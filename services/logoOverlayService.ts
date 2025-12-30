/**
 * Logo Overlay Service
 * Handles adding brand logos to generated images and videos
 */

export interface LogoOverlayConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  scale: number; // 0.1 to 1.0
  opacity: number; // 0 to 1
  padding: number; // padding from edges in pixels
}

export interface VideoLogoConfig extends LogoOverlayConfig {
  displayMode: 'static' | 'intro' | 'outro' | 'intro-outro';
  introDuration?: number; // seconds
  outroDuration?: number; // seconds
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export interface LogoPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class LogoOverlayService {
  /**
   * Apply logo overlay to an image using Canvas API
   */
  async applyLogoToImage(
    baseImageUrl: string,
    logoUrl: string,
    config: LogoOverlayConfig = {
      position: 'bottom-right',
      scale: 0.15,
      opacity: 0.9,
      padding: 20
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const baseImage = new Image();
      baseImage.crossOrigin = 'anonymous';
      
      baseImage.onload = () => {
        // Set canvas size to match base image
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        
        // Draw base image
        ctx.drawImage(baseImage, 0, 0);
        
        // Load and draw logo
        const logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';
        
        logoImage.onload = () => {
          // Calculate logo dimensions and position
          const placement = this.calculateLogoPlacement(
            baseImage.width,
            baseImage.height,
            logoImage.width,
            logoImage.height,
            config
          );
          
          // Apply opacity
          ctx.globalAlpha = config.opacity;
          
          // Draw logo
          ctx.drawImage(
            logoImage,
            placement.x,
            placement.y,
            placement.width,
            placement.height
          );
          
          // Reset opacity
          ctx.globalAlpha = 1.0;
          
          // Convert to data URL
          resolve(canvas.toDataURL('image/png'));
        };
        
        logoImage.onerror = () => reject(new Error('Failed to load logo'));
        logoImage.src = logoUrl;
      };
      
      baseImage.onerror = () => reject(new Error('Failed to load base image'));
      baseImage.src = baseImageUrl;
    });
  }

  /**
   * Calculate logo placement based on configuration
   */
  private calculateLogoPlacement(
    baseWidth: number,
    baseHeight: number,
    logoWidth: number,
    logoHeight: number,
    config: LogoOverlayConfig
  ): LogoPlacement {
    // Calculate scaled logo dimensions (maintain aspect ratio)
    const maxLogoWidth = baseWidth * config.scale;
    const maxLogoHeight = baseHeight * config.scale;
    
    let scaledWidth = logoWidth;
    let scaledHeight = logoHeight;
    
    // Scale down if needed
    if (logoWidth > maxLogoWidth || logoHeight > maxLogoHeight) {
      const widthRatio = maxLogoWidth / logoWidth;
      const heightRatio = maxLogoHeight / logoHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      scaledWidth = logoWidth * ratio;
      scaledHeight = logoHeight * ratio;
    }
    
    // Calculate position
    let x = 0;
    let y = 0;
    
    switch (config.position) {
      case 'top-left':
        x = config.padding;
        y = config.padding;
        break;
      case 'top-right':
        x = baseWidth - scaledWidth - config.padding;
        y = config.padding;
        break;
      case 'bottom-left':
        x = config.padding;
        y = baseHeight - scaledHeight - config.padding;
        break;
      case 'bottom-right':
        x = baseWidth - scaledWidth - config.padding;
        y = baseHeight - scaledHeight - config.padding;
        break;
      case 'center':
        x = (baseWidth - scaledWidth) / 2;
        y = (baseHeight - scaledHeight) / 2;
        break;
    }
    
    return {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    };
  }

