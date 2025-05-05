
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevent anyone from redefining ethereum property
if (typeof window !== 'undefined') {
  // Only try to configure if not already defined as non-configurable
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  
  if (!descriptor || descriptor.configurable) {
    // Only create ethereum property if it doesn't exist yet
    if (!window.hasOwnProperty('ethereum')) {
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    }
  } else {
    console.log('Ethereum property already defined and not configurable, using existing definition');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
