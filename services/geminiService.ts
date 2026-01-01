// OpenAI API service functions
import OpenAI from 'openai';
import { BrandIdentity, ChatMessage, GeneratedImages } from '../types';
import { generateWithFallback, getRecommendedModel } from './modelService';
import { getTaskModel } from '../config/modelConfig';
import { validateMissionStatement, validateImagePrompt, validateChatMessage } from './inputValidator';
import { formatErrorMessage, logError, APIError } from './errorHandler';
import * as modelConfig from '../config/modelConfig'; // Import modelConfig for the new generateBrandBible

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_OPENAI_API_KEY environment variable not set");
}
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

// Backend API URL
const API_URL = 'http://localhost:3001/api';

// Helper to call backend
async function callBackend(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Backend request failed');
    }

    return response.json();
}

const extractApiErrorDetails = (error: any) => {
    const statusCode = error?.status ?? error?.code;
    const message = error?.message ?? "";
    return { statusCode, message };
};

const isPaidModelAccessError = (error: any) => {
    const { statusCode, message } = extractApiErrorDetails(error);
    return statusCode === 400 || statusCode === 402;
};

const PAID_MODEL_ACCESS_MESSAGE = "Generating imagery requires sufficient API credits. Please check your OpenAI account billing.";

const parseJsonSafely = <T>(raw: string | undefined | null, fallback: T): T => {
    if (!raw) return fallback;
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    try {
        return JSON.parse(trimmed) as T;
    } catch (error) {
        console.warn("Structured JSON parse failed, returning fallback.", error);
        return fallback;
    }
};


// Schema instructions for OpenAI JSON mode
const brandIdentityInstructions = `
Return a JSON object with the following structure:
{
    "colorPalette": [
        { "hex": "#hexcode", "name": "Color Name", "usage": "Primary/Secondary/Accent/Text/Background" }
    ],
        "fontPairings": {
        "header": "Google Font name",
            "body": "Google Font name",
                "notes": "Why they work together"
    },
    "socialMediaPosts": [
        { "platform": "Instagram/Twitter/LinkedIn", "headline": "Catchy headline", "body": "Post content", "imagePrompt": "Detailed image prompt" }
    ],
        "logoPrompt": "Detailed single-sentence prompt for logo",
            "secondaryMarkPrompts": ["Prompt 1", "Prompt 2"]
}
`;

const parseStructuredJson = (response: OpenAI.Chat.Completions.ChatCompletion) => {
    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error("Model did not return any content.");
    }

    try {
        return JSON.parse(content);
    } catch (err) {
        console.warn("Failed to parse JSON from model response", err);
        throw new Error("Model did not return valid JSON for the brand identity.");
    }
};


type GenerateBrandBibleResult = {
    brandIdentity: BrandIdentity;
    generatedImages: GeneratedImages | null;
};

