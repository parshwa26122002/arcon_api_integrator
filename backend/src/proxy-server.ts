import express, { json } from 'express';
import cors from 'cors';
import fetch, { RequestInit } from 'node-fetch';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(json());

// Proxy endpoint
app.post('/api/proxy', async (req, res) => {
  try {
    
    let reqInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.body.headers // API key header
      },
      body: JSON.stringify(req.body.reqBody),
    }
    
    const response = await fetch('https://reqres.in/api/users', reqInit);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
