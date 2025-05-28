import type { IpcRendererEvent } from "electron";
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (msg: any) => ipcRenderer.send('fromFrontend', msg),
    onMessage: (callback: any) => ipcRenderer.on('fromMain', (_: IpcRendererEvent, data: any) => callback(data)),
    saveJsonFile: (json: string, filename: string) => ipcRenderer.invoke('save-json-file', json, filename)

});
