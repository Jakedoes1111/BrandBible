/**
 * Batch Logo Processor Service
 * Handles applying logos to multiple images and videos at scale
 */

import { logoOverlayService, LogoOverlayConfig, VideoLogoConfig } from './logoOverlayService';

export interface BatchProcessConfig {
  logoUrl: string;
  imageConfig?: LogoOverlayConfig;
  videoConfig?: VideoLogoConfig;
  platform?: string; // For platform-specific defaults
  applyToImages?: boolean;
  applyToVideos?: boolean;
}

export interface BatchProcessItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  platform?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  resultUrl?: string;
}

export interface BatchProcessResult {
  total: number;
  completed: number;
  failed: number;
  items: BatchProcessItem[];
  duration: number; // milliseconds
}

export type BatchProgressCallback = (
  current: number,
  total: number,
  item: BatchProcessItem
) => void;

export class BatchLogoProcessor {
  /**
   * Process multiple items with logo overlay
   */
  async processBatch(
    items: BatchProcessItem[],
    config: BatchProcessConfig,
    onProgress?: BatchProgressCallback
  ): Promise<BatchProcessResult> {
    const startTime = Date.now();
    const results: BatchProcessItem[] = [];
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = { ...items[i], status: 'processing' as const };
      
      try {
        // Skip if type doesn't match config
        if (item.type === 'image' && !config.applyToImages) {
          results.push({ ...item, status: 'completed', resultUrl: item.url });
          completed++;
          continue;
        }
        if (item.type === 'video' && !config.applyToVideos) {
          results.push({ ...item, status: 'completed', resultUrl: item.url });
          completed++;
          continue;
        }

        onProgress?.(i + 1, items.length, item);

        let resultUrl: string;

        if (item.type === 'image') {
          const imageConfig = this.getConfigForItem(item, config, 'image') as LogoOverlayConfig;
          resultUrl = await logoOverlayService.applyLogoToImage(
            item.url,
            config.logoUrl,
            imageConfig
          );
        } else {
          const videoConfig = this.getConfigForItem(item, config, 'video') as VideoLogoConfig;
          resultUrl = await logoOverlayService.applyLogoToVideo(
            item.url,
            config.logoUrl,
            videoConfig,
            (progress) => {
              const updatedItem = { ...item, progress };
              onProgress?.(i + 1, items.length, updatedItem);
            }
          );
        }

        results.push({
          ...item,
          status: 'completed',
          resultUrl,
          progress: 100,
        });
        completed++;
      } catch (error: any) {
        results.push({
          ...item,
          status: 'failed',
          error: error.message || 'Processing failed',
        });
        failed++;
      }

      onProgress?.(i + 1, items.length, results[results.length - 1]);
    }

    const duration = Date.now() - startTime;

