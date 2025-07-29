import { useEffect } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';

/**
 * Sistem temasını otomatik algılayıp uygulayan hook
 * İlk açılışta sistem ayarını kullanır, sonra kullanıcı tercihini saklar
 */
export const useSystemTheme = () => {
  useEffect(() => {
    const settings = loadSettings();
    
    // Eğer kullanıcı daha önce bir tercih yapmamışsa sistem ayarını kullan
    if (settings.darkMode === undefined) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Sistem ayarını kaydet ve uygula
      const newSettings = {
        ...settings,
        darkMode: prefersDark
      };
      saveSettings(newSettings);
      
      // Temayı uygula
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Kullanıcı tercihi varsa onu uygula
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
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