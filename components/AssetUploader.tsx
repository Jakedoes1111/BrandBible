import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { assetStorage } from '../services/assetStorage';

export interface UploadedAsset {
  id: string;
  file: File;
  preview: string;
  type: 'logo' | 'product' | 'lifestyle' | 'marketing' | 'other';
  name: string;
  size: number;
  uploadedAt: Date;
}

interface AssetUploaderProps {
  onAssetsUploaded: (assets: UploadedAsset[]) => void;
  existingAssets?: UploadedAsset[];
}

const AssetUploader: React.FC<AssetUploaderProps> = ({ onAssetsUploaded, existingAssets = [] }) => {
  const [assets, setAssets] = useState<UploadedAsset[]>(existingAssets);
  const [selectedCategories, setSelectedCategories] = useState<UploadedAsset['type'][]>(['other']);
  const [activeCategory, setActiveCategory] = useState<UploadedAsset['type']>('other');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAssets: UploadedAsset[] = acceptedFiles.map(file => ({
      id: `asset_${Date.now()}_${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      type: activeCategory,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }));

    const updatedAssets = [...assets, ...newAssets];
    setAssets(updatedAssets);

    // Save to IndexedDB
    assetStorage.saveAssets(newAssets).then(() => {
      console.log('Assets saved to storage');
      onAssetsUploaded(updatedAssets);
    }).catch(err => {
      console.error('Failed to save assets:', err);
      // Still notify parent even if save failed (or maybe show error?)
      onAssetsUploaded(updatedAssets);
    });
  }, [assets, activeCategory, onAssetsUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    multiple: true,
  });

  const removeAsset = (id: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== id);
    setAssets(updatedAssets);
    onAssetsUploaded(updatedAssets);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryIcon = (type: UploadedAsset['type']): string => {
    switch (type) {
      case 'logo': return '🎨';
      case 'product': return '📦';
      case 'lifestyle': return '📸';
      case 'marketing': return '📢';
      default: return '📄';
    }
  };

  const categories: { value: UploadedAsset['type'], label: string, icon: string }[] = [
    { value: 'logo', label: 'Logo', icon: '🎨' },
    { value: 'product', label: 'Product', icon: '📦' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '📸' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'other', label: 'Other', icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          What type of assets are you uploading? <span className="text-xs text-gray-500">(Select multiple)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isSelected = selectedCategories.includes(cat.value);
            const isActive = activeCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => {
                  if (isSelected && !isActive) {
                    // If already selected but not active, make it active
                    setActiveCategory(cat.value);
                  } else if (isSelected && isActive && selectedCategories.length > 1) {
                    // If active and there are other selections, deselect it
                    const newCategories = selectedCategories.filter(c => c !== cat.value);
                    setSelectedCategories(newCategories);
                    setActiveCategory(newCategories[0]);
                  } else if (!isSelected) {
                    // If not selected, add it and make it active
                    setSelectedCategories([...selectedCategories, cat.value]);
                    setActiveCategory(cat.value);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-green-500 text-black ring-2 ring-green-400'
                    : isSelected
                      ? 'bg-green-500/40 text-white border-2 border-green-500'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                title={isActive ? 'Active category for uploads' : isSelected ? 'Click to make active or click again to deselect' : 'Click to select'}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
                {isActive && <span className="ml-1.5 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
        {selectedCategories.length > 1 && (
          <p className="text-xs text-gray-500 mt-2">
            <strong className="text-green-400">{categories.find(c => c.value === activeCategory)?.label}</strong> is active for new uploads.
            Click other selected categories to make them active.
          </p>
        )}
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-700 bg-gray-800/50 hover:border-green-500/50 hover:bg-gray-800'
          }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <div className="text-4xl">📁</div>
          {isDragActive ? (
            <p className="text-green-400 font-semibold">Drop your files here...</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported: Images (PNG, JPG, SVG) and Videos (MP4, MOV)
              </p>
              <p className="text-xs text-gray-600">
                Uploading as: <span className="text-green-400">{categories.find(c => c.value === activeCategory)?.label}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Assets List */}
      {assets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Uploaded Assets ({assets.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="relative group bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-green-500/50 transition-all"
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-900 flex items-center justify-center">
                  {asset.file.type.startsWith('image') ? (
                    <img
                      src={asset.preview}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🎬</div>
                  )}
                </div>

                {/* Info Overlay */}
                <div className="p-2 space-y-1">
                  <div className="flex items-start gap-1">
                    <span className="text-sm">{getCategoryIcon(asset.type)}</span>
                    <p className="text-xs text-gray-300 truncate flex-1" title={asset.name}>
                      {asset.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(asset.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  ×
                </button>

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {categories.find(c => c.value === asset.type)?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {assets.length === 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Pro Tips:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Upload your logo to ensure consistent branding</li>
            <li>• Add product images for better content generation</li>
            <li>• Lifestyle shots help AI understand your brand style</li>
            <li>• Marketing materials guide the visual direction</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssetUploader;
