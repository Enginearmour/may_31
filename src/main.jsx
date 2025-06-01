import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found')
} else {
  // Create the root once and render the app
  const root = ReactDOM.createRoot(rootElement)
  
  // Use a simple wrapper to avoid direct rendering of complex components
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
