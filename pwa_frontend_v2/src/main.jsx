import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Home() {
  const [status, setStatus] = React.useState('Loading...')
  React.useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(r => r.json())
      .then(d => setStatus(`Backend: ${d.status}`))
      .catch(() => setStatus('Backend: unavailable'))
  }, [])
  return (
    <div style={{ padding: 24 }}>
      <h1>Arogya v2</h1>
      <p>{status}</p>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
)


