import React, { useState, useEffect } from 'react';
import { advancedAIService, EngagementPrediction } from '../services/advancedAIService';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  averageEngagement: number;
  bestPerformingPlatform: string;
  platformBreakdown: {
    platform: string;
    posts: number;
    engagement: number;
    averageEngagement: number;
  }[];
  recentPredictions: EngagementPrediction[];
  engagementTrend: {
    date: string;
    engagement: number;
  }[];
}

interface AnalyticsDashboardProps {
  brandIdentity: any;
  generatedContent: any[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  brandIdentity, 
  generatedContent 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [prediction, setPrediction] = useState<EngagementPrediction | null>(null);

  useEffect(() => {
    generateAnalyticsData();
  }, [brandIdentity, generatedContent, selectedTimeRange]);

  const generateAnalyticsData = async () => {
    setIsAnalyzing(true);
    
    // Simulate analytics generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const platforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'];
    const platformBreakdown = platforms.map(platform => ({
      platform,
      posts: Math.floor(Math.random() * 50) + 10,
      engagement: Math.floor(Math.random() * 10000) + 1000,
      averageEngagement: Math.floor(Math.random() * 500) + 100
    }));

    const totalPosts = platformBreakdown.reduce((sum, p) => sum + p.posts, 0);
    const totalEngagement = platformBreakdown.reduce((sum, p) => sum + p.engagement, 0);
    const bestPerformingPlatform = platformBreakdown.reduce((best, current) => 
      current.averageEngagement > best.averageEngagement ? current : best
    ).platform;

    // Generate trend data
    const engagementTrend = [];
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      engagementTrend.push({
        date: date.toLocaleDateString(),
        engagement: Math.floor(Math.random() * 1000) + 200
      });
    }

    setAnalyticsData({
      totalPosts,
      totalEngagement,
      averageEngagement: Math.floor(totalEngagement / totalPosts),
      bestPerformingPlatform,
      platformBreakdown,
      recentPredictions: [],
      engagementTrend
    });
    
    setIsAnalyzing(false);
  };

  const handleContentAnalysis = async (content: any) => {
    setSelectedContent(content);
    setIsAnalyzing(true);
    
    try {
      const predictionResult = await advancedAIService.predictEngagement(content, content.platform || 'instagram');
      setPrediction(predictionResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👍';
      case 'tiktok': return '🎵';
      default: return '📊';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 400) return 'text-green-400';
    if (score >= 250) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isAnalyzing && !analyticsData) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white font-medium">Analyzing Performance Data</p>
            <p className="text-gray-400 text-sm mt-2">Generating insights and predictions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Posts</span>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(analyticsData.totalPosts)}</div>
              <div className="text-xs text-green-400 mt-1">+12% from last period</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Engagement</span>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(analyticsData.totalEngagement)}</div>
              <div className="text-xs text-green-400 mt-1">+23% from last period</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Avg. Engagement</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className={`text-2xl font-bold ${getEngagementColor(analyticsData.averageEngagement)}`}>
                {formatNumber(analyticsData.averageEngagement)}
              </div>
              <div className="text-xs text-green-400 mt-1">+8% from last period</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Best Platform</span>
                <span className="text-lg">{getPlatformIcon(analyticsData.bestPerformingPlatform)}</span>
              </div>
              <div className="text-lg font-bold text-white capitalize">
                {analyticsData.bestPerformingPlatform}
              </div>
              <div className="text-xs text-blue-400 mt-1">Highest engagement rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      {analyticsData && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">Platform Performance</h4>
          <div className="space-y-3">
            {analyticsData.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPlatformIcon(platform.platform)}</span>
                  <div>
                    <div className="font-medium text-white capitalize">{platform.platform}</div>
                    <div className="text-sm text-gray-400">{platform.posts} posts</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getEngagementColor(platform.averageEngagement)}`}>
                    {formatNumber(platform.averageEngagement)}
                  </div>
                  <div className="text-sm text-gray-400">avg engagement</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Analysis */}
      {generatedContent.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">Content Performance Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedContent.slice(0, 4).map((content, index) => (
              <div
                key={index}
                onClick={() => handleContentAnalysis(content)}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {content.platform ? `${content.platform} Post` : 'Social Post'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {content.headline || content.body || 'Content preview...'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Click to analyze</span>
                  {content.visualUrl ? (
                    <span>{content.visualType === 'video' ? '🎥 Video' : '🖼️ Image'}</span>
                  ) : (
                    <span>📝 Text</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Prediction Result */}
      {prediction && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">Engagement Prediction</h4>
            <button
              onClick={() => setPrediction(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{formatNumber(prediction.predictedLikes)}</div>
              <div className="text-sm text-gray-400">Predicted Likes</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{formatNumber(prediction.predictedShares)}</div>
              <div className="text-sm text-gray-400">Predicted Shares</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{formatNumber(prediction.predictedComments)}</div>
              <div className="text-sm text-gray-400">Predicted Comments</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Prediction Confidence</span>
              <span className="text-sm font-medium text-white">{prediction.confidence}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-white mb-2">Improvement Suggestions</h5>
            <ul className="space-y-1">
              {prediction.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
