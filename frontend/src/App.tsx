import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { faker } from '@faker-js/faker'

// Utility to generate a custom username
function generateCustomUsername(totalLength: number, minDigits: number = 3): string {
  if (minDigits > totalLength) {
    throw new Error('minDigits cannot be greater than totalLength')
  }

  const digits = faker.string.numeric(minDigits).split('')
  const lettersNeeded = totalLength - minDigits
  const letters = faker.string.alpha({ length: lettersNeeded, casing: 'lower' }).split('')

  const combined = faker.helpers.shuffle([...letters, ...digits])
  return combined.join('')
}


function App() {
  const [count, setCount] = useState(0)
  const [response, setResponse] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')


  const sendRequest = async () => {
    const dynamicUsername = generateCustomUsername(10, 3)
    setUsername(dynamicUsername)

    try {
      // const res = await fetch('https://reqres.in/api/users?page=2', {
      //   headers: {
      //     'x-api-key': 'reqres-free-v1'
      //     // Add more custom headers here if needed
      //   },
      // })
      const res = await fetch('http://localhost:4000/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: dynamicUsername,
          job: 'Tester'
        })
      })
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
