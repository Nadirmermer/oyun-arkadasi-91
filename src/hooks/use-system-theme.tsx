import { useEffect } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';

/**
 * Sistem temasını otomatik algılayıp uygulayan hook
 * İlk açılışta sistem ayarını kullanır, sonra kullanıcı tercihini saklar
 */
export const useSystemTheme = () => {
  useEffect(() => {
    const settings = loadSettings();
    
    // İlk yükleme kontrol et
    const isFirstLoad = !localStorage.getItem('themeInitialized');
    
    if (isFirstLoad) {
      // İlk kez açılıyor - sistem temasını kullan
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const newSettings = {
        ...settings,
        darkMode: prefersDark
      };
      saveSettings(newSettings);
      localStorage.setItem('themeInitialized', 'true');
      
      // Temayı uygula
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Daha önce yüklenmiş - kullanıcı tercihini kullan
      if (typeof settings.darkMode === 'boolean') {
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Fallback: sistem teması
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
    
    // Sistem tema değişikliklerini sürekli dinle ama manuel tercihi koruyacak şekilde değil
    // Bunun yerine her session'da sistem ayarını kontrol et
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    return () => {
      // Cleanup yapılacak bir şey yok
    };
  }, []);
};