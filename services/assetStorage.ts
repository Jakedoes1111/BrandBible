/**
 * Asset Storage Service (IndexedDB)
 * Temporary storage for uploaded assets until backend is implemented
 */

import { UploadedAsset } from '../components/AssetUploader';

const DB_NAME = 'BrandBibleAssets';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

class AssetStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async saveAssets(assets: UploadedAsset[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Convert File objects to base64 for storage
    const assetsToStore = await Promise.all(
      assets.map(async (asset) => {
        const base64 = await this.fileToBase64(asset.file);
        return {
          ...asset,
          fileData: base64,
          file: undefined, // Remove File object (can't be stored)
        };
      })
    );

    for (const asset of assetsToStore) {
      store.put(asset);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAssets(): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAssetsByType(type: UploadedAsset['type']): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('type');

    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAsset(id: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get color palette from uploaded images (for brand generation)
  async extractBrandColorsFromAssets(): Promise<string[]> {
    const assets = await this.getAssetsByType('logo');
    
    // In a real implementation, this would use canvas to extract colors
    // For now, return empty array
    // TODO: Implement color extraction using canvas API
    return [];
  }

  // Check if user has uploaded any brand assets
  async hasAssets(): Promise<boolean> {
    const assets = await this.getAssets();
    return assets.length > 0;
  }

  // Get summary of uploaded assets
  async getAssetSummary(): Promise<{
    total: number;
    byType: Record<UploadedAsset['type'], number>;
  }> {
    const assets = await this.getAssets();
    const byType: Record<string, number> = {};

    assets.forEach((asset) => {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
    });

    return {
      total: assets.length,
      byType: byType as Record<UploadedAsset['type'], number>,
    };
  }
}

export const assetStorage = new AssetStorageService();
