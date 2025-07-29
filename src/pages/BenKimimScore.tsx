import { Home, RotateCcw, Trophy, Target, Clock } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { BenKimimGameState } from '@/types/benkimim';

interface BenKimimScoreProps {
  gameState: BenKimimGameState;
  onNewGame: () => void;
  onGoHome: () => void;
}

/**
 * Ben Kimim oyunu sonuç ekranı
 * Oyun istatistikleri ve yeni oyun seçenekleri
 */
export const BenKimimScore = ({ gameState, onNewGame, onGoHome }: BenKimimScoreProps) => {
  const { score, settings, totalWords } = gameState;
  const accuracy = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;
  const isTargetReached = score >= settings.targetScore;

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-card ${
          isTargetReached ? 'bg-success' : 'bg-primary'
        }`}>
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isTargetReached ? 'Tebrikler!' : 'Oyun Bitti'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isTargetReached 
            ? 'Hedef skora ulaştın!' 
            : 'Süre doldu, tekrar dene!'
          }
        </p>
      </div>

      {/* Skor Kartı */}
      <div className="px-4 space-y-6">
        <Card className="text-center">
          <div className="space-y-6">
            {/* Ana Skor */}
            <div>
              <div className="text-6xl font-bold text-primary mb-2">
                {score}
              </div>
              <p className="text-xl text-muted-foreground">
                Doğru Cevap
              </p>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {settings.targetScore}
                </div>
                <p className="text-sm text-muted-foreground">Hedef</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {accuracy}%
                </div>
                <p className="text-sm text-muted-foreground">İsabet</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.floor(settings.gameDuration / 60)}:{(settings.gameDuration % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-muted-foreground">Süre</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detaylı İstatistikler */}
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Oyun Detayları</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Toplam Kelime</span>
              <span className="font-medium text-foreground">{totalWords}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Doğru Cevap</span>
              <span className="font-medium text-success">{score}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pas Geçilen</span>
              <span className="font-medium text-muted-foreground">{totalWords - score}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Kontrol Tipi</span>
              <span className="font-medium text-foreground">
                {settings.controlType === 'buttons' ? 'Butonlar' : 'Hareket Sensörü'}
              </span>
            </div>
          </div>
        </Card>

        {/* Aksiyonlar */}
        <div className="space-y-3 pb-8">
          <Button
            onClick={onNewGame}
            variant="primary"
            size="lg"
            fullWidth
          >
            <RotateCcw className="w-5 h-5" />
            Tekrar Oyna
          </Button>
          
          <Button
            onClick={onGoHome}
            variant="ghost"
            size="lg"
            fullWidth
          >
            <Home className="w-5 h-5" />
            Ana Menü
          </Button>
        </div>
      </div>
    </div>
  );
};