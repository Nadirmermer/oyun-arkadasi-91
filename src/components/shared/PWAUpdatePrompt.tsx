import { useState, useEffect } from 'react';
import { Button } from './Button';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Yeni güncelleme mevcut mu kontrol et
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      // Kontrol edilen güncelleme mesajı
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-card border border-border rounded-lg shadow-elevated p-4 mx-auto max-w-md text-foreground">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-info" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              Yeni Güncelleme Mevcut!
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              PsikOyun'un yeni sürümü hazır. Hemen güncelleyin.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
          >
            Daha Sonra
          </Button>
          <Button
            onClick={handleUpdate}
            size="sm"
            variant="primary"
            className="flex-1 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Güncelle
          </Button>
        </div>
      </div>
    </div>
  );
};
