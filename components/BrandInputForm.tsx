import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import AssetUploader, { UploadedAsset } from './AssetUploader';
import { assetStorage } from '../services/assetStorage';

interface BrandInputFormProps {
  onGenerate: (mission: string, uploadedAssets?: UploadedAsset[]) => void;
  isLoading: boolean;
}

const BrandInputForm: React.FC<BrandInputFormProps> = ({ onGenerate, isLoading }) => {
  const [mission, setMission] = useState('');
  const [showAssetUpload, setShowAssetUpload] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [assetSummary, setAssetSummary] = useState({ total: 0, byType: {} as any });

  useEffect(() => {
    // Load existing assets on mount
    assetStorage.getAssetSummary().then(setAssetSummary).catch(console.error);
  }, []);

  const handleAssetsUploaded = async (assets: UploadedAsset[]) => {
    setUploadedAssets(assets);
    try {
      await assetStorage.saveAssets(assets);
      const summary = await assetStorage.getAssetSummary();
      setAssetSummary(summary);
    } catch (error) {
      console.error('Failed to save assets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Load all assets from storage before generating
    const allAssets = await assetStorage.getAssets();
    onGenerate(mission, allAssets);
  };

  return (
    <div className="space-y-6">
      {/* Asset Upload Section */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">0. Upload Brand Assets (Optional)</h2>
            <p className="text-sm text-gray-400 mt-1">
              Upload existing logos, products, or marketing materials
            </p>
          </div>
          <button
            onClick={() => setShowAssetUpload(!showAssetUpload)}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            {showAssetUpload ? '▼' : '▶'}
          </button>
        </div>

        {assetSummary.total > 0 && !showAssetUpload && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">
                {assetSummary.total} asset{assetSummary.total !== 1 ? 's' : ''} uploaded
                {assetSummary.byType?.logo && (
                  <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                    {assetSummary.byType.logo} Logo{assetSummary.byType.logo !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <button
                onClick={() => setShowAssetUpload(true)}
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                View/Edit
              </button>
            </div>
            {assetSummary.byType?.logo && (
              <div className="text-xs text-green-300 bg-green-900/20 px-3 py-2 rounded border border-green-500/30">
                💡 Your uploaded logo{assetSummary.byType.logo !== 1 ? 's' : ''} will be used instead of generating new ones
              </div>
            )}
          </div>
        )}

        {showAssetUpload && (
          <div className="mt-4">
            <AssetUploader
              onAssetsUploaded={handleAssetsUploaded}
              existingAssets={uploadedAssets}
            />
          </div>
        )}
      </div>

      {/* Mission Input Section */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-2xl shadow-black/30 sticky top-8">
        <h2 className="text-2xl font-bold mb-4 text-white">1. Your Mission</h2>
        <p className="text-gray-300 mb-6">Describe your company's purpose, values, and what you aim to achieve. The more detail, the better the result.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="e.g., To empower small businesses with accessible and user-friendly financial tools, helping them grow and succeed."
          className="w-full h-40 p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all text-gray-200 placeholder:text-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !mission}
          className="mt-4 w-full bg-green-400 text-black font-bold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-green-900 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"
        >
          {isLoading ? (
            <>
              <Spinner className="-ml-1 mr-3 h-5 w-5 text-black" title="Generating brand bible" />
              Generating...
            </>
          ) : (
            'Generate Brand Bible'
          )}
        </button>
      </form>
      </div>
    </div>
  );
};

export default BrandInputForm;