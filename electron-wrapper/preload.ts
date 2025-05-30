// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg: unknown) => ipcRenderer.send('fromFrontend', msg),
    onMessage: (callback: (data: any) => void) => ipcRenderer.on('fromMain', (_: any, data: any) => callback(data))
});
