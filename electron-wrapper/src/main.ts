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

app.whenReady().then(createWindow);
