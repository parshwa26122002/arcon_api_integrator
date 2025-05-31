import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { storageService } from '../services/StorageService';

export interface Info {
    _postman_id: string,
    name: string,
    description?: string,
    schema: string,
    _exporter_id: string
}
export interface ExportKeyValue {
    key: string;
    value: string;
}
export interface ExportHeader {
    key: string;
    value: string;
    description?: string;
    type: string;
}

export interface ExportKeyValueType {
    key: string;
    value: string;
    type: string;
}
export interface ExportKeyValueWithDescription {
    key: string;
    value: string;
    description?: string;
}
export interface ExportKeyValueWithDescriptionType {
    key: string;
    value: string;
    description?: string;
    type: string;
}
//export interface QueryParam {
//    key: string;
//    value: string;
//}
export interface URLExport {
    raw: string;
    protocol: string;
    host: string[];
    query?: ExportKeyValueWithDescription[];
}
export interface ExportAuth {
    type: string;
    bearer?: ExportKeyValueType[];
    apikey?: ExportKeyValueType[];
    basic?: ExportKeyValueType[];
}
export interface ExportFolderItem {
    name: string;
    description?: string;
    item?: ExportCollectionItem[];
    auth?: ExportAuth;
}
export interface ExportBodyGraphql {
    query: string;
    variables: string;
}
export interface ExportBodyOptions {
    raw: {
        language: 'json' | 'html' | 'xml' | 'text' | 'javascript';
    };
}
export interface ExportBodyFormData {
    key: string;
    value?: string;
    type: 'text' | 'file';
    src?: string;
}
export type ExportBody =
    {
        mode: 'urlencoded';
        urlencoded: ExportKeyValueWithDescriptionType[];
    }
    | {
        mode: 'formdata';
        formdata: ExportBodyFormData[];
    }
    | {
        mode: 'raw';
        raw: string;
        options?: ExportBodyOptions;
    }
    | {
        mode: 'file';
        file: { src: string };
    }
    | {
        mode: 'graphql';
        graphql: ExportBodyGraphql;
    };
export interface RequestObject {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    header: ExportHeader[];
    body?: ExportBody;
    url: URLExport;
    auth?: ExportAuth;
    description?: string;
}
export interface ExportRequestItem {
    name: string;
    request: RequestObject;
    response: Record<string, unknown>[];
}
export type ExportCollectionItem = ExportFolderItem | ExportRequestItem;
export interface ExportCollection {
    info: Info;
    item: ExportCollectionItem[];
    auth: ExportAuth;
    variable?: ExportKeyValueType[];
}
export interface ResponseExport {
    originalRequest: RequestObject;
    header: ExportHeader[];
    body?: string;
    status: string;
    code: number;
}
export interface Header {
  id: string;
  key: string;
  value: string;
  description?: string;
  isSelected?: boolean;
}

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  description?: string;
  isSelected?: boolean;
}

export interface FormDataItem {
  key: string;
  value: string;
  type: 'text' | 'file';
  src?: string;
  isSelected?: boolean;
}

export interface UrlEncodedItem {
  key: string;
  value: string;
  isSelected?: boolean;
}

export interface RawBody {
  content: string;
  language: string;
}

export interface FileBody {
  name: string;
  content: string;
  src?: string;
}

export interface RequestBody {
  mode: 'none' | 'raw' | 'form-data' | 'file' | 'urlencoded' | 'graphql';
  raw?: string;
  options?: {
    raw?: {
      language: 'json' | 'html' | 'xml' | 'text' | 'javascript'
    }
  }
  formData?: FormDataItem[];
  urlencoded?: UrlEncodedItem[];
  file?: FileBody;
  graphql?: GraphQLBody;
}

export interface GraphQLBody {
  query: string;
  variables: string;
  queryError?: string;
  variablesError?: string;
}

export interface AuthState {
  type: string;
  credentials: Record<string, string>;
}

export interface Response {
  status: string;
  code: number;
  body: string;
  expectedSchema?: string;
  expectedCode?: number;
  expectedStatus?: string; 
}

export interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
  url: string;
  headers: Header[];
  queryParams: QueryParam[];
  body?: RequestBody;
  contentType: string;
  formData: Array<{ key: string; value: string }>;
  auth: AuthState;
  response: Response[];
}

export interface Variable {
  id: string;
  name: string;
  initialValue: string;
  currentValue: string;
  isSelected: boolean;
}

export interface APIFolder {
  id: string;
  name: string;
  description?: string;
  auth?: AuthState;
  folders?: APIFolder[];  // Nested folders
  requests?: APIRequest[];
}

export interface APICollection {
  id: string;
  name: string;
  description?: string;
  auth?: AuthState;
  variables?: Variable[];
  folders: APIFolder[];  // Root level folders
  requests: APIRequest[];  // Root level requests
  isNew?: boolean;  // Flag for newly created collections
}

export interface Request {
  id: string;
  name: string;
}

export type HttpMethod = APIRequest['method'];

export type TabBodyType = {
  mode: 'none' | 'raw' | 'form-data' | 'file' | 'urlencoded' | 'graphql';
  raw?: string;
  options?: {
    raw?: {
      language: 'json' | 'html' | 'xml' | 'text' | 'javascript';
    };
  };
  formData?: Array<{ key: string; value: string; type: 'text' | 'file' }>;
  urlencoded?: Array<{ key: string; value: string }>;
  file?: { name: string; content: string };
  graphql?: { query: string; variables: string };
};

export interface RequestTabState {
  id: number;
  type: 'request';
  title: string;
  collectionId?: string;
  requestId?: string;
  method: HttpMethod;
  url: string;
  queryParams: Array<{ id: string; key: string; value: string; description?: string; isSelected?: boolean }>;
  headers: Array<{ id: string; key: string; value: string; description?: string; isSelected?: boolean }>;
  auth: { type: string; credentials: Record<string, string> };
  body: TabBodyType;
  response?: Array<{
    status: string;
    code: number;
    body: string;
    timestamp?: string;
    expectedSchema?: string;
    expectedCode?: number;
    expectedStatus?: string;
    validationResult?: string;
  }>;
  hasUnsavedChanges: boolean;
  showSchemaInput: boolean;
  showSchemaOutput: boolean;
  originalState?: {
    method: HttpMethod;
    url: string;
    queryParams: Array<{ id: string; key: string; value: string; description?: string; isSelected?: boolean }>;
    headers: Array<{ id: string; key: string; value: string; description?: string; isSelected?: boolean }>;
    auth: { type: string; credentials: Record<string, string> };
    body: TabBodyType;
    response?: Array<{
      status: string;
      code: number;
      body: string;
      timestamp?: string;
      expectedSchema?: string;
      expectedCode?: number;
      expectedStatus?: string;
      validationResult?: string;
    }>;
  };
}

export interface CollectionTabState {
  id: number;
  type: 'collection';
  title: string;
  collectionId?: string;
  description?: string;
  auth?: { type: string; credentials: Record<string, string> };
  variables?: Variable[];
  hasUnsavedChanges: boolean;
  originalState?: {
    description?: string;
    auth?: { type: string; credentials: Record<string, string> };
    variables?: Variable[];
  };
}

export interface FolderTabState {
  id: number;
  type: 'folder';
  title: string;
  collectionId: string;
  folderId: string;
  description?: string;
  auth?: { type: string; credentials: Record<string, string> };
  hasUnsavedChanges: boolean;
  originalState?: {
    description?: string;
    auth?: { type: string; credentials: Record<string, string> };
  };
}

export type RunnerTabState = {
  id: number;
  type: 'runner';
  title: string;
  collectionId: string;
  hasUnsavedChanges: boolean;
  selectedRequestIds: string[];
  iterations: number;
  delay: number;
  started: boolean;
  isOpen: boolean;
  selectedResultId: string | null;
  resultsByIteration?: {
    iteration: number;
    results: {
      requestId: string;
      name: string;
      code: number;
      status: string;
      body: string;
      isResponseSaved: boolean;
    }[];
  }[] 
  
};


