import type { IpcMainInvokeEvent } from 'electron';
import type { APICollection } from './types/api-models';
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(__dirname, 'assets', 'favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Vite dev server
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // Production build
    }
}

ipcMain.handle('save-json-file', async (event: any, json: string, filename: string) => {
    const win = BrowserWindow.getFocusedWindow();
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
        defaultPath: filename,
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!canceled && filePath) {
        fs.writeFileSync(filePath, json, 'utf-8');
    }
});

ipcMain.handle('save-collection', async (event: IpcMainInvokeEvent, collection: APICollection) => {
    try {
        const collectionsDir = path.join(app.getPath('userData'), 'collections');
        if (!fs.existsSync(collectionsDir)) {
            fs.mkdirSync(collectionsDir, { recursive: true });
        }

        const filePath = path.join(collectionsDir, `${collection.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf-8');

    } catch (err) {
        console.error('Failed to save collection:', err);
        throw err;
    }
});

ipcMain.handle('get-collection-by-id-from-files', async (event: IpcMainInvokeEvent, id: string) => {
    const collectionsDir = path.join(app.getPath('userData'), 'collections');
    const filePath = path.join(collectionsDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    return null;
});

ipcMain.handle('get-all-collections-from-files', async () => {
    const collectionsDir = path.join(app.getPath('userData'), 'collections');
    if (!fs.existsSync(collectionsDir)) {
        return [];
    }
    const files = fs.readdirSync(collectionsDir);
    const collections: APICollection[] = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const data = fs.readFileSync(path.join(collectionsDir, file), 'utf-8');
            collections.push(JSON.parse(data));
        }
    }
    return collections;
});
ipcMain.handle('delete-collection', async (event: IpcMainInvokeEvent, id: string) => {
    const collectionsDir = path.join(app.getPath('userData'), 'collections');
    const filePath = path.join(collectionsDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
});

app.whenReady().then(createWindow);
