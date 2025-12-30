// Bulk Content Generator - Generate 30/60/90 days of content at once
import OpenAI from 'openai';
import { BrandIdentity } from '../types';
import { generateWithFallback } from './modelService';
import { generateImage, generateVideo } from './geminiService';

// Progress callback for tracking generation
export type ProgressCallback = (current: number, total: number, message: string) => void;

export interface ContentMix {
  promotional: number; // percentage
  educational: number;
  entertaining: number;
  inspirational: number;
}

export interface BulkContentConfig {
  duration: 30 | 60 | 90; // days
  platforms: string[];
  postsPerDay: number;
  contentMix: ContentMix;
  theme?: string;
  includeHashtags: boolean;
  includeImages: boolean;
}

export interface GeneratedPost {
  id: string;
  date: Date;
  platform: string;
  contentType: 'promotional' | 'educational' | 'entertaining' | 'inspirational';
  headline: string;
  body: string;
  hashtags: string[];
  imagePrompt: string;
  visualUrl?: string; // Actual generated image/video URL
  visualType?: 'image' | 'video';
  callToAction?: string;
  scheduledTime: string; // HH:MM format
  status: 'draft' | 'generating' | 'ready' | 'failed';
}

export interface BulkContentCampaign {
  id: string;
  name: string;
  config: BulkContentConfig;
  posts: GeneratedPost[];
  createdAt: Date;
  statistics: {
    totalPosts: number;
    postsByPlatform: Record<string, number>;
    postsByType: Record<string, number>;
  };
}

export class BulkContentGenerator {
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

