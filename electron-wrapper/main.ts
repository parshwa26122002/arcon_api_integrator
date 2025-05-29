import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const isDev = !app.isPackaged;
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173'); // Or 3000 for CRA
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
