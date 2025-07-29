import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Pause, Play, SkipForward, Check, X, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { CircularTimer } from './CircularTimer';
import { TurnTransition } from './TurnTransition';
import { PauseModal } from './PauseModal';
import { ExitGameModal } from './ExitGameModal';
import { TabuEngine } from '@/games/tabu/TabuEngine';
import { GameState, Team, GameAction } from '@/types/game';
import { cn } from '@/lib/utils';
import { useMotionSensor } from '@/hooks/use-motion-sensor';

interface OptimizedGameScreenProps {
  gameEngine: TabuEngine;
  onGameEnd: () => void;
  onGoHome: () => void;
}

// Memoized Timer Component
const MemoizedTimer = memo(({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) => (
  <CircularTimer 
    timeLeft={timeLeft}
    totalTime={totalTime}
    className="scale-75 sm:scale-100"
  />
));

// Memoized Word Card Component  
const MemoizedWordCard = memo(({ word }: { word: any }) => (
  <Card className="text-center py-4 sm:py-8 max-h-full overflow-auto">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-8 px-4">
      {word.kelime}
    </h2>
    
    <div className="space-y-2 sm:space-y-4 px-4">
      {word.yasaklar.map((yasak: string, index: number) => (
        <div 
          key={index}
          className="text-danger font-semibold text-sm sm:text-lg md:text-xl p-2 sm:p-3 bg-danger/10 rounded-xl"
        >
          {yasak}
        </div>
      ))}
    </div>
  </Card>
));

// Memoized Team Info Component
const MemoizedTeamInfo = memo(({ currentTeam, otherTeams }: { currentTeam: Team | null; otherTeams: Team[] }) => (
  <div className="grid grid-cols-2 gap-2 mb-4">
    <div className={cn(
      'p-3 sm:p-4 rounded-xl text-center transition-all',
      'bg-primary text-primary-foreground shadow-md'
    )}>
      <div className="flex items-center justify-center gap-2">
        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-medium text-xs sm:text-sm">{currentTeam?.name}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold mt-1">{currentTeam?.score || 0}</div>
    </div>

    {otherTeams[0] && (
      <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground">
        <div className="font-medium text-xs sm:text-sm">{otherTeams[0].name}</div>
        <div className="text-xl sm:text-2xl font-bold mt-1">{otherTeams[0].score}</div>
      </div>
    )}
  </div>
));

/**
 * Performans optimize edilmiş oyun ekranı
 * React.memo ve useCallback kullanarak gereksiz render'ları önler
 */
export const OptimizedGameScreen = memo(({ gameEngine, onGameEnd, onGoHome }: OptimizedGameScreenProps) => {
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [flashColor, setFlashColor] = useState<'success' | 'danger' | null>(null);
  const [motionPermissionRequested, setMotionPermissionRequested] = useState(false);

  const motionSensor = useMotionSensor();

  // Optimized game state update with reduced frequency
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 500; // 500ms yerine 100ms

    const updateGameState = (timestamp: number) => {
      if (timestamp - lastUpdate >= UPDATE_INTERVAL) {
        const newState = gameEngine.getState();
        setGameState(prevState => {
          // Sadece değişiklik varsa state'i güncelle
          if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
            return newState;
          }
          return prevState;
        });
        
        // Tur geçişi gerekli mi kontrol et
        if (gameEngine.needsTurnTransition()) {
          setShowTurnTransition(true);
        }
        
        // Oyun bittiyse (kazanan var)
        if (gameEngine.getWinner()) {
          onGameEnd();
          return;
        }
        
        lastUpdate = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(updateGameState);
    };

    animationFrameId = requestAnimationFrame(updateGameState);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameEngine, onGameEnd]);

  // Memoized callbacks
  const handlePauseToggle = useCallback(() => {
    if (gameState.isPaused) {
      gameEngine.togglePause();
      setShowPauseModal(false);
    } else {
      gameEngine.togglePause();
      setShowPauseModal(true);
    }
  }, [gameEngine, gameState.isPaused]);

  const handleAction = useCallback((action: GameAction) => {
    gameEngine.processAction(action);
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const handleActionWithFlash = useCallback((action: GameAction) => {
    const color = action === 'correct' ? 'success' : 'danger';
    setFlashColor(color);
    
    setTimeout(() => {
      setFlashColor(null);
    }, 150);
    
    handleAction(action);
  }, [handleAction]);

  const handleContinueTurn = useCallback(() => {
    gameEngine.startNextTurn();
    setShowTurnTransition(false);
    setGameState(gameEngine.getState());
  }, [gameEngine]);

  const handleGoHomeInternal = useCallback(() => {
    setShowExitModal(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    gameEngine.endGame();
    onGoHome();
  }, [gameEngine, onGoHome]);

  // Memoized computed values
  const currentTeam = useMemo(() => gameEngine.getCurrentTeam(), [gameEngine, gameState.currentTeamIndex]);
  const otherTeams = useMemo(() => 
    gameState.teams.filter((_, index) => index !== gameState.currentTeamIndex), 
    [gameState.teams, gameState.currentTeamIndex]
  );

  // Motion sensor setup
  useEffect(() => {
    if (gameState.settings.controlType === 'motion' && !motionPermissionRequested) {
      setMotionPermissionRequested(true);
      
      const setupMotionSensor = async () => {
        if (motionSensor.isSupported) {
          const hasPermission = await motionSensor.requestPermission();
          
          if (hasPermission) {
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
          } else {
            gameEngine.updateSettings({ controlType: 'buttons' });
          }
        } else {
          gameEngine.updateSettings({ controlType: 'buttons' });
        }
      };

      setupMotionSensor();
    }

    return () => {
      motionSensor.cleanup();
    };
  }, [gameState.settings.controlType, motionPermissionRequested, motionSensor, gameEngine, gameState.isPlaying, gameState.isPaused, handleAction]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background relative">
      {/* Flash Overlay */}
      {flashColor && (
        <div className={cn(
          "fixed inset-0 z-40 pointer-events-none transition-opacity duration-150",
          flashColor === 'success' ? 'bg-success/40' : 'bg-danger/40'
        )} />
      )}

      {/* Header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">PsikoOyun</h1>
          <button
            onClick={handlePauseToggle}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        <div className="px-4 pb-4">
          <MemoizedTeamInfo currentTeam={currentTeam} otherTeams={otherTeams} />
          
          <div className="flex justify-center">
            <MemoizedTimer 
              timeLeft={gameState.timeLeft}
              totalTime={gameState.settings.gameDuration}
            />
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10">
        {gameState.currentWord && (
          <MemoizedWordCard word={gameState.currentWord} />
        )}

        {/* Kontrol Talimatları */}
        {gameState.settings.controlType === 'motion' && (
          <Card className="w-full max-w-md mt-4 mb-4">
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
          </Card>
        )}
      </div>

      {/* Alt Kontrol Paneli */}
      <div className="flex-none bg-card shadow-lg border-t border-border fixed bottom-0 left-0 right-0 z-20">
        <div className="p-3 sm:p-4 pb-4 sm:pb-6">
          {gameState.settings.controlType === 'motion' ? (
            <div className="flex justify-center">
              <Button
                onClick={() => handleAction('pass')}
                variant="secondary"
                size="md"
                disabled={gameState.passesUsed >= gameState.settings.passCount}
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem] px-8"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Pas ({gameState.settings.passCount - gameState.passesUsed})</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
              <Button
                onClick={() => handleAction('pass')}
                variant="secondary"
                size="md"
                disabled={gameState.passesUsed >= gameState.settings.passCount}
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Pas ({gameState.settings.passCount - gameState.passesUsed})</span>
              </Button>

              <Button
                onClick={() => handleActionWithFlash('correct')}
                variant="success"
                size="md"
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Doğru</span>
              </Button>

              <Button
                onClick={() => handleActionWithFlash('tabu')}
                variant="danger"
                size="md"
                className="flex flex-col items-center justify-center gap-1 py-3 sm:py-4 min-h-[3.5rem] sm:min-h-[4rem]"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs">Tabu</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPauseModal && (
        <PauseModal 
          onResume={handlePauseToggle}
          onGoHome={handleGoHomeInternal}
        />
      )}

      {showTurnTransition && (
        <TurnTransition
          currentTeam={gameEngine.getState().teams[(gameEngine.getState().currentTeamIndex + 1) % gameEngine.getState().teams.length]}
          onContinue={handleContinueTurn}
          scoreboard={gameEngine.getScoreboard()}
        />
      )}

      <ExitGameModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
});

OptimizedGameScreen.displayName = 'OptimizedGameScreen';