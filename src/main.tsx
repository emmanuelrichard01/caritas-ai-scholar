
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Only try to configure if window.ethereum is undefined
// This avoids errors when ethereum is already defined as non-configurable
if (typeof window !== 'undefined' && window.ethereum === undefined) {
  try {
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  } catch (error) {
    console.log('Ethereum property already defined and not configurable, using existing definition');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
