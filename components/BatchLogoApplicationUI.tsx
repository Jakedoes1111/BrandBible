import React, { useState, useEffect } from 'react';
import { batchLogoProcessor, BatchProcessItem, BatchProcessConfig, BatchProcessResult } from '../services/batchLogoProcessor';
import { assetStorage } from '../services/assetStorage';
import { SocialMediaPost } from '../types';

interface BatchLogoApplicationUIProps {
  posts: SocialMediaPost[];
  onComplete?: (updatedPosts: SocialMediaPost[]) => void;
}

const BatchLogoApplicationUI: React.FC<BatchLogoApplicationUIProps> = ({ posts, onComplete }) => {
  const [uploadedLogos, setUploadedLogos] = useState<any[]>([]);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [result, setResult] = useState<BatchProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [applyToImages, setApplyToImages] = useState(true);
  const [applyToVideos, setApplyToVideos] = useState(true);

  useEffect(() => {
    // Load uploaded logos
    assetStorage.getAssetsByType('logo').then(logos => {
      setUploadedLogos(logos);
      if (logos.length > 0) {
        setSelectedLogoUrl(logos[0].preview || logos[0].fileData);
      }
    }).catch(console.error);
  }, []);

  const handleBatchProcess = async () => {
    if (!selectedLogoUrl) {
      setError('Please select a logo first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentItem(0);
    setResult(null);

    try {
      // Convert posts to batch items
      const items: BatchProcessItem[] = posts
        .filter(post => post.visualUrl) // Only posts with visuals
        .map(post => ({
          id: post.platform,
          url: post.visualUrl!,
          type: post.visualType || 'image',
          platform: post.platform,
          status: 'pending' as const,
        }));

      setTotalItems(items.length);

      if (items.length === 0) {
        setError('No images or videos to process');
        setIsProcessing(false);
        return;
      }

      const config: BatchProcessConfig = {
        logoUrl: selectedLogoUrl,
        platform: selectedPlatform || undefined,
        applyToImages,
        applyToVideos,
      };

      const batchResult = await batchLogoProcessor.processBatch(
        items,
        config,
        (current, total, item) => {
          setCurrentItem(current);
          setTotalItems(total);
        }
      );

      setResult(batchResult);

      // Update posts with new visual URLs
      if (onComplete) {
        const updatedPosts = posts.map(post => {
          const resultItem = batchResult.items.find(item => item.url === post.visualUrl);
          if (resultItem && resultItem.resultUrl && resultItem.status === 'completed') {
            return { ...post, visualUrl: resultItem.resultUrl };
          }
          return post;
        });
        onComplete(updatedPosts);
      }
    } catch (err: any) {
      setError(err.message || 'Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const postsWithVisuals = posts.filter(p => p.visualUrl);
  const imageCount = postsWithVisuals.filter(p => p.visualType === 'image' || !p.visualType).length;
  const videoCount = postsWithVisuals.filter(p => p.visualType === 'video').length;
  const estimatedTime = batchLogoProcessor.estimateProcessingTime(
    postsWithVisuals.map(p => ({
      id: p.platform,
      url: p.visualUrl!,
      type: p.visualType || 'image',
      status: 'pending' as const,
    }))
  );

  const platformOptions = batchLogoProcessor.getPlatformDisplayNames();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Batch Logo Application</h2>
        <p className="text-gray-400 text-sm">
          Apply your logo to all generated content at once with platform-optimized settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{imageCount}</div>
          <div className="text-sm text-gray-400">Images</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{videoCount}</div>
          <div className="text-sm text-gray-400">Videos</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">~{Math.ceil(estimatedTime / 60)}m</div>
          <div className="text-sm text-gray-400">Est. Time</div>
        </div>
      </div>

      {/* Logo Selection */}
      {uploadedLogos.length === 0 ? (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            ⚠️ No logos uploaded. Please upload a logo in the Brand Assets section first.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Select Logo {uploadedLogos.length > 1 && `(${uploadedLogos.length} available)`}
          </label>
          <div className="grid grid-cols-4 gap-3">
            {uploadedLogos.map((logo) => (
              <button
                key={logo.id}
                onClick={() => setSelectedLogoUrl(logo.preview || logo.fileData)}
                disabled={isProcessing}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedLogoUrl === (logo.preview || logo.fileData)
                    ? 'border-green-500 ring-2 ring-green-400'
                    : 'border-gray-700 hover:border-gray-600'
                } disabled:opacity-50`}
              >
                <img
                  src={logo.preview || logo.fileData}
                  alt={logo.name}
                  className="w-full h-full object-contain bg-gray-800"
                />
                {selectedLogoUrl === (logo.preview || logo.fileData) && (
                  <div className="absolute top-1 right-1 bg-green-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Platform Optimization (Optional)
        </label>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
        >
          <option value="">Auto-detect from post platform</option>
          {Object.entries(platformOptions).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Platform-specific defaults will be applied for position, size, and timing
        </p>
      </div>

      {/* Content Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Apply Logo To
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 text-gray-300">
            <input
              type="checkbox"
              checked={applyToImages}
              onChange={(e) => setApplyToImages(e.target.checked)}
              disabled={isProcessing}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm">
              Images ({imageCount} items)
            </span>
          </label>
          <label className="flex items-center gap-3 text-gray-300">
            <input
              type="checkbox"
              checked={applyToVideos}
              onChange={(e) => setApplyToVideos(e.target.checked)}
              disabled={isProcessing}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm">
              Videos ({videoCount} items)
            </span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Processing Content...</p>
              <p className="text-gray-400 text-sm">
                {currentItem} of {totalItems} items complete
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${(currentItem / totalItems) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            This may take several minutes for videos. Please don't close this window.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Processing Complete!</h3>
            <div className="text-green-400 text-2xl">✓</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{result.completed}</div>
              <div className="text-xs text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{result.failed}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {batchLogoProcessor.formatDuration(result.duration)}
              </div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
          </div>

          {result.failed > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-300 text-sm font-semibold mb-2">
                Some items failed to process:
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                {result.items
                  .filter(item => item.status === 'failed')
                  .map((item, idx) => (
                    <li key={idx}>• {item.platform}: {item.error}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleBatchProcess}
        disabled={isProcessing || !selectedLogoUrl || uploadedLogos.length === 0 || (!applyToImages && !applyToVideos)}
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
            Processing...
          </>
        ) : (
          <>
            <span>🎨</span>
            Apply Logo to All Content
          </>
        )}
      </button>

      {/* Info Box */}
      {!isProcessing && !result && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-semibold mb-2 text-sm">💡 How it works:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Platform-optimized settings automatically applied</li>
            <li>• Images process in ~2 seconds each</li>
            <li>• Videos process in ~30 seconds each</li>
            <li>• All processing happens locally in your browser</li>
            <li>• You can adjust individual items afterward if needed</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BatchLogoApplicationUI;
