import React, { useState, useEffect } from 'react';
import { oauthService } from '../services/oauthService';
import { advancedAIService } from '../services/advancedAIService';
import Spinner from './Spinner';

interface BulkPost {
  id: string;
  platform: string;
  content: {
    caption: string;
    imageUrl?: string;
    videoUrl?: string;
    visualType?: 'image' | 'video';
  };
  status: 'pending' | 'posting' | 'posted' | 'failed';
  scheduledTime?: Date;
  result?: any;
  error?: string;
}

interface BulkPostingProps {
  availableContent?: any[];
}

const BulkPosting: React.FC<BulkPostingProps> = ({ availableContent = [] }) => {
  const [posts, setPosts] = useState<BulkPost[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<any[]>([]);
  const [isBulkPosting, setIsBulkPosting] = useState(false);
  const [postingProgress, setPostingProgress] = useState(0);
  const [scheduleMode, setScheduleMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [customMessage, setCustomMessage] = useState('');

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '👍' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
  ];

  useEffect(() => {
    // Load sample content if none provided
    if (availableContent.length === 0) {
      const sampleContent = [
        {
          id: '1',
          headline: 'Innovation Starts Here',
          body: 'Discover how our cutting-edge solutions are transforming the industry. Join us on this exciting journey!',
          visualUrl: 'https://picsum.photos/800/800?random=bulk1',
          visualType: 'image'
        },
        {
          id: '2',
          headline: 'Behind the Scenes',
          body: 'Take a look at our creative process and meet the team making it all happen!',
          visualUrl: 'https://sample-video.com/behind-scenes.mp4',
          visualType: 'video'
        },
        {
          id: '3',
          headline: 'Customer Success Story',
          body: 'See how our clients are achieving remarkable results with our innovative solutions.',
          visualUrl: 'https://picsum.photos/800/800?random=bulk2',
          visualType: 'image'
        }
      ];
      setSelectedContent(sampleContent);
    } else {
      setSelectedContent(availableContent);
    }
  }, [availableContent]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleContentToggle = (contentId: string) => {
    setSelectedContent(prev =>
      prev.some(c => c.id === contentId)
        ? prev.filter(c => c.id !== contentId)
        : [...prev, availableContent.find(c => c.id === contentId)]
    );
  };

  const prepareBulkPosts = (): BulkPost[] => {
    const bulkPosts: BulkPost[] = [];
    
    selectedContent.forEach(content => {
      selectedPlatforms.forEach(platform => {
        const postContent = {
          caption: customMessage || `${content.headline}\n\n${content.body}`,
          imageUrl: content.visualType === 'image' ? content.visualUrl : undefined,
          videoUrl: content.visualType === 'video' ? content.visualUrl : undefined,
          visualType: content.visualType
        };

        const scheduledTime = scheduleMode === 'scheduled' 
          ? new Date(`${scheduleDate}T${scheduleTime}`)
          : undefined;

        bulkPosts.push({
          id: `${content.id}-${platform}`,
          platform,
          content: postContent,
          status: 'pending',
          scheduledTime
        });
      });
    });

    return bulkPosts;
  };

  const handleBulkPost = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (selectedContent.length === 0) {
      alert('Please select at least one piece of content');
      return;
    }

    const bulkPosts = prepareBulkPosts();
    setPosts(bulkPosts);
    setIsBulkPosting(true);
    setPostingProgress(0);

    try {
      for (let i = 0; i < bulkPosts.length; i++) {
        const post = bulkPosts[i];
        
        // Update status to posting
        setPosts(prev => prev.map(p => 
          p.id === post.id ? { ...p, status: 'posting' } : p
        ));

        try {
          // Check if platform is connected
          if (!oauthService.isConnected(post.platform)) {
            throw new Error(`${post.platform} is not connected`);
          }

          // Post to platform
          const result = await oauthService.postToPlatform(post.platform, post.content);
          
          // Update status to posted
          setPosts(prev => prev.map(p => 
            p.id === post.id ? { 
              ...p, 
              status: 'posted', 
              result 
            } : p
          ));

        } catch (error: any) {
          // Update status to failed
          setPosts(prev => prev.map(p => 
            p.id === post.id ? { 
              ...p, 
              status: 'failed', 
              error: error.message 
            } : p
          ));
        }

        // Update progress
        setPostingProgress(((i + 1) / bulkPosts.length) * 100);
        
        // Small delay between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } finally {
      setIsBulkPosting(false);
    }
  };

  const handleScheduleBulk = () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (selectedContent.length === 0) {
      alert('Please select at least one piece of content');
      return;
    }

    if (!scheduleDate) {
      alert('Please select a date for scheduling');
      return;
    }

    const bulkPosts = prepareBulkPosts();
    setPosts(bulkPosts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'text-green-400';
      case 'posting': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return '✅';
      case 'posting': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform);
    return p?.icon || '📱';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Bulk Posting Operations</h3>
        <p className="text-gray-400 text-sm">
          Post content to multiple platforms simultaneously or schedule for later
        </p>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Select Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {platforms.map(platform => {
            const isConnected = oauthService.isConnected(platform.id);
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <button
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                disabled={!isConnected}
                className={`p-3 rounded-lg border transition-all ${
                  !isConnected
                    ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-600 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl block mb-1">{platform.icon}</span>
                  <span className="text-xs font-medium text-white">{platform.name}</span>
                  <span className="text-xs text-gray-400 block">
                    {isConnected ? '✓ Connected' : 'Not connected'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Select Content</h4>
        <div className="space-y-3">
          {selectedContent.map(content => (
            <div
              key={content.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  {content.visualType === 'video' ? '🎬' : '🖼️'}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-1">{content.headline}</h5>
                  <p className="text-sm text-gray-300 line-clamp-2">{content.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {content.visualType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleContentToggle(content.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Custom Message (Optional)</h4>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Override the default caption with your custom message..."
          className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500"
        />
      </div>

      {/* Scheduling Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Posting Options</h4>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setScheduleMode('immediate')}
            className={`px-4 py-2 rounded-md transition-colors ${
              scheduleMode === 'immediate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Post Now
          </button>
          <button
            onClick={() => setScheduleMode('scheduled')}
            className={`px-4 py-2 rounded-md transition-colors ${
              scheduleMode === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Schedule for Later
          </button>
        </div>

        {scheduleMode === 'scheduled' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={scheduleMode === 'immediate' ? handleBulkPost : handleScheduleBulk}
          disabled={isBulkPosting || selectedPlatforms.length === 0 || selectedContent.length === 0}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isBulkPosting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5" title="Posting content" />
              Posting... {Math.round(postingProgress)}%
            </span>
          ) : (
            `${scheduleMode === 'immediate' ? 'Post Now' : 'Schedule'} to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`
          )}
        </button>
        <button
          onClick={() => {
            setPosts([]);
            setPostingProgress(0);
          }}
          className="px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
        >
          Clear Results
        </button>
      </div>

      {/* Progress Bar */}
      {isBulkPosting && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Posting Progress</span>
            <span className="text-sm text-gray-300">{Math.round(postingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${postingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      {posts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Posting Results</h4>
          <div className="space-y-2">
            {posts.map(post => (
              <div
                key={post.id}
                className={`bg-gray-800/50 rounded-lg p-3 border ${
                  post.status === 'posted' ? 'border-green-700/50' :
                  post.status === 'failed' ? 'border-red-700/50' :
                  post.status === 'posting' ? 'border-blue-700/50' :
                  'border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white capitalize">
                          {post.platform}
                        </span>
                        <span className={`text-sm ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {post.scheduledTime ? (
                          `Scheduled for ${post.scheduledTime.toLocaleString()}`
                        ) : (
                          post.status === 'posted' ? 'Posted successfully' :
                          post.status === 'failed' ? post.error :
                          post.status === 'posting' ? 'Posting...' :
                          'Pending'
                        )}
                      </div>
                    </div>
                  </div>
                  {post.result && (
                    <div className="text-xs text-gray-400">
                      Post ID: {post.result.id || 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkPosting;
