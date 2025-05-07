
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Only try to configure if window.ethereum is not already defined
if (typeof window !== 'undefined' && !Object.getOwnPropertyDescriptor(window, 'ethereum')) {
  try {
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  } catch (error) {
    console.log('Ethereum property already defined, using existing definition');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
