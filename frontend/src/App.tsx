import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [response, setResponse] = useState<string | null>(null)
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('H');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Google OAuth config
  const OAUTH_CLIENT_ID = '90768485520-54o6jb71a9bksncu9gdfths0lb7ne6nn.apps.googleusercontent.com'; // TODO: Replace with your real Google client ID
  const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const OAUTH_REDIRECT_URI = window.location.origin;
  const OAUTH_SCOPE = 'openid profile email';

  const sendRequest = async () => {
    try {
      // Explicitly type headers as Record<string, string>
      let payload = {
          reqBody : {
            name: 'Manish Shingre',
            job: 'Tester',
          },
          headers : {} as Record<string, string>,
          params : {} as Record<string, string>
        }

      let reqInit: RequestInit = {
        method: 'POST',
        headers : {
        'Content-Type': 'application/json',
       }
      }

      

      if (username && password) {
        payload.headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
      } else if (accessToken) {
        payload.headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        if (mode === 'H') {
          payload.headers[key] = value;
        } else {
          payload.params['key'] = key;
          payload.params['value'] = value;
        }
      }

      reqInit.body = JSON.stringify(payload);
      const res = await fetch('http://localhost:4000/api/proxy', reqInit)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse('Error: ' + error)
    }
  }

  const getNewAccessToken = () => {
    const params = new URLSearchParams({
      response_type: 'token', // Implicit flow for demo; for production use Authorization Code flow
      client_id: OAUTH_CLIENT_ID,
      redirect_uri: OAUTH_REDIRECT_URI,
      scope: OAUTH_SCOPE,
      include_granted_scopes: 'true',
      state: 'xyz'
    });
    window.location.href = `${OAUTH_AUTH_URL}?${params.toString()}`;
  };

  // Listen for access token in URL hash (implicit flow)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
      }
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{ marginRight: '1rem' }}
        >
          <option value='H'>Header</option>
          <option value='Q'>Query Params</option>
        </select>
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={sendRequest} style={{ marginLeft: '1rem' }}>
          Send HTTP Request
        </button>
        <button onClick={getNewAccessToken} style={{ marginBottom: '1rem' }}>
          Get New Access Token
        </button>
        {accessToken && (
          <div style={{ margin: '1rem 0', wordBreak: 'break-all' }}>
            <strong>Access Token:</strong>
            <div style={{ background: '#f4f4f4', padding: '0.5em', borderRadius: '4px' }}>{accessToken}</div>
          </div>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {response && (
          <pre style={{ textAlign: 'left', background: '#f4f4f4', padding: '1em', borderRadius: '4px' }}>{response}</pre>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
