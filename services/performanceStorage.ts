import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'brand-bible-performance-db';
const STORE_NAME = 'performance-metrics';
const DB_VERSION = 1;

export interface PerformanceMetrics {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
    engagementRate?: number;
}

export interface PerformanceMetadata {
    hasImage: boolean;
    hasVideo: boolean;
    hashtagCount: number;
    captionLength: number;
    timeOfDay: string; // '07:00', '14:30', etc.
    dayOfWeek: string; // 'Monday', 'Tuesday', etc.
}

export interface PerformanceMetric {
    id: string; // matches post ID
    platform: string;
    contentType: string;
    publishedDate: Date;
    metrics: PerformanceMetrics;
    metadata: PerformanceMetadata;
    addedDate: Date; // when performance data was added
}

interface PerformanceDB extends DBSchema {
    [STORE_NAME]: {
        key: string;
        value: PerformanceMetric;
        indexes: {
            'by-date': Date;
            'by-platform': string;
            'by-content-type': string;
        };
    };
}

class PerformanceStorageService {
    private dbPromise: Promise<IDBPDatabase<PerformanceDB>>;

    constructor() {
        this.dbPromise = openDB<PerformanceDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('by-date', 'publishedDate');
                store.createIndex('by-platform', 'platform');
                store.createIndex('by-content-type', 'contentType');
            },
        });
    }

    async getAllMetrics(): Promise<PerformanceMetric[]> {
        const db = await this.dbPromise;
        return db.getAll(STORE_NAME);
    }

    async getMetric(id: string): Promise<PerformanceMetric | undefined> {
        const db = await this.dbPromise;
        return db.get(STORE_NAME, id);
    }

    async getMetricsByDateRange(start: Date, end: Date): Promise<PerformanceMetric[]> {
        const db = await this.dbPromise;
        const allMetrics = await db.getAll(STORE_NAME);
        return allMetrics.filter(metric =>
            new Date(metric.publishedDate) >= start &&
            new Date(metric.publishedDate) <= end
        );
    }

    async getMetricsByPlatform(platform: string): Promise<PerformanceMetric[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex(STORE_NAME, 'by-platform', platform);
    }

    async getMetricsByContentType(contentType: string): Promise<PerformanceMetric[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex(STORE_NAME, 'by-content-type', contentType);
    }

    async saveMetric(metric: PerformanceMetric): Promise<void> {
        const db = await this.dbPromise;

        // Calculate engagement rate if we have the data
        if (metric.metrics.views && metric.metrics.views > 0) {
            const totalEngagement = (metric.metrics.likes || 0) +
                (metric.metrics.shares || 0) +
                (metric.metrics.comments || 0);
            metric.metrics.engagementRate = (totalEngagement / metric.metrics.views) * 100;
        }

        await db.put(STORE_NAME, metric);
    }

    async deleteMetric(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete(STORE_NAME, id);
    }

    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        await db.clear(STORE_NAME);
    }

    // Analytics helper methods
    async getAverageEngagementByPlatform(): Promise<Map<string, number>> {
        const metrics = await this.getAllMetrics();
        const platformData = new Map<string, { total: number; count: number }>();

        metrics.forEach(metric => {
            if (metric.metrics.engagementRate !== undefined) {
                const existing = platformData.get(metric.platform) || { total: 0, count: 0 };
                platformData.set(metric.platform, {
                    total: existing.total + metric.metrics.engagementRate,
                    count: existing.count + 1
                });
            }
        });

        const averages = new Map<string, number>();
        platformData.forEach((value, key) => {
            averages.set(key, value.total / value.count);
        });

        return averages;
    }

    async getAverageEngagementByContentType(): Promise<Map<string, number>> {
        const metrics = await this.getAllMetrics();
        const contentTypeData = new Map<string, { total: number; count: number }>();

        metrics.forEach(metric => {
            if (metric.metrics.engagementRate !== undefined) {
                const existing = contentTypeData.get(metric.contentType) || { total: 0, count: 0 };
                contentTypeData.set(metric.contentType, {
                    total: existing.total + metric.metrics.engagementRate,
                    count: existing.count + 1
                });
            }
        });

        const averages = new Map<string, number>();
        contentTypeData.forEach((value, key) => {
            averages.set(key, value.total / value.count);
        });

        return averages;
    }

    async getTopPerformingPosts(limit: number = 10): Promise<PerformanceMetric[]> {
        const metrics = await this.getAllMetrics();
        return metrics
            .filter(m => m.metrics.engagementRate !== undefined)
            .sort((a, b) => (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0))
            .slice(0, limit);
    }

    async getBestPostingTimes(): Promise<Map<string, number>> {
        const metrics = await this.getAllMetrics();
        const timeData = new Map<string, { total: number; count: number }>();

        metrics.forEach(metric => {
            if (metric.metrics.engagementRate !== undefined) {
                const timeKey = metric.metadata.timeOfDay;
                const existing = timeData.get(timeKey) || { total: 0, count: 0 };
                timeData.set(timeKey, {
                    total: existing.total + metric.metrics.engagementRate,
                    count: existing.count + 1
                });
            }
        });

        const averages = new Map<string, number>();
        timeData.forEach((value, key) => {
            averages.set(key, value.total / value.count);
        });

        return averages;
    }

    async getPerformanceByDayOfWeek(): Promise<Map<string, number>> {
        const metrics = await this.getAllMetrics();
        const dayData = new Map<string, { total: number; count: number }>();

        metrics.forEach(metric => {
            if (metric.metrics.engagementRate !== undefined) {
                const day = metric.metadata.dayOfWeek;
                const existing = dayData.get(day) || { total: 0, count: 0 };
                dayData.set(day, {
                    total: existing.total + metric.metrics.engagementRate,
                    count: existing.count + 1
                });
            }
        });

        const averages = new Map<string, number>();
        dayData.forEach((value, key) => {
            averages.set(key, value.total / value.count);
        });

        return averages;
    }

    async getTotalStats(): Promise<{
        totalPosts: number;
        totalViews: number;
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        averageEngagement: number;
    }> {
        const metrics = await this.getAllMetrics();

        const stats = metrics.reduce((acc, metric) => {
            return {
                totalPosts: acc.totalPosts + 1,
                totalViews: acc.totalViews + (metric.metrics.views || 0),
                totalLikes: acc.totalLikes + (metric.metrics.likes || 0),
                totalShares: acc.totalShares + (metric.metrics.shares || 0),
                totalComments: acc.totalComments + (metric.metrics.comments || 0),
                totalEngagement: acc.totalEngagement + (metric.metrics.engagementRate || 0),
            };
        }, {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalComments: 0,
            totalEngagement: 0,
        });

        return {
            ...stats,
            averageEngagement: stats.totalPosts > 0 ? stats.totalEngagement / stats.totalPosts : 0,
        };
    }
}

export const performanceStorage = new PerformanceStorageService();