export interface DocumentationTabState {
    id: number;
    type: 'documentation';
    title: string;
    collectionId: string;
    content: string;
    hasUnsavedChanges: boolean;
}

interface CollectionStoreState {
  collections: APICollection[];
  activeCollectionId: string | null;
  activeRequestId: string | null;
  activeFolderId: string | null;
  isInitialized: boolean;
  runnerTabRequest: string | null;
  
  initialize: () => Promise<void>;
  addCollection: (collection: APICollection) => Promise<void>;
  addFolder: (collectionId: string, parentFolderId: string | null) => Promise<string>;
  addRequestToFolder: (collectionId: string, folderId: string) => Promise<string>;
  addRequestToCollection: (collectionId: string) => Promise<string>;
  addRequestToLocation: (locationId: string, name:string, request: RequestTabState) => Promise<void>;
  removeFolder: (collectionId: string, folderId: string) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
  renameCollection: (id: string, newName: string) => Promise<void>;
  renameFolder: (collectionId: string, folderId: string, newName: string) => Promise<void>;
  removeRequest: (collectionId: string, folderId: string | null, requestId: string) => Promise<void>;
  renameRequest: (collectionId: string, folderId: string | null, requestId: string, newName: string) => Promise<void>;
  updateRequest: (
    collectionId: string,
    requestId: string,
    updatedRequest: Partial<APIRequest>
  ) => Promise<void>;
  updateCollection: (
    collectionId: string,
    updates: Partial<Pick<APICollection, 'description' | 'auth' | 'variables'>>
  ) => Promise<void>;
  updateFolder: (
    collectionId: string,
    folderId: string,
    updates: Partial<Pick<APIFolder, 'description' | 'auth'>>
  ) => Promise<void>;
  setActiveCollection: (id: string | null) => void;
  setActiveRequest: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  getActiveRequest: () => APIRequest | null;
  getActiveCollection: () => APICollection | null;
  getActiveFolder: () => APIFolder | null;
  findRequestLocation: (requestId: string) => { collectionId: string; folderId: string | null } | null;
  setRunnerTabRequest: (id: string | null) => void;
  findFolderLocation: (folderId: string) => { collectionId: string; folderId: string | null } | null;
}

