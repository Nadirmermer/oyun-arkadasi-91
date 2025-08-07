import { useState, useEffect } from 'react';
import { Brain, Trophy, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CircularTimer } from '@/components/shared/CircularTimer';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { BilBakalimEngine, BilBakalimGameState } from '@/games/bilbakalim/BilBakalimEngine';
import { cn } from '@/lib/utils';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useNavigate } from 'react-router-dom';
import { saveGameRecord } from '@/lib/storage';
import { GameHeader } from '@/components/shared/GameHeader';
export const BilBakalimScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new BilBakalimEngine());
  const [gameState, setGameState] = useState<BilBakalimGameState>(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Tema uyumluluğunu sağla
  useSystemTheme();
  useEffect(() => {
    const initGame = async () => {
      await gameEngine.loadQuestions();
      if (gameEngine.isLoaded()) {
        // Kaydedilen ayarları kontrol et
        const savedSettings = localStorage.getItem('bilBakalimSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          gameEngine.startGame({
            totalQuestions: settings.totalQuestions,
            questionDuration: settings.gameDuration,
            pointPerCorrect: 10, // Sabit puan
            timeBonus: true // Her zaman aktif
          });
        } else {
          gameEngine.startGame();
        }
        setGameState(gameEngine.getGameState());
      }
    };
    initGame();
  }, [gameEngine]);

  // Oyun durumu güncellemelerini dinle - event-driven
  useEffect(() => {
    const handleUpdate = () => {
      setGameState(gameEngine.getGameState());
    };
    gameEngine.addListener(handleUpdate);
    return () => gameEngine.removeListener(handleUpdate);
  }, [gameEngine]);

  /**
   * Oyunu duraklatır/devam ettirir
   */
  const handlePauseToggle = () => {
    // Header'dan gelen pause: modalı aç ve oyunu duraklat
    if (!gameState.isPaused) {
      gameEngine.togglePause();
    }
    setShowPauseModal(true);
  };

  // Duraklatma modundan devam
  const handleResume = () => {
    if (gameEngine.getGameState().isPaused) {
      gameEngine.togglePause();
    }
    setShowPauseModal(false);
  };

  /**
   * Cevap seçildiğinde
   */
  const handleAnswerSelect = (optionIndex: number) => {
    gameEngine.selectAnswer(optionIndex);
  };

  /**
   * Oyun bittiğinde
   */
  const handleGameEnd = () => {
    // Oyun sonuçlarını kaydet
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'BilBakalim' as const,
      gameDate: new Date().toISOString(),
      results: [{
        name: 'Oyuncu',
        score: gameState.score
      }],
      winner: 'Oyuncu'
    };
    saveGameRecord(gameResult);
    navigate('/');
  };

  /**
   * Yeni oyun başlat
   */
  const handleNewGame = () => {
    gameEngine.resetGame();
    gameEngine.startGame();
    setGameState(gameEngine.getGameState());
  };

  /**
   * Ana sayfaya dön - Exit modalı göster
   */
  const handleGoHomeInternal = () => {
    setShowExitModal(true);
  };

  /**
   * Oyundan çıkışı onayla
   */
  const handleConfirmExit = () => {
    navigate('/');
  };

  // Uygulama arkaplana gidince otomatik duraklat
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

  // Yükleniyor durumu
  if (!gameEngine.isLoaded() || !gameState.currentQuestion) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Sorular yükleniyor...</p>
        </div>
      </div>;
  }

  // Oyun bitti ekranı
  if (gameState.isFinished) {
    const accuracy = Math.round(gameState.correctAnswers / gameState.totalQuestions * 100);
    
    const getPerformanceMessage = (acc: number) => {
      if (acc >= 80) return '🎉 Harika performans!';
      if (acc >= 60) return '👏 İyi iş çıkardın!';
      if (acc >= 40) return '👍 Fena değil!';
      return '💪 Daha fazla çalışman gerekiyor!';
    };
    
    return (
      <GameResultScreen
        icon={<Trophy className="w-10 h-10 text-success" />}
        metrics={{
          primary: { 
            label: "Doğru Cevaplar", 
            value: `${gameState.correctAnswers}/${gameState.totalQuestions}`,
            color: "text-primary"
          },
          secondary: { 
            label: "Toplam Puan", 
            value: gameState.score,
            color: "text-success"
          },
          tertiary: { 
            label: "Başarı Oranı", 
            value: `%${accuracy}`
          }
        }}
        performanceMessage={getPerformanceMessage(accuracy)}
        onRestart={handleNewGame}
        onGoHome={handleGameEnd}
      />
    );
  }

  // Oyun ekranı
  return <div className="min-h-screen bg-background page-fade-in">
      <GameHeader
        title="Bil Bakalım"
        isPaused={gameState.isPaused}
        onPauseToggle={handlePauseToggle}
      />

      {/* Circular Timer ve Puan */}
      <div className="pb-4 my-0 py-0 px-6 md:px-8">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md flex flex-col items-center justify-center py-0 px-0">
              <CircularTimer timeLeft={gameState.timeLeft} totalTime={gameState.questionDuration} className="scale-75" />
            </div>

            <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground">
              <div className="font-medium text-xs sm:text-sm">Puan</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}</div>
            </div>
          </div>
        </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-6 md:px-8 mx-0 my-3">
        {/* Kategori */}
        <div className="text-center mb-4">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            {gameState.currentQuestion.kategori}
          </span>
        </div>

        {/* Soru Kartı */}
        <Card className="text-center mb-6 py-6">
          <h2 className="text-xl font-bold text-foreground px-4 leading-relaxed">
            {gameState.currentQuestion.soru}
          </h2>
        </Card>

        {/* Cevap Seçenekleri */}
        <div className="space-y-3">
          {gameState.shuffledOptions.map((option, index) => {
          let buttonVariant: 'primary' | 'secondary' | 'success' | 'danger' = 'secondary';
          let disabled = gameState.isPaused || !gameState.isPlaying;
          if (gameState.showResult) {
            disabled = true;
            if (gameState.selectedAnswer === index) {
              // Seçilen cevap
              buttonVariant = option.dogruMu ? 'success' : 'danger';
            } else if (option.dogruMu) {
              // Doğru cevap (seçilmemişse)
              buttonVariant = 'success';
            }
          }
          return <Button key={index} onClick={() => handleAnswerSelect(index)} variant={buttonVariant} size="lg" fullWidth disabled={disabled} className={cn("text-left justify-start h-auto py-4 px-4", !gameState.showResult && !disabled && "hover:bg-primary/5")}>
                <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-wrap">{option.metin}</span>
              </Button>;
        })}
        </div>
      </div>

      {/* Pause Modal */}
      {showPauseModal && <PauseModal onResume={handleResume} onGoHome={handleGoHomeInternal} />}

      {/* Exit Game Modal */}
      <ExitGameModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} onConfirm={handleConfirmExit} />
    </div>;
};