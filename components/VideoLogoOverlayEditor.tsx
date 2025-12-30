import React, { useState, useEffect, useRef } from 'react';
import { logoOverlayService, VideoLogoConfig } from '../services/logoOverlayService';

interface VideoLogoOverlayEditorProps {
  baseVideoUrl: string;
  logoUrl: string;
  onApply: (modifiedVideoUrl: string) => void;
  onCancel: () => void;
}

const VideoLogoOverlayEditor: React.FC<VideoLogoOverlayEditorProps> = ({
  baseVideoUrl,
  logoUrl,
  onApply,
  onCancel,
}) => {
  const [config, setConfig] = useState<VideoLogoConfig>({
    position: 'bottom-right',
    scale: 0.12,
    opacity: 0.85,
    padding: 20,
    displayMode: 'static',
    introDuration: 3,
    outroDuration: 3,
    fadeIn: true,
    fadeOut: true,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const presets = logoOverlayService.getVideoPresetConfigs();

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await logoOverlayService.applyLogoToVideo(
        baseVideoUrl,
        logoUrl,
        config,
        (prog) => setProgress(Math.round(prog))
      );
      setProcessedVideoUrl(result);
    } catch (err: any) {
      setError(err.message || 'Failed to process video');
      console.error('Video processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (processedVideoUrl) {
      onApply(processedVideoUrl);
    }
  };

  const applyPreset = (presetName: string) => {
    setConfig(presets[presetName]);
    setProcessedVideoUrl(null); // Clear preview on config change
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Logo to Video</h2>
            <p className="text-sm text-gray-400 mt-1">Configure logo placement and timing</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {processedVideoUrl ? 'Processed Video' : 'Original Video'}
              </h3>
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={processedVideoUrl || baseVideoUrl}
                  controls
                  loop
                  className="w-full rounded-lg"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-white font-semibold mb-2">Processing Video...</p>
                    <div className="w-64 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{progress}%</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!processedVideoUrl && !isProcessing && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  ℹ️ Configure settings below, then click "Preview with Logo" to see the result
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Logo Settings</h3>
              
              {/* Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(presets).map(([presetName, presetConfig]) => (
                    <button
                      key={presetName}
                      onClick={() => applyPreset(presetName)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors capitalize text-sm disabled:opacity-50"
                    >
                      {presetName.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'static', label: '🔒 Static (Always On)', desc: 'Logo visible throughout' },
                    { value: 'intro', label: '▶️ Intro Only', desc: 'First few seconds' },
                    { value: 'outro', label: '⏹️ Outro Only', desc: 'Last few seconds' },
                    { value: 'intro-outro', label: '⏯️ Bookends', desc: 'Intro & outro' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => {
                        setConfig({ ...config, displayMode: mode.value as any });
                        setProcessedVideoUrl(null);
                      }}
                      disabled={isProcessing}
                      className={`px-3 py-3 rounded-lg text-left transition-all ${
                        config.displayMode === mode.value
                          ? 'bg-green-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <div className="font-semibold text-sm">{mode.label}</div>
                      <div className="text-xs opacity-75">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Settings */}
              {config.displayMode !== 'static' && (
                <div className="mb-6 space-y-4">
                  {(config.displayMode === 'intro' || config.displayMode === 'intro-outro') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Intro Duration: {config.introDuration}s
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={config.introDuration}
                        onChange={(e) => {
                          setConfig({ ...config, introDuration: parseFloat(e.target.value) });
                          setProcessedVideoUrl(null);
                        }}
                        disabled={isProcessing}
                        className="w-full accent-green-500"
                      />
                    </div>
                  )}
                  
                  {(config.displayMode === 'outro' || config.displayMode === 'intro-outro') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Outro Duration: {config.outroDuration}s
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={config.outroDuration}
                        onChange={(e) => {
                          setConfig({ ...config, outroDuration: parseFloat(e.target.value) });
                          setProcessedVideoUrl(null);
                        }}
                        disabled={isProcessing}
                        className="w-full accent-green-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Position */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'top-left', label: '↖' },
                    { value: 'top-right', label: '↗' },
                    { value: 'center', label: '⊙' },
                    { value: 'bottom-left', label: '↙' },
                    { value: 'bottom-right', label: '↘' },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => {
                        setConfig({ ...config, position: pos.value as any });
                        setProcessedVideoUrl(null);
                      }}
                      disabled={isProcessing}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        config.position === pos.value
                          ? 'bg-green-500 text-black font-semibold'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Size: {Math.round(config.scale * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.01"
                  value={config.scale}
                  onChange={(e) => {
                    setConfig({ ...config, scale: parseFloat(e.target.value) });
                    setProcessedVideoUrl(null);
                  }}
                  disabled={isProcessing}
                  className="w-full accent-green-500"
                />
              </div>

              {/* Opacity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Opacity: {Math.round(config.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.opacity}
                  onChange={(e) => {
                    setConfig({ ...config, opacity: parseFloat(e.target.value) });
                    setProcessedVideoUrl(null);
                  }}
                  disabled={isProcessing}
                  className="w-full accent-green-500"
                />
              </div>

              {/* Padding */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Padding: {config.padding}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config.padding}
                  onChange={(e) => {
                    setConfig({ ...config, padding: parseInt(e.target.value) });
                    setProcessedVideoUrl(null);
                  }}
                  disabled={isProcessing}
                  className="w-full accent-green-500"
                />
              </div>

              {/* Fade Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fade Effects
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={config.fadeIn}
                      onChange={(e) => {
                        setConfig({ ...config, fadeIn: e.target.checked });
                        setProcessedVideoUrl(null);
                      }}
                      disabled={isProcessing}
                      className="accent-green-500"
                    />
                    Fade In
                  </label>
                  <label className="flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={config.fadeOut}
                      onChange={(e) => {
                        setConfig({ ...config, fadeOut: e.target.checked });
                        setProcessedVideoUrl(null);
                      }}
                      disabled={isProcessing}
                      className="accent-green-500"
                    />
                    Fade Out
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 sticky bottom-0 bg-gray-900">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {!processedVideoUrl && (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : '👁️ Preview with Logo'}
              </button>
            )}
            
            {processedVideoUrl && (
              <>
                <button
                  onClick={() => setProcessedVideoUrl(null)}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  🔄 Adjust Settings
                </button>
                <button
                  onClick={handleApply}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
                >
                  ✅ Apply Logo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLogoOverlayEditor;
