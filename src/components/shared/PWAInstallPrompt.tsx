import { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Download, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const isMobile = useIsMobile();
  const { deferredPrompt, isInstalled, installApp } = usePWAInstall();

  useEffect(() => {
    // iOS kontrolü
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Sadece mobil cihazlarda ve PWA kurulabilir durumdayken göster
    if (isMobile && deferredPrompt && !isInstalled) {
      // localStorage'dan kontrol et, daha önce dismiss edilmiş mi
      const promptDismissed = localStorage.getItem('pwaInstallDismissed');
      
      // Eğer daha önce dismiss edilmemişse göster
      if (!promptDismissed) {
        setTimeout(() => setShowPrompt(true), 2000); // 2 saniye sonra göster
      }
    }
  }, [isMobile, deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Kullanıcı modalı kapattı, bir daha otomatik olarak gösterme
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  // Zaten yüklenmiş veya gösterilmeyecekse render etme
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md animate-in scale-in duration-300 mx-4 text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                PsikOyun'u Yükle
              </h3>
              <p className="text-sm text-muted-foreground">
                Telefonunda uygulama gibi kullan
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-muted/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-success rounded-full" />
              </div>
              <span className="text-foreground">Çevrimdışı oynanabilir</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-info rounded-full" />
              </div>
              <span className="text-foreground">Hızlı erişim</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              <span className="text-foreground">Ana ekrana ekle</span>
            </div>
          </div>

          {/* iOS Özel Talimatı */}
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <p className="text-sm text-info mb-2">
                  <strong>iOS'ta yüklemek için:</strong>
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Safari'de bu sayfayı aç</li>
                  <li>Alt menüdeki "Paylaş" butonuna dokun</li>
                  <li>"Ana Ekrana Ekle" seçeneğini seç</li>
                </ol>
              </div>
              <Button
                onClick={handleDismiss}
                className="w-full"
                variant="ghost"
              >
                Anladım
              </Button>
            </div>
          ) : (
            /* Android/Desktop */
            <div className="flex gap-3">
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1"
              >
                Daha Sonra
              </Button>
              <Button
                onClick={handleInstallClick}
                className="flex-1"
                variant="primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Yükle
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
