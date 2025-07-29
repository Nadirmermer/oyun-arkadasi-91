import { memo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Moon, Sun, Smartphone, Settings as SettingsIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import { LoadingSpinner } from './LoadingSpinner';
import { loadSettings, saveSettings, StoredSettings } from '@/lib/storage';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface OptimizedSettingsProps {
  onGoBack: () => void;
}

// Memoized Settings Section Component
const MemoizedSettingsSection = memo(({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode; 
}) => (
  <div>
    <h2 className="text-lg font-semibold text-foreground mb-4 px-2">{title}</h2>
    {children}
  </div>
));

MemoizedSettingsSection.displayName = 'MemoizedSettingsSection';

/**
 * Performans optimize edilmiş ayarlar sayfası
 * Loading states ve memoized components ile
 */
export const OptimizedSettings = memo(({ onGoBack }: OptimizedSettingsProps) => {
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const motionSensor = useMotionSensor();

  useEffect(() => {
    // Settings yükleme simülasyonu
    const timer = setTimeout(() => {
      setSettings(loadSettings());
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (settings) {
      // Karanlık mod uygula
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings?.darkMode]);

  // Memoized callbacks
  const getPermissionStatusText = useCallback(() => {
    if (!motionSensor.isSupported) return 'Cihaz Desteklemiyor';
    
    switch (settings?.motionPermissionStatus) {
      case 'granted': return 'İzin Verildi';
      case 'denied': return 'Reddedildi';
      case 'prompt': return 'Henüz Sorulmadı';
      case 'unsupported': return 'Cihaz Desteklemiyor';
      default: return 'Bilinmiyor';
    }
  }, [motionSensor.isSupported, settings?.motionPermissionStatus]);

  const getSensitivityValue = useCallback((sensitivity: 'low' | 'medium' | 'high'): number => {
    switch (sensitivity) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }, []);

  const getValueToSensitivity = useCallback((value: number): 'low' | 'medium' | 'high' => {
    switch (value) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      default: return 'medium';
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof StoredSettings>(
    key: K, 
    value: StoredSettings[K]
  ) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const handleRequestMotionPermission = useCallback(async () => {
    if (!settings) return;
    
    const granted = await motionSensor.requestPermission();
    const newStatus = granted ? 'granted' as const : 'denied' as const;
    updateSetting('motionPermissionStatus', newStatus);
  }, [motionSensor, settings, updateSetting]);

  const handleSensitivityChange = useCallback((value: number) => {
    const sensitivity = getValueToSensitivity(value);
    motionSensor.setSensitivity(sensitivity);
    updateSetting('motionSensitivity', sensitivity);
  }, [getValueToSensitivity, motionSensor, updateSetting]);

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card hover-lift">
        <button
          onClick={onGoBack}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary">Ayarlar</h1>
      </div>

      {/* Ayarlar İçeriği */}
      <div className="p-4 space-y-4">
        {/* Görünüm Bölümü */}
        <MemoizedSettingsSection title="Görünüm">
          {/* Karanlık Mod */}
          <Card className="hover-lift">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">Karanlık Mod</h3>
                  <p className="text-sm text-muted-foreground">
                    Uygulamanın görünümünü değiştir
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.darkMode}
                onChange={(checked) => updateSetting('darkMode', checked)}
                label=""
              />
            </div>
          </Card>
        </MemoizedSettingsSection>

        {/* Hareketle Kontrol Bölümü */}
        <MemoizedSettingsSection title="Hareketle Kontrol">
          {/* İzin Yönetimi */}
          <Card className="mb-4 hover-lift">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Hareket Sensörü İzinleri</h3>
                  <p className="text-sm text-muted-foreground">
                    Telefonu eğerek oyun kontrol etme özelliği
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Durum:</span>
                  <span className={`text-sm font-medium ${
                    settings.motionPermissionStatus === 'granted' ? 'text-success' :
                    settings.motionPermissionStatus === 'denied' ? 'text-danger' :
                    'text-muted-foreground'
                  }`}>
                    {getPermissionStatusText()}
                  </span>
                </div>
                
                <Button
                  onClick={handleRequestMotionPermission}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  disabled={!motionSensor.isSupported}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Hareket Sensörü İzinlerini Yönet
                </Button>
              </div>
            </div>
          </Card>

          {/* Hassasiyet Ayarı */}
          <Card className="hover-lift">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Hareket Hassasiyeti</h3>
                  <p className="text-sm text-muted-foreground">
                    Telefon hareketlerinin ne kadar hassas algılanacağını belirler
                  </p>
                </div>
              </div>

              <Slider
                label="Hassasiyet"
                value={getSensitivityValue(settings.motionSensitivity)}
                min={1}
                max={3}
                step={1}
                unit=""
                onChange={handleSensitivityChange}
              />
              
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                <div className="text-center">Düşük (25°)</div>
                <div className="text-center">Orta (15°)</div>
                <div className="text-center">Yüksek (10°)</div>
              </div>
            </div>
          </Card>
        </MemoizedSettingsSection>

        {/* Gelecekteki ayarlar için yer */}
        <Card className="opacity-50 hover-lift">
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Yakında</h3>
            <p className="text-sm text-muted-foreground">
              Daha fazla ayar seçeneği yakında eklenecek...
            </p>
          </div>
        </Card>
      </div>

      {/* Geri Dön Butonu */}
      <div className="fixed bottom-4 left-4 right-4">
        <Button
          onClick={onGoBack}
          variant="secondary"
          size="lg"
          fullWidth
        >
          Geri Dön
        </Button>
      </div>
    </div>
  );
});

OptimizedSettings.displayName = 'OptimizedSettings';