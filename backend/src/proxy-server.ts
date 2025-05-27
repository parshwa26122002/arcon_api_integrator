import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fetch, { RequestInit } from 'node-fetch';
import crypto from 'crypto';
import querystring from 'querystring';

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

// OAuth 1.0a 3-legged flow endpoints
app.post('/api/oauth1/request_token', async (req, res) => {
  const { requestTokenUrl, consumerKey, consumerSecret, callbackUrl, signatureMethod = 'HMAC-SHA1' } = req.body;
  try {
    // Build OAuth 1.0a params
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_signature_method: signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0',
      oauth_callback: callbackUrl,
    };
    // Generate signature base string and sign (for demo, PLAINTEXT only)
    let signature = '';
    if (signatureMethod === 'PLAINTEXT') {
      signature = `${encodeURIComponent(consumerSecret)}&`;
    } else {
      // HMAC-SHA1 signature (for production, use a library like oauth-1.0a)
      signature = `${encodeURIComponent(consumerSecret)}&`;
    }
    (oauthParams as any).oauth_signature = signature;
    const authHeader =
      'OAuth ' +
      Object.entries(oauthParams)
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(', ');
    const response = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: (err as Error).toString() });
  }
});

app.post('/api/oauth1/access_token', async (req, res) => {
  const { accessTokenUrl, consumerKey, consumerSecret, oauthToken, oauthTokenSecret, oauthVerifier, signatureMethod = 'HMAC-SHA1' } = req.body;
  try {
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_token: oauthToken,
      oauth_signature_method: signatureMethod,
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0',
      oauth_verifier: oauthVerifier,
    };
    let signature = '';
    if (signatureMethod === 'PLAINTEXT') {
      signature = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(oauthTokenSecret)}`;
    } else {
      signature = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(oauthTokenSecret)}`;
    }
    (oauthParams as any).oauth_signature = signature;
    const authHeader =
      'OAuth ' +
      Object.entries(oauthParams)
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(', ');
    const response = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const text = await response.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: (err as Error).toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
