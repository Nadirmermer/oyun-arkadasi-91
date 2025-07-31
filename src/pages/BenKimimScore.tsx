import { Trophy } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';

interface BenKimimScoreProps {
  gameEngine: BenKimimEngine;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const BenKimimScore = ({ gameEngine, onPlayAgain, onGoHome }: BenKimimScoreProps) => {
  const gameState = gameEngine.getGameState();

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Ben Kimim?</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="px-4 pt-8">
        {/* Sonuç Kartı */}
        <Card className="text-center mb-8 bg-primary/5 border-primary/20">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-primary mb-2">Oyun Bitti!</h2>
          <div className="space-y-2">
            <p className="text-xl text-foreground">
              <span className="font-bold">{gameState.score}/{gameState.settings.targetScore}</span> doğru
            </p>
            <p className="text-lg text-primary font-bold">
              Toplam Kelime: {gameState.totalWords}
            </p>
            <p className="text-muted-foreground">
              Başarı oranı: %{Math.round((gameState.score / gameState.totalWords) * 100)}
            </p>
          </div>
        </Card>

        {/* Başarı Mesajı */}
        <Card className="text-center mb-8">
          <div className="space-y-2">
            {gameState.score >= gameState.settings.targetScore * 0.8 && (
              <p className="text-lg text-success font-bold">🎉 Harika performans!</p>
            )}
            {gameState.score >= gameState.settings.targetScore * 0.6 && gameState.score < gameState.settings.targetScore * 0.8 && (
              <p className="text-lg text-primary font-bold">👏 İyi iş çıkardın!</p>
            )}
            {gameState.score >= gameState.settings.targetScore * 0.4 && gameState.score < gameState.settings.targetScore * 0.6 && (
              <p className="text-lg text-warning font-bold">👍 Fena değil!</p>
            )}
            {gameState.score < gameState.settings.targetScore * 0.4 && (
              <p className="text-lg text-muted-foreground">💪 Daha fazla çalışman gerekiyor!</p>
            )}
          </div>
        </Card>

        {/* Aksiyon Butonları */}
        <div className="space-y-4">
          <Button onClick={onPlayAgain} variant="primary" size="lg" fullWidth>
            Yeniden Oyna
          </Button>
          <Button onClick={onGoHome} variant="secondary" size="lg" fullWidth>
            Ana Menüye Dön
          </Button>
        </div>
      </div>
    </div>
  );
};