import type { IpcRendererEvent } from "electron";
import { APICollection } from "./src/types/api-models";
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendMessage: (msg: any) => ipcRenderer.send('fromFrontend', msg),
    onMessage: (callback: any) => ipcRenderer.on('fromMain', (_: IpcRendererEvent, data: any) => callback(data)),
    saveJsonFile: (json: string, filename: string) => ipcRenderer.invoke('save-json-file', json, filename),
    saveCollection: (collection: APICollection) => ipcRenderer.invoke('save-collection', collection),
    getCollectionByIdFromFiles: (id: string) => ipcRenderer.invoke('get-collection-by-id-from-files', id),
    getAllCollectionsFromFiles: () => ipcRenderer.invoke('get-all-collections-from-files'),
    deleteCollection: (id: string) => ipcRenderer.invoke('delete-collection', id),
});
