import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  canInstall: boolean;
  installApp: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export { PWAInstallContext };

interface PWAInstallProviderProps {
  children: ReactNode;
}

export const PWAInstallProvider = ({ children }: PWAInstallProviderProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Zaten yüklenmiş mi kontrol et
    const isInStandaloneMode = (window.navigator as unknown as { standalone?: boolean }).standalone || 
      window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isInStandaloneMode);

    // PWA install event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // App yüklendikten sonra prompt'u temizle
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'dismissed') {
        // Kullanıcı redetti, bir daha otomatik olarak gösterme
        localStorage.setItem('pwaInstallDismissed', 'true');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA kurulum hatası:', error);
    }
  };

  const canInstall = !!deferredPrompt && !isInstalled;

  return (
    <PWAInstallContext.Provider value={{
      deferredPrompt,
      isInstalled,
      canInstall,
      installApp
    }}>
      {children}
    </PWAInstallContext.Provider>
  );
};
