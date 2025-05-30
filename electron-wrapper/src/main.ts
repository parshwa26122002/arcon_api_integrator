const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const collectionsDir = path.join(app.getPath('userData'), 'collections');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Vite dev server
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // Production build
    }
}

app.whenReady().then(createWindow);


ipcMain.handle('save-collection', async (event: any, collection: any) => {
    try {
        const collectionsDir = path.join(app.getPath('userData'), 'collections');

        if (!fs.existsSync(collectionsDir)) {
            fs.mkdirSync(collectionsDir, { recursive: true });
        }

        const filePath = path.join(collectionsDir, `${collection.id}.json`);
        await fsPromises.writeFile(filePath, JSON.stringify(collection, null, 2), 'utf-8');

        return { success: true };
    } catch (err) {
        console.error('Failed to save collection:', err);
        throw err;
    }
});
ipcMain.handle('get-all-collections-from-files', async () => {
    try {
        if (!fs.existsSync(collectionsDir)) {
            return [];
        }
        const files = await fsPromises.readdir(collectionsDir);
        const collections = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(collectionsDir, file);
                const data = await fsPromises.readFile(filePath, 'utf-8');
                collections.push(JSON.parse(data));
            }
        }
        return collections;
    } catch (err) {
        console.error('Failed to get all collections:', err);
        throw err;
    }
});

ipcMain.handle('get-collection-by-id-from-files', async (event: any, id: string) => {
    try {
        const filePath = path.join(collectionsDir, `${id}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Collection with ID ${id} does not exist`);
        }
        const data = await fsPromises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('Failed to get collection by ID:', err);
        throw err;
    }
});
ipcMain.handle('delete-collection', async (event: any, id: string) => {
    try {
        const filePath = path.join(collectionsDir, `${id}.json`);
        if (fs.existsSync(filePath)) {
            await fsPromises.unlink(filePath);
        }
    } catch (err) {
        console.error('Failed to delete collection:', err);
        throw err;
    }
});
ipcMain.handle('save-json-file', async (event: any, content: string, filename: string, type: string) => {
    if (type === 'json') {
        const win = BrowserWindow.getFocusedWindow();
        const { filePath, canceled } = await dialog.showSaveDialog(win, {
            defaultPath: filename,
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (!canceled && filePath) {
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
    else if (type === 'html') {
        const win = BrowserWindow.getFocusedWindow();
        const { filePath, canceled } = await dialog.showSaveDialog(win, {
            defaultPath: filename,
            filters: [{ name: 'HTML', extensions: ['html'] }]
        });
        if (!canceled && filePath) {
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
    else if (type === 'pdf') {
        const win = new BrowserWindow({
            show: false,
            width: 794, // A4 width in pixels at 96 DPI (8.27in * 96)
            height: 1123, // A4 height in pixels at 96 DPI (11.69in * 96)
            webPreferences: {
                offscreen: true
            }
        });

        const fullHtml = `
        <html>
        <head>
            <style>
                html, body {
                    margin: 0;
                    padding: 20px;
                    font-family: sans-serif;
                }
                .page-break {
                    page-break-after: always;
                }
                ::-webkit-scrollbar {
                    display: none;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;

        await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml));

        try {
            // Wait for rendering to complete
            await new Promise(resolve => setTimeout(resolve, 300));

            const { canceled, filePath } = await dialog.showSaveDialog({
                defaultPath: filename,
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
            });

            if (!canceled && filePath) {
                const pdfData = await win.webContents.printToPDF({
                    printBackground: true,
                    margins: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    },
                    pageSize: 'A4'
                });

                fs.writeFileSync(filePath, pdfData);
            }

            win.close();
        } catch (error) {
            console.error('Error generating PDF:', error);
            win.close();
        }
    }
});
//ipcMain.handle('save-pdf-blob', async (event: any, blob: Blob, filename: string) => {
//    try {
//        const buffer = Buffer.from(await blob.arrayBuffer());
//        const win = BrowserWindow.getFocusedWindow();
//        const { filePath, canceled } = await dialog.showSaveDialog(win, {
//            defaultPath: filename,
//            filters: [{ name: 'PDF', extensions: ['pdf'] }]
//        });
//        if (!canceled && filePath) {
//            await fsPromises.writeFile(filePath, buffer);
//        }
//    } catch (err) {
//        console.error('Failed to save PDF blob:', err);
//        throw err;
//    }
//});
ipcMain.handle('save-pdf-blob', async (event: any, base64: string, filename: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!canceled && filePath) {
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(filePath, buffer);
    }
});

