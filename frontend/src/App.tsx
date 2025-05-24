import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [response, setResponse] = useState<string | null>(null)
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('H');

  const sendRequest = async () => {
    try {
      // Explicitly type headers as Record<string, string>
      let payload = {
          reqBody : {
            name: 'Manish Shingre',
            job: 'Tester',
          },
          headers : {} as Record<string, string>
        }

      let reqInit: RequestInit = {
        method: 'POST',
        headers : {
        'Content-Type': 'application/json',
       }
      }
      
      if (mode === 'H') {
        payload.headers[key] = value;
      } else {
        const url = new URL('http://localhost:4000/api/proxy');
        url.searchParams.append(key, value);
        reqInit = { ...reqInit, method: 'GET', headers: {} };
        reqInit.body = null; // Clear body for GET request
      }
      reqInit.body = JSON.stringify(payload);
      const res = await fetch('http://localhost:4000/api/proxy', reqInit)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse('Error: ' + error)
    }
  }

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
