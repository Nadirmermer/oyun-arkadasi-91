import { useState, useEffect, useCallback } from 'react';

export const usePwaUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      
      // Update bulunduğunda dinle
      const handleUpdateFound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        
        const handleStateChange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Sadece gerçekten yeni bir sürüm varsa göster
            setTimeout(() => {
              setUpdateAvailable(true);
              console.log('🔄 Yeni sürüm hazır, kullanıcı güncelleyebilir');
            }, 2000); // 2 saniye gecikme ile göster
          }
        };
        
        newWorker.addEventListener('statechange', handleStateChange);
        
        return () => {
          newWorker.removeEventListener('statechange', handleStateChange);
        };
      };
      
      reg.addEventListener('updatefound', handleUpdateFound);
      
      // Controlling değişikliklerini dinle
      const handleControllerChange = () => {
        console.log('🎉 Uygulama güncellendi');
        setUpdateAvailable(false);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      return () => {
        reg.removeEventListener('updatefound', handleUpdateFound);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }).catch((error) => {
      console.error('Service Worker ready hatası:', error);
    });
  }, []);

  return {
    updateAvailable,
    updateApp,
    registration
  };
};