export const generateBrandBible = async (mission: string, uploadedAssets?: any[]): Promise<GenerateBrandBibleResult> => {
    // Validate and sanitize input
    const validatedMission = validateMissionStatement(mission);

    let brandIdentity: BrandIdentity | null = null;
    let logoPrompt: string | null = null;
    let secondaryMarkPrompts: string[] | null = null;

    // Check for uploaded logo assets
    const uploadedLogos = uploadedAssets?.filter(asset => asset.type === 'logo') || [];
    const hasUploadedLogos = uploadedLogos.length > 0;

    try {
        // Use model-agnostic service with automatic fallback
        const prompt = `Based on the following company mission, generate a complete brand identity bible.

    Mission: "${validatedMission}"
        
        ${brandIdentityInstructions}
        
        Please provide a JSON object that includes a 5 - color palette, a header / body font pairing from Google Fonts, 3 social media post ideas, a prompt for a primary logo, and 2 prompts for secondary brand marks.`;

        const modelResponse = await generateWithFallback({
            task: 'brandGeneration',
            prompt: prompt,
            config: {
                response_format: { type: "json_object" },
            },
            requireStructuredOutput: true,
        });

        const brandIdentityResponse = modelResponse.response;
        console.log(`[BrandGeneration] Model used: ${modelResponse.modelUsed}, Fallbacks attempted: ${modelResponse.fallbacksAttempted.length} `);

        const brandIdentityJson = parseStructuredJson(brandIdentityResponse);

        const parsed = brandIdentityJson as BrandIdentity & { logoPrompt: string; secondaryMarkPrompts: string[] };
        logoPrompt = parsed.logoPrompt;
        secondaryMarkPrompts = parsed.secondaryMarkPrompts;
        brandIdentity = {
            colorPalette: parsed.colorPalette,
            fontPairings: parsed.fontPairings,
            socialMediaPosts: parsed.socialMediaPosts,
        };

        // If user has uploaded logos, use those instead of generating new ones
        if (hasUploadedLogos) {
            console.log(`Using ${uploadedLogos.length} uploaded logo(s) instead of generating new ones.`);

            const primaryLogoUrl = uploadedLogos[0].preview || uploadedLogos[0].fileData;
            const secondaryMarkUrls = uploadedLogos.slice(1, 3).map((logo: any) => logo.preview || logo.fileData);

            // If only one logo uploaded but we need more, pad with empty strings or skip
            const generatedImages: GeneratedImages = {
                primaryLogoUrl,
                secondaryMarkUrls: secondaryMarkUrls.length > 0 ? secondaryMarkUrls : [],
            };

            return { brandIdentity, generatedImages };
        }

        if (!logoPrompt || !secondaryMarkPrompts || secondaryMarkPrompts.length < 2) {
            console.warn("Model did not return logo prompts. Returning brand identity without imagery.");
            return { brandIdentity, generatedImages: null };
        }

        try {
            // Get image generation model
            const imageModel = getTaskModel('imageGeneration');

            const imagePromises = [
                openai.images.generate({ model: imageModel, prompt: logoPrompt, n: 1, size: '1024x1024', response_format: 'b64_json' }),
                ...secondaryMarkPrompts.map((p: string) => openai.images.generate({ model: imageModel, prompt: p, n: 1, size: '1024x1024', response_format: 'b64_json' }))
            ];

            const imageResults = await Promise.all(imagePromises);

            const primaryLogoUrl = `data:image/png;base64,${imageResults[0].data[0].b64_json}`;
            const secondaryMarkUrls = imageResults.slice(1).map(res => `data:image/png;base64,${res.data[0].b64_json}`);

            const generatedImages: GeneratedImages = {
                primaryLogoUrl,
                secondaryMarkUrls,
            };

            return { brandIdentity, generatedImages };
        } catch (imageError) {
            if (isPaidModelAccessError(imageError)) {
                console.warn("Unable to generate images with DALL-E. Returning brand identity without imagery.");
                return { brandIdentity, generatedImages: null };
            }

            throw imageError;
        }
    } catch (error) {
        console.error("Error generating brand bible:", error);

        const apiError = error as any;

        if (isPaidModelAccessError(apiError) && brandIdentity) {
            console.warn("Falling back to brand identity without generated images.");
            return { brandIdentity, generatedImages: null };
        }

        throw new Error("Failed to generate brand identity. The model may have returned an unexpected format. Please try again with a more detailed mission.");
    }
};

export const chatWithBot = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        // Validate input
        const validatedMessage = validateChatMessage(newMessage);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: "You are a friendly and helpful branding assistant. The user is creating a brand identity. You can answer questions about colors, fonts, marketing, and design principles." },
            ...history.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            })),
            { role: 'user', content: validatedMessage }
        ];

        const response = await openai.chat.completions.create({
            model: getTaskModel('chatAssistant'),
            messages,
            max_tokens: 1000,
        });

        return response.choices[0]?.message?.content || 'No response';
    } catch (error) {
        logError(error, 'chatWithBot');
        throw new APIError(formatErrorMessage(error));
    }
};


