const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const collectionsDir = path.join(app.getPath('userData'), 'collections');
const isDev = process.env.NODE_ENV === 'development';
//const fetch = require('node-fetch');
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Vite dev server
        //mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
    } else {
        mainWindow.loadURL('https://arcon-api-integrator-frontend.onrender.com'); // Production build
        //mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
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
ipcMain.handle('send-request', async (event: any, url: string, method: any, header: Record<any, any>, body?: any) => {

  //  (async () => {
  //  try {
  //    console.log('Received proxy request:', {
  //      url,
  //      method,
  //        header,
  //      checkBodyType
  //    });

  //    if (!url) {
  //      console.error('URL is missing in request');
  //      return res.status(400).json({ error: 'URL is required' });
  //    }

  //    // Prepare request init
  //    const reqInit: RequestInit = {
  //      method: method || 'GET',
  //      headers: {
  //        ...headers,
  //        'Accept-Encoding': 'identity' // Force no compression
  //      }
  //    };

  //    // Add body for non-GET requests
  //    if (method !== 'GET' && body !== undefined) {
  //      //if (body instanceof FormData) {
  //      //  reqInit.body = body;
  //        //} else
  //      if (typeof body === 'string') {
  //        reqInit.body = body;
  //      } else {
  //        reqInit.body = JSON.stringify(body);
  //      }
  //      let formDataArray: any[] = [];
  //      if (checkBodyType === 'formdata' && typeof reqInit.body === 'string') {
  //          formDataArray = JSON.parse(reqInit.body);
  //          const formData = new FormData();
  //          if (Array.isArray(formDataArray)) {
  //              for (const item of formDataArray) {
  //                  if (!item.key || item.isSelected === false) continue;

  //                  if (item.type === 'file' && item.content && item.fileType) {
  //                      // item.content is expected to be a base64 string (e.g., "data:...;base64,....")
  //                      let base64Data = item.content;
  //                      if (base64Data.startsWith('data:')) {
  //                          base64Data = base64Data.split(',')[1];
  //                      }
  //                      const buffer = Buffer.from(base64Data, 'base64');
  //                      const blob = new Blob([buffer], { type: item.fileType });
  //                      formData.append(
  //                          item.key,
  //                          blob,
  //                          item.src || 'file',
  //                      );
  //                  } else if (item.type === 'text') {
  //                      formData.append(item.key, item.value || '');
  //                  }
  //              }

  //          }
  //          //delete reqInit.headers['Content-Type']; // Let FormData set it with boundary
  //          reqInit.body = formData;

  //      }
  //      if (checkBodyType === 'file' && typeof reqInit.body === 'string') {
  //          let fileData = JSON.parse(reqInit.body);
  //          let base64Data = fileData.content;
  //          if (base64Data.startsWith('data:')) {
  //              base64Data = base64Data.split(',')[1];
  //          }
  //          const buffer = Buffer.from(base64Data, 'base64');
  //          if (reqInit.headers && typeof reqInit.headers === 'object' && !Array.isArray(reqInit.headers)) {
  //              (reqInit.headers as Record<string, string>)['Content-Type'] = fileData.fileType || 'application/octet-stream';
  //          }
  //          reqInit.body = buffer;
  //          //const blob = new Blob([buffer], { type: fileData.fileType });
  //      } 
  //    }

  //    console.log('Sending request to:', url);
  //    console.log('Request init:', {
  //      method: reqInit.method,
  //      headers: reqInit.headers,
  //      hasBody: !!reqInit.body
  //    });
      
  //    // Start timing
  //    const startTime = Date.now();
  //    // Make the request through the proxy
  //    const response = await fetch(url, reqInit);
  //    const endTime = Date.now();
  //    const durationMs = endTime - startTime;
  //    const durationSeconds = durationMs / 1000;
  //    console.log('Received response:', {
  //      status: response.status,
  //      statusText: response.statusText,
  //      headers: response.headers.raw(),
  //      durationSeconds
  //    });

  //    // Get response body first
  //    let responseData;
  //    const contentType = response.headers.get('content-type');
      
  //    try {
  //      if (contentType?.includes('application/json')) {
  //        responseData = await response.json();
  //      } else {
  //        responseData = await response.text();
  //      }
  //    } catch (error) {
  //      console.error('Error reading response:', error);
  //      return res.status(500).json({ 
  //        error: 'Failed to read response',
  //        details: (error as Error).message 
  //      });
  //    }

  //    // Set basic headers
  //    res.status(response.status);
  //    res.setHeader('Content-Type', contentType || 'text/plain');

  //    // Send the response
  //    if (typeof responseData === 'string') {
  //      res.send({
  //        body: responseData,
  //        status: response.status,
  //        statusText: response.statusText,
  //        durationSeconds
  //      });
  //    } else {
  //      res.json({
  //        body: responseData,
  //        status: response.status,
  //        statusText: response.statusText,
  //        durationSeconds
  //      });
  //    }
  //  } catch (error) {
  //    console.error('Proxy error:', error);
  //    return res.status(500).json({ 
  //      error: 'Proxy request failed',
  //      details: (error as Error).message 
  //    });
  //  }
  //})().catch(error => {
  //  console.error('Unhandled error:', error);
  //  res.status(500).json({ 
  //    error: 'Internal server error',
  //    details: (error as Error).message 
  //  });
  //});
    
    try {
        console.log("Method: ", method);
        
        const reqInit: RequestInit = {
            method: method || 'GET',
            headers: {
                ...header,
                'Accept-Encoding': 'identity' // Force no compression
            },
        };
        if (typeof body === 'string') {
            reqInit.body = body;
        } else {
            reqInit.body = JSON.stringify(body);
        }
        console.log("Header: ", reqInit.headers);
        console.log("Body: ", reqInit.body);
        const response = await fetch(url, reqInit);
        const data = await response.text();
        console.log('Response received', response);
        
        console.log('Response body received', data);
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headersObj[key] = value;
        });

        return {
            body: data,
            status: response.status,
            statusText: response.statusText,
            headers: headersObj
        };

    } catch (error) {
        console.error('Error sending request:', error);
        throw error;
    }
});
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

