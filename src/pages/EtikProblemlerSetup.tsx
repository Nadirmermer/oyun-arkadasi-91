import { Play, Brain } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';

/**
 * Etik Problemler oyunu ayarlar ekranı
 * Basit başlatma ekranı
 */
export const EtikProblemlerSetup = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game/etikproblemler');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="Etik Problemler"
        subtitle="Oyunu başlat"
        onGoBack={handleGoBack}
      />

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Etik Problemler</h2>
            <p className="text-muted-foreground">
              Psikoloji alanından etik vakalar ve tartışmalar. Her vaka için etik değerlendirme yapın.
            </p>
          </div>
        </Card>

        {/* Oyun Hakkında */}
        <Card>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Nasıl Oynanır?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Etik vaka senaryolarını okuyun</li>
              <li>• Kendi değerlendirmenizi yapın</li>
              <li>• Tartışma ve yorumu görüntüleyin</li>
              <li>• Yeni vakalar için devam edin</li>
            </ul>
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