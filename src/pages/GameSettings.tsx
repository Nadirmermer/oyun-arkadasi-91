import { useState } from 'react';
import { ArrowLeft, Clock, Target, SkipForward, Gamepad2, Smartphone } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { Team, GameSettings as GameSettingsType } from '@/types/game';
import { loadSettings, saveSettings } from '@/lib/storage';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface GameSettingsProps {
  teams: Team[];
  onStartGame: (settings: GameSettingsType) => void;
  onGoBack?: () => void;
}

/**
 * Oyun ayarları ekranı
 * Kullanıcıların oyun parametrelerini ayarlamasını sağlar
 */
export const GameSettings = ({ teams, onStartGame, onGoBack }: GameSettingsProps) => {
  // Kaydedilmiş ayarları yükle
  const savedSettings = loadSettings();
  const [gameDuration, setGameDuration] = useState(savedSettings.gameDuration);
  const [maxScore, setMaxScore] = useState(savedSettings.maxScore);
  const [passCount, setPassCount] = useState(savedSettings.passCount);
  const [controlType, setControlType] = useState<'buttons' | 'motion'>('buttons');
  
  const motionSensor = useMotionSensor();

  /**
   * Oyunu başlat
   */
  const handleStartGame = async () => {
    // Eğer hareket kontrolü seçildiyse izin iste
    if (controlType === 'motion') {
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

    const settings = {
      gameDuration,
      maxScore,
      passCount,
      darkMode: savedSettings.darkMode,
      controlType
    };
    
    // Ayarları kaydet
    saveSettings({
      gameDuration,
      maxScore,
      passCount,
      darkMode: savedSettings.darkMode,
      motionSensorEnabled: savedSettings.motionSensorEnabled,
      motionSensitivity: savedSettings.motionSensitivity,
      motionPermissionStatus: savedSettings.motionPermissionStatus
    });
    
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-primary">Oyun Ayarları</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Takım Bilgileri */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Takımlar</h3>
              <p className="text-sm text-muted-foreground">Oyuna katılacak takımlar</p>
            </div>
          </div>

          <div className="space-y-2">
            {teams.map((team, index) => (
              <div 
                key={team.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="font-medium text-foreground">{team.name}</span>
                <span className="text-sm text-muted-foreground">Hazır</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Oyun Ayarları */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Oyun Ayarları</h3>
              <p className="text-sm text-muted-foreground">Oyun kurallarını belirle</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <Slider
              label="Tur Süresi"
              value={gameDuration}
              min={30}
              max={120}
              step={10}
              unit="saniye"
              onChange={setGameDuration}
            />

            <Slider
              label="Tur Sayısı"
              value={maxScore}
              min={1}
              max={10}
              step={1}
              unit="tur"
              onChange={setMaxScore}
            />

            <Slider
              label="Pas Hakkı"
              value={passCount}
              min={1}
              max={5}
              step={1}
              unit="hak"
              onChange={setPassCount}
            />
          </div>
        </Card>

        {/* Kontrol Tipi */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Kontrol Tipi</h3>
              <p className="text-sm text-muted-foreground">Oyunu nasıl kontrol etmek istiyorsun?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setControlType('buttons')}
              className={`p-4 rounded-xl border-2 transition-all ${
                controlType === 'buttons'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Gamepad2 className={`w-6 h-6 ${
                  controlType === 'buttons' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  controlType === 'buttons' ? 'text-primary' : 'text-foreground'
                }`}>
                  Butonlar
                </span>
              </div>
            </button>

            <button
              onClick={() => setControlType('motion')}
              disabled={!motionSensor.isSupported}
              className={`p-4 rounded-xl border-2 transition-all ${
                controlType === 'motion'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${!motionSensor.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Smartphone className={`w-6 h-6 ${
                  controlType === 'motion' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  controlType === 'motion' ? 'text-primary' : 'text-foreground'
                }`}>
                  {motionSensor.isSupported ? 'Hareket' : 'Desteklenmiyor'}
                </span>
              </div>
            </button>
          </div>

          {controlType === 'motion' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📱 <strong>Doğru:</strong> Telefonu sağa eğin<br />
                📱 <strong>Tabu:</strong> Telefonu sola eğin<br />
                📱 <strong>Pas:</strong> Ekranda buton kullanın
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Başlat Butonu - Daha üstte ve padding ile */}
      <div className="p-4 pb-8">
        <Button
          onClick={handleStartGame}
          variant="primary"
          size="lg"
          fullWidth
          className="shadow-elevated"
        >
          Oyunu Başlat
        </Button>
      </div>
    </div>
  );
};