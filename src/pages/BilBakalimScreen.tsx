import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Brain, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CircularTimer } from '@/components/shared/CircularTimer';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { BilBakalimEngine, BilBakalimGameState } from '@/games/bilbakalim/BilBakalimEngine';
import { saveGameRecord } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
export const BilBakalimScreen = () => {
  const [gameEngine] = useState(() => new BilBakalimEngine());
  const [gameState, setGameState] = useState<BilBakalimGameState>(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const navigate = useNavigate();
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
            pointPerCorrect: settings.pointPerCorrect,
            timeBonus: settings.timeBonus
          });
        } else {
          gameEngine.startGame();
        }
        setGameState(gameEngine.getGameState());
      }
    };
    initGame();
  }, [gameEngine]);

  // Oyun durumu güncellemelerini dinle
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = gameEngine.getGameState();
      setGameState(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newState)) {
          return newState;
        }
        return prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameEngine]);

  /**
   * Oyunu duraklatır/devam ettirir
   */
  const handlePauseToggle = () => {
    if (gameState.isPaused) {
      gameEngine.togglePause();
      setShowPauseModal(false);
    } else {
      gameEngine.togglePause();
      setShowPauseModal(true);
    }
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
    return <div className="min-h-screen bg-background page-fade-in">
        {/* Header - Tabu tarzı minimal header */}
        <div className="flex-none bg-card shadow-sm relative z-10">
          <div className="flex justify-between items-center p-4">
            <div className="w-8" />
            <h1 className="text-xl font-bold text-primary">Bil Bakalım</h1>
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
                <span className="font-bold">{gameState.correctAnswers}/{gameState.totalQuestions}</span> doğru
              </p>
              <p className="text-lg text-primary font-bold">
                Toplam Puan: {gameState.score}
              </p>
              <p className="text-muted-foreground">
                Başarı oranı: %{Math.round(gameState.correctAnswers / gameState.totalQuestions * 100)}
              </p>
            </div>
          </Card>

          {/* Başarı Mesajı */}
          <Card className="text-center mb-8">
            <div className="space-y-2">
              {gameState.correctAnswers >= 8 && <p className="text-lg text-success font-bold">🎉 Harika performans!</p>}
              {gameState.correctAnswers >= 6 && gameState.correctAnswers < 8 && <p className="text-lg text-primary font-bold">👏 İyi iş çıkardın!</p>}
              {gameState.correctAnswers >= 4 && gameState.correctAnswers < 6 && <p className="text-lg text-warning font-bold">👍 Fena değil!</p>}
              {gameState.correctAnswers < 4 && <p className="text-lg text-muted-foreground">💪 Daha fazla çalışman gerekiyor!</p>}
            </div>
          </Card>

          {/* Aksiyon Butonları */}
          <div className="space-y-4">
            <Button onClick={handleNewGame} variant="primary" size="lg" fullWidth>
              Yeniden Oyna
            </Button>

            <Button onClick={handleGameEnd} variant="secondary" size="lg" fullWidth>
              Ana Menüye Dön
            </Button>
          </div>
        </div>
      </div>;
  }

  // Oyun ekranı
  return <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Bil Bakalım</h1>
          <button onClick={handlePauseToggle} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        {/* Circular Timer ve Puan */}
        <div className="pb-4 my-0 py-0 px-[27px]">
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
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-[27px] py-0 mx-0 my-[13px]">
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
      {showPauseModal && <PauseModal onResume={handlePauseToggle} onGoHome={handleGoHomeInternal} />}

      {/* Exit Game Modal */}
      <ExitGameModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} onConfirm={handleConfirmExit} />
    </div>;
};