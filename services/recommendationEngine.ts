import { performanceStorage } from './performanceStorage';

export interface Recommendation {
    id: string;
    category: 'timing' | 'content' | 'platform' | 'caption';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    actionable: boolean;
}

class RecommendationEngine {
    async generateRecommendations(): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = [];
        const metrics = await performanceStorage.getAllMetrics();

        if (metrics.length < 5) {
            return [{
                id: 'need-more-data',
                category: 'content',
                priority: 'medium',
                title: 'Need More Data',
                description: 'Add performance data to at least 5 posts to get personalized recommendations.',
                impact: 'Unable to generate insights with current data',
                actionable: false,
            }];
        }

        // Platform performance analysis
        const platformRecs = await this.analyzePlatformPerformance();
        recommendations.push(...platformRecs);

        // Content type analysis
        const contentRecs = await this.analyzeContentTypes();
        recommendations.push(...contentRecs);

        // Timing analysis
        const timingRecs = await this.analyzePostingTimes();
        recommendations.push(...timingRecs);

        // Day of week analysis
        const dayRecs = await this.analyzeDayOfWeek();
        recommendations.push(...dayRecs);

        // Caption length analysis
        const captionRecs = await this.analyzeCaptionLength();
        recommendations.push(...captionRecs);

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    private async analyzePlatformPerformance(): Promise<Recommendation[]> {
        const platformEngagement = await performanceStorage.getAverageEngagementByPlatform();
        const recommendations: Recommendation[] = [];

        if (platformEngagement.size < 2) return recommendations;

        const sorted = Array.from(platformEngagement.entries())
            .sort((a, b) => b[1] - a[1]);

        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const diff = ((best[1] - worst[1]) / worst[1]) * 100;

        if (diff > 50) {
            recommendations.push({
                id: `platform-${best[0]}`,
                category: 'platform',
                priority: 'high',
                title: `${best[0]} Outperforms Other Platforms`,
                description: `Your ${best[0]} posts get ${diff.toFixed(0)}% more engagement than ${worst[0]}. Consider focusing more effort on ${best[0]}.`,
                impact: `+${diff.toFixed(0)}% engagement potential`,
                actionable: true,
            });
        }

        return recommendations;
    }

    private async analyzeContentTypes(): Promise<Recommendation[]> {
        const contentTypeEngagement = await performanceStorage.getAverageEngagementByContentType();
        const recommendations: Recommendation[] = [];

        if (contentTypeEngagement.size < 2) return recommendations;

        const sorted = Array.from(contentTypeEngagement.entries())
            .sort((a, b) => b[1] - a[1]);

        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const diff = ((best[1] - worst[1]) / worst[1]) * 100;

        if (diff > 40) {
            recommendations.push({
                id: `content-${best[0]}`,
                category: 'content',
                priority: 'high',
                title: `${best[0]} Content Performs Best`,
                description: `${best[0]} posts generate ${diff.toFixed(0)}% more engagement than ${worst[0]} posts. Increase your ${best[0]} content ratio.`,
                impact: `${diff.toFixed(0)}% more engagement`,
                actionable: true,
            });
        }

        return recommendations;
    }

    private async analyzePostingTimes(): Promise<Recommendation[]> {
        const timeEngagement = await performanceStorage.getBestPostingTimes();
        const recommendations: Recommendation[] = [];

        if (timeEngagement.size < 3) return recommendations;

        const sorted = Array.from(timeEngagement.entries())
            .sort((a, b) => b[1] - a[1]);

        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const diff = ((best[1] - worst[1]) / worst[1]) * 100;

        if (diff > 30) {
            recommendations.push({
                id: `time-${best[0]}`,
                category: 'timing',
                priority: 'medium',
                title: `Post Around ${best[0]} for Better Engagement`,
                description: `Posts around ${best[0]} get ${diff.toFixed(0)}% more engagement than ${worst[0]}. Schedule more content for this time window.`,
                impact: `+${diff.toFixed(0)}% engagement`,
                actionable: true,
            });
        }

        return recommendations;
    }

