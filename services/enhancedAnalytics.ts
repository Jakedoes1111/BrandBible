// Enhanced Analytics Service with Advanced Insights
import { BrandIdentity, SocialMediaPost } from '../types';

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  impressions: number;
  reach: number;
  saves?: number;
}

export interface PostPerformance {
  postId: string;
  platform: string;
  publishedDate: Date;
  contentType: 'image' | 'video' | 'carousel' | 'text';
  metrics: EngagementMetrics;
  engagementRate: number;
  viralityScore: number;
}

export interface PlatformInsights {
  platform: string;
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  bestPostingTime: string;
  bestPostingDay: string;
  topContentType: string;
  growthRate: number;
  audienceSize: number;
}

export interface AudienceDemographics {
  ageGroups: { range: string; percentage: number }[];
  genderSplit: { male: number; female: number; other: number };
  topLocations: { location: string; percentage: number }[];
  interests: string[];
  activeHours: number[];
}

export interface ContentInsight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  actionable: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalyticsReport {
  period: { start: Date; end: Date };
  overview: {
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    followerGrowth: number;
    reach: number;
    impressions: number;
  };
  platformBreakdown: PlatformInsights[];
  topPerformingPosts: PostPerformance[];
  insights: ContentInsight[];
  audienceAnalysis: AudienceDemographics;
  trends: {
    engagementTrend: 'up' | 'down' | 'stable';
    bestPerformingDay: string;
    bestPerformingTime: string;
    optimalPostLength: string;
  };
  recommendations: string[];
}

export class EnhancedAnalyticsService {
  private brandIdentity: BrandIdentity;

  constructor(brandIdentity: BrandIdentity) {
    this.brandIdentity = brandIdentity;
  }

  // Generate comprehensive analytics report
  generateReport(period: 'week' | 'month' | 'quarter' | 'year'): AnalyticsReport {
    const { start, end } = this.getPeriodDates(period);
    
    // Generate mock data (in production, this would fetch from real APIs)
    const postPerformances = this.generateMockPostPerformances(30);
    const platformInsights = this.analyzePlatformPerformance(postPerformances);
    const overview = this.calculateOverview(postPerformances);
    const insights = this.generateInsights(platformInsights, postPerformances);
    const audienceAnalysis = this.generateAudienceDemographics();
    const trends = this.analyzeTrends(postPerformances);
    const recommendations = this.generateRecommendations(insights, trends);

    return {
      period: { start, end },
      overview,
      platformBreakdown: platformInsights,
      topPerformingPosts: postPerformances.slice(0, 10),
      insights,
      audienceAnalysis,
      trends,
      recommendations,
    };
  }

  // Platform comparison
  comparePlatforms(): {
    platform: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }[] {
    const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'];
    
    return platforms.map(platform => ({
      platform,
      score: Math.floor(Math.random() * 40) + 60,
      strengths: this.getPlatformStrengths(platform),
      weaknesses: this.getPlatformWeaknesses(platform),
    }));
  }

  // Predict performance
  predictPerformance(post: Partial<SocialMediaPost>): {
    predictedEngagement: number;
    confidence: number;
    suggestions: string[];
  } {
    let baseEngagement = 100;
    let confidence = 75;
    const suggestions: string[] = [];

    // Analyze headline
    if (post.headline && post.headline.length < 30) {
      suggestions.push('Consider a longer, more descriptive headline');
      baseEngagement *= 0.9;
    }

    // Analyze body
    if (post.body && post.body.length > 280 && post.platform === 'Twitter') {
      suggestions.push('Tweet is too long - consider shortening for Twitter');
      baseEngagement *= 0.8;
    }

    // Platform-specific recommendations
    if (post.platform === 'Instagram' && !post.imagePrompt) {
      suggestions.push('Instagram posts perform better with images');
      baseEngagement *= 0.7;
    }

    if (post.platform === 'LinkedIn' && post.body && post.body.length < 100) {
      suggestions.push('LinkedIn posts perform better with longer, informative content');
      baseEngagement *= 0.85;
    }

    // Add randomness for realism
    const variance = (Math.random() - 0.5) * 50;
    const predictedEngagement = Math.max(50, baseEngagement + variance);

    return {
      predictedEngagement: Math.round(predictedEngagement),
      confidence,
      suggestions: suggestions.length > 0 ? suggestions : ['Post looks good! Ready to publish.'],
    };
  }

