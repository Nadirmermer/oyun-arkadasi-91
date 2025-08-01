import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Service Worker kayıt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Service Worker başarıyla kaydedildi
      })
      .catch((registrationError) => {
        // Service Worker kayıt hatası
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