export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        // Validate prompt
        const validatedPrompt = validateImagePrompt(prompt);

        // OpenAI's image editing requires a PNG image and uses edit endpoint
        // Convert base64 to blob for editing
        const imageResponse = await openai.images.edit({
            model: 'dall-e-2',
            image: await fetch(`data:${mimeType};base64,${base64ImageData}`).then(r => r.blob()) as any,
            prompt: validatedPrompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
        });

        const editedImage = imageResponse.data[0].b64_json;
        if (editedImage) {
            return `data:image/png;base64,${editedImage}`;
        }

        throw new Error("No image was generated by the model.");

    } catch (error) {
        console.error("Error editing image:", error);
        if (isPaidModelAccessError(error)) {
            throw new Error(PAID_MODEL_ACCESS_MESSAGE);
        }
        throw new Error("Failed to edit image.");
    }
};

export async function generateImage(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1'): Promise<string> {
    try {
        // DALL-E 3 supports limited sizes: 1024x1024, 1024x1792 (portrait), 1792x1024 (landscape)
        // Map aspect ratios to DALL-E 3 compatible sizes for the backend
        let size: '1024x1024' | '1024x1792' | '1792x1024';
        switch (aspectRatio) {
            case '1:1':
                size = '1024x1024';
                break;
            case '9:16':
                size = '1024x1792';
                break;
            case '16:9':
            case '4:3': // Closest landscape
                size = '1792x1024';
                break;
            case '3:4': // Closest portrait
                size = '1024x1792';
                break;
            default:
                size = '1024x1024';
        }

        const validatedPrompt = validateImagePrompt(prompt);

        const response = await callBackend('/generate-image', {
            prompt: validatedPrompt,
            size: size,
            quality: 'standard', // Assuming backend uses DALL-E 3 which has quality option
            n: 1,
        });

        return response.data[0].url; // Assuming backend returns a similar structure with a URL
    } catch (error) {
        console.error("Error generating image:", error);
        // The backend should handle specific API errors and return a generic error message
        throw new Error("Failed to generate image.");
    }
}

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    try {
        const validatedPrompt = validateImagePrompt(prompt); // Re-using image prompt validation for video
        const response = await callBackend('/generate-video', {
            prompt: validatedPrompt,
            aspectRatio: aspectRatio,
        });
        return response.videoUrl; // Assuming backend returns a video URL
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate video.");
    }
};

export const extendVideo = async (previousOperation: any, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    try {
        const validatedPrompt = validateImagePrompt(prompt); // Re-using image prompt validation for video
        const response = await callBackend('/extend-video', {
            previousOperation,
            prompt: validatedPrompt,
            aspectRatio: aspectRatio,
        });
        return response.videoUrl; // Assuming backend returns a video URL
    } catch (error) {
        console.error("Error extending video:", error);
        throw new Error("Failed to extend video.");
    }
};

export interface ImageAnalysisResult {
    colors: string[];
    style: string;
    tags: string[];
}

export async function analyzeImage(base64ImageData: string): Promise<ImageAnalysisResult> {
    try {
        const prompt = `
      You are a brand design expert.Analyze this image and extract the following:
1. A list of 3 - 5 dominant colors in hex format.
      2. A brief description of the visual style(e.g., "Minimalist", "Vintage", "Corporate").
      3. A list of 5 - 10 relevant tags describing the content and mood.

      Return the result as a JSON object with keys: "colors"(array of strings), "style"(string), "tags"(array of strings).
      Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

        const response = await callBackend('/analyze-image', {
            image: base64ImageData,
            prompt,
        });

        const content = response?.content ?? response?.choices?.[0]?.message?.content ?? "";

        // Clean up content if it contains markdown code blocks
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Failed to analyze image.");
    }
}
