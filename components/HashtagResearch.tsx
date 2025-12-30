import React, { useState } from 'react';
import { ContentRecommendationEngine } from '../services/contentRecommendations';
import { BrandIdentity } from '../types';

interface HashtagData {
  tag: string;
  category: 'trending' | 'branded' | 'niche' | 'community';
  volume: number; // estimated posts
  competition: 'low' | 'medium' | 'high';
  relevance: number; // 0-100
  avgEngagement: number;
}

interface HashtagSet {
  id: string;
  name: string;
  tags: string[];
  platform: string;
  createdAt: Date;
}

interface HashtagResearchProps {
  brandIdentity: BrandIdentity | null;
}

const HashtagResearch: React.FC<HashtagResearchProps> = ({ brandIdentity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'twitter' | 'tiktok' | 'linkedin'>('instagram');
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set());
  const [savedSets, setSavedSets] = useState<HashtagSet[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchHashtags = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockHashtags: HashtagData[] = generateMockHashtags(searchQuery, selectedPlatform);
    setHashtags(mockHashtags);
    setIsSearching(false);
  };

  const generateMockHashtags = (query: string, platform: string): HashtagData[] => {
    const baseTag = query.toLowerCase().replace(/\s+/g, '');
    const categories: Array<'trending' | 'branded' | 'niche' | 'community'> = ['trending', 'branded', 'niche', 'community'];

    return Array.from({ length: 20 }, (_, i) => ({
      tag: `#${baseTag}${i === 0 ? '' : i > 10 ? Math.random().toString(36).substring(7) : i}`,
      category: categories[i % 4],
      volume: Math.floor(Math.random() * 1000000) + 1000,
      competition: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
      relevance: Math.floor(Math.random() * 40) + 60,
      avgEngagement: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    })).sort((a, b) => b.relevance - a.relevance);
  };

  const toggleHashtag = (tag: string) => {
    const newSelected = new Set(selectedHashtags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      if (newSelected.size < getMaxHashtags(selectedPlatform)) {
        newSelected.add(tag);
      }
    }
    setSelectedHashtags(newSelected);
  };

  const getMaxHashtags = (platform: string): number => {
    const limits: Record<string, number> = {
      instagram: 30,
      twitter: 5,
      tiktok: 10,
      linkedin: 10,
    };
    return limits[platform] || 10;
  };

  const saveHashtagSet = () => {
    if (selectedHashtags.size === 0) return;

    const newSet: HashtagSet = {
      id: `set_${Date.now()}`,
      name: searchQuery || 'Untitled Set',
      tags: Array.from(selectedHashtags),
      platform: selectedPlatform,
      createdAt: new Date(),
    };

    setSavedSets([newSet, ...savedSets]);
    setSelectedHashtags(new Set());
  };

  const loadHashtagSet = (set: HashtagSet) => {
    setSelectedHashtags(new Set(set.tags));
    setSelectedPlatform(set.platform as any);
  };

  const deleteSet = (id: string) => {
    setSavedSets(savedSets.filter(s => s.id !== id));
  };

  const copyToClipboard = () => {
    const tags = Array.from(selectedHashtags).join(' ');
    navigator.clipboard.writeText(tags);
    alert('Hashtags copied to clipboard!');
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      trending: 'text-red-400 bg-red-900/20 border-red-500/30',
      branded: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      niche: 'text-green-400 bg-green-900/20 border-green-500/30',
      community: 'text-purple-400 bg-purple-900/20 border-purple-500/30',
    };
    return colors[category] || 'text-gray-400 bg-gray-800 border-gray-700';
  };

  const getCompetitionColor = (competition: string): string => {
    const colors: Record<string, string> = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400',
    };
    return colors[competition] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Hashtag Research</h2>
        <p className="text-gray-400 mb-6">
          Find the best hashtags for your content to maximize reach and engagement
        </p>

        {/* Platform Selection */}
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Platform</label>
          <div className="flex gap-3">
            {(['instagram', 'twitter', 'tiktok', 'linkedin'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  selectedPlatform === platform
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Max hashtags for {selectedPlatform}: {getMaxHashtags(selectedPlatform)}
          </p>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter topic or keyword (e.g., 'marketing', 'fitness')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchHashtags()}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500"
          />
          <button
            onClick={searchHashtags}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSearching ? '🔍 Searching...' : '🔍 Research'}
          </button>
        </div>
      </div>

      {/* Results */}
      {hashtags.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Results ({hashtags.length} hashtags)
            </h3>
            <div className="text-gray-400 text-sm">
              Selected: {selectedHashtags.size} / {getMaxHashtags(selectedPlatform)}
            </div>
          </div>

          {/* Filter by Category */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-gray-400 text-sm mr-2">Filter:</span>
            {['all', 'trending', 'branded', 'niche', 'community'].map(cat => (
              <button
                key={cat}
                className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 capitalize"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Hashtag Grid */}
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {hashtags.map((hashtag, idx) => (
              <div
                key={idx}
                onClick={() => toggleHashtag(hashtag.tag)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedHashtags.has(hashtag.tag)
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{hashtag.tag}</span>
                    {selectedHashtags.has(hashtag.tag) && (
                      <span className="text-green-400">✓</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(hashtag.category)}`}>
                    {hashtag.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs">Volume</div>
                    <div className="text-white font-medium">
                      {(hashtag.volume / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Competition</div>
                    <div className={`font-medium capitalize ${getCompetitionColor(hashtag.competition)}`}>
                      {hashtag.competition}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Relevance</div>
                    <div className="text-white font-medium">{hashtag.relevance}%</div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="text-gray-400 text-xs">Avg Engagement Rate</div>
                  <div className="text-green-400 font-bold">{hashtag.avgEngagement}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {selectedHashtags.size > 0 && (
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={saveHashtagSet}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Save Set
              </button>
              <button
                onClick={() => setSelectedHashtags(new Set())}
                className="px-6 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Sets */}
      {savedSets.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Saved Hashtag Sets</h3>
          <div className="space-y-3">
            {savedSets.map(set => (
              <div key={set.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{set.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {set.platform} • {set.tags.length} hashtags • {set.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadHashtagSet(set)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSet(set.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {set.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-blue-200 font-semibold mb-3 flex items-center gap-2">
          <span>💡</span> Hashtag Best Practices
        </h3>
        <ul className="text-blue-300 text-sm space-y-2">
          <li>• Mix trending, niche, and branded hashtags for best results</li>
          <li>• Use 5-10 hashtags on Instagram for optimal engagement</li>
          <li>• Keep it to 1-2 hashtags on Twitter to avoid looking spammy</li>
          <li>• Research hashtag volume and competition before using</li>
          <li>• Create a branded hashtag for your campaigns</li>
          <li>• Update your hashtag strategy monthly based on performance</li>
        </ul>
      </div>
    </div>
  );
};

export default HashtagResearch;
