import React, { useState, useEffect } from 'react';

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  content: string;
  visualUrl?: string;
  visualType?: 'image' | 'video';
  scheduledDate: Date;
  status: 'scheduled' | 'posted' | 'draft';
  engagementPrediction?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

interface ContentCalendarProps {
  onPostScheduled: (post: ScheduledPost) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onPostScheduled }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [newPost, setNewPost] = useState({
    title: '',
    platform: 'instagram',
    content: '',
    visualUrl: '',
    visualType: 'image' as 'image' | 'video',
    time: '09:00'
  });

  const platforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'];

  useEffect(() => {
    // Load sample scheduled posts
    const samplePosts: ScheduledPost[] = [
      {
        id: '1',
        title: 'Product Launch Post',
        platform: 'instagram',
        content: 'Excited to announce our new product line! 🚀',
        visualUrl: 'https://picsum.photos/400/400?random=1',
        visualType: 'image',
        scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5, 9, 0),
        status: 'scheduled',
        engagementPrediction: {
          likes: 2500,
          shares: 150,
          comments: 80
        }
      },
      {
        id: '2',
        title: 'Behind the Scenes',
        platform: 'tiktok',
        content: 'Take a look behind the scenes at our creative process!',
        visualUrl: 'https://sample-video.com/behind-scenes.mp4',
        visualType: 'video',
        scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 14, 0),
        status: 'scheduled',
        engagementPrediction: {
          likes: 5000,
          shares: 300,
          comments: 200
        }
      },
      {
        id: '3',
        title: 'Industry Insights',
        platform: 'linkedin',
        content: 'Sharing our thoughts on the future of digital marketing...',
        scheduledDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12, 10, 0),
        status: 'draft'
      }
    ];
    
    setScheduledPosts(samplePosts);
  }, [currentDate]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👍';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-600';
      case 'twitter': return 'bg-blue-500';
      case 'linkedin': return 'bg-blue-700';
      case 'facebook': return 'bg-blue-600';
      case 'tiktok': return 'bg-black';
      default: return 'bg-gray-600';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const handleSchedulePost = () => {
    if (!selectedDate || !newPost.title || !newPost.content) {
      alert('Please fill in all required fields');
      return;
    }

    const [hours, minutes] = newPost.time.split(':').map(Number);
    const scheduledDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes
    );

    const post: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.title,
      platform: newPost.platform,
      content: newPost.content,
      visualUrl: newPost.visualUrl || undefined,
      visualType: newPost.visualType,
      scheduledDate,
      status: 'scheduled',
      engagementPrediction: {
        likes: Math.floor(Math.random() * 5000) + 500,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 200) + 20
      }
    };

    setScheduledPosts([...scheduledPosts, post]);
    onPostScheduled(post);
    setShowScheduleModal(false);
    setNewPost({
      title: '',
      platform: 'instagram',
      content: '',
      visualUrl: '',
      visualType: 'image',
      time: '09:00'
    });
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(scheduledPosts.filter(post => post.id !== postId));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (showScheduleModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full p-6 m-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Schedule New Post</h3>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Post Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select
                value={newPost.platform}
                onChange={(e) => setNewPost({...newPost, platform: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform} className="bg-gray-800">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
                placeholder="Write your post content..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visual Type</label>
                <select
                  value={newPost.visualType}
                  onChange={(e) => setNewPost({...newPost, visualType: e.target.value as 'image' | 'video'})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                <input
                  type="time"
                  value={newPost.time}
                  onChange={(e) => setNewPost({...newPost, time: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scheduled Date: {selectedDate?.toLocaleDateString()}
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSchedulePost}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Schedule Post
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-gray-700 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Content Calendar</h3>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule Post
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="text-lg font-semibold text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
        
        {getDaysInMonth(currentDate).map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square"></div>;
          }

          const posts = getPostsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all ${
                isToday ? 'bg-blue-900/20 border-blue-600' : 'bg-gray-800/30 border-gray-700'
              } ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:border-gray-500`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                  {date.getDate()}
                </span>
                {posts.length > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-1 rounded">
                    {posts.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {posts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className={`text-xs p-1 rounded ${getPlatformColor(post.platform)} bg-opacity-20 border border-opacity-30`}
                    title={post.title}
                  >
                    <div className="flex items-center gap-1">
                      <span>{getPlatformIcon(post.platform)}</span>
                      <span className="truncate">{post.title}</span>
                    </div>
                  </div>
                ))}
                {posts.length > 2 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{posts.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Posts */}
      {selectedDate && (
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Posts for {selectedDate.toLocaleDateString()}
            </h4>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Add Post +
            </button>
          </div>

          {getPostsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No posts scheduled for this date</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Schedule your first post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {getPostsForDate(selectedDate).map((post) => (
                <div key={post.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{getPlatformIcon(post.platform)}</span>
                        <h5 className="font-medium text-white">{post.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.status === 'scheduled' ? 'bg-blue-600 text-white' :
                          post.status === 'posted' ? 'bg-green-600 text-white' :
                          'bg-gray-600 text-gray-300'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{post.scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {post.visualType && (
                          <span>{post.visualType === 'video' ? '🎥 Video' : '🖼️ Image'}</span>
                        )}
                        {post.engagementPrediction && (
                          <div className="flex items-center gap-2">
                            <span>👍 {formatNumber(post.engagementPrediction.likes)}</span>
                            <span>🔄 {formatNumber(post.engagementPrediction.shares)}</span>
                            <span>💬 {formatNumber(post.engagementPrediction.comments)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;
