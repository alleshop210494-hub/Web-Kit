import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Pendaftaran Service Worker untuk Mode Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('ServiceWorker pendaftaran berhasil dengan scope: ', reg.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker pendaftaran gagal: ', err);
      });
  });
}