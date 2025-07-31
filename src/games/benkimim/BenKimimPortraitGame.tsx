import { useState, useEffect } from 'react';
import { Check, X, Home } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGameState } from '@/types/benkimim';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface BenKimimPortraitGameProps {
  gameEngine: BenKimimEngine;
  onGameEnd: () => void;
  onGoHome: () => void;
}

/**
 * Ben Kimim oyunu dikey mod ekranı
 * Normal telefon kullanımı için optimize edilmiş tasarım
 */
export const BenKimimPortraitGame = ({ gameEngine, onGameEnd, onGoHome }: BenKimimPortraitGameProps) => {
  const [gameState, setGameState] = useState<BenKimimGameState>(gameEngine.getGameState());
  const [motionPermissionRequested, setMotionPermissionRequested] = useState(false);

  const motionSensor = useMotionSensor();

  // Oyun durumu değişikliklerini dinle
  useEffect(() => {
    const handleGameStateChange = () => {
      const newState = gameEngine.getGameState();
      setGameState(newState);
      
      // Oyun bittiyse sonuç ekranına geç
      if (!newState.isPlaying && gameState.isPlaying) {
        onGameEnd();
      }
    };

    gameEngine.addListener(handleGameStateChange);

    return () => {
      gameEngine.removeListener(handleGameStateChange);
    };
  }, [gameEngine, onGameEnd, gameState.isPlaying]);

  // Hareket sensörü ayarları
  useEffect(() => {
    if (gameState.settings.controlType === 'motion' && !motionPermissionRequested) {
      setMotionPermissionRequested(true);
      
      const setupMotionSensor = async () => {
        if (motionSensor.isSupported) {
          const hasPermission = await motionSensor.requestPermission();
          
          if (hasPermission) {
            motionSensor.onTiltForward(() => {
              if (gameState.isPlaying && !gameState.isPaused) {
                gameEngine.handleAction('correct');
              }
            });
            
            motionSensor.onTiltBackward(() => {
              if (gameState.isPlaying && !gameState.isPaused) {
                gameEngine.handleAction('pass');
              }
            });
          } else {
            // İzin verilmediyse buton moduna geç
            gameEngine.updateSettings({ controlType: 'buttons' });
          }
        } else {
          // Desteklenmiyorsa buton moduna geç
          gameEngine.updateSettings({ controlType: 'buttons' });
        }
      };

      setupMotionSensor();
    }

    return () => {
      motionSensor.cleanup();
    };
  }, [gameState.settings.controlType, motionPermissionRequested, motionSensor, gameEngine, gameState.isPlaying, gameState.isPaused]);

  const handleCorrect = () => {
    gameEngine.handleAction('correct');
  };

  const handlePass = () => {
    gameEngine.handleAction('pass');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState.currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Oyun hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-none bg-card border-b border-border">
        <div className="flex justify-between items-center px-6 py-4">
          <Button onClick={onGoHome} variant="ghost" size="sm">
            <Home className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(gameState.timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground">Kalan Süre</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {gameState.score}/{gameState.settings.targetScore}
              </div>
              <div className="text-xs text-muted-foreground">Skor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Kelime Alanı */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md w-full">
          {/* Ana Kelime */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {gameState.currentWord.kisi}
          </h1>
          
          {/* Kategori */}
          <p className="text-lg md:text-xl text-primary font-medium">
            {gameState.currentWord.kategori}
          </p>
        </div>
      </div>

      {/* Kontrol Paneli */}
      <div className="flex-none bg-card border-t border-border">
        <div className="px-6 py-6">
          {gameState.settings.controlType === 'buttons' ? (
            <div className="flex gap-4">
              <Button
                onClick={handleCorrect}
                variant="success"
                size="lg"
                fullWidth
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center justify-center gap-2 text-lg py-4"
              >
                <Check className="w-6 h-6" />
                Doğru
              </Button>

              <Button
                onClick={handlePass}
                variant="danger"
                size="lg"
                fullWidth
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center justify-center gap-2 text-lg py-4"
              >
                <X className="w-6 h-6" />
                Pas
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Telefonu ileri/geri eğerek oynayın
              </p>
              <Button
                onClick={handlePass}
                variant="secondary"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center gap-2 mx-auto"
              >
                <X className="w-5 h-5" />
                Pas
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};