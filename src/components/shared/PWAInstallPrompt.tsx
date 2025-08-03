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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                PsikOyun'u Yükle
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Telefonunda uygulama gibi kullan
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Çevrimdışı oynanabilir</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Hızlı erişim</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Ana ekrana ekle</span>
            </div>
          </div>

          {/* iOS Özel Talimatı */}
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>iOS'ta yüklemek için:</strong>
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