export const useCollectionStore = create<CollectionStoreState>((set, get) => ({
  collections: [],
  activeCollectionId: null,
  activeRequestId: null,
  activeFolderId: null,
  isInitialized: false,
  runnerTabRequest: null,

  initialize: async () => {
    try {
      await storageService.initialize();
      const collections = await storageService.getAllCollections();
      // Initialize empty folders array for existing collections if needed
      const updatedCollections = collections.map(collection => ({
        ...collection,
        folders: collection.folders || [],
      }));
      set({ collections: updatedCollections, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isInitialized: true });
    }
  },

  addCollection: async (collection: APICollection) => {
    const newCollection = {
      ...collection,
      id: collection.id ?? uuid(),
      requests: collection.requests || [],
      folders: collection.folders || [],
    };

    set((state) => ({ collections: [...state.collections, newCollection] }));
    await storageService.saveCollection(newCollection);
  },

  addFolder: async (collectionId, parentFolderId) => {
    const newFolder: APIFolder = {
      id: crypto.randomUUID(),
      name: 'New Folder',
      folders: [],
      requests: [],
    };
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        if (!parentFolderId) {
          // Add to root level
          return {
            ...collection,
            folders: [...collection.folders, newFolder],
          };
        }

        // Helper function to recursively find and update the parent folder
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map((folder) => {
            if (folder.id === parentFolderId) {
              return {
                ...folder,
                folders: [...(folder.folders || []), newFolder],
              };
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || []),
            };
          });
        };

        return {
          ...collection,
          folders: updateFolders(collection.folders),
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
    return newFolder.id;
  },

  addRequestToFolder: async (collectionId, folderId) => {
    const newRequest: APIRequest = {
      id: uuid(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      queryParams: [],
      body: undefined,
      contentType: '',
      formData: [],
      auth: {type: '', credentials: {}},
      response: []
    };

    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        // Helper function to recursively find and update the target folder
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map((folder) => {
            if (folder.id === folderId) {
              return {
                ...folder,
                requests: [...(folder.requests || []), newRequest],
              };
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || []),
            };
          });
        };

        return {
          ...collection,
          folders: updateFolders(collection.folders || []),
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
    return newRequest.id;
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

  addRequestToCollection: async (collectionId) => {
    const newRequest: APIRequest = {
      id: uuid(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      queryParams: [],
      body: undefined,
      contentType: '',
      formData: [],
      auth: {type: '', credentials: {}},
      response: []
    };

    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: [
                ...c.requests,
                newRequest
              ],
            }
          : c
      ),
    }));
    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
    return newRequest.id;
  },

  addRequestToLocation: async (locationId, name, request) => {
    const newRequest: APIRequest = {
      id: uuid(),
      name: name,
      method: request.method,
      url: request.url,
      headers: request.headers,
      queryParams: request.queryParams,
      body: request.body,
      contentType: request.body.mode,
      formData: request.body.formData || [],
      auth: request.auth,
      response: request.response || []
    };
  
    let matchedCollectionId: string | undefined;
  
    set((state) => ({
      collections: state.collections.map((collection) => {
        console.log(state.collections);
        if (collection.id === locationId) {
          matchedCollectionId = collection.id;
          return {
            ...collection,
            requests: [...(collection.requests || []), newRequest],
          };
        }
  
        // Helper to search/update folders recursively and set matchedCollectionId
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map((folder) => {
            if (folder.id === locationId) {
              matchedCollectionId = collection.id;
              return {
                ...folder,
                requests: [...(folder.requests || []), newRequest],
              };
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || []),
            };
          });
        };
  
        return {
          ...collection,
          folders: updateFolders(collection.folders || []),
        };
      }),
    }));
  
    // Save only if matched
    if (matchedCollectionId) {
      const updatedCollection = get().collections.find(c => c.id === matchedCollectionId);
      if (updatedCollection) {
        await storageService.saveCollection(updatedCollection);
      }
    }
  },
  

  updateRequest: async (collectionId, requestId, updatedRequest) => {
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        // First check and update root-level requests
        const rootRequestIndex = collection.requests.findIndex(r => r.id === requestId);
        if (rootRequestIndex !== -1) {
          const updatedRequests = [...collection.requests];
          updatedRequests[rootRequestIndex] = {
            ...collection.requests[rootRequestIndex],
            ...updatedRequest
          };
          return { ...collection, requests: updatedRequests };
        }

        // If not found in root, search and update in folders
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map(folder => {
            if (folder.requests) {
              const requestIndex = folder.requests.findIndex(r => r.id === requestId);
              if (requestIndex !== -1) {
                const updatedRequests = [...folder.requests];
                updatedRequests[requestIndex] = {
                  ...folder.requests[requestIndex],
                  ...updatedRequest
                };
                return { ...folder, requests: updatedRequests };
              }
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || [])
            };
          });
        };

        return {
          ...collection,
          folders: updateFolders(collection.folders)
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  updateCollection: async (collectionId, updates) => {
    const state = get();
    const collections = state.collections.map(collection => {
      if (collection.id === collectionId) {
        return { ...collection, ...updates };
      }
      return collection;
    });
    set({ collections });
    const updatedCollection = collections.find(c => c.id === collectionId);
    if (updatedCollection) {
      await storageService.saveCollection(updatedCollection);
    }
  },

  updateFolder: async (collectionId: string, folderId: string, updates: Partial<Pick<APIFolder, 'description' | 'auth'>>) => {
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        // Helper function to recursively find and update the folder
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map((folder) => {
            if (folder.id === folderId) {
              return {
                ...folder,
                ...updates,
              };
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || []),
            };
          });
        };

        return {
          ...collection,
          folders: updateFolders(collection.folders || []),
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  setActiveCollection: (id) =>
    set(() => ({ activeCollectionId: id })),

  setActiveRequest: (id) =>
    set(() => ({ activeRequestId: id })),

  getActiveRequest: () => {
    const state = get();
    const collection = state.collections.find((c) => c.id === state.activeCollectionId);
    if (!collection) return null;

    // First check collection-level requests
    const rootRequest = collection.requests.find((r) => r.id === state.activeRequestId);
    if (rootRequest) return rootRequest;

    // Helper function to recursively search folders
    const findRequestInFolders = (folders: APIFolder[]): APIRequest | null => {
      for (const folder of folders) {
        // Check requests in current folder
        const foundRequest = folder.requests?.find(r => r.id === state.activeRequestId);
        if (foundRequest) return foundRequest;

        // Check nested folders
        const foundInNested = findRequestInFolders(folder.folders || []);
        if (foundInNested) return foundInNested;
      }
      return null;
    };

    // Then check folder requests
    return findRequestInFolders(collection.folders) || null;
  },

  getActiveCollection: () => {
    const state = get();
    return state.collections.find((c) => c.id === state.activeCollectionId) || null;
  },

  setActiveFolder: (id: string | null) => {
    set({ activeFolderId: id });
  },

  getActiveFolder: () => {
    const state = get();
    if (!state.activeFolderId || !state.activeCollectionId) return null;

    const collection = state.collections.find(
      (c) => c.id === state.activeCollectionId
    );
    if (!collection) return null;

    // Helper function to recursively find the active folder
    const findFolder = (folders: APIFolder[]): APIFolder | null => {
      for (const folder of folders) {
        if (folder.id === state.activeFolderId) return folder;
        const found = findFolder(folder.folders || []);
        if (found) return found;
      }
      return null;
    };

    return findFolder(collection.folders);
  },

  setRunnerTabRequest: (id: string | null) => {
    set({ runnerTabRequest: id });
  },

  removeFolder: async (collectionId: string, folderId: string) => {
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        // Helper function to recursively remove the folder
        const filterFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders
            .filter((folder) => folder.id !== folderId)
            .map((folder) => ({
              ...folder,
              folders: filterFolders(folder.folders || []),
            }));
        };

        return {
          ...collection,
          folders: filterFolders(collection.folders || []),
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  renameFolder: async (collectionId: string, folderId: string, newName: string) => {
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;

        // Helper function to recursively find and rename the folder
        const updateFolders = (folders: APIFolder[]): APIFolder[] => {
          return folders.map((folder) => {
            if (folder.id === folderId) {
              return {
                ...folder,
                name: newName,
              };
            }
            return {
              ...folder,
              folders: updateFolders(folder.folders || []),
            };
          });
        };

        return {
          ...collection,
          folders: updateFolders(collection.folders || []),
        };
      }),
    }));

    const collection = get().collections.find(c => c.id === collectionId);
    if (collection) {
      await storageService.saveCollection(collection);
    }
  },

  removeRequest: async (collectionId: string, folderId: string | null, requestId: string) => {
    const { collections } = get();
    const updatedCollections = collections.map(collection => {
      if (collection.id !== collectionId) return collection;

      if (!folderId) {
        // Remove from collection root
        return {
          ...collection,
          requests: collection.requests.filter(request => request.id !== requestId)
        };
      }

      // Remove from folder
      const updateFolders = (folders: APIFolder[]): APIFolder[] => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              requests: folder.requests?.filter(request => request.id !== requestId) || []
            };
          }
          if (folder.folders) {
            return {
              ...folder,
              folders: updateFolders(folder.folders)
            };
          }
          return folder;
        });
      };

      return {
        ...collection,
        folders: updateFolders(collection.folders)
      };
    });

    set({ collections: updatedCollections });
    // Save each modified collection
    for (const collection of updatedCollections) {
      if (collection.id === collectionId) {
        await storageService.saveCollection(collection);
      }
    }
  },

  renameRequest: async (collectionId: string, folderId: string | null, requestId: string, newName: string) => {
    const { collections } = get();
    const updatedCollections = collections.map(collection => {
      if (collection.id !== collectionId) return collection;

      if (!folderId) {
        // Rename in collection root
        return {
          ...collection,
          requests: collection.requests.map(request =>
            request.id === requestId ? { ...request, name: newName } : request
          )
        };
      }

      // Rename in folder
      const updateFolders = (folders: APIFolder[]): APIFolder[] => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              requests: folder.requests?.map(request =>
                request.id === requestId ? { ...request, name: newName } : request
              ) || []
            };
          }
          if (folder.folders) {
            return {
              ...folder,
              folders: updateFolders(folder.folders)
            };
          }
          return folder;
        });
      };

      return {
        ...collection,
        folders: updateFolders(collection.folders)
      };
    });

    set({ collections: updatedCollections });
    // Save each modified collection
    for (const collection of updatedCollections) {
      if (collection.id === collectionId) {
        await storageService.saveCollection(collection);
      }
    }
  },

  findRequestLocation: (requestId: string): { collectionId: string; folderId: string | null } | null => {
    const state = get();
  
    for (const collection of state.collections) {
      // Root-level request
      if (collection.requests.some(req => req.id === requestId)) {
        return { collectionId: collection.id, folderId: null };
      }
  
      // Recursive folder search
      const searchFolders = (folders: APIFolder[]): { collectionId: string; folderId: string } | null => {
        for (const folder of folders) {
          if (folder.requests?.some(req => req.id === requestId)) {
            return { collectionId: collection.id, folderId: folder.id };
          }
          const foundInNested = searchFolders(folder.folders || []);
          if (foundInNested) return foundInNested;
        }
        return null;
      };
  
      const found = searchFolders(collection.folders);
      if (found) return found;
    }
  
    return null;
  },
  /**
   * Find the collectionId and parentFolderId for a given folderId.
   * Returns { collectionId, parentFolderId } or null if not found.
   */
  findFolderLocation: (folderId: string): { collectionId: string; folderId: string | null } | null => {
    const state = get();
    for (const collection of state.collections) {
      // Helper to recursively search folders
      const searchFolders = (folders: APIFolder[], parentId: string | null): { collectionId: string; folderId: string | null } | null => {
        for (const folder of folders) {
          if (folder.id === folderId) {
            return { collectionId: collection.id, folderId: parentId };
          }
          const foundInNested = searchFolders(folder.folders || [], folder.id);
          if (foundInNested) return foundInNested;
        }
        return null;
      };
      const found = searchFolders(collection.folders, null);
      if (found) return found;
    }
    return null;
  },
}));