  async generateCampaign(
    config: BulkContentConfig,
    onProgress?: ProgressCallback
  ): Promise<BulkContentCampaign> {
    const posts: GeneratedPost[] = [];
    const totalPosts = config.duration * config.postsPerDay;

    onProgress?.(0, totalPosts, 'Starting content generation...');

    // Distribute content types based on mix
    const contentTypeDistribution = this.calculateContentDistribution(totalPosts, config.contentMix);

    // Generate posts in batches to avoid overwhelming API
    const batchSize = 10;
    const batches = Math.ceil(totalPosts / batchSize);

    // Step 1: Generate text content
    onProgress?.(0, totalPosts, 'Generating post ideas and captions...');
    for (let batch = 0; batch < batches; batch++) {
      const postsInThisBatch = Math.min(batchSize, totalPosts - batch * batchSize);
      const batchPosts = await this.generateBatch(
        postsInThisBatch,
        config,
        contentTypeDistribution,
        batch * batchSize
      );
      posts.push(...batchPosts);

      onProgress?.(posts.length, totalPosts, `Generated ${posts.length}/${totalPosts} post ideas...`);
    }

    // Step 2: Generate visual content for each post
    if (config.includeImages) {
      onProgress?.(0, totalPosts, 'Generating images for posts...');
      await this.generateVisuals(posts, onProgress);
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(posts);

    onProgress?.(totalPosts, totalPosts, 'Campaign complete!');

    return {
      id: `campaign_${Date.now()}`,
      name: config.theme || `${config.duration}-Day Content Campaign`,
      config,
      posts,
      createdAt: new Date(),
      statistics,
    };
  }

  // Generate actual visual content for posts
  private async generateVisuals(
    posts: GeneratedPost[],
    onProgress?: ProgressCallback
  ): Promise<void> {
    const totalPosts = posts.length;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      post.status = 'generating';

      try {
        // Determine aspect ratio based on platform
        const aspectRatio = this.getAspectRatio(post.platform);

        // Check if platform is video-centric
        const isVideoPlatform = this.isVideoPlatform(post.platform);

        if (isVideoPlatform) {
          try {
            // Try to generate video
            // Note: Currently this might fail if API doesn't support it, so we fallback
            const videoUrl = await generateVideo(post.imagePrompt, aspectRatio as any);
            post.visualUrl = videoUrl;
            post.visualType = 'video';
            post.status = 'ready';
          } catch (videoError) {
            console.warn(`Video generation failed for post ${post.id}, falling back to image:`, videoError);

            // Fallback to image
            const imageUrl = await generateImage(post.imagePrompt, aspectRatio);
            post.visualUrl = imageUrl;
            post.visualType = 'image';
            post.status = 'ready';
          }
        } else {
          // Generate image using DALL-E
          const imageUrl = await generateImage(post.imagePrompt, aspectRatio);

          post.visualUrl = imageUrl;
          post.visualType = 'image';
          post.status = 'ready';
        }

        onProgress?.(i + 1, totalPosts, `Generated visual ${i + 1}/${totalPosts}...`);

        // Small delay to avoid rate limits
        if (i < posts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to generate visual for post ${post.id}:`, error);
        post.status = 'failed';
        post.visualUrl = undefined;

        onProgress?.(i + 1, totalPosts, `Visual ${i + 1}/${totalPosts} failed, continuing...`);
      }
    }
  }

  // Get recommended aspect ratio for platform
  private getAspectRatio(platform: string): '1:1' | '16:9' | '9:16' | '4:3' | '3:4' {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes('story') || platformLower.includes('reel') || platformLower === 'tiktok') {
      return '9:16'; // Vertical
    }
    if (platformLower === 'youtube' || platformLower === 'twitter') {
      return '16:9'; // Horizontal
    }
    if (platformLower === 'pinterest') {
      return '3:4'; // Tall
    }

    return '1:1'; // Default square (Instagram, Facebook, LinkedIn)
  }

  private isVideoPlatform(platform: string): boolean {
    const p = platform.toLowerCase();
    return p.includes('tiktok') || p.includes('reel') || p.includes('youtube') || p.includes('video');
  }

  private calculateContentDistribution(
    totalPosts: number,
    mix: ContentMix
  ): Map<string, number> {
    const distribution = new Map<string, number>();
    distribution.set('promotional', Math.round(totalPosts * (mix.promotional / 100)));
    distribution.set('educational', Math.round(totalPosts * (mix.educational / 100)));
    distribution.set('entertaining', Math.round(totalPosts * (mix.entertaining / 100)));
    distribution.set('inspirational', Math.round(totalPosts * (mix.inspirational / 100)));

    // Adjust for rounding errors
    const sum = Array.from(distribution.values()).reduce((a, b) => a + b, 0);
    if (sum < totalPosts) {
      distribution.set('educational', distribution.get('educational')! + (totalPosts - sum));
    }

    return distribution;
  }

  private async generateBatch(
    count: number,
    config: BulkContentConfig,
    distribution: Map<string, number>,
    offset: number
  ): Promise<GeneratedPost[]> {
    const prompt = this.buildPrompt(count, config, distribution);

    try {
      // Use model-agnostic service with fallback
      const modelResponse = await generateWithFallback({
        task: 'bulkContent',
        prompt: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      });

      console.log(`[BulkContent] Model used: ${modelResponse.modelUsed}`);
      const content = modelResponse.response.choices[0]?.message?.content || '';
      const posts = this.parseGeneratedPosts(content, config, offset);
      return posts;
    } catch (error) {
      console.error('Error generating batch:', error);
      // Return placeholder posts on error
      return this.generatePlaceholderPosts(count, config, offset);
    }
  }

  private buildPrompt(
    count: number,
    config: BulkContentConfig,
    distribution: Map<string, number>
  ): string {
    const brandColors = this.brandIdentity.colorPalette.map(c => c.name).join(', ');
    const brandTone = this.brandIdentity.socialMediaPosts[0]?.body || 'engaging and authentic';

    return `
Generate ${count} social media posts for a brand with the following characteristics:

Brand Colors: ${brandColors}
Brand Tone: ${brandTone}
Platforms: ${config.platforms.join(', ')}
Theme: ${config.theme || 'general brand content'}

Content Mix:
- Promotional: ${config.contentMix.promotional}%
- Educational: ${config.contentMix.educational}%
- Entertaining: ${config.contentMix.entertaining}%
- Inspirational: ${config.contentMix.inspirational}%

For each post, provide:
1. Platform (rotate through: ${config.platforms.join(', ')})
2. Content Type (promotional/educational/entertaining/inspirational)
3. Headline (attention-grabbing)
4. Body (150-280 characters for Twitter, up to 2200 for Instagram/LinkedIn)
5. Hashtags (${config.includeHashtags ? '5-10 relevant hashtags' : 'none'})
6. Image Prompt (if ${config.includeImages})
7. Call to Action (for promotional content)

Format each post as:
---
Platform: [platform]
Type: [type]
Headline: [headline]
Body: [body]
Hashtags: [hashtags]
Image: [image prompt]
CTA: [call to action]
---

Generate diverse, engaging content that maintains brand consistency while varying topics and approaches.
    `.trim();
  }

  private parseGeneratedPosts(
    content: string,
    config: BulkContentConfig,
    offset: number
  ): GeneratedPost[] {
    const posts: GeneratedPost[] = [];
    const postBlocks = content.split('---').filter(block => block.trim());

    postBlocks.forEach((block, index) => {
      const lines = block.split('\n').filter(line => line.trim());
      const post: Partial<GeneratedPost> = {
        id: `post_${Date.now()}_${offset + index}`,
      };

      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        switch (key.trim().toLowerCase()) {
          case 'platform':
            post.platform = value;
            break;
          case 'type':
            post.contentType = value as any;
            break;
          case 'headline':
            post.headline = value;
            break;
          case 'body':
            post.body = value;
            break;
          case 'hashtags':
            post.hashtags = value.split(' ').filter(h => h.startsWith('#'));
            break;
          case 'image':
            post.imagePrompt = value;
            break;
          case 'cta':
            post.callToAction = value;
            break;
        }
      });

      // Assign date and time
      const dayIndex = Math.floor((offset + index) / config.postsPerDay);
      const postDate = new Date();
      postDate.setDate(postDate.getDate() + dayIndex);
      post.date = postDate;

      // Assign optimal posting time based on platform
      post.scheduledTime = this.getOptimalTime(post.platform || 'instagram', index % config.postsPerDay);

      if (post.platform && post.headline && post.body) {
        // Add status field
        post.status = 'draft';
        posts.push(post as GeneratedPost);
      }
    });

    return posts;
  }

  private generatePlaceholderPosts(
    count: number,
    config: BulkContentConfig,
    offset: number
  ): GeneratedPost[] {
    const posts: GeneratedPost[] = [];
    const contentTypes: Array<'promotional' | 'educational' | 'entertaining' | 'inspirational'> = [
      'promotional',
      'educational',
      'entertaining',
      'inspirational',
    ];

    for (let i = 0; i < count; i++) {
      const platformIndex = (offset + i) % config.platforms.length;
      const platform = config.platforms[platformIndex];
      const contentType = contentTypes[i % contentTypes.length];

      const dayIndex = Math.floor((offset + i) / config.postsPerDay);
      const postDate = new Date();
      postDate.setDate(postDate.getDate() + dayIndex);

      posts.push({
        id: `post_${Date.now()}_${offset + i}`,
        date: postDate,
        platform,
        contentType,
        headline: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Post ${i + 1}`,
        body: `Engaging ${contentType} content for ${platform}. Share your brand story and connect with your audience.`,
        hashtags: config.includeHashtags ? ['#brand', '#marketing', `#${platform}`] : [],
        imagePrompt: config.includeImages ? `Professional ${contentType} image for social media` : '',
        callToAction: contentType === 'promotional' ? 'Learn more!' : undefined,
        scheduledTime: this.getOptimalTime(platform, i % config.postsPerDay),
        status: 'draft',
      });
    }

    return posts;
  }

