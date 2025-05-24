// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg) => ipcRenderer.send('fromFrontend', msg),
    onMessage: (callback) => ipcRenderer.on('fromMain', (_, data) => callback(data))
});
