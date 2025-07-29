import { useState, useEffect } from 'react';
import { Moon, Sun, Smartphone, Settings as SettingsIcon, Info } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toggle } from '@/components/shared/Toggle';
import { Slider } from '@/components/shared/Slider';
import { AboutModal } from '@/components/shared/AboutModal';
import { loadSettings, saveSettings, StoredSettings } from '@/lib/storage';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

/**
 * Standalone Ayarlar sayfası
 * Bottom navigation ile kullanım için
 */
export const SettingsPage = () => {
  const [settings, setSettings] = useState<StoredSettings>(loadSettings());
  const [showAboutModal, setShowAboutModal] = useState(false);
  const motionSensor = useMotionSensor();
  useEffect(() => {
    // Karanlık mod uygula
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // İzin durumu metni
  const getPermissionStatusText = () => {
    if (!motionSensor.isSupported) return 'Cihaz Desteklemiyor';
    switch (settings.motionPermissionStatus) {
      case 'granted':
        return 'İzin Verildi';
      case 'denied':
        return 'Reddedildi';
      case 'prompt':
        return 'Henüz Sorulmadı';
      case 'unsupported':
        return 'Cihaz Desteklemiyor';
      default:
        return 'Bilinmiyor';
    }
  };

  // Hassasiyet değerini sayıya çevir
  const getSensitivityValue = (sensitivity: 'low' | 'medium' | 'high'): number => {
    switch (sensitivity) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      default:
        return 2;
    }
  };

  // Sayıyı hassasiyet değerine çevir
  const getValueToSensitivity = (value: number): 'low' | 'medium' | 'high' => {
    switch (value) {
      case 1:
        return 'low';
      case 2:
        return 'medium';
      case 3:
        return 'high';
      default:
        return 'medium';
    }
  };

  /**
   * Ayarları güncelle ve kaydet
   */
  const updateSetting = <K extends keyof StoredSettings,>(key: K, value: StoredSettings[K]) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  /**
   * Motion sensor izinlerini yeniden iste
   */
  const handleRequestMotionPermission = async () => {
    const granted = await motionSensor.requestPermission();
    if (granted) {
      const newSettings = {
        ...settings,
        motionPermissionStatus: 'granted' as const
      };
      setSettings(newSettings);
      saveSettings(newSettings);
    } else {
      const newSettings = {
        ...settings,
        motionPermissionStatus: 'denied' as const
      };
      setSettings(newSettings);
      saveSettings(newSettings);
    }
  };

  /**
   * Motion sensor hassasiyetini güncelle
   */
  const handleSensitivityChange = (value: number) => {
    const sensitivity = getValueToSensitivity(value);
    motionSensor.setSensitivity(sensitivity);
    updateSetting('motionSensitivity', sensitivity);
  };
  return <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card py-[10px] px-[20px]">
        <h1 className="text-2xl font-bold text-primary">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">Uygulamayı kişiselleştir</p>
      </div>

      {/* Ayarlar İçeriği */}
      <div className="p-4 space-y-6">
        {/* Görünüm Bölümü */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 px-2">Görünüm</h2>
          
          {/* Karanlık Mod */}
          <Card>
            <div className="flex items-center justify-between p-4 mx-0 my-0 py-[15px] px-0">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <div>
                  <h3 className="font-semibold text-foreground">Karanlık Mod</h3>
                  <p className="text-sm text-muted-foreground mx-0 py-0 my-[4px] px-0">
                    Uygulamanın görünümünü değiştir
                  </p>
                </div>
              </div>
              <Toggle checked={settings.darkMode} onChange={checked => updateSetting('darkMode', checked)} label="" />
            </div>
          </Card>
        </div>

        {/* Hareketle Kontrol Bölümü */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 px-2">Hareketle Kontrol</h2>
          
          {/* İzin Yönetimi */}
          <Card className="mb-4">
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
                <div className="flex items-center justify-between my-[12px] mx-0 py-[20px]">
                  <span className="text-sm font-medium text-foreground">Durum:</span>
                  <span className={`text-sm font-medium ${settings.motionPermissionStatus === 'granted' ? 'text-success' : settings.motionPermissionStatus === 'denied' ? 'text-danger' : 'text-muted-foreground'}`}>
                    {getPermissionStatusText()}
                  </span>
                </div>
                
                <Button onClick={handleRequestMotionPermission} variant="secondary" size="sm" fullWidth disabled={!motionSensor.isSupported} className="my-[34px]">
                  <SettingsIcon className="w-4 h-4" />
                  Hareket Sensörü İzinlerini Yönet
                </Button>
              </div>
            </div>
          </Card>

          {/* Hassasiyet Ayarı */}
          <Card>
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

              <Slider label="Hassasiyet" value={getSensitivityValue(settings.motionSensitivity)} min={1} max={3} step={1} unit="" onChange={handleSensitivityChange} />
              
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground my-[14px] mx-0 px-0 py-0">
                <div className="text-center">Düşük (25°)</div>
                <div className="text-center">Orta (15°)</div>
                <div className="text-center">Yüksek (10°)</div>
              </div>
            </div>
          </Card>

        </div>

        {/* Uygulama Bölümü */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 px-2">Uygulama</h2>
          
          {/* Hakkımızda */}
          <Card>
            <button onClick={() => setShowAboutModal(true)} className="w-full p-4 text-left hover:bg-muted/30 transition-colors rounded-2xl">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Hakkımızda</h3>
                  <p className="text-sm text-muted-foreground">
                    Uygulama hakkında bilgi al
                  </p>
                </div>
              </div>
            </button>
          </Card>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </div>;
};