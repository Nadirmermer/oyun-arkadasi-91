import { useState, useEffect } from 'react';
import { Pause, Play, Check, X } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CircularTimer } from '@/components/shared/CircularTimer';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGameState } from '@/types/benkimim';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface BenKimimGameProps {
  gameEngine: BenKimimEngine;
  onGameEnd: () => void;
  onGoHome: () => void;
}

/**
 * Ben Kimim oyunu ana ekranı
 * Kelime gösterimi, kontroller ve oyun akışını yönetir
 */
export const BenKimimGame = ({ gameEngine, onGameEnd, onGoHome }: BenKimimGameProps) => {
  const [gameState, setGameState] = useState<BenKimimGameState>(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
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

  const handlePause = () => {
    gameEngine.togglePause();
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setShowPauseModal(false);
    gameEngine.togglePause();
  };

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
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">PsikoOyun</h1>
          <button
            onClick={handlePause}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={!gameState.isPlaying}
          >
            {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        {/* Skor ve Timer */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-2 mb-2">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium text-xs sm:text-sm">Skor</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.score}/{gameState.settings.targetScore}
              </div>
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex justify-center">
            <CircularTimer 
              timeLeft={gameState.timeLeft}
              totalTime={gameState.settings.gameDuration}
              className="scale-75 sm:scale-100"
            />
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col justify-center min-h-0 relative z-10 -mt-8 p-4 pb-32">
        {/* Kelime Kartı */}
        <Card className="text-center py-4 sm:py-8 mb-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-8 px-4">
            {gameState.currentWord.kisi}
          </h2>
          <p className="text-base md:text-lg text-primary px-4">
            {gameState.currentWord.kategori}
          </p>
        </Card>

        {/* Kontrol Talimatları (Hareket Modu) */}
        {gameState.settings.controlType === 'motion' && (
          <Card className="w-full max-w-md mb-8 mx-auto">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Telefonu hareket ettir:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <Check className="w-4 h-4 text-success" />
                  <span>Aşağı → Doğru</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <X className="w-4 h-4 text-danger" />
                  <span>Yukarı → Pas</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Alt Kontrol Paneli */}
      <div className="flex-none bg-card shadow-lg border-t border-border fixed bottom-0 left-0 right-0 z-20">
        <div className="p-3 sm:p-4 pb-4 sm:pb-6">
          {gameState.settings.controlType === 'buttons' ? (
            /* Buton Modu - İki buton grid */
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
              {/* Doğru Butonu */}
              <Button
                onClick={handleCorrect}
                variant="success"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 min-h-[4rem] sm:min-h-[4.5rem]"
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm font-semibold">Doğru</span>
              </Button>

              {/* Pas Butonu */}
              <Button
                onClick={handlePass}
                variant="danger"
                size="lg"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 min-h-[4rem] sm:min-h-[4.5rem]"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm font-semibold">Pas</span>
              </Button>
            </div>
          ) : (
            /* Hareket Modu - Sadece Pas Butonu */
            <div className="flex justify-center">
              <Button
                onClick={handlePass}
                variant="secondary"
                size="md"
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem] px-8"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Pas</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal
          onResume={handleResume}
          onGoHome={() => setShowExitModal(true)}
        />
      )}

      {/* Exit Game Modal */}
      <ExitGameModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={onGoHome}
      />
    </div>
  );
};