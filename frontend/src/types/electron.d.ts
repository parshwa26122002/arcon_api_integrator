import { APICollection } from '../store/collectionStore';

declare global {
  interface Window {
    electron?: {
      saveCollection: (collection: APICollection) => Promise<void>;
      getAllCollections: () => Promise<APICollection[]>;
      deleteCollection: (id: string) => Promise<void>;
    };
  }
} 