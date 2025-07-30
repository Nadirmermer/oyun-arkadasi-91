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
      <div className="px-4 pt-8">
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
          </div>
        </Card>

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