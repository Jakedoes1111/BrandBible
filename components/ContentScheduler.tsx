import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  status: 'connected' | 'disconnected';
  connectedAt?: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: {
    caption: string;
    imageUrl?: string;
    videoUrl?: string;
    visualType?: 'image' | 'video';
  };
  scheduledTime: Date;
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  createdAt: Date;
}

interface ContentSchedulerProps {
  availableContent?: any[];
}

const ContentScheduler: React.FC<ContentSchedulerProps> = ({ availableContent = [] }) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<any[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'single' | 'recurring'>('single');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [customMessage, setCustomMessage] = useState('');
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringCount, setRecurringCount] = useState(4);
  const [isScheduling, setIsScheduling] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);

  const socialApiBase = 'http://localhost:3001/api/social';

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', apiName: 'Instagram' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', apiName: 'Twitter' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', apiName: 'LinkedIn' },
    { id: 'facebook', name: 'Facebook', icon: '👍', apiName: 'Facebook' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', apiName: 'TikTok' }
  ];

  useEffect(() => {
    loadScheduledPosts();
    fetchConnectedAccounts();
    setupScheduler();
    
    // Load sample content if none provided
    if (availableContent.length === 0) {
      const sampleContent = [
        {
          id: '1',
          headline: 'Innovation Starts Here',
          body: 'Discover how our cutting-edge solutions are transforming the industry. Join us on this exciting journey!',
          visualUrl: 'https://picsum.photos/800/800?random=schedule1',
          visualType: 'image'
        },
        {
          id: '2',
          headline: 'Behind the Scenes',
          body: 'Take a look at our creative process and meet the team making it all happen!',
          visualUrl: 'https://sample-video.com/behind-scenes.mp4',
          visualType: 'video'
        }
      ];
      setSelectedContent(sampleContent);
    } else {
      setSelectedContent(availableContent);
    }
  }, []);

  const fetchConnectedAccounts = async (): Promise<SocialAccount[]> => {
    try {
      const res = await fetch(`${socialApiBase}/accounts`);
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch connected accounts:', error);
    }
    return [];
  };

  const loadScheduledPosts = () => {
    const stored = localStorage.getItem('scheduled_posts');
    if (stored) {
      const posts = JSON.parse(stored);
      setScheduledPosts(posts.map((post: ScheduledPost) => ({
        ...post,
        scheduledTime: new Date(post.scheduledTime),
        createdAt: new Date(post.createdAt)
      })));
    }
  };

  const saveScheduledPosts = (posts: ScheduledPost[]) => {
    localStorage.setItem('scheduled_posts', JSON.stringify(posts));
  };

  const setupScheduler = () => {
    // Check for posts that need to be posted every minute
    setInterval(() => {
      checkAndPostScheduledContent();
    }, 60000);

    // Check immediately on load
    checkAndPostScheduledContent();
  };

  const checkAndPostScheduledContent = async () => {
    const now = new Date();
    const postsToCheck = scheduledPosts.filter(post => 
      post.status === 'scheduled' && 
      new Date(post.scheduledTime) <= now
    );

    for (const post of postsToCheck) {
      try {
        const latestAccounts = await fetchConnectedAccounts();
        const platformConfig = platforms.find(platform => platform.id === post.platform);
        const apiPlatform = platformConfig?.apiName ?? post.platform;
        const isConnected = latestAccounts.some(account => account.platform === apiPlatform);

        if (!isConnected) {
          updatePostStatus(post.id, 'failed', `${platformConfig?.name ?? post.platform} is not connected`);
          continue;
        }

        const response = await fetch(`${socialApiBase}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: apiPlatform,
            content: post.content.caption,
            image: post.content.imageUrl ?? post.content.videoUrl
          })
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.error || response.statusText);
        }

        const result = await response.json();
        updatePostStatus(post.id, 'posted', undefined, result);
      } catch (error: any) {
        updatePostStatus(post.id, 'failed', error.message);
      }
    }
  };

  const updatePostStatus = (postId: string, status: ScheduledPost['status'], error?: string, result?: any) => {
    setScheduledPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, status, error, result } : post
    ));
    
    // Update localStorage
    const updated = scheduledPosts.map(post => 
      post.id === postId ? { ...post, status, error, result } : post
    );
    saveScheduledPosts(updated);
  };

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

  const generateRecurringDates = (startDate: Date, pattern: string, count: number): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate));
      
      switch (pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return dates;
  };

  const handleSchedule = () => {
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

    setIsScheduling(true);
    const newPosts: ScheduledPost[] = [];
    const baseDate = new Date(`${scheduleDate}T${scheduleTime}`);

    if (scheduleMode === 'single') {
      // Single post
      selectedContent.forEach(content => {
        selectedPlatforms.forEach(platform => {
          newPosts.push({
            id: `${content.id}-${platform}-${Date.now()}`,
            platform,
            content: {
              caption: customMessage || `${content.headline}\n\n${content.body}`,
              imageUrl: content.visualType === 'image' ? content.visualUrl : undefined,
              videoUrl: content.visualType === 'video' ? content.visualUrl : undefined,
              visualType: content.visualType
            },
            scheduledTime: baseDate,
            status: 'scheduled',
            createdAt: new Date()
          });
        });
      });
    } else {
      // Recurring posts
      const dates = generateRecurringDates(baseDate, recurringPattern, recurringCount);
      
      dates.forEach(date => {
        selectedContent.forEach(content => {
          selectedPlatforms.forEach(platform => {
            newPosts.push({
              id: `${content.id}-${platform}-${Date.now()}-${date.getTime()}`,
              platform,
              content: {
                caption: customMessage || `${content.headline}\n\n${content.body}`,
                imageUrl: content.visualType === 'image' ? content.visualUrl : undefined,
                videoUrl: content.visualType === 'video' ? content.visualUrl : undefined,
                visualType: content.visualType
              },
              scheduledTime: date,
              status: 'scheduled',
              createdAt: new Date()
            });
          });
        });
      });
    }

    const updatedPosts = [...scheduledPosts, ...newPosts];
    setScheduledPosts(updatedPosts);
    saveScheduledPosts(updatedPosts);
    setIsScheduling(false);

    // Reset form
    setScheduleDate('');
    setScheduleTime('09:00');
    setCustomMessage('');
    setSelectedPlatforms([]);
  };

  const handleCancelPost = (postId: string) => {
    updatePostStatus(postId, 'cancelled');
  };

  const handleReschedulePost = (postId: string, newDate: string, newTime: string) => {
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      const updatedPost = { ...post, scheduledTime: new Date(`${newDate}T${newTime}`), status: 'scheduled' as const };
      setScheduledPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      saveScheduledPosts(scheduledPosts.map(p => p.id === postId ? updatedPost : p));
    }
  };

  const handleDeletePost = (postId: string) => {
    const updated = scheduledPosts.filter(post => post.id !== postId);
    setScheduledPosts(updated);
    saveScheduledPosts(updated);
  };

  const getFilteredPosts = () => {
    if (filterStatus === 'all') return scheduledPosts;
    return scheduledPosts.filter(post => post.status === filterStatus);
  };

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform);
    return p?.icon || '📱';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'text-green-400';
      case 'scheduled': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted': return '✅';
      case 'scheduled': return '⏰';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      default: return '⏸️';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Content Scheduler</h3>
        <p className="text-gray-400 text-sm">
          Schedule your content for automatic posting across platforms
        </p>
      </div>

      {/* Scheduling Form */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Schedule New Content</h4>
        
        {/* Platform Selection */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Select Platforms</h5>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => {
              const isConnected = connectedAccounts.some(account => account.platform === platform.apiName);
              const isSelected = selectedPlatforms.includes(platform.id);
              
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  disabled={!isConnected}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    !isConnected
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{platform.icon}</span>
                  {platform.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Selection */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Select Content</h5>
          <div className="space-y-2">
            {selectedContent.map(content => (
              <div
                key={content.id}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{content.visualType === 'video' ? '🎬' : '🖼️'}</span>
                    <div>
                      <h6 className="font-medium text-white text-sm">{content.headline}</h6>
                      <p className="text-xs text-gray-400 line-clamp-1">{content.body}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleContentToggle(content.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling Options */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Scheduling Options</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Schedule Type</label>
              <select
                value={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.value as 'single' | 'recurring')}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
              >
                <option value="single">Single Post</option>
                <option value="recurring">Recurring Posts</option>
              </select>
            </div>
            
            {scheduleMode === 'recurring' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Pattern</label>
                  <select
                    value={recurringPattern}
                    onChange={(e) => setRecurringPattern(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Number of Posts</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={recurringCount}
                    onChange={(e) => setRecurringCount(parseInt(e.target.value))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Custom Message (Optional)</h5>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Override the default caption with your custom message..."
            className="w-full h-20 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 text-sm"
          />
        </div>

        {/* Schedule Button */}
        <button
          onClick={handleSchedule}
          disabled={isScheduling || selectedPlatforms.length === 0 || selectedContent.length === 0 || !scheduleDate}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isScheduling ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5" title="Scheduling posts" />
              Scheduling...
            </span>
          ) : (
            `Schedule ${scheduleMode === 'recurring' ? `${recurringCount} ` : ''}Post${(scheduleMode === 'recurring' && recurringCount > 1) || (scheduleMode === 'single' && selectedPlatforms.length * selectedContent.length > 1) ? 's' : ''}`
          )}
        </button>
      </div>

      {/* Scheduled Posts List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Scheduled Posts</h4>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm"
          >
            <option value="all">All Posts</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {getFilteredPosts().length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No scheduled posts found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredPosts().map(post => (
              <div
                key={post.id}
                className={`bg-gray-800/50 rounded-lg p-4 border ${
                  post.status === 'posted' ? 'border-green-700/50' :
                  post.status === 'failed' ? 'border-red-700/50' :
                  post.status === 'cancelled' ? 'border-gray-600' :
                  'border-blue-700/50'
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
                        Scheduled for {post.scheduledTime.toLocaleString()}
                      </div>
                      {post.error && (
                        <div className="text-xs text-red-400 mt-1">
                          Error: {post.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => {
                            const newDate = prompt('Enter new date (YYYY-MM-DD):', post.scheduledTime.toISOString().split('T')[0]);
                            const newTime = prompt('Enter new time (HH:MM):', post.scheduledTime.toTimeString().slice(0, 5));
                            if (newDate && newTime) {
                              handleReschedulePost(post.id, newDate, newTime);
                            }
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Reschedule"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCancelPost(post.id)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-posting Status */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-medium">Auto-posting Active</p>
            <p className="text-blue-200/70">
              Scheduled posts will be automatically posted at their scheduled time. The system checks for pending posts every minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentScheduler;
