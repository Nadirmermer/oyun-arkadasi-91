import { useState } from 'react';
import { Play, Clock, Target, Smartphone, Search } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PageHeader } from '@/components/shared/PageHeader';
import { BenKimimSettings } from '@/types/benkimim';

import { toast } from '@/hooks/use-toast';

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
    targetScore: 15
  });

  const handleStartGame = async () => {
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
              <Search className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Ben Kimim?</h2>
            <p className="text-muted-foreground">
              Psikoloji alanından ünlü kişileri tahmin etmeye çalış!
            </p>
          </div>
        </Card>

        {/* Telefon Kullanım Talimatı */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Telefon Kullanımı</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📱 <strong>Telefonu yatay çevir</strong> ve alnına koy</p>
              <p>👁️ <strong>Kelime karşı tarafa gözüksün</strong></p>
              <p>🎯 <strong>Doğru tahmin etmeye çalış!</strong></p>
            </div>
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