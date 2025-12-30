import React, { useState, useEffect } from 'react';
import { performanceStorage, PerformanceMetric } from '../services/performanceStorage';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const PerformanceDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    useEffect(() => {
        loadMetrics();
    }, [dateRange, selectedPlatform]);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            let data: PerformanceMetric[];

            if (dateRange === 'all') {
                data = await performanceStorage.getAllMetrics();
            } else {
                const days = dateRange === '7d' ? 7 : 30;
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - days);
                data = await performanceStorage.getMetricsByDateRange(start, end);
            }

            if (selectedPlatform) {
                data = data.filter(m => m.platform === selectedPlatform);
            }

            setMetrics(data);
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalPosts = metrics.length;
    const totalViews = metrics.reduce((sum, m) => sum + (m.metrics.views || 0), 0);
    const totalLikes = metrics.reduce((sum, m) => sum + (m.metrics.likes || 0), 0);
    const avgEngagement = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.metrics.engagementRate || 0), 0) / metrics.length
        : 0;

    // Platform performance data
    const platformData = Array.from(
        metrics.reduce((map, m) => {
            const existing = map.get(m.platform) || { platform: m.platform, engagement: 0, count: 0 };
            map.set(m.platform, {
                platform: m.platform,
                engagement: existing.engagement + (m.metrics.engagementRate || 0),
                count: existing.count + 1
            });
            return map;
        }, new Map<string, { platform: string; engagement: number; count: number }>())
    ).map(({ platform, engagement, count }) => ({
        name: platform,
        engagement: count > 0 ? Number((engagement / count).toFixed(2)) : 0
    }));

    // Content type distribution
    const contentTypeData = Array.from(
        metrics.reduce((map, m) => {
            const count = map.get(m.contentType) || 0;
            map.set(m.contentType, count + 1);
            return map;
        }, new Map<string, number>())
    ).map(([name, value]) => ({ name, value }));

    // Engagement over time
    const timeSeriesData = metrics
        .sort((a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime())
        .map(m => ({
            date: new Date(m.publishedDate).toLocaleDateString(),
            engagement: m.metrics.engagementRate || 0,
            views: m.metrics.views || 0
        }));

    // Top performing posts
    const topPosts = metrics
        .filter(m => m.metrics.engagementRate !== undefined)
        .sort((a, b) => (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Loading analytics...</div>
            </div>
        );
    }

    if (metrics.length === 0) {
        return (
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">No Performance Data Yet</h2>
                <p className="text-gray-400 mb-4">
                    Start tracking performance by adding metrics to your published posts.
                </p>
                <p className="text-sm text-gray-500">
                    Go to the Content Calendar and click "Add Performance Data" on any published post.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Performance Analytics</h2>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <select
                        value={selectedPlatform || ''}
                        onChange={(e) => setSelectedPlatform(e.target.value || null)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <option value="">All Platforms</option>
                        {Array.from(new Set(metrics.map(m => m.platform))).map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700">
                    <div className="text-blue-200 text-sm mb-2">Total Posts</div>
                    <div className="text-white text-3xl font-bold">{totalPosts}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg border border-purple-700">
                    <div className="text-purple-200 text-sm mb-2">Total Views</div>
                    <div className="text-white text-3xl font-bold">{totalViews.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-900 to-pink-800 p-6 rounded-lg border border-pink-700">
                    <div className="text-pink-200 text-sm mb-2">Total Likes</div>
                    <div className="text-white text-3xl font-bold">{totalLikes.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
                    <div className="text-green-200 text-sm mb-2">Avg Engagement</div>
                    <div className="text-white text-3xl font-bold">{avgEngagement.toFixed(2)}%</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Performance */}
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Engagement by Platform</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={platformData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Bar dataKey="engagement" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Content Type Distribution */}
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Content Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={contentTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {contentTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Engagement Trend */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                        <defs>
                            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="engagement"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorEngagement)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Top Performing Posts */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Top Performing Posts</h3>
                <div className="space-y-3">
                    {topPosts.map((post, index) => (
                        <div key={post.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-bold text-blue-400">#{index + 1}</div>
                                    <div>
                                        <div className="text-white font-semibold">{post.platform}</div>
                                        <div className="text-sm text-gray-400">{post.contentType} • {new Date(post.publishedDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">{post.metrics.engagementRate?.toFixed(2)}%</div>
                                <div className="text-sm text-gray-400">{post.metrics.views?.toLocaleString()} views</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
