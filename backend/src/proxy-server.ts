import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fetch, { RequestInit } from 'node-fetch';
import authRouter from './auth'

const app = express();
const PORT = 4000;

app.use(cors());
app.use(json());
app.use("/api",authRouter)
// Proxy endpoint that handles all HTTP methods
app.post('/api/proxy', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const { url, method, headers, body, checkBodyType } = req.body;
      
      console.log('Received proxy request:', {
        url,
        method,
          headers,
          body,
        checkBodyType
      });

      if (!url) {
        console.error('URL is missing in request');
        return res.status(400).json({ error: 'URL is required' });
      }

      // Prepare request init
      const reqInit: RequestInit = {
        method: method || 'GET',
        headers: {
          ...headers,
          'Accept-Encoding': 'identity' // Force no compression
        }
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body !== undefined) {
        //if (body instanceof FormData) {
        //  reqInit.body = body;
          //} else
        if (typeof body === 'string') {
          reqInit.body = body;
        } else {
          reqInit.body = JSON.stringify(body);
        }
        let formDataArray: any[] = [];
        if (checkBodyType === 'formdata' && typeof reqInit.body === 'string') {
            formDataArray = JSON.parse(reqInit.body);
            const formData = new FormData();
            if (Array.isArray(formDataArray)) {
                for (const item of formDataArray) {
                    if (!item.key || item.isSelected === false) continue;

                    if (item.type === 'file' && item.content && item.fileType) {
                        // item.content is expected to be a base64 string (e.g., "data:...;base64,....")
                        let base64Data = item.content;
                        if (base64Data.startsWith('data:')) {
                            base64Data = base64Data.split(',')[1];
                        }
                        const buffer = Buffer.from(base64Data, 'base64');
                        const blob = new Blob([buffer], { type: item.fileType });
                        formData.append(
                            item.key,
                            blob,
                            item.src || 'file',
                        );
                    } else if (item.type === 'text') {
                        formData.append(item.key, item.value || '');
                    }
                }

            }
            //delete reqInit.headers['Content-Type']; // Let FormData set it with boundary
            reqInit.body = formData;

        }
        if (checkBodyType === 'file' && typeof reqInit.body === 'string') {
            let fileData = JSON.parse(reqInit.body);
            let base64Data = fileData.content;
            if (base64Data.startsWith('data:')) {
                base64Data = base64Data.split(',')[1];
            }
            const buffer = Buffer.from(base64Data, 'base64');
            if (reqInit.headers && typeof reqInit.headers === 'object' && !Array.isArray(reqInit.headers)) {
                (reqInit.headers as Record<string, string>)['Content-Type'] = fileData.fileType || 'application/octet-stream';
            }
            reqInit.body = buffer;
            //const blob = new Blob([buffer], { type: fileData.fileType });
        } 
      }

      console.log('Sending request to:', url);
      console.log('Request init:', {
        method: reqInit.method,
        headers: reqInit.headers,
        hasBody: !!reqInit.body
      });
      
      const response = await fetch(url, reqInit);
      console.log('Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers.raw()
      });

      // Get response body first
      let responseData;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (error) {
        console.error('Error reading response:', error);
        return res.status(500).json({ 
          error: 'Failed to read response',
          details: (error as Error).message 
        });
      }

      // Set basic headers
      res.status(response.status);
      res.setHeader('Content-Type', contentType || 'text/plain');

      // Send the response
      if (typeof responseData === 'string') {
        res.send(responseData);
      } else {
        res.json(responseData);
      }
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({ 
        error: 'Proxy request failed',
        details: (error as Error).message 
      });
    }
  })().catch(error => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    });
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
