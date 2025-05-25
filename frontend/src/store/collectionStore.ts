import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

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

    addCollection: (collection: APICollection) => void;
    addRequestToCollection: (collectionId: string, request: Request) => void;

  //addCollection: (name: string, requests?: APIRequest[]) => void;
  removeCollection: (id: string) => void;
  renameCollection: (id: string, newName: string) => void;

  //addRequestToCollection: (collectionId: string, requestName: string) => void;
  removeRequestFromCollection: (collectionId: string, requestId: string) => void;

  updateRequest: (
    collectionId: string,
    requestId: string,
    updatedRequest: Partial<APIRequest>
  ) => void;

  setActiveCollection: (id: string | null) => void;
  setActiveRequest: (id: string | null) => void;

  getActiveRequest: () => APIRequest | null;
  getActiveCollection: () => APICollection | null;
}

export const useCollectionStore = create<CollectionStoreState>((set, get) => ({
  collections: [],
  activeCollectionId: null,
  activeRequestId: null,

  addCollection: (collection:APICollection) =>
    set((state) => ({
      collections: [
        ...state.collections,
        {
          id: uuid(),
          name: collection.name,
          requests: collection.requests || [],
        },
      ],
    })),

  removeCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
      activeRequestId: state.activeCollectionId === id ? null : state.activeRequestId,
    })),

  renameCollection: (id, newName) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, name: newName } : c
      ),
    })),

  addRequestToCollection: (collectionId, requestName) =>
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
    })),

  removeRequestFromCollection: (collectionId, requestId) =>
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
    })),

  updateRequest: (collectionId, requestId, updatedRequest) =>
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
    })),

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