/**
 * Find the nearest parent (folder or collection) with auth set for a given requestId.
 */
export function getNearestParentAuth(Id: string, isRequest: boolean): AuthState | undefined {
  const { collections, findRequestLocation, findFolderLocation } = useCollectionStore.getState();
  let location;
  if (isRequest) {
    location = findRequestLocation(Id);
  }
  else {
    location = findFolderLocation(Id);
  }
  if (!location) return undefined;

  const collection = collections.find(c => c.id === location.collectionId);
  if (!collection) return undefined;

  // Helper to recursively find the folder path to the request
  function findFolderPath(folders: APIFolder[], targetFolderId: string, path: APIFolder[] = []): APIFolder[] | null {
    for (const folder of folders) {
      if (folder.id === targetFolderId) return [...path, folder];
      if (folder.folders) {
        const result = findFolderPath(folder.folders, targetFolderId, [...path, folder]);
        if (result) return result;
      }
    }
    return null;
  }

  // If the request is in a folder, build the folder path
  if (location.folderId) {
    const folderPath = findFolderPath(collection.folders, location.folderId);
    if (folderPath) {
      // Traverse from deepest to root to find the nearest auth
      for (let i = folderPath.length - 1; i >= 0; i--) {
        const folder = folderPath[i];
        if (folder && folder.auth && folder.auth.type != 'noAuth' && folder.auth.type != 'inheritCollection') {
          return folder.auth;
        }
      }
    }
  }

  // If not found in folders, check collection-level auth
  if (collection.auth && collection.auth.type) {
    return collection.auth;
  }

  return undefined;
}
