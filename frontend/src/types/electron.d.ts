import { APICollection } from '../store/collectionStore';

declare global {
    interface Window {
        electron?: {
            saveCollection: (collection: APICollection) => Promise<void>;
            getCollectionByIdFromFiles: (id: string) => Promise<APICollection>;
            getAllCollectionsFromFiles: () => Promise<APICollection[]>;
            deleteCollection: (id: string) => Promise<void>;
            saveExportFile: (content: string, filename: string, type: string) => Promise<void>;
            savepdfBlob: (base64: string, filename: string) => Promise<void>;
        };
    }
} 