  private getOptimalTime(platform: string, postOfDay: number): string {
    const times: Record<string, string[]> = {
      instagram: ['09:00', '12:00', '19:00'],
      twitter: ['09:00', '12:00', '17:00'],
      linkedin: ['08:00', '12:00', '17:00'],
      facebook: ['13:00', '15:00', '19:00'],
      tiktok: ['07:00', '16:00', '20:00'],
    };

    const platformTimes = times[platform.toLowerCase()] || ['09:00', '12:00', '18:00'];
    return platformTimes[postOfDay % platformTimes.length];
  }

  private calculateStatistics(posts: GeneratedPost[]): BulkContentCampaign['statistics'] {
    const postsByPlatform: Record<string, number> = {};
    const postsByType: Record<string, number> = {};

    posts.forEach(post => {
      postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1;
      postsByType[post.contentType] = (postsByType[post.contentType] || 0) + 1;
    });

    return {
      totalPosts: posts.length,
      postsByPlatform,
      postsByType,
    };
  }
}

// Utility functions
export function exportCampaignToCSV(campaign: BulkContentCampaign): string {
  const headers = ['Date', 'Time', 'Platform', 'Type', 'Headline', 'Body', 'Hashtags', 'Image Prompt', 'CTA'];
  const rows = campaign.posts.map(post => [
    post.date.toLocaleDateString(),
    post.scheduledTime,
    post.platform,
    post.contentType,
    post.headline,
    post.body,
    post.hashtags.join(' '),
    post.imagePrompt,
    post.callToAction || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

export function groupPostsByWeek(posts: GeneratedPost[]): Map<number, GeneratedPost[]> {
  const weeks = new Map<number, GeneratedPost[]>();

  posts.forEach(post => {
    const weekNumber = Math.floor((post.date.getTime() - posts[0].date.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!weeks.has(weekNumber)) {
      weeks.set(weekNumber, []);
    }
    weeks.get(weekNumber)!.push(post);
  });

  return weeks;
}
