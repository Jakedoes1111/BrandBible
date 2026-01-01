import React, { useState, useEffect } from 'react';
import { oauthService } from '../services/oauthService';
import Spinner from './Spinner';
import { contentStorage, ScheduledPost as StoredScheduledPost } from '../services/contentStorage';

type SchedulerPost = StoredScheduledPost & {
  result?: any;
  error?: string;
  caption?: string;
};

interface ContentSchedulerProps {
  availableContent?: any[];
}

const ContentScheduler: React.FC<ContentSchedulerProps> = ({ availableContent = [] }) => {
  const [scheduledPosts, setScheduledPosts] = useState<SchedulerPost[]>([]);
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

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '👍' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
  ];

  useEffect(() => {
    loadScheduledPosts();
    const cleanupScheduler = setupScheduler();

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

    return cleanupScheduler;
  }, []);

  const normalizePostDates = (post: SchedulerPost): SchedulerPost => ({
    ...post,
    scheduledDate: post.scheduledDate instanceof Date ? post.scheduledDate : new Date(post.scheduledDate),
    date: post.date instanceof Date ? post.date : new Date(post.date)
  });

  const loadScheduledPosts = async () => {
    const posts = await contentStorage.getPosts();
    setScheduledPosts(posts.map(normalizePostDates));
  };

  const saveScheduledPosts = async (posts: SchedulerPost[]) => {
    await contentStorage.savePosts(posts);
  };

  const setupScheduler = () => {
    // Check for posts that need to be posted every minute
    const intervalId = window.setInterval(() => {
      checkAndPostScheduledContent();
    }, 60000);

    // Check immediately on load
    checkAndPostScheduledContent();

    return () => {
      window.clearInterval(intervalId);
    };
  };

  const checkAndPostScheduledContent = async () => {
    const now = new Date();
    const storedPosts = await contentStorage.getPosts();
    const normalizedPosts = storedPosts.map(normalizePostDates);
    setScheduledPosts(normalizedPosts);

    const postsToCheck = normalizedPosts.filter(post =>
      post.status === 'scheduled' &&
      post.scheduledDate <= now
    );

    for (const post of postsToCheck) {
      try {
        if (!oauthService.isConnected(post.platform)) {
          updatePostStatus(post.id, 'failed', `${post.platform} is not connected`);
          continue;
        }

        const result = await oauthService.postToPlatform(post.platform, {
          caption: post.caption || `${post.headline}\n\n${post.body}`,
          imageUrl: post.visualType === 'image' ? post.visualUrl : undefined,
          videoUrl: post.visualType === 'video' ? post.visualUrl : undefined,
          visualType: post.visualType
        });
        updatePostStatus(post.id, 'published', undefined, result);
      } catch (error: any) {
        updatePostStatus(post.id, 'failed', error.message);
      }
    }
  };

  const updatePostStatus = (postId: string, status: SchedulerPost['status'], error?: string, result?: any) => {
    setScheduledPosts(prev => {
      const updated = prev.map(post =>
        post.id === postId ? { ...post, status, error, result } : post
      );
      void saveScheduledPosts(updated);
      return updated;
    });
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
    const newPosts: SchedulerPost[] = [];
    const baseDate = new Date(`${scheduleDate}T${scheduleTime}`);

    const buildPost = (content: any, platform: string, scheduledDate: Date): SchedulerPost => ({
      id: `${content.id}-${platform}-${Date.now()}-${scheduledDate.getTime()}`,
      platform,
      contentType: content.contentType || 'promotional',
      headline: content.headline,
      body: content.body,
      hashtags: content.hashtags || [],
      imagePrompt: content.imagePrompt || content.headline,
      visualUrl: content.visualUrl,
      visualType: content.visualType,
      callToAction: content.callToAction,
      caption: customMessage || `${content.headline}\n\n${content.body}`,
      scheduledTime: scheduleTime,
      scheduledDate,
      date: scheduledDate,
      status: 'scheduled'
    });

    if (scheduleMode === 'single') {
      // Single post
      selectedContent.forEach(content => {
        selectedPlatforms.forEach(platform => {
          const scheduledDate = new Date(baseDate);
          const post = buildPost(content, platform, scheduledDate);
          newPosts.push(post);
        });
      });
    } else {
      // Recurring posts
      const dates = generateRecurringDates(baseDate, recurringPattern, recurringCount);
      
      dates.forEach(date => {
        selectedContent.forEach(content => {
          selectedPlatforms.forEach(platform => {
            const post = buildPost(content, platform, date);
            newPosts.push(post);
          });
        });
      });
    }

    setScheduledPosts(prev => {
      const updatedPosts = [...prev, ...newPosts];
      void saveScheduledPosts(updatedPosts);
      return updatedPosts;
    });
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
    setScheduledPosts(prev => {
      const updatedPosts = prev.map(post => {
        if (post.id !== postId) return post;
        const rescheduledDate = new Date(`${newDate}T${newTime}`);
        return {
          ...post,
          scheduledDate: rescheduledDate,
          date: rescheduledDate,
          scheduledTime: newTime,
          status: 'scheduled'
        };
      });
      void saveScheduledPosts(updatedPosts);
      return updatedPosts;
    });
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(prev => {
      const updated = prev.filter(post => post.id !== postId);
      void saveScheduledPosts(updated);
      return updated;
    });
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
      case 'published': return 'text-green-400';
      case 'scheduled': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✅';
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
              const isConnected = oauthService.isConnected(platform.id);
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
            <option value="published">Published</option>
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
                        Scheduled for {post.scheduledDate.toLocaleString()}
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
