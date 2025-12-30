import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GeneratedPost } from './bulkContentGenerator';

const DB_NAME = 'brand-bible-content-db';
const STORE_NAME = 'scheduled-posts';
const DB_VERSION = 1;

export interface ScheduledPost extends GeneratedPost {
    scheduledDate: Date;
    status: 'scheduled' | 'published' | 'failed';
}

interface ContentDB extends DBSchema {
    [STORE_NAME]: {
        key: string;
        value: ScheduledPost;
        indexes: { 'by-date': Date };
    };
}

class ContentStorageService {
    private dbPromise: Promise<IDBPDatabase<ContentDB>>;

    constructor() {
        this.dbPromise = openDB<ContentDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('by-date', 'scheduledDate');
            },
        });
    }

    async getPosts(): Promise<ScheduledPost[]> {
        const db = await this.dbPromise;
        return db.getAll(STORE_NAME);
    }

    async getPostsByDateRange(start: Date, end: Date): Promise<ScheduledPost[]> {
        const db = await this.dbPromise;
        const allPosts = await db.getAll(STORE_NAME);
        return allPosts.filter(post =>
            new Date(post.scheduledDate) >= start &&
            new Date(post.scheduledDate) <= end
        );
    }

    async savePost(post: ScheduledPost): Promise<void> {
        const db = await this.dbPromise;
        await db.put(STORE_NAME, post);
    }

    async savePosts(posts: ScheduledPost[]): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all(posts.map(post => tx.store.put(post)));
        await tx.done;
    }

    async deletePost(id: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete(STORE_NAME, id);
    }

    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        await db.clear(STORE_NAME);
    }
}

export const contentStorage = new ContentStorageService();
