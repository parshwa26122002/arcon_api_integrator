import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fetch, { RequestInit } from 'node-fetch';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(json());

// Proxy endpoint that handles all HTTP methods
app.post('/api/proxy', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const { url, method, headers, body } = req.body;
      
      console.log('Received proxy request:', {
        url,
        method,
        headers,
        bodyType: typeof body
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
        if (body instanceof FormData) {
          reqInit.body = body;
        } else if (typeof body === 'string') {
          reqInit.body = body;
        } else {
          reqInit.body = JSON.stringify(body);
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
