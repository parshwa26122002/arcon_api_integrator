import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { storageService } from '../services/StorageService';

interface Header {
  id: string;
  key: string;
  value: string;
}

export interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Header[];
  body: string;
  auth: {
    type: string;
    credentials: Record<string, string>;
  };
}

export interface APICollection {
  id: string;
  name: string;
  requests: APIRequest[];
}

interface Request {
  id: string;
  name: string;
}

interface CollectionStoreState {
  collections: APICollection[];
  activeCollectionId: string | null;
  activeRequestId: string | null;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  addCollection: (collection: APICollection) => Promise<void>;
  addRequestToCollection: (collectionId: string, request: Request) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
  renameCollection: (id: string, newName: string) => Promise<void>;
  removeRequestFromCollection: (collectionId: string, requestId: string) => Promise<void>;
  updateRequest: (
    collectionId: string,
    requestId: string,
    updatedRequest: Partial<APIRequest>
  ) => Promise<void>;
  setActiveCollection: (id: string | null) => void;
  setActiveRequest: (id: string | null) => void;
  getActiveRequest: () => APIRequest | null;
  getActiveCollection: () => APICollection | null;
}

export const useCollectionStore = create<CollectionStoreState>((set, get) => ({
  collections: [],
  activeCollectionId: null,
  activeRequestId: null,
  isInitialized: false,

  initialize: async () => {
    try {
      await storageService.initialize();
      const collections = await storageService.getAllCollections();
      set({ collections, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isInitialized: true });
    }
  },

  addCollection: async (collection: APICollection) => {
    const newCollection = {
      ...collection,
      id: uuid(),
      requests: collection.requests || [],
    };

    set((state) => ({ collections: [...state.collections, newCollection] }));
    await storageService.saveCollection(newCollection);
  },

  removeCollection: async (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
      activeRequestId: state.activeCollectionId === id ? null : state.activeRequestId,
    }));
    await storageService.deleteCollection(id);
  },

  renameCollection: async (id, newName) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === id);
    if (collection) {
      const updatedCollection = { ...collection, name: newName };
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? updatedCollection : c
        ),
      }));
      await storageService.saveCollection(updatedCollection);
    }
  },

  addRequestToCollection: async (collectionId, request) => {
    const newRequest = {
      id: uuid(),
      name: request.name,
      method: 'GET' as const,
      url: '',
      headers: [],
      body: '',
      auth: { type: '', credentials: {} },
    };

    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (collection) {
      const updatedCollection = {
        ...collection,
        requests: [...collection.requests, newRequest],
      };
      
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId ? updatedCollection : c
        ),
      }));
      await storageService.saveCollection(updatedCollection);
    }
  },

  removeRequestFromCollection: async (collectionId, requestId) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (collection) {
      const updatedCollection = {
        ...collection,
        requests: collection.requests.filter((r) => r.id !== requestId),
      };

      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId ? updatedCollection : c
        ),
        activeRequestId:
          get().activeRequestId === requestId ? null : get().activeRequestId,
      }));
      await storageService.saveCollection(updatedCollection);
    }
  },

  updateRequest: async (collectionId, requestId, updatedRequest) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (collection) {
      const updatedCollection = {
        ...collection,
        requests: collection.requests.map((r) =>
          r.id === requestId ? { ...r, ...updatedRequest } : r
        ),
      };

      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId ? updatedCollection : c
        ),
      }));
      await storageService.saveCollection(updatedCollection);
    }
  },

  setActiveCollection: (id) =>
    set(() => ({ activeCollectionId: id, activeRequestId: null })),

  setActiveRequest: (id) =>
    set(() => ({ activeRequestId: id })),

  getActiveRequest: () => {
    const state = get();
    const collection = state.collections.find((c) => c.id === state.activeCollectionId);
    return collection?.requests.find((r) => r.id === state.activeRequestId) || null;
  },

  getActiveCollection: () => {
    const state = get();
    return state.collections.find((c) => c.id === state.activeCollectionId) || null;
  },
}));
