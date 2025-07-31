import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGameState } from '@/types/benkimim';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface BenKimimLandscapeProps {
  gameEngine: BenKimimEngine;
  onGameEnd: () => void;
  onGoHome: () => void;
}

/**
 * Ben Kimim oyunu yatay mod ekranı
 * Telefonu alnına tutmak için optimize edilmiş tasarım
 */
export const BenKimimLandscape = ({ gameEngine, onGameEnd, onGoHome }: BenKimimLandscapeProps) => {
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
    <div className="min-h-screen bg-background dark:bg-background flex flex-col overflow-hidden landscape-mode">
      {/* Üst Bilgi Çubuğu - Minimal */}
      <div className="flex-none bg-card dark:bg-card border-b border-border dark:border-border">
        <div className="flex justify-between items-center px-6 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary dark:text-primary">
              {formatTime(gameState.timeLeft)}
            </div>
            <div className="text-xs text-muted-foreground dark:text-muted-foreground">Kalan Süre</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground dark:text-foreground">
              {gameState.score}/{gameState.settings.targetScore}
            </div>
            <div className="text-xs text-muted-foreground dark:text-muted-foreground">Skor</div>
          </div>
        </div>
      </div>

      {/* Ana Kelime Alanı - Maksimum büyüklük */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background dark:bg-background">
        <div className="text-center max-w-4xl w-full">
          {/* Ana Kelime - Çok büyük */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground dark:text-foreground mb-6 leading-none">
            {gameState.currentWord.kisi}
          </h1>
          
          {/* Kategori */}
          <p className="text-xl md:text-2xl lg:text-3xl text-primary dark:text-primary font-medium">
            {gameState.currentWord.kategori}
          </p>
        </div>
      </div>

      {/* Alt Kontrol Paneli - Kompakt */}
      <div className="flex-none bg-card dark:bg-card border-t border-border dark:border-border">
        <div className="px-6 py-4">
          {gameState.settings.controlType === 'buttons' ? (
            <div className="flex justify-center gap-8">
              <Button
                onClick={handleCorrect}
                variant="success"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center gap-3 px-8 py-4 text-lg"
              >
                <Check className="w-6 h-6" />
                Doğru
              </Button>

              <Button
                onClick={handlePass}
                variant="danger"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center gap-3 px-8 py-4 text-lg"
              >
                <X className="w-6 h-6" />
                Pas
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={handlePass}
                variant="secondary"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center gap-2 px-6 py-3"
              >
                <X className="w-5 h-5" />
                Pas
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .landscape-mode {
          /* Yatay modda özel stiller */
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        @media (orientation: landscape) {
          .landscape-mode {
            height: 100vh;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};