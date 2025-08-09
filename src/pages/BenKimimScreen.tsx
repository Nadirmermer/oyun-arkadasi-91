import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Pause, Play, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGameState } from '@/types/benkimim';
import { useMotionSensor } from '@/hooks/use-motion-sensor';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { saveGameRecord } from '@/lib/storage';

export const BenKimimScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new BenKimimEngine());
  const [gameState, setGameState] = useState<BenKimimGameState>(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const motionSensor = useMotionSensor();

  // Tema uyumluluğunu sağla
  useSystemTheme();

  useEffect(() => {
    const initGame = async () => {
      // Ayarları yükle
      const savedSettings = localStorage.getItem('benKimimGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsLandscapeMode(settings.isLandscapeMode || false);
        
        gameEngine.updateSettings({
          gameDuration: settings.gameDuration,
          targetScore: settings.targetScore,
          controlType: settings.controlType
        });
      }

      // Kelimeleri yükle ve oyunu başlat
      await gameEngine.loadWords();
      gameEngine.startGame();
      setGameState(gameEngine.getGameState());
    };

    initGame();
  }, [gameEngine]);

  // Oyun durumu değişikliklerini dinle
  useEffect(() => {
    const handleGameStateChange = () => {
      const newState = gameEngine.getGameState();
      setGameState(newState);
    };

    gameEngine.addListener(handleGameStateChange);

    return () => {
      gameEngine.removeListener(handleGameStateChange);
    };
  }, [gameEngine]);

  // Hareket sensörü ayarları - sadece permission durumu değiştiğinde çalışır
  useEffect(() => {
    if (gameState.settings.controlType === 'motion' && motionSensor.hasPermission) {
      // İzin zaten var, sadece callback'leri ayarla
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
    }

    return () => {
      // Cleanup sadece component unmount'ta
      if (gameState.settings.controlType === 'motion') {
        motionSensor.cleanup();
      }
    };
  }, [gameState.settings.controlType, motionSensor.hasPermission, motionSensor, gameEngine, gameState.isPlaying, gameState.isPaused]);

  const handleCorrect = () => {
    gameEngine.handleAction('correct');
  };

  const handlePass = () => {
    gameEngine.handleAction('pass');
  };

  const handlePauseToggle = () => {
    if (gameState.isPaused) {
      gameEngine.togglePause();
      setShowPauseModal(false);
    } else {
      gameEngine.togglePause();
      setShowPauseModal(true);
    }
  };

  const handleGoHomeInternal = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    gameEngine.destroy();
    navigate('/');
  };

  const handleGameEnd = useCallback(() => {
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'BenKimim' as const,
      gameDate: new Date().toISOString(),
      results: [{
        name: 'Oyuncu',
        score: gameState.score
      }],
      winner: 'Oyuncu'
    };
    saveGameRecord(gameResult);
    setShowResults(true);
  }, [gameState.score]);

  const handleRestart = () => {
    setShowResults(false);
    gameEngine.resetGame();
    gameEngine.startGame();
  };

  const handleGoHome = () => {
    gameEngine.destroy();
    navigate('/');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Oyun bitti mi kontrol et
  useEffect(() => {
    // Oyun daha önce başlatılmış ve şimdi playing false ise oyun bitmiştir
    // İlk mount sırasında oyun hiç başlatılmamışsa (currentWord null) oyun bitişi sayılmaz
    if (!gameState.isPlaying && gameState.currentWord !== null && (gameState.score > 0 || gameState.totalWords > 0)) {
      handleGameEnd();
    }
  }, [gameState.isPlaying, gameState.score, gameState.totalWords, gameState.currentWord, handleGameEnd]);

  // Sonuç ekranını göster
  if (showResults) {
    const metrics = gameEngine.getGameMetrics();
    const performanceMessage = 
      metrics.accuracy >= 80 ? "Mükemmel performans! 🌟" :
      metrics.accuracy >= 60 ? "İyi performans! 👍" :
      "Daha fazla pratik yapabilirsin! 💪";

    return (
      <GameResultScreen
        title="Ben Kimim Tamamlandı! 🎭"
        icon={<User className="w-10 h-10 text-primary" />}
        iconBgColor="bg-primary/10"
        metrics={{
          primary: { label: "Final Skor", value: `${metrics.finalScore}/${metrics.targetScore}`, color: "text-primary" },
          secondary: { label: "Doğruluk Oranı", value: `%${metrics.accuracy}`, color: "text-success" },
          tertiary: { label: "Toplam Kelime", value: metrics.totalWords }
        }}
        performanceMessage={performanceMessage}
        onRestart={handleRestart}
        onGoHome={handleGoHome}
        restartButtonText="Tekrar Oyna"
        homeButtonText="Ana Menü"
      />
    );
  }

  // Yükleniyor durumu
  if (!gameState.currentWord) {
    return (
      <div className="min-h-screen bg-background page-fade-in">
        {/* Header - Tabu tarzı minimal header */}
        <div className="flex-none bg-card shadow-sm relative z-10">
          <div className="flex justify-between items-center p-4">
            <div className="w-8" />
            <h1 className="text-xl font-bold text-primary">Ben Kimim?</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Kelimeler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Yatay mod
  if (isLandscapeMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Header - Tabu tarzı minimal header */}
        <div className="flex-none bg-card shadow-sm relative z-10">
          <div className="flex justify-between items-center p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(gameState.timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground">Kalan Süre</div>
            </div>
            
            <h1 className="text-xl font-bold text-primary">Ben Kimim?</h1>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {gameState.score}/{gameState.settings.targetScore}
                </div>
                <div className="text-xs text-muted-foreground">Skor</div>
              </div>
              <button onClick={handlePauseToggle} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ana Kelime Alanı - Maksimum büyüklük */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-4xl w-full">
            {/* Ana Kelime - Çok büyük */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6 leading-none">
              {gameState.currentWord.kisi}
            </h1>
            
            {/* Kategori */}
            <p className="text-xl md:text-2xl lg:text-3xl text-primary font-medium">
              {gameState.currentWord.kategori}
            </p>
          </div>
        </div>

        {/* Alt Kontrol Paneli - Kompakt */}
        <div className="flex-none bg-card border-t border-border">
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

        {/* Pause Modal */}
        {showPauseModal && (
          <PauseModal 
            onResume={handlePauseToggle} 
            onGoHome={handleGoHomeInternal} 
          />
        )}

        {/* Exit Game Modal */}
        <ExitGameModal 
          isOpen={showExitModal} 
          onClose={() => setShowExitModal(false)} 
          onConfirm={handleConfirmExit} 
        />
      </div>
    );
  }

  // Dikey mod
  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Ben Kimim?</h1>
          <button onClick={handlePauseToggle} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        {/* Skor Bilgisi */}
        <div className="pb-4 px-[18px] py-0 my-0 mx-0">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Kalan Süre</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{formatTime(gameState.timeLeft)}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground">
              <div className="font-medium text-xs sm:text-sm">Skor</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}/{gameState.settings.targetScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-[27px] py-0 mx-0 my-[13px]">
        {/* Kelime Kartı */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-xl bg-card border border-border shadow-md">
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
        </div>

        {/* Kontrol Butonları */}
        <div className="space-y-4">
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

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal 
          onResume={handlePauseToggle} 
          onGoHome={handleGoHomeInternal} 
        />
      )}

      {/* Exit Game Modal */}
      <ExitGameModal 
        isOpen={showExitModal} 
        onClose={() => setShowExitModal(false)} 
        onConfirm={handleConfirmExit} 
      />
    </div>
  );
};