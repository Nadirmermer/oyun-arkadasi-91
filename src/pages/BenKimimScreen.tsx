import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Pause, Play, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGameState } from '@/types/benkimim';

import { useSystemTheme } from '@/hooks/use-system-theme';
import { saveGameRecord } from '@/lib/storage';

export const BenKimimScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new BenKimimEngine());
  const [gameState, setGameState] = useState<BenKimimGameState>(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Tema uyumluluğunu sağla
  useSystemTheme();

  useEffect(() => {
    const initGame = async () => {
      // Ayarları yükle
      const savedSettings = localStorage.getItem('benKimimGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        gameEngine.updateSettings({
          gameDuration: settings.gameDuration,
          targetScore: settings.targetScore,
          difficulty: settings.difficulty || 'orta'
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
        wrongGuesses={metrics.wrongGuesses} // Yanlış tahmin edilen kişileri geçir
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

  // Dikey mod - yatay ekrana uygun boyutlarda
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
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Kalan Süre</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{formatTime(gameState.timeLeft)}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground">
              <div className="font-medium text-xs sm:text-sm">Skor</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}/{gameState.settings.targetScore}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-accent text-accent-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Zorluk</div>
              <div className="text-base sm:text-lg font-bold mt-1 capitalize">
                {gameState.settings.difficulty === 'kolay' && '😊 Kolay'}
                {gameState.settings.difficulty === 'orta' && '🤔 Orta'}
                {gameState.settings.difficulty === 'zor' && '🧠 Zor'}
                {gameState.settings.difficulty === 'karisik' && '🎲 Karışık'}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Ana İçerik Alanı - Yatay ekrana uygun boyutlarda */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-[27px] py-0 mx-0 my-[13px]">
        {/* Kelime Kartı */}
        <div className="text-center mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border shadow-md">
              {/* Ana Kelime - Yatay ekrana uygun boyut */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {gameState.currentWord.kisi}
              </h1>
              
              {/* Kategori */}
              <p className="text-base md:text-lg text-primary font-medium">
                {gameState.currentWord.kategori}
              </p>
            </div>
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="space-y-3">
          {gameState.settings.controlType === 'buttons' ? (
            <div className="flex gap-3">
              <Button
                onClick={handleCorrect}
                variant="success"
                size="lg"
                fullWidth
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center justify-center gap-2 text-base py-3"
              >
                <Check className="w-5 h-5" />
                Doğru
              </Button>

              <Button
                onClick={handlePass}
                variant="danger"
                size="lg"
                fullWidth
                disabled={!gameState.isPlaying || gameState.isPaused}
                className="flex items-center justify-center gap-2 text-base py-3"
              >
                <X className="w-5 h-5" />
                Pas
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
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