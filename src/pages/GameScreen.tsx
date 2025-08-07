import { useState, useEffect, useCallback } from 'react';
import { Pause, Play, SkipForward, Check, X, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CircularTimer } from '@/components/shared/CircularTimer';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameHeader } from '@/components/shared/GameHeader';
import { GameFooterControls } from '@/components/shared/GameFooterControls';
import { TabuEngine } from '@/games/tabu/TabuEngine';
import { GameState, Team, GameAction } from '@/types/game';
import { cn } from '@/lib/utils';
import { useMotionSensor } from '@/hooks/use-motion-sensor';
interface GameScreenProps {
  gameEngine: TabuEngine;
  onGameEnd: () => void;
  onGoHome: () => void;
}

/**
 * Ana oyun ekranı
 * Tabu oyununun oynanış kısmını yönetir
 */
export const GameScreen = ({
  gameEngine,
  onGameEnd,
  onGoHome
}: GameScreenProps) => {
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [flashColor, setFlashColor] = useState<'success' | 'danger' | null>(null);
  const motionSensor = useMotionSensor();

  // Event-driven güncelleme
  useEffect(() => {
    const handleUpdate = () => {
      const newState = gameEngine.getState();
      setGameState(newState);
      if (gameEngine.needsTurnTransition()) {
        setShowTurnTransition(true);
      }
      if (gameEngine.getWinner()) {
        onGameEnd();
      }
    };
    gameEngine.addListener(handleUpdate);
    return () => gameEngine.removeListener(handleUpdate);
  }, [gameEngine, onGameEnd]);

  /**
   * Oyun aksiyonunu işler
   */
  const handleAction = useCallback((action: GameAction) => {
    gameEngine.processAction(action);
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  // Hareket sensörü ayarları - sadece permission durumu değiştiğinde çalışır
  useEffect(() => {
    if (gameState.settings.controlType === 'motion' && motionSensor.hasPermission) {
      // İzin zaten var, sadece callback'leri ayarla
      motionSensor.onTiltRight(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
          handleAction('correct');
        }
      });
      
      motionSensor.onTiltLeft(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
          handleAction('tabu');
        }
      });
    }

    return () => {
      // Cleanup sadece component unmount'ta
      if (gameState.settings.controlType === 'motion') {
        motionSensor.cleanup();
      }
    };
  }, [gameState.settings.controlType, motionSensor.hasPermission, motionSensor, gameEngine, gameState.isPlaying, gameState.isPaused, handleAction]);

  /**
   * Oyunu duraklatır/devam ettirir
   */
  const handlePauseToggle = () => {
    if (!gameState.isPaused) {
      gameEngine.togglePause();
    }
    setShowPauseModal(true);
  };
  /**
   * Flash efekti ile aksiyon işler
   */
  const handleActionWithFlash = (action: GameAction) => {
    const color = action === 'correct' ? 'success' : 'danger';
    setFlashColor(color);
    setTimeout(() => {
      setFlashColor(null);
    }, 150);
    handleAction(action);
  };

  /**
   * Tur geçişini başlat
   */
  const handleContinueTurn = () => {
    gameEngine.startNextTurn();
    setShowTurnTransition(false);
    setGameState(gameEngine.getState());
  };

  /**
   * Ana sayfaya dön - Exit modalı göster
   */
  const handleGoHome = () => {
    setShowExitModal(true);
  };

  // Arkaplana gidince otomatik duraklat
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (gameState.isPlaying && !gameState.isPaused) {
          gameEngine.togglePause();
          setShowPauseModal(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [gameEngine, gameState.isPlaying, gameState.isPaused]);

  /**
   * Oyundan çıkışı onayla
   */
  const handleConfirmExit = () => {
    gameEngine.endGame();
    onGoHome();
  };
  const currentTeam = gameEngine.getCurrentTeam();
  const otherTeams = gameState.teams.filter((_, index) => index !== gameState.currentTeamIndex);
  return <div className="min-h-screen flex flex-col overflow-hidden bg-background relative">
      {/* Flash Overlay - Tam ekran */}
      {flashColor && <div className={cn("fixed inset-0 z-40 pointer-events-none transition-opacity duration-150", flashColor === 'success' ? 'bg-success/40' : 'bg-danger/40')} />}
      {/* Header */}
      <GameHeader
        title="Psikoloji Tabu"
        isPaused={gameState.isPaused}
        onPauseToggle={handlePauseToggle}
      />

      {/* Takım Bilgileri ve Timer */}
        <div className="pb-4 px-[18px] py-0 my-0 mx-0">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className={cn('p-3 sm:p-4 rounded-xl text-center transition-all', 'bg-primary text-primary-foreground shadow-md')}>
              <div className="flex items-center justify-center gap-2">
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium text-xs sm:text-sm">{currentTeam?.name}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{currentTeam?.score || 0}</div>
            </div>

            {otherTeams[0] && <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground">
                <div className="font-medium text-xs sm:text-sm">{otherTeams[0].name}</div>
                <div className="text-xl sm:text-2xl font-bold mt-1">{otherTeams[0].score}</div>
              </div>}
          </div>
          
          {/* Timer - Takımların altında */}
          <div className="flex justify-center my-0 py-0 px-0 mx-6 md:mx-10">
            <CircularTimer timeLeft={gameState.timeLeft} totalTime={gameState.settings.gameDuration} className="scale-75 sm:scale-100" />
          </div>
        </div>

      {/* Ana İçerik Alanı - Orta kısım, responsive */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10">
        {/* Kelime Kartı */}
        {gameState.currentWord && <Card className="text-center py-4 sm:py-8 max-h-full overflow-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-8 px-4">
              {gameState.currentWord.kelime}
            </h2>
            
            <div className="space-y-2 sm:space-y-4 px-4">
              {gameState.currentWord.yasaklar.map((yasak, index) => <div key={index} className="text-danger font-semibold text-sm sm:text-lg md:text-xl p-2 sm:p-3 bg-danger/10 rounded-xl">
                  {yasak}
                </div>)}
            </div>
          </Card>}

        {/* Kontrol Talimatları (Hareket Modu) */}
        {gameState.settings.controlType === 'motion' && <Card className="w-full max-w-md mt-4 mb-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Telefonu hareket ettir:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <ChevronRight className="w-4 h-4 text-success" />
                  <span>Sağa → Doğru</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <ChevronLeft className="w-4 h-4 text-danger" />
                  <span>Sola → Tabu</span>
                </div>
              </div>
            </div>
          </Card>}
      </div>

      {/* Alt Kontrol Paneli */}
      <GameFooterControls>
        {gameState.settings.controlType === 'motion' ? (
          <div className="flex justify-center">
            <Button onClick={() => handleAction('pass')} variant="secondary" size="md" disabled={gameState.passesUsed >= gameState.settings.passCount} className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem] px-8">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Pas ({gameState.settings.passCount - gameState.passesUsed})</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
            <Button onClick={() => handleAction('pass')} variant="secondary" size="md" disabled={gameState.passesUsed >= gameState.settings.passCount} className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Pas ({gameState.settings.passCount - gameState.passesUsed})</span>
            </Button>
            <Button onClick={() => handleActionWithFlash('correct')} variant="success" size="md" className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]">
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Doğru</span>
            </Button>
            <Button onClick={() => handleActionWithFlash('tabu')} variant="danger" size="md" className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Tabu</span>
            </Button>
          </div>
        )}
      </GameFooterControls>

      {/* Duraklatma Modalı */}
      {showPauseModal && <PauseModal onResume={handlePauseToggle} onGoHome={handleGoHome} />}

      {/* Tur Geçişi Modalı - Inline entegre edildi */}
      {showTurnTransition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm m-4">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold text-primary mb-2">Tur Bitti!</h2>
              
              <p className="text-muted-foreground mb-4">
                Sıra şimdi <span className="font-semibold text-foreground">
                  {gameEngine.getState().teams[(gameEngine.getState().currentTeamIndex + 1) % gameEngine.getState().teams.length]?.name}
                </span> takımında
              </p>

              {/* Puan Durumu */}
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground">Puan Durumu</h3>
                {gameEngine.getScoreboard().map((team) => (
                  <div key={`${team.id}-${team.score}`} className="flex justify-between items-center">
                    <span className={`text-sm ${
                      team.id === gameEngine.getState().teams[(gameEngine.getState().currentTeamIndex + 1) % gameEngine.getState().teams.length]?.id 
                        ? 'font-bold text-primary' 
                        : 'text-muted-foreground'
                    }`}>
                      {team.name}
                    </span>
                    <span className={`text-sm font-semibold ${
                      team.id === gameEngine.getState().teams[(gameEngine.getState().currentTeamIndex + 1) % gameEngine.getState().teams.length]?.id 
                        ? 'text-primary' 
                        : 'text-foreground'
                    }`}>
                      {team.score}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleContinueTurn}
                variant="primary"
                size="lg"
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Başla</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Çıkış Onayı Modalı */}
      <ExitGameModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} onConfirm={handleConfirmExit} />
    </div>;
};