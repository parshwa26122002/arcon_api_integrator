import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { APICollection } from '../store/collectionStore';

const DB_NAME = 'arcon_api_db';
const DB_VERSION = 1;
const COLLECTION_STORE = 'collections';

class StorageService {
  private db: IDBPDatabase | null = null;
  private isElectron: boolean;

  constructor() {
    console.log('StorageService: Initializing');
    this.isElectron = typeof window !== 'undefined' && 
      window.electron !== undefined;
    console.log('StorageService: Is Electron?', this.isElectron);
  }

  async initialize(): Promise<void> {
    console.log('StorageService: Starting initialization');
    if (this.isElectron) {
      console.log('StorageService: Initializing file system');
      await this.initializeFileSystem();
    } else {
      console.log('StorageService: Initializing IndexedDB');
      await this.initializeIndexedDB();
    }
    console.log('StorageService: Initialization complete');
  }

  private async initializeIndexedDB(): Promise<void> {
    try {
      console.log('StorageService: Opening IndexedDB');
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          console.log('StorageService: Upgrading database');
          if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
            db.createObjectStore(COLLECTION_STORE, { keyPath: 'id' });
            console.log('StorageService: Created collections store');
          }
        },
      });
      console.log('StorageService: IndexedDB opened successfully');
    } catch (error) {
      console.error('StorageService: Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  private async initializeFileSystem(): Promise<void> {
    if (!window.electron) {
      throw new Error('Electron APIs not available');
    }
  }

  async saveCollection(collection: APICollection): Promise<void> {
      console.log('StorageService: Saving collection', collection);
      console.log('StorageService: Is Electron?', this.isElectron);
      console.log('StorageService: Window Electron', (((typeof window) !== 'undefined') && window.electron));
      if (typeof window !== 'undefined' && window.electron) {
          console.log('StorageService: Window Electron', this.isElectron);

      }
    if (typeof window !== 'undefined' && window.electron) {
        await window.electron.saveCollection(collection);
    } else {
        await this.saveCollectionToIndexedDB(collection);
    }
  }

  private async saveCollectionToIndexedDB(collection: APICollection): Promise<void> {
    console.log('StorageService: Saving to IndexedDB', collection);
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.put(COLLECTION_STORE, collection);
    console.log('StorageService: Saved to IndexedDB successfully');
  }


  async getAllCollections(): Promise<APICollection[]> {
    console.log('StorageService: Getting all collections');
    if (typeof window !== 'undefined' && window.electron) {
        return window.electron.getAllCollectionsFromFiles();
    } else {
        return this.getAllCollectionsFromIndexedDB();
    }
  }
  async getCollectionByID(id: string): Promise<APICollection> {
    console.log('StorageService: Getting collections by id');
    if (typeof window !== 'undefined' && window.electron) {
        return window.electron.getCollectionByIdFromFiles(id);
    } else {
        return this.getCollectionByIdFromIndexedDB(id);
    }
  }
  private async getCollectionByIdFromIndexedDB(id: string): Promise<APICollection> {
    console.log('StorageService: Getting collections from IndexedDB');
    if (!this.db) {
        throw new Error('Database not initialized');
    }
    const collections = await this.db.get(COLLECTION_STORE, id);
    console.log('StorageService: Retrieved collections from IndexedDB:', collections);
    return collections;
  }
  private async getAllCollectionsFromIndexedDB(): Promise<APICollection[]> {
    console.log('StorageService: Getting collections from IndexedDB');
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const collections = await this.db.getAll(COLLECTION_STORE);
    console.log('StorageService: Retrieved collections from IndexedDB:', collections);
    return collections;
  }

  async deleteCollection(id: string): Promise<void> {
    console.log('StorageService: Deleting collection', id);
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.deleteCollection(id);
    } else {
      await this.deleteCollectionFromIndexedDB(id);
    }
  }

  private async deleteCollectionFromIndexedDB(id: string): Promise<void> {
    console.log('StorageService: Deleting from IndexedDB', id);
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.delete(COLLECTION_STORE, id);
    console.log('StorageService: Deleted from IndexedDB successfully');
  }

}

export const storageService = new StorageService(); 