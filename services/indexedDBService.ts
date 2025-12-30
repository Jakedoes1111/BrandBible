// IndexedDB service for robust local data persistence
import { BrandIdentity, GeneratedImages } from '../types';
import { SavedProject } from '../contexts/AppContext';

const DB_NAME = 'BrandBibleDB';
const DB_VERSION = 1;

interface DBStores {
  projects: 'projects';
  assets: 'assets';
  scheduledPosts: 'scheduledPosts';
  analytics: 'analytics';
  cache: 'cache';
}

const STORES: DBStores = {
  projects: 'projects',
  assets: 'assets',
  scheduledPosts: 'scheduledPosts',
  analytics: 'analytics',
  cache: 'cache',
};

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not available, falling back to localStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains(STORES.projects)) {
          const projectStore = db.createObjectStore(STORES.projects, { keyPath: 'id' });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Assets store
        if (!db.objectStoreNames.contains(STORES.assets)) {
          const assetStore = db.createObjectStore(STORES.assets, { keyPath: 'id' });
          assetStore.createIndex('type', 'type', { unique: false });
          assetStore.createIndex('category', 'category', { unique: false });
          assetStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Scheduled posts store
        if (!db.objectStoreNames.contains(STORES.scheduledPosts)) {
          const scheduledStore = db.createObjectStore(STORES.scheduledPosts, { keyPath: 'id' });
          scheduledStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
          scheduledStore.createIndex('status', 'status', { unique: false });
          scheduledStore.createIndex('platform', 'platform', { unique: false });
        }

        // Analytics store
        if (!db.objectStoreNames.contains(STORES.analytics)) {
          const analyticsStore = db.createObjectStore(STORES.analytics, { keyPath: 'id', autoIncrement: true });
          analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
          analyticsStore.createIndex('eventType', 'eventType', { unique: false });
        }

        // Cache store
        if (!db.objectStoreNames.contains(STORES.cache)) {
          const cacheStore = db.createObjectStore(STORES.cache, { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('IndexedDB not available');
    }
    return this.db;
  }

  // Generic CRUD operations
  async add<T>(storeName: keyof DBStores, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readwrite');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: keyof DBStores, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readwrite');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: keyof DBStores, key: string): Promise<T | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readonly');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: keyof DBStores): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readonly');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof DBStores, key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readwrite');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: keyof DBStores): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES[storeName], 'readwrite');
      const store = transaction.objectStore(STORES[storeName]);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Project-specific methods
  async saveProject(project: SavedProject): Promise<void> {
    try {
      await this.put('projects', project);
    } catch (error) {
      console.error('Failed to save project to IndexedDB:', error);
      // Fallback to localStorage
      this.saveProjectToLocalStorage(project);
    }
  }

  async getProjects(): Promise<SavedProject[]> {
    try {
      const projects = await this.getAll<SavedProject>('projects');
      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get projects from IndexedDB:', error);
      return this.getProjectsFromLocalStorage();
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.delete('projects', id);
    } catch (error) {
      console.error('Failed to delete project from IndexedDB:', error);
      this.deleteProjectFromLocalStorage(id);
    }
  }

  // Cache methods with expiration
  async setCache(key: string, data: any, expiresInMs: number = 300000): Promise<void> {
    const cacheEntry = {
      key,
      data,
      expiresAt: Date.now() + expiresInMs,
    };
    try {
      await this.put('cache', cacheEntry);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.get<{ key: string; data: T; expiresAt: number }>('cache', key);
      if (!entry) return null;
      
      if (Date.now() > entry.expiresAt) {
        await this.delete('cache', key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(STORES.cache, 'readwrite');
      const store = transaction.objectStore(STORES.cache);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  // LocalStorage fallback methods
  private saveProjectToLocalStorage(project: SavedProject): void {
    try {
      const projects = this.getProjectsFromLocalStorage();
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }
      localStorage.setItem('brandbible_projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getProjectsFromLocalStorage(): SavedProject[] {
    try {
      const stored = localStorage.getItem('brandbible_projects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return [];
    }
  }

  private deleteProjectFromLocalStorage(id: string): void {
    try {
      const projects = this.getProjectsFromLocalStorage();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem('brandbible_projects', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
    }
  }

  // Analytics tracking
  async trackEvent(eventType: string, data: any): Promise<void> {
    const event = {
      eventType,
      data,
      timestamp: Date.now(),
    };
    try {
      await this.add('analytics', event);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async getAnalytics(eventType?: string, limit?: number): Promise<any[]> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.analytics, 'readonly');
        const store = transaction.objectStore(STORES.analytics);
        
        let request: IDBRequest;
        if (eventType) {
          const index = store.index('eventType');
          request = index.getAll(eventType);
        } else {
          request = store.getAll();
        }

        request.onsuccess = () => {
          let results = request.result;
          if (limit) {
            results = results.slice(-limit);
          }
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return [];
    }
  }

  // Export all data for backup
  async exportAllData(): Promise<any> {
    try {
      const [projects, assets, scheduledPosts, analytics] = await Promise.all([
        this.getAll('projects'),
        this.getAll('assets'),
        this.getAll('scheduledPosts'),
        this.getAll('analytics'),
      ]);

      return {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
          projects,
          assets,
          scheduledPosts,
          analytics,
        },
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // Import data from backup
  async importData(backup: any): Promise<void> {
    try {
      const { data } = backup;
      
      if (data.projects) {
        for (const project of data.projects) {
          await this.put('projects', project);
        }
      }
      if (data.assets) {
        for (const asset of data.assets) {
          await this.put('assets', asset);
        }
      }
      if (data.scheduledPosts) {
        for (const post of data.scheduledPosts) {
          await this.put('scheduledPosts', post);
        }
      }
      if (data.analytics) {
        for (const event of data.analytics) {
          await this.add('analytics', event);
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

export const indexedDBService = new IndexedDBService();
