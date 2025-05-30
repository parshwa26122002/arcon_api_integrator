// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    saveCollection: (collection: any) => ipcRenderer.invoke('save-collection', collection),
    getAllCollectionsFromFiles: () => ipcRenderer.invoke('get-all-collections-from-files'),
    getCollectionByIdFromFiles: (id: string) => ipcRenderer.invoke('get-collection-by-id-from-files', id),
    deleteCollection: (id: string) => ipcRenderer.invoke('delete-collection', id),
    saveExportFile: (content: string, filename: string, type: string) => ipcRenderer.invoke('save-json-file', content, filename, type),
    savepdfBlob: (base64: string, filename: string) => ipcRenderer.invoke('save-pdf-blob', base64, filename),
    sendMessage: (msg: any) => ipcRenderer.send('fromFrontend', msg),
    onMessage: (callback: any) => ipcRenderer.on('fromMain', (_: any, data: any) => callback(data))
});
