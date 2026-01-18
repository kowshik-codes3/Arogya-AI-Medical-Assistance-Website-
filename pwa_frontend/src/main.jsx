import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/theme.css'
import { initTelemetry } from './telemetry/index'

const container = document.getElementById('root')
const root = createRoot(container)

initTelemetry().finally(() => {
  root.render(<App />)
})