    private async analyzeDayOfWeek(): Promise<Recommendation[]> {
        const dayEngagement = await performanceStorage.getPerformanceByDayOfWeek();
        const recommendations: Recommendation[] = [];

        if (dayEngagement.size < 3) return recommendations;

        const sorted = Array.from(dayEngagement.entries())
            .sort((a, b) => b[1] - a[1]);

        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        const diff = ((best[1] - worst[1]) / worst[1]) * 100;

        if (diff > 35) {
            recommendations.push({
                id: `day-${best[0]}`,
                category: 'timing',
                priority: 'medium',
                title: `${best[0]} Posts Perform Better`,
                description: `${best[0]} posts get ${diff.toFixed(0)}% more engagement than ${worst[0]}. Consider reducing ${worst[0]} posts and adding more on ${best[0]}.`,
                impact: `${diff.toFixed(0)}% improvement potential`,
                actionable: true,
            });
        }

        return recommendations;
    }

    private async analyzeCaptionLength(): Promise<Recommendation[]> {
        const metrics = await performanceStorage.getAllMetrics();
        const recommendations: Recommendation[] = [];

        if (metrics.length < 10) return recommendations;

        // Group by caption length
        const shortCaptions = metrics.filter(m => m.metadata.captionLength < 100);
        const mediumCaptions = metrics.filter(m => m.metadata.captionLength >= 100 && m.metadata.captionLength < 250);
        const longCaptions = metrics.filter(m => m.metadata.captionLength >= 250);

        const avgShort = shortCaptions.reduce((sum, m) => sum + (m.metrics.engagementRate || 0), 0) / (shortCaptions.length || 1);
        const avgMedium = mediumCaptions.reduce((sum, m) => sum + (m.metrics.engagementRate || 0), 0) / (mediumCaptions.length || 1);
        const avgLong = longCaptions.reduce((sum, m) => sum + (m.metrics.engagementRate || 0), 0) / (longCaptions.length || 1);

        const best = [
            { type: 'short (<100 chars)', avg: avgShort },
            { type: 'medium (100-250 chars)', avg: avgMedium },
            { type: 'long (250+ chars)', avg: avgLong }
        ].sort((a, b) => b.avg - a.avg)[0];

        if (best.avg > 0) {
            recommendations.push({
                id: 'caption-length',
                category: 'caption',
                priority: 'low',
                title: `${best.type} Captions Work Best`,
                description: `Your ${best.type} captions get the best engagement. Try maintaining similar caption lengths for optimal performance.`,
                impact: 'Consistent engagement',
                actionable: true,
            });
        }

        return recommendations;
    }

    async generateAIInsights(): Promise<string> {
        const stats = await performanceStorage.getTotalStats();
        const platformData = await performanceStorage.getAverageEngagementByPlatform();
        const topPosts = await performanceStorage.getTopPerformingPosts(3);

        if (stats.totalPosts < 5) {
            return 'Add more performance data to receive AI-powered strategic recommendations.';
        }

        const platformSummary = Array.from(platformData.entries())
            .map(([platform, engagement]) => `${platform}: ${engagement.toFixed(2)}%`)
            .join(', ');

        // This would call OpenAI in a real implementation
        // For now, return a helpful summary
        const insights = `
Based on ${stats.totalPosts} tracked posts with an average engagement rate of ${stats.averageEngagement.toFixed(2)}%, here are strategic recommendations:

**Platform Performance:**
${platformSummary}

**Key Insights:**
- Your best-performing post achieved ${topPosts[0]?.metrics.engagementRate?.toFixed(2)}% engagement
- Total reach: ${stats.totalViews.toLocaleString()} views across all platforms
- Consistency is key: maintain your top-performing content mix

**Action Items:**
1. Focus on your highest-performing platform
2. Replicate the format of your top posts
            3. Post during your proven optimal times
4. Test variations of successful content types
        `.trim();

        return insights;
    }
}

export const recommendationEngine = new RecommendationEngine();
