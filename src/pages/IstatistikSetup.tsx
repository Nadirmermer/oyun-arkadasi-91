import { useState } from 'react';
import { Play, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';

export interface IstatistikSettings {
  gameDuration: number;    // Soru başına düşünme süresi (saniye)
}

/**
 * İstatistik Sezgisi oyunu ayarlar ekranı
 * Oyun parametrelerini belirlemek için
 */
export const IstatistikSetup = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<IstatistikSettings>({
    gameDuration: 30
  });

  const handleStartGame = () => {
    // Ayarları localStorage'a kaydet ve oyunu başlat
    localStorage.setItem('istatistikSettings', JSON.stringify(settings));
    navigate('/game/istatistik');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="İstatistik Sezgisi"
        subtitle="Oyun ayarlarını belirle"
        onGoBack={handleGoBack}
      />

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">İstatistik Sezgisi</h2>
            <p className="text-muted-foreground">
              Psikoloji araştırmalarından gerçek istatistikler. Tahmin et, öğren, sezgilerini geliştir!
            </p>
          </div>
        </Card>

        {/* Oyun Hakkında Bilgi */}
        <Card>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Nasıl Oynanır?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Psikoloji araştırmaları hakkında istatistik soruları görün</li>
              <li>• Slider ile tahminizi belirleyin (0-100% arası)</li>
              <li>• Tahmininizi gerçek sonuçla karşılaştırın</li>
              <li>• Doğruluğunuza göre puan kazanın</li>
              <li>• Her soru sonrası detaylı açıklama ve kaynak bilgisi</li>
            </ul>
          </div>
        </Card>

        {/* Ayarlar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground px-2">Oyun Ayarları</h3>
          
          {/* Soru Başına Süre */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Düşünme Süresi</h4>
                <p className="text-sm text-muted-foreground">
                  Her soru için kaç saniye düşünme süresi
                </p>
              </div>
            </div>
            
            <Slider
              label="Süre"
              value={settings.gameDuration}
              min={15}
              max={60}
              step={5}
              unit="saniye"
              onChange={(value) => setSettings(prev => ({ ...prev, gameDuration: value }))}
            />
          </Card>

        </div>

        {/* Bilgi Notu */}
        <Card className="bg-info/5 border-info/20">
          <div className="p-4">
            <h4 className="font-semibold text-info mb-2">💡 İpucu</h4>
            <p className="text-sm text-muted-foreground">
              Tüm sorular gerçek psikoloji araştırmalarından alınmıştır. 
              39 farklı soru rastgele sırada gelecek, istediğin zaman çıkabilirsin! 
              Bu oyun psikoloji bilginizi değil, sezgisel düşünme becerilerinizi geliştirir.
            </p>
          </div>
        </Card>

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
