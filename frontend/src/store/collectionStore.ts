import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { storageService } from '../services/StorageService';

interface Header {
  id: string;
  key: string;
  value: string;
}

interface QueryParam {
  id: string;
  key: string;
  value: string;
  description: string;
  isSelected: boolean;
}

export interface FormDataItem {
  key: string;
  value?: string;
  type: string;
  description?: string;
  src?: string;
}

export interface RequestBody {
  mode: 'none' | 'raw' | 'formdata' | 'urlencoded' | 'file' | 'graphql';
  raw?: string;
  formdata?: FormDataItem[];
  urlencoded?: Array<{key: string; value: string; type: string}>;
  file?: { src: string };
  options?: {
    raw?: {
      language: 'json' | 'html' | 'xml' | 'text'
    }
  }
}

export interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Header[];
  queryParams: QueryParam[];
  body?: RequestBody;
  contentType: string;
  formData: Array<{ key: string; value: string }>;
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

  addRequestToCollection: async (collectionId, requestName) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: [
                ...c.requests,
                {
                  id: uuid(),
                  name: requestName.name,
                  method: 'GET',
                  url: '',
                  headers: [],
                  queryParams: [],
                  body: undefined,
                  bodyType: 'none',
                  contentType: '',
                  formData: [],
                  auth: {type: '', credentials: {}}
                },
              ],
            }
          : c
      ),
    }));
    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  removeRequestFromCollection: async (collectionId, requestId) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: c.requests.filter((r) => r.id !== requestId),
            }
          : c
      ),
      activeRequestId:
        get().activeRequestId === requestId ? null : get().activeRequestId,
    }));
    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  updateRequest: async (collectionId, requestId, updatedRequest) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: c.requests.map((r) =>
                r.id === requestId ? { ...r, ...updatedRequest } : r
              ),
            }
          : c
      ),
    }));
    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
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
