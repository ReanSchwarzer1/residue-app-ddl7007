import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import VideoTemplate from './components/video/VideoTemplate';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoTemplate />
  </StrictMode>
);