    return {
      total: items.length,
      completed,
      failed,
      items: results,
      duration,
    };
  }

  /**
   * Get configuration for a specific item, applying platform-specific defaults
   */
  private getConfigForItem(
    item: BatchProcessItem,
    batchConfig: BatchProcessConfig,
    type: 'image' | 'video'
  ): LogoOverlayConfig | VideoLogoConfig {
    const platform = item.platform || batchConfig.platform;

    if (type === 'image') {
      const baseConfig = batchConfig.imageConfig || logoOverlayService.getPresetConfigs().standard;
      return this.applyPlatformDefaults(baseConfig, platform, 'image') as LogoOverlayConfig;
    } else {
      const baseConfig = batchConfig.videoConfig || logoOverlayService.getVideoPresetConfigs()['corner-bug'];
      return this.applyPlatformDefaults(baseConfig, platform, 'video') as VideoLogoConfig;
    }
  }

  /**
   * Apply platform-specific defaults to configuration
   */
  private applyPlatformDefaults(
    config: LogoOverlayConfig | VideoLogoConfig,
    platform?: string,
    type?: 'image' | 'video'
  ): LogoOverlayConfig | VideoLogoConfig {
    if (!platform) return config;

    const platformDefaults = this.getPlatformDefaults();
    const platformConfig = platformDefaults[platform.toLowerCase()];

    if (!platformConfig) return config;

    const typeConfig = type === 'video' ? platformConfig.video : platformConfig.image;
    
    return {
      ...config,
      ...typeConfig,
    };
  }

  /**
   * Get platform-specific defaults
   */
  private getPlatformDefaults(): Record<string, {
    image: Partial<LogoOverlayConfig>;
    video: Partial<VideoLogoConfig>;
  }> {
    return {
      instagram: {
        image: {
          position: 'bottom-right',
          scale: 0.12,
          opacity: 0.9,
          padding: 20,
        },
        video: {
          position: 'bottom-right',
          scale: 0.1,
          opacity: 0.85,
          padding: 15,
          displayMode: 'static',
          fadeIn: true,
          fadeOut: true,
        },
      },
      'instagram-story': {
        image: {
          position: 'top-left',
          scale: 0.15,
          opacity: 0.9,
          padding: 25,
        },
        video: {
          position: 'top-left',
          scale: 0.12,
          opacity: 0.9,
          padding: 20,
          displayMode: 'static',
          fadeIn: true,
          fadeOut: true,
        },
      },
      'instagram-reel': {
        image: {
          position: 'bottom-right',
          scale: 0.1,
          opacity: 0.85,
          padding: 15,
        },
        video: {
          position: 'bottom-right',
          scale: 0.1,
          opacity: 0.85,
          padding: 15,
          displayMode: 'intro',
          introDuration: 2,
          fadeIn: true,
          fadeOut: true,
        },
      },
      tiktok: {
        image: {
          position: 'bottom-left',
          scale: 0.1,
          opacity: 0.85,
          padding: 20,
        },
        video: {
          position: 'bottom-left',
          scale: 0.1,
          opacity: 0.85,
          padding: 15,
          displayMode: 'intro',
          introDuration: 2,
          fadeIn: true,
          fadeOut: true,
        },
      },
      youtube: {
        image: {
          position: 'bottom-right',
          scale: 0.15,
          opacity: 0.9,
          padding: 25,
        },
        video: {
          position: 'bottom-right',
          scale: 0.12,
          opacity: 0.85,
          padding: 20,
          displayMode: 'static',
          fadeIn: true,
          fadeOut: true,
        },
      },
      'youtube-short': {
        image: {
          position: 'top-right',
          scale: 0.12,
          opacity: 0.9,
          padding: 20,
        },
        video: {
          position: 'top-right',
          scale: 0.1,
          opacity: 0.85,
          padding: 15,
          displayMode: 'intro',
          introDuration: 2,
          fadeIn: true,
          fadeOut: true,
        },
      },
      twitter: {
        image: {
          position: 'bottom-right',
          scale: 0.12,
          opacity: 0.9,
          padding: 20,
        },
        video: {
          position: 'bottom-right',
          scale: 0.12,
          opacity: 0.85,
          padding: 20,
          displayMode: 'intro-outro',
          introDuration: 2,
          outroDuration: 2,
          fadeIn: true,
          fadeOut: true,
        },
      },
      linkedin: {
        image: {
          position: 'bottom-right',
          scale: 0.15,
          opacity: 1.0,
          padding: 25,
        },
        video: {
          position: 'bottom-right',
          scale: 0.15,
          opacity: 0.9,
          padding: 25,
          displayMode: 'intro-outro',
          introDuration: 3,
          outroDuration: 3,
          fadeIn: true,
          fadeOut: true,
        },
      },
      facebook: {
        image: {
          position: 'bottom-right',
          scale: 0.15,
          opacity: 0.9,
          padding: 20,
        },
        video: {
          position: 'bottom-right',
          scale: 0.12,
          opacity: 0.85,
          padding: 20,
          displayMode: 'static',
          fadeIn: true,
          fadeOut: true,
        },
      },
      pinterest: {
        image: {
          position: 'bottom-left',
          scale: 0.12,
          opacity: 0.9,
          padding: 20,
        },
        video: {
          position: 'bottom-left',
          scale: 0.12,
          opacity: 0.85,
          padding: 20,
          displayMode: 'outro',
          outroDuration: 3,
          fadeIn: true,
          fadeOut: true,
        },
      },
    };
  }

  /**
   * Get list of supported platforms
   */
  getSupportedPlatforms(): string[] {
    return Object.keys(this.getPlatformDefaults());
  }

  /**
   * Get platform display names
   */
  getPlatformDisplayNames(): Record<string, string> {
    return {
      'instagram': 'Instagram Post',
      'instagram-story': 'Instagram Story',
      'instagram-reel': 'Instagram Reel',
      'tiktok': 'TikTok',
      'youtube': 'YouTube',
      'youtube-short': 'YouTube Short',
      'twitter': 'Twitter/X',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
    };
  }

  /**
   * Estimate processing time
   */
  estimateProcessingTime(items: BatchProcessItem[]): number {
    let totalSeconds = 0;
    
    for (const item of items) {
      if (item.type === 'image') {
        totalSeconds += 2; // ~2 seconds per image
      } else {
        totalSeconds += 30; // ~30 seconds per video (estimate)
      }
    }
    
    return totalSeconds;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }
}

export const batchLogoProcessor = new BatchLogoProcessor();
