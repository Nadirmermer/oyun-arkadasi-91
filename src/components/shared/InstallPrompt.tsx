import { useState, useEffect, memo } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA kurulum prompt'u
 * Kullanıcılara uygulamayı ana ekranlarına ekleme seçeneği sunar
 */
export const InstallPrompt = memo(() => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA zaten kurulu mu kontrol et
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // beforeinstallprompt event'ini dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Kullanıcı sitede biraz vakit geçirdikten sonra göster
      setTimeout(() => {
        const gameRecords = localStorage.getItem('psikoOyunScores');
        const hasPlayedGames = gameRecords && JSON.parse(gameRecords).length > 0;
        
        // Oyun oynamış ya da 30 saniye beklemişse göster
        if (hasPlayedGames) {
          setShowInstallPrompt(true);
        } else {
          // Hiç oyun oynamamışsa 30 saniye sonra göster
          setTimeout(() => setShowInstallPrompt(true), 30000);
        }
      }, 3000);
    };

    // appinstalled event'ini dinle
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA kuruldu');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('PWA kurulum hatası:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 24 saat boyunca gösterme
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Eğer PWA kurulu veya prompt yoksa gösterme
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null;
  }

  // Son 24 saat içinde dismiss edilmişse gösterme
  const dismissed = localStorage.getItem('installPromptDismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className={cn(
      'fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm',
      'bg-card border border-border rounded-xl shadow-elevated p-4',
      'animate-slide-in-up backdrop-blur-sm'
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Uygulamayı Yükle
          </h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            PsikoOyun'u ana ekranına ekle ve daha hızlı erişim sağla
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              variant="primary"
              size="sm"
              className="flex-1 text-xs h-8"
            >
              Yükle
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="px-2 h-8"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

InstallPrompt.displayName = 'InstallPrompt';