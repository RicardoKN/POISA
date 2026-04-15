import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { Capacitor } from '@capacitor/core'
import { dbService } from './services/capacitorDb'

// Electron uses file:// protocol in production, so HashRouter is needed
const Router = window.electronAPI ? HashRouter : BrowserRouter

async function bootstrap() {
  if (Capacitor.isNativePlatform() || import.meta.env.VITE_USE_CAPACITOR) {
    if (!window.electronAPI) {
      window.electronAPI = dbService // Mock for mobile
    }
    await dbService.openDatabase()
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  )
}

bootstrap()
