import React, { useState } from 'react';
import { BrandIdentity } from '../types';
import { BulkContentGenerator, GenerationConfig, ContentCampaign, ContentMix } from '../services/bulkContentGenerator';
import { exportCampaignToCSV, downloadBlob } from '../utils/exportHelpers';
import { contentStorage } from '../services/contentStorage';

interface BulkContentGeneratorUIProps {
  brandIdentity: BrandIdentity | null;
}

const BulkContentGeneratorUI: React.FC<BulkContentGeneratorUIProps> = ({ brandIdentity }) => {
  const [config, setConfig] = useState<GenerationConfig>({
    duration: 30,
    postsPerDay: 2,
    platforms: ['instagram', 'twitter', 'linkedin'],
    contentMix: {
      promotional: 30,
      educational: 30,
      storytelling: 20,
      userGenerated: 20,
    },
    theme: '',
    includeHashtags: true,
    includeImages: true,
  });

  const [campaign, setCampaign] = useState<ContentCampaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleGenerate = async () => {
    if (!brandIdentity) return;

    setIsGenerating(true);
    setProgress(0);
    setProgressMessage('Initializing...');

    const generator = new BulkContentGenerator();

    try {
      const result = await generator.generateCampaign(brandIdentity, config);
      setCampaign(result);

      // Save all posts to calendar
      setProgressMessage('Saving to calendar...');
      for (const post of result.posts) {
        await contentStorage.savePost(post);
      }

      setProgressMessage('Complete!');
      setProgress(100);
    } catch (error) {
      console.error('Failed to generate campaign:', error);
      alert('Failed to generate campaign. Please try again.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
    }
  };

  const handleExportCSV = () => {
    if (!campaign) return;

    const csv = exportCampaignToCSV(campaign);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `${campaign.name.replace(/\s+/g, '-')}.csv`);
  };

  const handlePlatformToggle = (platform: string) => {
    setConfig(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const updateContentMix = (type: keyof ContentMix, value: number) => {
    setConfig(prev => ({
      ...prev,
      contentMix: {
        ...prev.contentMix,
        [type]: value,
      },
    }));
  };

  const totalMix = Object.values(config.contentMix).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Bulk Content Generator</h2>
        <p className="text-gray-400 mb-6">
          Generate {config.duration} days of content ({config.duration * config.postsPerDay} posts) in one click
        </p>

        {!brandIdentity && (
          <div className="bg-yellow-900/20 border border-yellow-500/40 rounded-lg p-4 mb-6">
            <p className="text-yellow-200">
              ⚠️ Please generate a brand identity first before creating bulk content
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Duration */}
          <div>
            <label className="block text-white font-semibold mb-3">Campaign Duration</label>
            <div className="flex gap-3">
              {[30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setConfig(prev => ({ ...prev, duration: days as any }))}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${config.duration === days
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Posts Per Day */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Posts Per Day: {config.postsPerDay}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={config.postsPerDay}
              onChange={(e) => setConfig(prev => ({ ...prev, postsPerDay: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 post</span>
              <span>5 posts</span>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="mt-6">
          <label className="block text-white font-semibold mb-3">Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'].map(platform => (
              <button
                key={platform}
                onClick={() => handlePlatformToggle(platform)}
                className={`py-2 px-4 rounded-lg font-medium transition-colors capitalize ${config.platforms.includes(platform)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {platform}
              </button>
            ))}
          </div>
          {config.platforms.length === 0 && (
            <p className="text-red-400 text-sm mt-2">Select at least one platform</p>
          )}
        </div>

        {/* Content Mix */}
        <div className="mt-6">
          <label className="block text-white font-semibold mb-3">
            Content Mix {totalMix !== 100 && <span className="text-red-400 text-sm">(Must equal 100%)</span>}
          </label>
          <div className="space-y-4">
            {Object.entries(config.contentMix).map(([type, value]) => (
              <div key={type}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 capitalize">{type}</span>
                  <span className="text-white font-medium">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(e) => updateContentMix(type as keyof ContentMix, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className={`mt-2 text-sm ${totalMix === 100 ? 'text-green-400' : 'text-red-400'}`}>
            Total: {totalMix}%
          </div>
        </div>

        {/* Theme */}
        <div className="mt-6">
          <label className="block text-white font-semibold mb-3">Campaign Theme (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Summer Launch, Holiday Campaign, Product Series"
            value={config.theme}
            onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
          />
        </div>

        {/* Options */}
        <div className="mt-6 space-y-2">
          <label className="flex items-center text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.includeHashtags}
              onChange={(e) => setConfig(prev => ({ ...prev, includeHashtags: e.target.checked }))}
              className="mr-2"
            />
            Include hashtag suggestions
          </label>
          <label className="flex items-center text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.includeImages}
              onChange={(e) => setConfig(prev => ({ ...prev, includeImages: e.target.checked }))}
              className="mr-2"
            />
            Include image prompts
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !brandIdentity || config.platforms.length === 0 || totalMix !== 100}
          className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating {config.duration * config.postsPerDay} posts...
            </span>
          ) : (
            `⚡ Generate ${config.duration * config.postsPerDay} Posts`
          )}
        </button>

        {isGenerating && progress > 0 && (
          <div className="mt-4">
            <div className="bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-400 text-sm">{progressMessage}</p>
              <p className="text-white font-semibold text-sm">{progress}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {campaign && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{campaign.name}</h3>
              <p className="text-gray-400">
                {campaign.statistics.totalPosts} posts generated • Created {campaign.createdAt.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{campaign.statistics.totalPosts}</div>
              <div className="text-gray-400 text-sm">Total Posts</div>
            </div>
            {Object.entries(campaign.statistics.postsByPlatform).map(([platform, count]) => (
              <div key={platform} className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white capitalize">{count}</div>
                <div className="text-gray-400 text-sm">{platform}</div>
              </div>
            ))}
          </div>

          {/* Post Preview */}
          <div>
            <h4 className="text-white font-semibold mb-3">Generated Posts Preview:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaign.posts.slice(0, 9).map(post => (
                <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden hover:border-green-500 border border-gray-700 transition-all">
                  {/* Visual Preview */}
                  {post.visualUrl && (
                    <div className="aspect-square bg-gray-900 relative">
                      <img
                        src={post.visualUrl}
                        alt={post.headline}
                        className="w-full h-full object-cover"
                      />
                      {post.status === 'ready' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ✓ Ready
                        </div>
                      )}
                      {post.status === 'failed' && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          ✗ Failed
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded capitalize">
                        {post.platform}
                      </span>
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded capitalize">
                        {post.contentType}
                      </span>
                    </div>

                    <h5 className="text-white font-medium mb-1 text-sm line-clamp-2">{post.headline}</h5>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">{post.body}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{post.date.toLocaleDateString()}</span>
                      <span>{post.scheduledTime}</span>
                    </div>

                    {post.hashtags.length > 0 && (
                      <div className="text-blue-400 text-xs mt-2 line-clamp-1">
                        {post.hashtags.slice(0, 3).join(' ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {campaign.posts.length > 9 && (
              <div className="text-center mt-6">
                <p className="text-gray-400 mb-2">
                  Showing 9 of {campaign.posts.length} posts
                </p>
                <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                  View All Posts →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkContentGeneratorUI;
