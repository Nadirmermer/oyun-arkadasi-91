import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '@/components/shared/GameHeader';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { GameFooterControls } from '@/components/shared/GameFooterControls';
import { ZihinDetektifiEngine } from '@/games/zihindetektifi/ZihinDetektifiEngine';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const ZihinDetektifiScreen = () => {
  const navigate = useNavigate();
  const engineRef = useRef<ZihinDetektifiEngine | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);



  useEffect(() => {
    const initGame = async () => {
      try {
        const settingsJson = localStorage.getItem('zihinDetektifiGameSettings');
        const settings = settingsJson ? JSON.parse(settingsJson) : {
          selectedTypes: ['savunma_mekanizmasi'],
          questionCount: 10,
          timeLimit: 60
        };

        const engine = new ZihinDetektifiEngine();
        engineRef.current = engine;

        await engine.loadGameData();
        engine.updateSettings(settings);

        const updateGameState = () => {
          const state = engine.getGameState();
          setGameState(state);
          
          if (state.status === 'finished') {
            setShowResultScreen(true);
          }

          // Yeni engine'de otomatik feedback yok
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
    // Yeni engine'de pause/resume yok, sadece modal'ı kontrol et
    setShowPauseModal(!showPauseModal);
  };

  const handleAnswerSelect = (answer: string) => {
    if (engineRef.current) {
      engineRef.current.selectAnswer(answer);
    }
  };

  const handleNewGame = () => {
    setShowResultScreen(false);
    navigate('/game/zihindetektifi/setup');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoHomeInternal = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  const handleNextQuestion = () => {
    if (engineRef.current) {
      engineRef.current.nextQuestion();
    }
  };


  if (showResultScreen && engineRef.current) {
    const metrics = engineRef.current.getGameMetrics();
    return (
      <GameResultScreen
        title="Zihin Dedektifi Tamamlandı! 🎉"
        metrics={{
          primary: { label: "Final Skor", value: `${metrics.score} puan`, color: "text-primary" },
          secondary: { label: "Doğru Cevap", value: `${metrics.score / 10}/${metrics.answeredQuestions}`, color: "text-success" },
          tertiary: { label: "İlerleme", value: `%${Math.round(metrics.progress)}` }
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
        isPaused={gameState.status === 'paused'}
        onPauseToggle={handlePauseToggle}
      />

      {/* Skor ve Süre Bilgisi */}
      <div className="px-6 md:px-8 pb-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
            <div className="font-medium text-xs sm:text-sm">İlerleme</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.answeredQuestions}/{gameState.totalQuestions}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl text-center bg-success text-success-foreground shadow-md">
            <div className="font-medium text-xs sm:text-sm">Puan</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-8 space-y-6 pb-32">
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

      {/* Feedback Area */}
      {gameState.showFeedback && (
        <GameFooterControls>
          <div className="space-y-4">
            {/* Sonuç Mesajı */}
            <div className={`p-3 rounded-lg text-center ${
              gameState.isCorrect 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {gameState.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Doğru!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Yanlış!</span>
                  </>
                )}
              </div>
              <p className="text-sm">
                <span className="font-medium">Doğru Cevap:</span> {gameState.currentCase?.correct_answer}
              </p>
            </div>
            
            {/* Açıklama */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {gameState.currentCase?.explanation}
              </p>
            </div>
            
            {/* Sonraki Soru Butonu */}
            <Button 
              onClick={handleNextQuestion} 
              className="w-full" 
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Sonraki Soru
            </Button>
          </div>
        </GameFooterControls>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal
          onResume={handlePauseToggle}
          onGoHome={handleGoHomeInternal}
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