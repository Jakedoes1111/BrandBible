// FIX: Implemented Gemini API service functions.
// FIX: Imported `Modality` to use for `responseModalities` config.
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { BrandIdentity, ChatMessage, GeneratedImages } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
let ai = new GoogleGenAI({ apiKey });

// Helper to re-initialize AI instance, useful for VEO which might have specific key requirements
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });


const brandIdentitySchema = {
  type: Type.OBJECT,
  properties: {
    colorPalette: {
      type: Type.ARRAY,
      description: "A color palette of 5 colors. Provide a descriptive name and a common usage for each color (e.g., Primary, Accent, Background).",
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING, description: "Hexadecimal color code." },
          name: { type: Type.STRING, description: "Descriptive name of the color." },
          usage: { type: Type.STRING, description: "Primary, Secondary, Accent, Text, Background." },
        },
        required: ["hex", "name", "usage"],
      },
    },
    fontPairings: {
      type: Type.OBJECT,
      description: "A pair of Google Fonts for headers and body text, with a brief note on why they work well together for the brand.",
      properties: {
        header: { type: Type.STRING, description: "Name of the Google Font for headers." },
        body: { type: Type.STRING, description: "Name of the Google Font for body text." },
        notes: { type: Type.STRING, description: "Rationale for the font pairing choice." },
      },
      required: ["header", "body", "notes"],
    },
    socialMediaPosts: {
      type: Type.ARRAY,
      description: "3 social media post ideas for different platforms (e.g., Twitter, Instagram, LinkedIn) including a headline, body text, and a detailed prompt for an accompanying image.",
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, description: "Social media platform (e.g., Instagram)." },
          headline: { type: Type.STRING, description: "A catchy headline for the post." },
          body: { type: Type.STRING, description: "The main content of the social media post." },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate a visually appealing image for this post." },
        },
        required: ["platform", "headline", "body", "imagePrompt"],
      },
    },
    logoPrompt: {
        type: Type.STRING,
        description: "A detailed, single-sentence prompt for an image generation model to create a primary logo. Describe a minimalist, modern, vector-style logo. Example: 'a stylized letter 'S' combined with a leaf, minimalist, vector, blue and green'."
    },
    secondaryMarkPrompts: {
        type: Type.ARRAY,
        description: "An array of 2 detailed, single-sentence prompts for an image generation model to create secondary brand marks or icons. Describe minimalist, modern, vector-style icons. Example: 'a simple leaf icon, vector, green'." ,
        items: {
            type: Type.STRING,
        }
    }
  },
  required: ["colorPalette", "fontPairings", "socialMediaPosts", "logoPrompt", "secondaryMarkPrompts"],
};


export const generateBrandBible = async (mission: string): Promise<{ brandIdentity: BrandIdentity, generatedImages: GeneratedImages }> => {
    try {
        const textModel = 'gemini-2.5-pro';
        const imageModel = 'imagen-4.0-generate-001';

        const prompt = `Based on the following company mission, generate a complete brand identity bible.
        
        Mission: "${mission}"
        
        Please provide a JSON object that includes a 5-color palette, a header/body font pairing from Google Fonts, 3 social media post ideas, a prompt for a primary logo, and 2 prompts for secondary brand marks.`;
        
        const brandIdentityResponse: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: brandIdentitySchema,
            },
        });

        const brandIdentityJson = JSON.parse(brandIdentityResponse.text);
        
        const { logoPrompt, secondaryMarkPrompts, ...brandIdentity } = brandIdentityJson;

        if (!logoPrompt || !secondaryMarkPrompts || secondaryMarkPrompts.length < 2) {
            throw new Error("Failed to get valid logo prompts from the model.");
        }
        
        const imagePromises = [
            ai.models.generateImages({ model: imageModel, prompt: logoPrompt, config: { numberOfImages: 1 } }),
            ...secondaryMarkPrompts.map((p: string) => ai.models.generateImages({ model: imageModel, prompt: p, config: { numberOfImages: 1 } }))
        ];

        const imageResults = await Promise.all(imagePromises);

        const primaryLogoUrl = `data:image/png;base64,${imageResults[0].generatedImages[0].image.imageBytes}`;
        const secondaryMarkUrls = imageResults.slice(1).map(res => `data:image/png;base64,${res.generatedImages[0].image.imageBytes}`);

        const generatedImages: GeneratedImages = {
            primaryLogoUrl,
            secondaryMarkUrls,
        };
        
        return { brandIdentity, generatedImages };
    } catch (error) {
        console.error("Error generating brand bible:", error);
        throw new Error("Failed to generate brand identity. The model may have returned an unexpected format. Please try again with a more detailed mission.");
    }
};

export const chatWithBot = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const formattedHistory = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: formattedHistory,
            config: {
                systemInstruction: "You are a friendly and helpful branding assistant. The user is creating a brand identity. You can answer questions about colors, fonts, marketing, and design principles.",
            }
        });
        
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error in chatWithBot:", error);
        throw new Error("Failed to get a response from the chatbot.");
    }
};


export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: prompt,
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart]
            },
            config: {
// FIX: The `responseModalities` config must use the `Modality.IMAGE` enum instead of the string "IMAGE".
                responseModalities: [Modality.IMAGE],
            }
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            const base64ImageBytes: string = firstPart.inlineData.data;
            return `data:${firstPart.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
        
        throw new Error("No image was generated by the model.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4') => {
    const imageModel = 'imagen-4.0-generate-001';
    const response = await ai.models.generateImages({ 
        model: imageModel, 
        prompt: prompt, 
        config: { 
            numberOfImages: 1,
            aspectRatio,
        } 
    });
    return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
    const currentAI = getAI();
    let operation = await currentAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', // 720p is required for extension capability
        aspectRatio,
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await currentAI.operations.getVideosOperation({operation: operation});
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation succeeded but no download link was provided.");
    }
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return {
      url: URL.createObjectURL(videoBlob),
      operation,
    };
};

export const extendVideo = async (previousOperation: any, prompt: string, aspectRatio: '16:9' | '9:16') => {
    const previousVideo = previousOperation.response?.generatedVideos?.[0]?.video;
    if (!previousVideo) {
        throw new Error("Invalid previous video data. Cannot extend.");
    }

    const currentAI = getAI();
    let operation = await currentAI.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: previousVideo,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await currentAI.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video extension succeeded but no download link was provided.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return {
        url: URL.createObjectURL(videoBlob),
        operation,
    };
};