import React, { useState, useEffect } from 'react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'document' | 'guidelines';
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  category: string;
  brandId?: string;
  createdAt: Date;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: {
    platform?: string;
    engagement?: {
      likes: number;
      shares: number;
      comments: number;
    };
    performance?: number;
  };
}

interface AssetManagerProps {
  brandIdentity?: any;
  onAssetSelected: (asset: Asset) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ brandIdentity, onAssetSelected }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'performance'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const categories = ['all', 'logos', 'social-media', 'brand-guidelines', 'videos', 'images'];
  const types = ['all', 'image', 'video', 'logo', 'document', 'guidelines'];
  const availableTags = ['brand', 'logo', 'instagram', 'tiktok', 'linkedin', 'facebook', 'twitter', 'high-performing', 'trending', 'featured'];

  useEffect(() => {
    loadSampleAssets();
  }, [brandIdentity]);

  useEffect(() => {
    filterAssets();
  }, [assets, selectedCategory, selectedType, searchQuery, selectedTags, sortBy]);

  const loadSampleAssets = () => {
    const sampleAssets: Asset[] = [
      {
        id: '1',
        name: 'Primary Logo',
        type: 'logo',
        url: 'https://picsum.photos/400/400?random=logo1',
        thumbnailUrl: 'https://picsum.photos/200/200?random=logo1',
        tags: ['brand', 'logo', 'featured'],
        category: 'logos',
        brandId: brandIdentity?.name || 'default',
        createdAt: new Date(Date.now() - 86400000),
        size: 245760,
        dimensions: { width: 400, height: 400 }
      },
      {
        id: '2',
        name: 'Instagram Post - Product Launch',
        type: 'image',
        url: 'https://picsum.photos/800/800?random=insta1',
        thumbnailUrl: 'https://picsum.photos/200/200?random=insta1',
        tags: ['instagram', 'brand', 'high-performing'],
        category: 'social-media',
        brandId: brandIdentity?.name || 'default',
        createdAt: new Date(Date.now() - 172800000),
        size: 524288,
        dimensions: { width: 800, height: 800 },
        metadata: {
          platform: 'instagram',
          engagement: { likes: 2500, shares: 150, comments: 80 },
          performance: 85
        }
      },
      {
        id: '3',
        name: 'TikTok Video - Behind the Scenes',
        type: 'video',
        url: 'https://sample-video.com/tiktok1.mp4',
        thumbnailUrl: 'https://picsum.photos/200/200?random=video1',
        tags: ['tiktok', 'video', 'trending'],
        category: 'videos',
        brandId: brandIdentity?.name || 'default',
        createdAt: new Date(Date.now() - 259200000),
        size: 2097152,
        metadata: {
          platform: 'tiktok',
          engagement: { likes: 5000, shares: 300, comments: 200 },
          performance: 92
        }
      },
      {
        id: '4',
        name: 'Brand Guidelines PDF',
        type: 'document',
        url: 'https://sample-docs.com/guidelines.pdf',
        tags: ['brand', 'guidelines', 'featured'],
        category: 'brand-guidelines',
        brandId: brandIdentity?.name || 'default',
        createdAt: new Date(Date.now() - 345600000),
        size: 1048576
      },
      {
        id: '5',
        name: 'LinkedIn Post - Industry Insights',
        type: 'image',
        url: 'https://picsum.photos/1200/630?random=linkedin1',
        thumbnailUrl: 'https://picsum.photos/200/200?random=linkedin1',
        tags: ['linkedin', 'brand', 'professional'],
        category: 'social-media',
        brandId: brandIdentity?.name || 'default',
        createdAt: new Date(Date.now() - 432000000),
        size: 786432,
        dimensions: { width: 1200, height: 630 },
        metadata: {
          platform: 'linkedin',
          engagement: { likes: 800, shares: 120, comments: 45 },
          performance: 76
        }
      }
    ];

    setAssets(sampleAssets);
  };

  const filterAssets = () => {
    let filtered = [...assets];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(asset =>
        selectedTags.some(tag => asset.tags.includes(tag))
      );
    }

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'performance':
          return (b.metadata?.performance || 0) - (a.metadata?.performance || 0);
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    onAssetSelected(asset);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(asset => asset.id !== assetId));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null);
    }
  };

  const handleDownloadAsset = (asset: Asset) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPerformanceColor = (performance?: number) => {
    if (!performance) return 'text-gray-400';
    if (performance >= 80) return 'text-green-400';
    if (performance >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'logo': return '🎯';
      case 'document': return '📄';
      case 'guidelines': return '📋';
      default: return '📎';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Asset Management</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            {viewMode === 'grid' ? '📋' : '🔲'}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category and Type Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
            >
              <option value="date" className="bg-gray-800">Date Created</option>
              <option value="name" className="bg-gray-800">Name</option>
              <option value="performance" className="bg-gray-800">Performance</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>No assets found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-2 text-blue-400 hover:text-blue-300"
          >
            Upload your first asset
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              onClick={() => handleAssetClick(asset)}
              className={`bg-gray-800/50 rounded-lg border transition-all cursor-pointer ${
                selectedAsset?.id === asset.id
                  ? 'border-blue-600 bg-blue-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {viewMode === 'grid' ? (
                <div className="p-4">
                  <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{getTypeIcon(asset.type)}</span>
                    )}
                  </div>
                  <h4 className="font-medium text-white mb-1 truncate">{asset.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {asset.type}
                    </span>
                    {asset.metadata?.performance && (
                      <span className={`text-xs font-medium ${getPerformanceColor(asset.metadata.performance)}`}>
                        {asset.metadata.performance}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">
                        {tag}
                      </span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{asset.tags.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(asset.createdAt)}</span>
                    <span>{formatFileSize(asset.size)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{asset.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{asset.type}</span>
                      <span>{formatDate(asset.createdAt)}</span>
                      <span>{formatFileSize(asset.size)}</span>
                      {asset.metadata?.performance && (
                        <span className={getPerformanceColor(asset.metadata.performance)}>
                          {asset.metadata.performance}% performance
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAsset(asset);
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{selectedAsset.name}</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                  {selectedAsset.thumbnailUrl ? (
                    <img
                      src={selectedAsset.thumbnailUrl}
                      alt={selectedAsset.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-6xl">{getTypeIcon(selectedAsset.type)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadAsset(selectedAsset)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(selectedAsset.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedAsset.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white capitalize">{selectedAsset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{formatFileSize(selectedAsset.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{formatDate(selectedAsset.createdAt)}</span>
                    </div>
                    {selectedAsset.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions:</span>
                        <span className="text-white">{selectedAsset.dimensions.width} × {selectedAsset.dimensions.height}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedAsset.metadata && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      {selectedAsset.metadata.platform && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform:</span>
                          <span className="text-white capitalize">{selectedAsset.metadata.platform}</span>
                        </div>
                      )}
                      {selectedAsset.metadata.performance && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Performance Score:</span>
                          <span className={getPerformanceColor(selectedAsset.metadata.performance)}>
                            {selectedAsset.metadata.performance}%
                          </span>
                        </div>
                      )}
                      {selectedAsset.metadata.engagement && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Likes:</span>
                            <span className="text-white">{selectedAsset.metadata.engagement.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Shares:</span>
                            <span className="text-white">{selectedAsset.metadata.engagement.shares.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Comments:</span>
                            <span className="text-white">{selectedAsset.metadata.engagement.comments.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;
