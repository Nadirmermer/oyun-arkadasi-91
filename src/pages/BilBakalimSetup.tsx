import { useState } from 'react';
import { Play, Clock, Target, Brain } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';

export interface BilBakalimSettings {
  gameDuration: number;    // Soru başına süre (saniye)
  totalQuestions: number;  // Toplam soru sayısı
}

/**
 * Bil Bakalım oyunu ayarlar ekranı
 * Soru sayısı, süre ve puan ayarlarını yönetir
 */
export const BilBakalimSetup = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BilBakalimSettings>({
    gameDuration: 15,
    totalQuestions: 10
  });

  const handleStartGame = () => {
    // Ayarları localStorage'a kaydet ve oyunu başlat
    localStorage.setItem('bilBakalimSettings', JSON.stringify(settings));
    navigate('/game/bilbakalim');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="Bil Bakalım"
        subtitle="Oyun ayarlarını belirle"
        onGoBack={handleGoBack}
      />

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Bil Bakalım</h2>
            <p className="text-muted-foreground">
              Psikoloji sorularını cevaplayarak puanla! Hızlı ol, bonus puan kazan.
            </p>
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
                <h4 className="text-lg font-semibold text-foreground">Soru Başına Süre</h4>
                <p className="text-sm text-muted-foreground">
                  Her soru için kaç saniye verilsin
                </p>
              </div>
            </div>
            
            <Slider
              label="Süre"
              value={settings.gameDuration}
              min={10}
              max={30}
              step={5}
              unit="saniye"
              onChange={(value) => setSettings(prev => ({ ...prev, gameDuration: value }))}
            />
          </Card>

          {/* Toplam Soru Sayısı */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Soru Sayısı</h4>
                <p className="text-sm text-muted-foreground">
                  Oyunda kaç soru çıkacak
                </p>
              </div>
            </div>
            
            <Slider
              label="Soru"
              value={settings.totalQuestions}
              min={5}
              max={20}
              step={5}
              unit="soru"
              onChange={(value) => setSettings(prev => ({ ...prev, totalQuestions: value }))}
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