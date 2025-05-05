
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Fix for ethereum property issue
// This prevents the "Cannot redefine property: ethereum" error
if (typeof window !== 'undefined') {
  try {
    // Check if ethereum already exists and is not configurable
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    if (descriptor && !descriptor.configurable) {
      console.log('Ethereum property is already defined and not configurable, skipping configuration');
    } else {
      // Create ethereum property only if it doesn't exist
      if (!window.hasOwnProperty('ethereum')) {
        Object.defineProperty(window, 'ethereum', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      }
    }
  } catch (error) {
    console.error('Error handling ethereum property:', error);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