  /**
   * Batch apply logo to multiple images
   */
  async batchApplyLogo(
    imageUrls: string[],
    logoUrl: string,
    config: LogoOverlayConfig,
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const result = await this.applyLogoToImage(imageUrls[i], logoUrl, config);
        results.push(result);
        onProgress?.(i + 1, imageUrls.length);
      } catch (error) {
        console.error(`Failed to apply logo to image ${i}:`, error);
        // Use original image if logo application fails
        results.push(imageUrls[i]);
      }
    }
    
    return results;
  }

  /**
   * Apply logo overlay to a video
   * Returns a blob URL of the processed video
   */
  async applyLogoToVideo(
    videoUrl: string,
    logoUrl: string,
    config: VideoLogoConfig = {
      position: 'bottom-right',
      scale: 0.15,
      opacity: 0.9,
      padding: 20,
      displayMode: 'static',
      fadeIn: false,
      fadeOut: false,
    },
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;

      video.onloadedmetadata = async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const duration = video.duration;
        const fps = 30; // Target 30 FPS
        const totalFrames = Math.floor(duration * fps);

        // Load logo
        const logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';

        logoImage.onload = async () => {
          try {
            const placement = this.calculateLogoPlacement(
              canvas.width,
              canvas.height,
              logoImage.width,
              logoImage.height,
              config
            );

            // Set up MediaRecorder
            const stream = canvas.captureStream(fps);
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: 2500000,
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                chunks.push(e.data);
              }
            };

            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              resolve(url);
            };

            mediaRecorder.onerror = (e) => {
              reject(new Error('MediaRecorder error: ' + e));
            };

            // Start recording
            mediaRecorder.start();
            video.play();

            let frameCount = 0;

            // Render frames
            const renderFrame = () => {
              if (video.paused || video.ended) {
                mediaRecorder.stop();
                return;
              }

              const currentTime = video.currentTime;
              const progress = (currentTime / duration) * 100;
              onProgress?.(progress);

              // Draw video frame
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Calculate logo opacity based on display mode
              let logoOpacity = config.opacity;

              if (config.displayMode === 'intro' && currentTime > (config.introDuration || 3)) {
                logoOpacity = 0;
              } else if (config.displayMode === 'outro' && currentTime < duration - (config.outroDuration || 3)) {
                logoOpacity = 0;
              } else if (config.displayMode === 'intro-outro') {
                if (currentTime > (config.introDuration || 3) && currentTime < duration - (config.outroDuration || 3)) {
                  logoOpacity = 0;
                }
              }

              // Apply fade effects
              if (config.fadeIn && config.displayMode !== 'outro') {
                const fadeInDuration = Math.min(config.introDuration || 3, 2);
                if (currentTime < fadeInDuration) {
                  logoOpacity *= currentTime / fadeInDuration;
                }
              }

              if (config.fadeOut && config.displayMode !== 'intro') {
                const fadeOutStart = duration - Math.min(config.outroDuration || 3, 2);
                if (currentTime > fadeOutStart) {
                  logoOpacity *= 1 - (currentTime - fadeOutStart) / (duration - fadeOutStart);
                }
              }

              // Draw logo if visible
              if (logoOpacity > 0) {
                ctx.globalAlpha = logoOpacity;
                ctx.drawImage(
                  logoImage,
                  placement.x,
                  placement.y,
                  placement.width,
                  placement.height
                );
                ctx.globalAlpha = 1.0;
              }

              frameCount++;
              requestAnimationFrame(renderFrame);
            };

            renderFrame();
          } catch (error) {
            reject(error);
          }
        };

        logoImage.onerror = () => reject(new Error('Failed to load logo'));
        logoImage.src = logoUrl;
      };

      video.onerror = () => reject(new Error('Failed to load video'));
    });
  }

  /**
   * Get default logo overlay configs for different use cases
   */
  getPresetConfigs(): Record<string, LogoOverlayConfig> {
    return {
      subtle: {
        position: 'bottom-right',
        scale: 0.1,
        opacity: 0.7,
        padding: 15,
      },
      standard: {
        position: 'bottom-right',
        scale: 0.15,
        opacity: 0.9,
        padding: 20,
      },
      prominent: {
        position: 'top-left',
        scale: 0.25,
        opacity: 1.0,
        padding: 25,
      },
      watermark: {
        position: 'center',
        scale: 0.3,
        opacity: 0.3,
        padding: 0,
      },
    };
  }

  /**
   * Get video-specific preset configs
   */
  getVideoPresetConfigs(): Record<string, VideoLogoConfig> {
    return {
      'corner-bug': {
        position: 'bottom-right',
        scale: 0.12,
        opacity: 0.85,
        padding: 20,
        displayMode: 'static',
        fadeIn: true,
        fadeOut: true,
      },
      'intro-only': {
        position: 'center',
        scale: 0.3,
        opacity: 1.0,
        padding: 0,
        displayMode: 'intro',
        introDuration: 3,
        fadeIn: true,
        fadeOut: true,
      },
      'outro-only': {
        position: 'center',
        scale: 0.3,
        opacity: 1.0,
        padding: 0,
        displayMode: 'outro',
        outroDuration: 3,
        fadeIn: true,
        fadeOut: true,
      },
      'bookends': {
        position: 'center',
        scale: 0.25,
        opacity: 1.0,
        padding: 0,
        displayMode: 'intro-outro',
        introDuration: 2,
        outroDuration: 2,
        fadeIn: true,
        fadeOut: true,
      },
    };
  }
}

export const logoOverlayService = new LogoOverlayService();
