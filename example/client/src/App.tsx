import { useState } from 'react'
import { createRpcClient } from 'client'
import './App.css'


import { type NestRPCConfigType } from "../../server/src/type"

type AppRouter = NestRPCConfigType

function App() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [inputValue, setInputValue] = useState('hello')

  // Create the RPC client
  const client = createRpcClient<AppRouter>({
    baseUrl: 'http://localhost:3000',
  })

  const handleTestCall = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      // This is the magic! It looks like a local method call
      // but it's actually making an HTTP request to the server
      const response = await client.rout.route2.hello({ greeting: inputValue })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 NestRPC Client Example</h1>
        <p>This demonstrates how the client proxy makes remote calls feel local!</p>
      </header>

      <main className="App-main">
        <div className="demo-section">
          <h2>Remote Method Call Demo</h2>

          <div className="input-group">
            <label htmlFor="test-input">Input Parameter:</label>
            <input
              id="test-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a test value"
            />
          </div>

          <button
            onClick={handleTestCall}
            disabled={loading}
            className="call-button"
          >
            {loading ? 'Calling...' : 'Call Remote Method'}
          </button>

          {result && (
            <div className="result-section">
              <h3>✅ Result:</h3>
              <pre>{result}</pre>
            </div>
          )}

          {error && (
            <div className="error-section">
              <h3>❌ Error:</h3>
              <pre className="error">{error}</pre>
            </div>
          )}
        </div>

        <div className="info-section">
          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Proxy Creation:</strong> The client creates a JavaScript Proxy that intercepts all method calls
            </li>
            <li>
              <strong>Method Interception:</strong> When you call <code>client.appRouter.test()</code>, the proxy intercepts it
            </li>
            <li>
              <strong>HTTP Request:</strong> The proxy converts the call to a POST request to <code>/api/appRouter/test</code>
            </li>
            <li>
              <strong>Response Handling:</strong> The server response is parsed and returned as if it was a local method call
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}

export default App
