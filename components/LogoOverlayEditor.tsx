import React, { useState, useEffect } from 'react';
import { logoOverlayService, LogoOverlayConfig } from '../services/logoOverlayService';

interface LogoOverlayEditorProps {
  baseImageUrl: string;
  logoUrl: string;
  onApply: (modifiedImageUrl: string) => void;
  onCancel: () => void;
}

const LogoOverlayEditor: React.FC<LogoOverlayEditorProps> = ({
  baseImageUrl,
  logoUrl,
  onApply,
  onCancel,
}) => {
  const [config, setConfig] = useState<LogoOverlayConfig>({
    position: 'bottom-right',
    scale: 0.15,
    opacity: 0.9,
    padding: 20,
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = logoOverlayService.getPresetConfigs();

  // Generate preview whenever config changes
  useEffect(() => {
    generatePreview();
  }, [config, baseImageUrl, logoUrl]);

  const generatePreview = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await logoOverlayService.applyLogoToImage(
        baseImageUrl,
        logoUrl,
        config
      );
      setPreviewUrl(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
      console.error('Preview error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (previewUrl) {
      onApply(previewUrl);
    }
  };

  const applyPreset = (presetName: string) => {
    setConfig(presets[presetName]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add Logo to Image</h2>
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
          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-square">
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 p-4">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}
              {previewUrl && !error && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Logo Settings</h3>
            
            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(presets).map((presetName) => (
                  <button
                    key={presetName}
                    onClick={() => applyPreset(presetName)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors capitalize"
                  >
                    {presetName}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'top-left', label: '↖ Top Left' },
                  { value: 'top-right', label: '↗ Top Right' },
                  { value: 'center', label: '⊙ Center' },
                  { value: 'bottom-left', label: '↙ Bottom Left' },
                  { value: 'bottom-right', label: '↘ Bottom Right' },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => setConfig({ ...config, position: pos.value as any })}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      config.position === pos.value
                        ? 'bg-green-500 text-black font-semibold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size: {Math.round(config.scale * 100)}%
              </label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={config.scale}
                onChange={(e) => setConfig({ ...config, scale: parseFloat(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opacity: {Math.round(config.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.opacity}
                onChange={(e) => setConfig({ ...config, opacity: parseFloat(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>

            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Padding: {config.padding}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={config.padding}
                onChange={(e) => setConfig({ ...config, padding: parseInt(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing || !previewUrl}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Logo
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoOverlayEditor;
