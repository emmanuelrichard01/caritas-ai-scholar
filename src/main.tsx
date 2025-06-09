
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix for the ethereum redefinition error (conflict with browser extensions)
// This check prevents redefining the ethereum property if already defined by a browser extension
if (typeof window !== 'undefined' && !window.hasOwnProperty('ethereum')) {
  try {
    // Only define if it doesn't exist and the property is configurable
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
    if (!descriptor || descriptor.configurable !== false) {
      Object.defineProperty(window, 'ethereum', {
        value: undefined,
        configurable: true,
        writable: true
      });
    }
  } catch (err) {
    // Silently ignore if we can't set the property
    console.debug('Ethereum property already defined by extension');
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
