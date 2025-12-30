import React, { useState, useEffect } from 'react';
import { recommendationEngine, Recommendation } from '../services/recommendationEngine';

const InsightsPanel: React.FC = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [aiInsights, setAiInsights] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setLoading(true);
        try {
            const recs = await recommendationEngine.generateRecommendations();
            const insights = await recommendationEngine.generateAIInsights();
            setRecommendations(recs);
            setAiInsights(insights);
        } catch (err) {
            console.error('Failed to load insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-500 bg-red-500/10';
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/10';
            case 'low':
                return 'border-blue-500 bg-blue-500/10';
            default:
                return 'border-gray-500 bg-gray-500/10';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return '🔥';
            case 'medium':
                return '⚡';
            case 'low':
                return '💡';
            default:
                return '📊';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'timing':
                return '⏰';
            case 'content':
                return '📝';
            case 'platform':
                return '🌐';
            case 'caption':
                return '✍️';
            default:
                return '📊';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading insights...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">AI Insights & Recommendations</h2>
                <button
                    onClick={loadInsights}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    🔄 Refresh Insights
                </button>
            </div>

            {/* AI Strategic Insights */}
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-lg border border-purple-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🤖</span>
                    AI Strategic Analysis
                </h3>
                <div className="text-gray-200 whitespace-pre-line text-sm leading-relaxed">
                    {aiInsights}
                </div>
            </div>

            {/* Recommendations Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Actionable Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.id}
                            className={`border rounded-lg p-5 ${getPriorityColor(rec.priority)}`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-3xl">{getCategoryIcon(rec.category)}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{getPriorityIcon(rec.priority)}</span>
                                        <h4 className="text-white font-bold">{rec.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                                            {rec.category}
                                        </span>
                                        <span className="text-xs font-semibold text-green-400">
                                            {rec.impact}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {rec.actionable && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <span className="text-xs text-gray-400">
                                        ✓ Actionable insight - Apply in your next campaign
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Help Section */}
            {recommendations.some(r => r.id === 'need-more-data') && (
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-3">How to Get Better Insights</h3>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">1.</span>
                            <span>Publish content from the Content Calendar</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">2.</span>
                            <span>Add performance data to published posts (views, likes, shares, comments)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">3.</span>
                            <span>Track at least 5-10 posts for meaningful insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">4.</span>
                            <span>Come back here to see AI-powered recommendations</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;
