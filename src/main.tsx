
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix for the ethereum redefinition error (conflict with browser extensions)
// This check prevents redefining the ethereum property if already defined by a browser extension
if (!window.ethereum) {
  try {
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      configurable: true,
      writable: true
    });
  } catch (err) {
    console.warn('Failed to set ethereum placeholder:', err);
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
