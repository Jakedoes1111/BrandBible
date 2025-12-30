import React, { useState, useEffect } from 'react';
import { BrandIdentity } from '../types';
import { BrandConsistencyChecker } from '../services/brandConsistencyChecker';

interface BrandHealthScore {
  overall: number; // 0-100
  visualConsistency: number;
  messageAlignment: number;
  contentQuality: number;
  engagementTrend: 'up' | 'down' | 'stable';
  audienceSentiment: number;
  brandAwareness: number;
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  timestamp: Date;
}

interface BrandHealthMonitorProps {
  brandIdentity: BrandIdentity | null;
}

const BrandHealthMonitor: React.FC<BrandHealthMonitorProps> = ({ brandIdentity }) => {
  const [healthScore, setHealthScore] = useState<BrandHealthScore>({
    overall: 0,
    visualConsistency: 0,
    messageAlignment: 0,
    contentQuality: 0,
    engagementTrend: 'stable',
    audienceSentiment: 0,
    brandAwareness: 0,
  });

  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (brandIdentity) {
      analyzeHealth();
    }
  }, [brandIdentity, selectedPeriod]);

  const analyzeHealth = async () => {
    if (!brandIdentity) return;

    setIsAnalyzing(true);

    try {
      // Simulate health analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newHealthScore: BrandHealthScore = {
        overall: Math.floor(Math.random() * 30) + 70, // 70-100
        visualConsistency: Math.floor(Math.random() * 20) + 80,
        messageAlignment: Math.floor(Math.random() * 25) + 75,
        contentQuality: Math.floor(Math.random() * 30) + 70,
        engagementTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        audienceSentiment: Math.floor(Math.random() * 20) + 75,
        brandAwareness: Math.floor(Math.random() * 25) + 70,
      };

      setHealthScore(newHealthScore);

      // Generate alerts based on scores
      const newAlerts = generateAlerts(newHealthScore);
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error analyzing health:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAlerts = (score: BrandHealthScore): HealthAlert[] => {
    const alerts: HealthAlert[] = [];

    if (score.visualConsistency < 75) {
      alerts.push({
        id: 'visual-consistency',
        type: 'warning',
        title: 'Visual Consistency Needs Attention',
        description: 'Some content is using off-brand colors or fonts',
        action: 'Review brand guidelines and update recent posts',
        timestamp: new Date(),
      });
    }

    if (score.engagementTrend === 'down') {
      alerts.push({
        id: 'engagement-declining',
        type: 'critical',
        title: 'Engagement is Declining',
        description: 'Your engagement rate has dropped by more than 10% this period',
        action: 'Review top-performing content and adjust strategy',
        timestamp: new Date(),
      });
    }

    if (score.messageAlignment < 70) {
      alerts.push({
        id: 'message-alignment',
        type: 'warning',
        title: 'Message Alignment Low',
        description: 'Recent content is not aligned with your brand voice',
        action: 'Review brand voice guidelines and train team',
        timestamp: new Date(),
      });
    }

    if (score.overall >= 90) {
      alerts.push({
        id: 'excellent-health',
        type: 'info',
        title: 'Excellent Brand Health!',
        description: 'Your brand is performing exceptionally well',
        action: 'Keep up the great work and maintain consistency',
        timestamp: new Date(),
      });
    }

    return alerts;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (!brandIdentity) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="text-center py-12 text-gray-400">
          Generate a brand identity first to monitor brand health.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Brand Health Monitor</h2>
            <p className="text-gray-400">
              Track your brand consistency and performance over time
            </p>
          </div>

          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl p-8 mb-6">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">Overall Brand Health</div>
            <div className={`text-7xl font-bold mb-2 ${getScoreColor(healthScore.overall)}`}>
              {isAnalyzing ? (
                <div className="animate-pulse">--</div>
              ) : (
                healthScore.overall
              )}
            </div>
            <div className="text-2xl text-gray-300">
              {getScoreLabel(healthScore.overall)}
            </div>
            <div className="mt-4 text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label="Visual Consistency"
            score={healthScore.visualConsistency}
            icon="🎨"
            isAnalyzing={isAnalyzing}
          />
          <MetricCard
            label="Message Alignment"
            score={healthScore.messageAlignment}
            icon="💬"
            isAnalyzing={isAnalyzing}
          />
          <MetricCard
            label="Content Quality"
            score={healthScore.contentQuality}
            icon="⭐"
            isAnalyzing={isAnalyzing}
          />
          <MetricCard
            label="Engagement Trend"
            score={healthScore.engagementTrend === 'up' ? 95 : healthScore.engagementTrend === 'down' ? 40 : 70}
            icon="📈"
            isAnalyzing={isAnalyzing}
            trend={healthScore.engagementTrend}
          />
          <MetricCard
            label="Audience Sentiment"
            score={healthScore.audienceSentiment}
            icon="😊"
            isAnalyzing={isAnalyzing}
          />
          <MetricCard
            label="Brand Awareness"
            score={healthScore.brandAwareness}
            icon="👁️"
            isAnalyzing={isAnalyzing}
          />
        </div>

        <button
          onClick={analyzeHealth}
          disabled={isAnalyzing}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : '🔄 Refresh Analysis'}
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Health Alerts</h3>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-900/20 border-red-500/40'
                    : alert.type === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-500/40'
                    : 'bg-blue-900/20 border-blue-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : '💡'}
                      </span>
                      <h4 className={`font-semibold ${
                        alert.type === 'critical'
                          ? 'text-red-200'
                          : alert.type === 'warning'
                          ? 'text-yellow-200'
                          : 'text-blue-200'
                      }`}>
                        {alert.title}
                      </h4>
                    </div>
                    <p className={`text-sm mb-2 ${
                      alert.type === 'critical'
                        ? 'text-red-300'
                        : alert.type === 'warning'
                        ? 'text-yellow-300'
                        : 'text-blue-300'
                    }`}>
                      {alert.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Action: {alert.action}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                    className="text-gray-400 hover:text-white ml-4"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
        <div className="space-y-3">
          <RecommendationItem
            icon="📊"
            title="Monitor Engagement Trends"
            description="Track your engagement metrics weekly to catch issues early"
          />
          <RecommendationItem
            icon="🎨"
            title="Maintain Visual Consistency"
            description="Use your brand colors and fonts in all content"
          />
          <RecommendationItem
            icon="📖"
            title="Follow Brand Guidelines"
            description="Share your style guide with all team members"
          />
          <RecommendationItem
            icon="🔍"
            title="Regular Audits"
            description="Review all published content monthly for brand compliance"
          />
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  score: number;
  icon: string;
  isAnalyzing: boolean;
  trend?: 'up' | 'down' | 'stable';
}> = ({ label, score, icon, isAnalyzing, trend }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
            {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
          </span>
        )}
      </div>
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {isAnalyzing ? (
          <div className="animate-pulse">--</div>
        ) : (
          score
        )}
      </div>
    </div>
  );
};

const RecommendationItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
    <span className="text-2xl">{icon}</span>
    <div>
      <div className="text-white font-medium">{title}</div>
      <div className="text-gray-400 text-sm">{description}</div>
    </div>
  </div>
);

export default BrandHealthMonitor;
