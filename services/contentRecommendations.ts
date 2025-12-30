// Smart Content Recommendations Engine
import OpenAI from 'openai';
import { BrandIdentity } from '../types';

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'text';
  estimatedEngagement: 'low' | 'medium' | 'high';
  hashtags: string[];
  imagePrompt?: string;
  trending: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TrendingTopic {
  topic: string;
  relevance: number; // 0-100
  platforms: string[];
  examples: string[];
}

export interface HashtagSuggestion {
  hashtag: string;
  category: 'trending' | 'branded' | 'niche' | 'community';
  popularity: number; // 0-100
  competition: 'low' | 'medium' | 'high';
}

export class ContentRecommendationEngine {
  private openai: OpenAI;
  private brandIdentity: BrandIdentity;

  constructor(brandIdentity: BrandIdentity) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY not found');
    }
    this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    this.brandIdentity = brandIdentity;
  }

  // Get daily content ideas
  async getDailyIdeas(count: number = 5): Promise<ContentIdea[]> {
    const brandTone = this.brandIdentity.socialMediaPosts[0]?.body || 'engaging';
    const colors = this.brandIdentity.colorPalette.map(c => c.name).join(', ');

    const prompt = `
Generate ${count} fresh, creative social media content ideas for a brand with these characteristics:

Brand Colors: ${colors}
Brand Tone: ${brandTone}
Previous Posts: ${this.brandIdentity.socialMediaPosts.map(p => p.headline).join('; ')}

For each idea, provide:
1. Title (catchy, descriptive)
2. Brief description
3. Best platform (Instagram, TikTok, LinkedIn, Twitter, Facebook)
4. Content type (image, video, carousel, story, reel)
5. Estimated engagement (low/medium/high)
6. 3-5 relevant hashtags
7. Image/video description
8. Whether it's trending
9. Difficulty to create (easy/medium/hard)

Make ideas diverse, actionable, and aligned with current social media trends.
Format as JSON array.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 2048,
      });

      const ideas = this.parseContentIdeas(response.choices[0]?.message?.content || '', count);
      return ideas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      return this.getFallbackIdeas(count);
    }
  }

  // Get trending topics in industry
  async getTrendingTopics(industry: string): Promise<TrendingTopic[]> {
    const trendingTopics: TrendingTopic[] = [
      {
        topic: 'AI and Automation',
        relevance: 95,
        platforms: ['LinkedIn', 'Twitter', 'Instagram'],
        examples: ['ChatGPT tips', 'Workflow automation', 'AI tools showcase'],
      },
      {
        topic: 'Sustainability',
        relevance: 85,
        platforms: ['Instagram', 'Facebook', 'LinkedIn'],
        examples: ['Eco-friendly practices', 'Carbon footprint reduction', 'Green initiatives'],
      },
      {
        topic: 'Behind-the-Scenes',
        relevance: 90,
        platforms: ['Instagram', 'TikTok', 'Stories'],
        examples: ['Day in the life', 'Process videos', 'Team spotlights'],
      },
      {
        topic: 'User-Generated Content',
        relevance: 88,
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        examples: ['Customer testimonials', 'Reviews showcase', 'Community highlights'],
      },
      {
        topic: 'Educational Content',
        relevance: 92,
        platforms: ['LinkedIn', 'YouTube', 'Instagram'],
        examples: ['How-to guides', 'Industry insights', 'Tips and tricks'],
      },
    ];

    return trendingTopics;
  }

  // Generate captions with variations
  async generateCaptions(config: {
    platform: string;
    imageDescription: string;
    tone: 'professional' | 'casual' | 'funny' | 'inspirational';
    includeHashtags: boolean;
    callToAction?: string;
  }): Promise<string[]> {
    const maxLength = this.getPlatformMaxLength(config.platform);

    const prompt = `
Generate 5 engaging social media captions for ${config.platform}:

Image/Video: ${config.imageDescription}
Tone: ${config.tone}
Max Length: ${maxLength} characters
Call to Action: ${config.callToAction || 'None'}
Include Hashtags: ${config.includeHashtags}

Brand Voice Reference: ${this.brandIdentity.socialMediaPosts[0]?.body}

Create diverse variations - some short and punchy, some longer and storytelling.
Each caption should be engaging, on-brand, and platform-appropriate.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const captions = (response.choices[0]?.message?.content || '')
        .split('\n')
        .filter(line => line.trim().length > 10)
        .slice(0, 5);

      return captions;
    } catch (error) {
      console.error('Error generating captions:', error);
      return this.getFallbackCaptions(config);
    }
  }

  // Suggest hashtags
  async suggestHashtags(
    content: string,
    platform: string
  ): Promise<{
    trending: HashtagSuggestion[];
    branded: HashtagSuggestion[];
    niche: HashtagSuggestion[];
  }> {
    const prompt = `
Analyze this content and suggest relevant hashtags for ${platform}:

Content: "${content}"

Provide:
1. 5 trending hashtags (currently popular)
2. 3 branded hashtags (specific to brand/industry)
3. 5 niche hashtags (targeted, less competitive)

For each hashtag, estimate:
- Popularity (0-100)
- Competition level (low/medium/high)

Format as JSON with categories: trending, branded, niche.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      // Parse response and structure hashtags
      const parsed = this.parseHashtagSuggestions(response.choices[0]?.message?.content || '');
      return parsed;
    } catch (error) {
      console.error('Error suggesting hashtags:', error);
      return this.getFallbackHashtags(platform);
    }
  }

  // Get content calendar suggestions
  async getMonthlyThemes(): Promise<Array<{ month: string; theme: string; ideas: string[] }>> {
    const now = new Date();
    const months = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      months.push({
        month: monthName,
        theme: this.getMonthTheme(date.getMonth()),
        ideas: this.getMonthIdeas(date.getMonth()),
      });
    }

    return months;
  }

  private getMonthTheme(month: number): string {
    const themes: Record<number, string> = {
      0: 'New Beginnings & Goal Setting',
      1: 'Love & Relationships',
      2: 'Growth & Renewal',
      3: 'Innovation & Spring Energy',
      4: 'Community & Connection',
      5: 'Summer & Adventure',
      6: 'Independence & Freedom',
      7: 'Back to School & Learning',
      8: 'Harvest & Gratitude',
      9: 'Spooky Season & Creativity',
      10: 'Thanksgiving & Appreciation',
      11: 'Holidays & Celebration',
    };

    return themes[month] || 'General Content';
  }

  private getMonthIdeas(month: number): string[] {
    const ideas: Record<number, string[]> = {
      0: ['New Year goals', 'Fresh starts', 'Resolutions', 'Planning ahead'],
      1: ['Valentine\'s Day', 'Self-love', 'Customer appreciation', 'Love stories'],
      2: ['Spring cleaning', 'Renewal', 'Growth tips', 'Fresh perspectives'],
      // Add more months as needed
    };

    return ideas[month] || ['Engaging content', 'Behind the scenes', 'Tips and tricks', 'Customer stories'];
  }

  private parseContentIdeas(text: string, count: number): ContentIdea[] {
    const ideas: ContentIdea[] = [];

    // Try to parse as JSON first
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.slice(0, count).map((idea: any, index: number) => ({
          id: `idea_${Date.now()}_${index}`,
          title: idea.title || `Content Idea ${index + 1}`,
          description: idea.description || '',
          platform: idea.platform || 'Instagram',
          contentType: idea.contentType || 'image',
          estimatedEngagement: idea.estimatedEngagement || 'medium',
          hashtags: idea.hashtags || [],
          imagePrompt: idea.imagePrompt,
          trending: idea.trending || false,
          difficulty: idea.difficulty || 'medium',
        }));
      }
    } catch (e) {
      // Fall through to manual parsing
    }

    return this.getFallbackIdeas(count);
  }

  private getFallbackIdeas(count: number): ContentIdea[] {
    const fallbackIdeas = [
      {
        title: 'Behind-the-Scenes Monday',
        description: 'Show your team at work, share your process',
        platform: 'Instagram',
        contentType: 'story' as const,
        hashtags: ['#BehindTheScenes', '#TeamWork', '#MondayMotivation'],
        trending: true,
      },
      {
        title: 'Tips Tuesday',
        description: 'Share valuable industry tips with your audience',
        platform: 'LinkedIn',
        contentType: 'carousel' as const,
        hashtags: ['#TipsTuesday', '#ProTips', '#Learning'],
        trending: false,
      },
      {
        title: 'Customer Spotlight',
        description: 'Feature a customer success story',
        platform: 'Facebook',
        contentType: 'video' as const,
        hashtags: ['#CustomerLove', '#SuccessStory', '#Community'],
        trending: true,
      },
      {
        title: 'Quick Tutorial',
        description: 'Create a 60-second how-to video',
        platform: 'TikTok',
        contentType: 'reel' as const,
        hashtags: ['#Tutorial', '#HowTo', '#LearnOnTikTok'],
        trending: true,
      },
      {
        title: 'Inspirational Quote',
        description: 'Share a motivational quote with branded visuals',
        platform: 'Instagram',
        contentType: 'image' as const,
        hashtags: ['#Motivation', '#Inspiration', '#QuoteOfTheDay'],
        trending: false,
      },
    ];

    return fallbackIdeas.slice(0, count).map((idea, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      ...idea,
      estimatedEngagement: 'medium' as const,
      imagePrompt: `Professional ${idea.contentType} for ${idea.platform}`,
      difficulty: 'easy' as const,
    }));
  }

  private getFallbackCaptions(config: any): string[] {
    return [
      `Discover ${config.imageDescription}! ${config.callToAction || ''} ${config.includeHashtags ? '#brand #marketing' : ''}`,
      `Here's something special for you: ${config.imageDescription}. ${config.callToAction || ''}`,
      `We're excited to share ${config.imageDescription} with you today!`,
      `${config.imageDescription} - what do you think? ${config.callToAction || ''}`,
      `New post alert! ${config.imageDescription}. ${config.includeHashtags ? '#newpost #exciting' : ''}`,
    ];
  }

  private getFallbackHashtags(platform: string): {
    trending: HashtagSuggestion[];
    branded: HashtagSuggestion[];
    niche: HashtagSuggestion[];
  } {
    return {
      trending: [
        { hashtag: '#trending', category: 'trending', popularity: 90, competition: 'high' },
        { hashtag: '#viral', category: 'trending', popularity: 85, competition: 'high' },
        { hashtag: '#foryou', category: 'trending', popularity: 95, competition: 'high' },
      ],
      branded: [
        { hashtag: '#yourbrand', category: 'branded', popularity: 50, competition: 'low' },
        { hashtag: '#brandname', category: 'branded', popularity: 45, competition: 'low' },
      ],
      niche: [
        { hashtag: '#industryspecific', category: 'niche', popularity: 60, competition: 'medium' },
        { hashtag: '#nichecommunity', category: 'niche', popularity: 55, competition: 'medium' },
        { hashtag: '#targetaudience', category: 'niche', popularity: 50, competition: 'low' },
      ],
    };
  }

  private parseHashtagSuggestions(text: string): {
    trending: HashtagSuggestion[];
    branded: HashtagSuggestion[];
    niche: HashtagSuggestion[];
  } {
    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Return fallback
    }

    return this.getFallbackHashtags('instagram');
  }

  private getPlatformMaxLength(platform: string): number {
    const lengths: Record<string, number> = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000,
      tiktok: 150,
    };

    return lengths[platform.toLowerCase()] || 500;
  }
}