  // Calculate ROI
  calculateROI(investment: number, conversions: number, avgValue: number): {
    roi: number;
    revenue: number;
    profit: number;
    roiPercentage: number;
  } {
    const revenue = conversions * avgValue;
    const profit = revenue - investment;
    const roi = investment > 0 ? (profit / investment) : 0;
    const roiPercentage = roi * 100;

    return {
      roi,
      revenue,
      profit,
      roiPercentage,
    };
  }

  // Helper methods
  private getPeriodDates(period: 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  private generateMockPostPerformances(count: number): PostPerformance[] {
    const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'];
    const contentTypes: Array<'image' | 'video' | 'carousel' | 'text'> = ['image', 'video', 'carousel', 'text'];

    return Array.from({ length: count }, (_, i) => {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const likes = Math.floor(Math.random() * 1000) + 100;
      const shares = Math.floor(Math.random() * 200) + 10;
      const comments = Math.floor(Math.random() * 150) + 5;
      const impressions = Math.floor(Math.random() * 10000) + 1000;
      const reach = Math.floor(impressions * 0.7);
      
      const totalEngagement = likes + shares + comments;
      const engagementRate = (totalEngagement / reach) * 100;
      const viralityScore = (shares / totalEngagement) * 100;

      return {
        postId: `post_${i}`,
        platform,
        publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        metrics: {
          likes,
          shares,
          comments,
          clicks: Math.floor(Math.random() * 500) + 50,
          impressions,
          reach,
          saves: Math.floor(Math.random() * 100),
        },
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        viralityScore: parseFloat(viralityScore.toFixed(2)),
      };
    });
  }

  private analyzePlatformPerformance(posts: PostPerformance[]): PlatformInsights[] {
    const platforms = new Map<string, PostPerformance[]>();

    posts.forEach(post => {
      if (!platforms.has(post.platform)) {
        platforms.set(post.platform, []);
      }
      platforms.get(post.platform)!.push(post);
    });

    return Array.from(platforms.entries()).map(([platform, platformPosts]) => {
      const totalEngagement = platformPosts.reduce((sum, p) => 
        sum + p.metrics.likes + p.metrics.shares + p.metrics.comments, 0
      );
      const avgEngagementRate = platformPosts.reduce((sum, p) => sum + p.engagementRate, 0) / platformPosts.length;

      // Determine best posting time and day
      const hourCounts = new Map<number, number>();
      const dayCounts = new Map<string, number>();

      platformPosts.forEach(post => {
        const hour = post.publishedDate.getHours();
        const day = post.publishedDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      });

      const bestHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 12;
      const bestDay = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

      // Determine top content type
      const contentTypeCounts = new Map<string, number>();
      platformPosts.forEach(post => {
        contentTypeCounts.set(post.contentType, (contentTypeCounts.get(post.contentType) || 0) + 1);
      });
      const topContentType = Array.from(contentTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'image';

      return {
        platform,
        totalPosts: platformPosts.length,
        totalEngagement,
        avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
        bestPostingTime: `${bestHour}:00`,
        bestPostingDay: bestDay,
        topContentType,
        growthRate: parseFloat((Math.random() * 20 - 5).toFixed(2)),
        audienceSize: Math.floor(Math.random() * 50000) + 10000,
      };
    });
  }

  private calculateOverview(posts: PostPerformance[]) {
    const totalEngagement = posts.reduce((sum, p) => 
      sum + p.metrics.likes + p.metrics.shares + p.metrics.comments, 0
    );
    const totalReach = posts.reduce((sum, p) => sum + p.metrics.reach, 0);
    const totalImpressions = posts.reduce((sum, p) => sum + p.metrics.impressions, 0);
    const avgEngagementRate = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;

    return {
      totalPosts: posts.length,
      totalEngagement,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      followerGrowth: parseFloat((Math.random() * 1000 + 500).toFixed(0)),
      reach: totalReach,
      impressions: totalImpressions,
    };
  }

  private generateInsights(platforms: PlatformInsights[], posts: PostPerformance[]): ContentInsight[] {
    const insights: ContentInsight[] = [];

    // Top performing platform
    const topPlatform = platforms.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0];
    if (topPlatform) {
      insights.push({
        type: 'success',
        title: `${topPlatform.platform} is your best performer`,
        description: `${topPlatform.avgEngagementRate.toFixed(1)}% avg engagement rate`,
        actionable: `Increase posting frequency on ${topPlatform.platform}`,
        priority: 'high',
      });
    }

    // Engagement trend
    const recentPosts = posts.slice(0, 10);
    const avgRecentEngagement = recentPosts.reduce((sum, p) => sum + p.engagementRate, 0) / recentPosts.length;
    const olderPosts = posts.slice(10, 20);
    const avgOlderEngagement = olderPosts.reduce((sum, p) => sum + p.engagementRate, 0) / olderPosts.length;

    if (avgRecentEngagement > avgOlderEngagement * 1.1) {
      insights.push({
        type: 'success',
        title: 'Engagement is trending up',
        description: `${((avgRecentEngagement - avgOlderEngagement) / avgOlderEngagement * 100).toFixed(1)}% increase`,
        actionable: 'Keep up the great content!',
        priority: 'medium',
      });
    } else if (avgRecentEngagement < avgOlderEngagement * 0.9) {
      insights.push({
        type: 'warning',
        title: 'Engagement is declining',
        description: 'Recent posts are underperforming',
        actionable: 'Review top-performing posts and replicate their elements',
        priority: 'high',
      });
    }

    // Best content type
    const contentTypeCounts = new Map<string, { count: number; totalEngagement: number }>();
    posts.forEach(post => {
      const current = contentTypeCounts.get(post.contentType) || { count: 0, totalEngagement: 0 };
      contentTypeCounts.set(post.contentType, {
        count: current.count + 1,
        totalEngagement: current.totalEngagement + (post.metrics.likes + post.metrics.shares + post.metrics.comments),
      });
    });

    const bestType = Array.from(contentTypeCounts.entries())
      .map(([type, data]) => ({ type, avgEngagement: data.totalEngagement / data.count }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

    if (bestType) {
      insights.push({
        type: 'tip',
        title: `${bestType.type.charAt(0).toUpperCase() + bestType.type.slice(1)} content performs best`,
        description: `${bestType.avgEngagement.toFixed(0)} avg engagement per post`,
        actionable: `Create more ${bestType.type} content`,
        priority: 'medium',
      });
    }

    return insights;
  }

  private generateAudienceDemographics(): AudienceDemographics {
    return {
      ageGroups: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 25 },
        { range: '45-54', percentage: 15 },
        { range: '55+', percentage: 10 },
      ],
      genderSplit: {
        male: 45,
        female: 50,
        other: 5,
      },
      topLocations: [
        { location: 'United States', percentage: 40 },
        { location: 'United Kingdom', percentage: 20 },
        { location: 'Canada', percentage: 15 },
        { location: 'Australia', percentage: 10 },
        { location: 'Others', percentage: 15 },
      ],
      interests: ['Technology', 'Business', 'Marketing', 'Design', 'Entrepreneurship'],
      activeHours: [9, 12, 13, 17, 18, 19, 20, 21],
    };
  }

  private analyzeTrends(posts: PostPerformance[]) {
    const recentPosts = posts.slice(0, 15);
    const olderPosts = posts.slice(15, 30);

    const recentAvg = recentPosts.reduce((sum, p) => sum + p.engagementRate, 0) / recentPosts.length;
    const olderAvg = olderPosts.reduce((sum, p) => sum + p.engagementRate, 0) / olderPosts.length;

    const engagementTrend: 'up' | 'down' | 'stable' = recentAvg > olderAvg * 1.05 ? 'up' : recentAvg < olderAvg * 0.95 ? 'down' : 'stable';

    // Determine best performing day and time
    const dayPerformance = new Map<string, number[]>();
    posts.forEach(post => {
      const day = post.publishedDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayPerformance.has(day)) {
        dayPerformance.set(day, []);
      }
      dayPerformance.get(day)!.push(post.engagementRate);
    });

    const bestDay = Array.from(dayPerformance.entries())
      .map(([day, rates]) => ({
        day,
        avgRate: rates.reduce((a, b) => a + b, 0) / rates.length,
      }))
      .sort((a, b) => b.avgRate - a.avgRate)[0]?.day || 'Monday';

    // Determine optimal post length
    const shortPosts = posts.filter(p => (p.postId.length < 100)); // Mock length check
    const longPosts = posts.filter(p => (p.postId.length >= 100));
    
    const shortAvg = shortPosts.reduce((sum, p) => sum + p.engagementRate, 0) / (shortPosts.length || 1);
    const longAvg = longPosts.reduce((sum, p) => sum + p.engagementRate, 0) / (longPosts.length || 1);

    const optimalPostLength = shortAvg > longAvg ? 'Short (< 100 chars)' : 'Long (> 100 chars)';

    return {
      engagementTrend,
      bestPerformingDay: bestDay,
      bestPerformingTime: '12:00 PM - 2:00 PM',
      optimalPostLength,
    };
  }

