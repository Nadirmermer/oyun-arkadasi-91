import { Pause, Play, Home, Sun, Moon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { loadSettings, saveSettings } from '@/lib/storage';
import { useState } from 'react';

interface PauseModalProps {
  onResume: () => void;
  onGoHome: () => void;
}

/**
 * Oyun duraklatma modalı
 * Karanlık mod değiştirme ve ana menüye dönme seçenekleri
 */
export const PauseModal = ({ onResume, onGoHome }: PauseModalProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    const settings = loadSettings();
    return settings.darkMode;
  });

  /**
   * Karanlık modu değiştir
   */
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Ayarları kaydet
    const currentSettings = loadSettings();
    saveSettings({
      ...currentSettings,
      darkMode: newDarkMode
    });
    
    // Tema uygula
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full m-4 max-w-sm">
        <div className="text-center">
          <Pause className="text-primary mx-auto mb-4 w-12 h-12" />
          <h2 className="font-bold text-primary mb-2 text-xl">Oyun Duraklatıldı</h2>
          <p className="text-muted-foreground mb-6">Ne yapmak istersiniz?</p>

          <div className="space-y-3">
            {/* Tema Değiştir */}
            <Button
              onClick={handleThemeToggle}
              variant="secondary"
              size="md"
              fullWidth
              className="flex items-center justify-center gap-3"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'Aydınlık Mod' : 'Karanlık Mod'}</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onGoHome}
                variant="secondary"
                size="md"
                className="flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Ana Sayfa</span>
              </Button>
              
              <Button
                onClick={onResume}
                variant="primary"
                size="md"
                className="flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Devam Et</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};