import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '@/components/shared/GameHeader';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { ZihinDetektifiEngine } from '@/games/zihindetektifi/ZihinDetektifiEngine';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ZihinDetektifiScreen = () => {
  const navigate = useNavigate();
  const engineRef = useRef<ZihinDetektifiEngine | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      try {
        const settingsJson = localStorage.getItem('zihinDetektifiGameSettings');
        const settings = settingsJson ? JSON.parse(settingsJson) : {
          selectedType: 'savunma_mekanizmasi',
          gameDuration: 300,
          targetScore: 10
        };

        const engine = new ZihinDetektifiEngine();
        engineRef.current = engine;

        await engine.loadCases();
        engine.updateSettings(settings);

        const updateGameState = () => {
          const state = engine.getGameState();
          setGameState(state);
          
          if (!state.isPlaying && state.totalQuestions > 0) {
            setShowResultScreen(true);
          }

          if (state.showFeedback && !showFeedbackModal) {
            setShowFeedbackModal(true);
          }
        };

        engine.addListener(updateGameState);
        updateGameState();
        engine.startGame();
        
      } catch (error) {
        console.error('Oyun başlatılırken hata:', error);
        navigate('/');
      }
    };

    initGame();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [navigate]);

  const handlePauseToggle = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      if (gameState?.isPaused) {
        setShowPauseModal(false);
      } else {
        setShowPauseModal(true);
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (engineRef.current) {
      engineRef.current.selectAnswer(answer);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedbackModal(false);
    if (engineRef.current) {
      engineRef.current.nextQuestion();
    }
  };

  const handleNewGame = () => {
    setShowResultScreen(false);
    navigate('/game/zihindetektifi/setup');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResultScreen && engineRef.current) {
    const metrics = engineRef.current.getGameMetrics();
    return (
      <GameResultScreen
        title="Zihin Dedektifi Tamamlandı! 🎉"
        metrics={{
          primary: { label: "Final Skor", value: metrics.finalScore, color: "text-primary" },
          secondary: { label: "Doğruluk Oranı", value: `%${metrics.accuracy}`, color: "text-success" },
          tertiary: { label: "Toplam Soru", value: `${metrics.totalQuestions} soru` }
        }}
        onRestart={handleNewGame}
        onGoHome={handleGoHome}
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Oyun yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader
        title="Zihin Dedektifi"
        isPaused={gameState.isPaused}
        onPauseToggle={handlePauseToggle}
        leftSlot={
          <button
            onClick={handleExit}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        }
        rightSlot={
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-success">{gameState.score} Puan</span>
            <span className="text-primary">{formatTime(gameState.timeLeft)}</span>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Vaka Metni */}
        <Card className="bg-card/50">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Vaka</h3>
            <p className="text-foreground leading-relaxed">
              {gameState.currentCase?.case_text}
            </p>
          </div>
        </Card>

        {/* Soru */}
        <Card>
          <h3 className="font-semibold text-foreground mb-4">
            {gameState.currentCase?.question}
          </h3>
          
          <div className="grid gap-3">
            {gameState.currentCase?.options.map((option: string, index: number) => {
              const isSelected = gameState.selectedAnswer === option;
              const isCorrect = option === gameState.currentCase?.correct_answer;
              const showResult = gameState.showFeedback;
              
              let buttonVariant: 'primary' | 'success' | 'danger' | 'secondary' = 'secondary';
              
              if (showResult) {
                if (isCorrect) {
                  buttonVariant = 'success';
                } else if (isSelected && !isCorrect) {
                  buttonVariant = 'danger';
                }
              }
              
              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={gameState.showFeedback}
                  className="text-left justify-start p-4 h-auto"
                  fullWidth
                >
                  <span className="flex items-center gap-3">
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                    {option}
                  </span>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              gameState.isCorrect ? 'text-success' : 'text-danger'
            }`}>
              {gameState.isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Doğru!
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  Yanlış!
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground mb-2">
                Doğru Cevap: {gameState.currentCase?.correct_answer}
              </p>
              <p className="text-muted-foreground text-sm">
                {gameState.currentCase?.explanation}
              </p>
            </div>
            <Button onClick={handleNextQuestion} fullWidth>
              Devam Et
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal
          onResume={handlePauseToggle}
          onGoHome={confirmExit}
        />
      )}

      {/* Exit Modal */}
      <ExitGameModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
      />
    </div>
  );
};