  private generateRecommendations(insights: ContentInsight[], trends: any): string[] {
    const recommendations: string[] = [];

    if (trends.engagementTrend === 'down') {
      recommendations.push('📉 Engagement is declining - review your top performers and replicate successful elements');
      recommendations.push('🎯 Try A/B testing different headlines and visuals');
    } else if (trends.engagementTrend === 'up') {
      recommendations.push('📈 Keep momentum! Your content strategy is working');
    }

    recommendations.push(`📅 Best day to post: ${trends.bestPerformingDay}`);
    recommendations.push(`⏰ Optimal posting time: ${trends.bestPerformingTime}`);
    recommendations.push(`✍️ Optimal post length: ${trends.optimalPostLength}`);

    // Add priority insights
    insights
      .filter(i => i.priority === 'high')
      .forEach(i => recommendations.push(`⚠️ ${i.actionable}`));

    return recommendations;
  }

  private getPlatformStrengths(platform: string): string[] {
    const strengths: Record<string, string[]> = {
      Instagram: ['Visual storytelling', 'High engagement rate', 'Stories & Reels'],
      Twitter: ['Real-time engagement', 'Viral potential', 'News and trends'],
      LinkedIn: ['Professional audience', 'B2B reach', 'Thought leadership'],
      Facebook: ['Large audience', 'Diverse demographics', 'Community building'],
      TikTok: ['Young audience', 'Viral content', 'Creative expression'],
    };

    return strengths[platform] || ['Growing audience', 'Good engagement'];
  }

  private getPlatformWeaknesses(platform: string): string[] {
    const weaknesses: Record<string, string[]> = {
      Instagram: ['Algorithm changes', 'High competition'],
      Twitter: ['Character limit', 'Fast-moving feed'],
      LinkedIn: ['Slower viral spread', 'Narrow audience'],
      Facebook: ['Declining young users', 'Organic reach decline'],
      TikTok: ['Uncertain regulations', 'Short-lived trends'],
    };

    return weaknesses[platform] || ['Needs more content', 'Low posting frequency'];
  }
}
