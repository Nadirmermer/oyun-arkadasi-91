import { useState } from 'react';
import { Play, Clock, Target, Gamepad2, Smartphone, Brain } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PageHeader } from '@/components/shared/PageHeader';
import { BenKimimSettings } from '@/types/benkimim';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface BenKimimSetupProps {
  onStartGame: (settings: BenKimimSettings) => void;
  onGoBack: () => void;
}

/**
 * Ben Kimim oyunu ayarlar ekranı
 * Tur süresi, hedef skor ve kontrol tipi ayarlarını yönetir
 */
export const BenKimimSetup = ({ onStartGame, onGoBack }: BenKimimSetupProps) => {
  const [settings, setSettings] = useState<BenKimimSettings>({
    gameDuration: 90,
    targetScore: 15,
    controlType: 'buttons'
  });
  
  const motionSensor = useMotionSensor();

  const handleStartGame = async () => {
    // Eğer hareket kontrolü seçildiyse izin iste
    if (settings.controlType === 'motion') {
      if (!motionSensor.isSupported) {
        alert('Bu cihaz hareket sensörünü desteklemiyor. Lütfen buton kontrolünü seçin.');
        return;
      }
      
      if (!motionSensor.hasPermission) {
        const granted = await motionSensor.requestPermission();
        if (!granted) {
          alert('Hareket sensörü izni gerekli. Lütfen ayarlardan izin verin veya buton kontrolünü seçin.');
          return;
        }
      }
    }
    
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="Ben Kimim?"
        subtitle="Oyun ayarlarını belirle"
        onGoBack={onGoBack}
      />

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Ben Kimim?</h2>
            <p className="text-muted-foreground">
              Psikoloji alanından ünlü kişi, kavram ve vakaları tahmin etmeye çalış!
            </p>
          </div>
        </Card>

        {/* Ayarlar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground px-2">Oyun Ayarları</h3>
          
          {/* Tur Süresi */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Tur Süresi</h4>
                <p className="text-sm text-muted-foreground">
                  Her turun kaç saniye süreceğini belirleyin
                </p>
              </div>
            </div>
            
            <Slider
              label="Süre"
              value={settings.gameDuration}
              min={60}
              max={180}
              step={30}
              unit="saniye"
              onChange={(value) => setSettings(prev => ({ ...prev, gameDuration: value }))}
            />
          </Card>

          {/* Hedef Skor */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Hedef Skor</h4>
                <p className="text-sm text-muted-foreground">
                  Oyunu tamamlamak için kaç doğru cevap gerekli
                </p>
              </div>
            </div>
            
            <Slider
              label="Hedef"
              value={settings.targetScore}
              min={5}
              max={30}
              step={5}
              unit="doğru"
              onChange={(value) => setSettings(prev => ({ ...prev, targetScore: value }))}
            />
          </Card>

          {/* Kontrol Tipi */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Kontrol Tipi</h4>
                <p className="text-sm text-muted-foreground">
                  Oyunu nasıl kontrol etmek istiyorsun?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings(prev => ({ ...prev, controlType: 'buttons' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.controlType === 'buttons'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Gamepad2 className={`w-6 h-6 ${
                    settings.controlType === 'buttons' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm font-medium ${
                    settings.controlType === 'buttons' ? 'text-primary' : 'text-foreground'
                  }`}>
                    Butonlar
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSettings(prev => ({ ...prev, controlType: 'motion' }))}
                disabled={!motionSensor.isSupported}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.controlType === 'motion'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${!motionSensor.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Smartphone className={`w-6 h-6 ${
                    settings.controlType === 'motion' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm font-medium ${
                    settings.controlType === 'motion' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {motionSensor.isSupported ? 'Hareket' : 'Desteklenmiyor'}
                  </span>
                </div>
              </button>
            </div>

            {settings.controlType === 'motion' && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📱 <strong>Doğru:</strong> Telefonu aşağı eğin<br />
                  📱 <strong>Pas:</strong> Telefonu yukarı eğin
                </p>
              </div>
            )}
          </Card>

        </div>

        {/* Başlat Butonu */}
        <Button
          onClick={handleStartGame}
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8 shadow-elevated"
        >
          <Play className="w-5 h-5" />
          Oyunu Başlat
        </Button>
      </div>
    </div>
  );
};