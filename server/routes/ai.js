import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client with server-side API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generate Text (Chat Completions)
router.post('/generate-text', async (req, res) => {
    try {
        const { messages, model = 'gpt-4o', temperature = 0.7, max_tokens = 1000, response_format } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured on server' });
        }

        const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens,
            response_format
        });

        res.json(completion);
    } catch (error) {
        console.error('Error in /generate-text:', error);
        res.status(500).json({ error: error.message || 'Failed to generate text' });
    }
});

// Generate Image (DALL-E)
router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, size = '1024x1024', quality = 'standard', n = 1 } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured on server' });
        }

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            size,
            quality,
            n,
        });

        res.json({ content: response.choices?.[0]?.message?.content ?? '' });
    } catch (error) {
        console.error('Error in /generate-image:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
});

// Analyze Image (Vision)
router.post('/analyze-image', async (req, res) => {
    try {
        const { image, prompt } = req.body; // image should be base64 data URI

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured on server' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt || 'Analyze this image.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        res.json(response);
    } catch (error) {
        console.error('Error in /analyze-image:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze image' });
    }
});

export default router;
