/**
 * Renk Dizisi Takibi Oyun Ekranı
 * Görsel hafızaya dayalı tek kişilik oyun
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { RenkDizisiEngine } from '@/games/renkdizisi/RenkDizisiEngine';
import { Color } from '@/types/renkdizisi';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { saveGameRecord } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export const RenkDizisiScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new RenkDizisiEngine());
  const [gameState, setGameState] = useState(() => gameEngine.getGameState());
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Oyun durumu değişikliklerini dinle
  useEffect(() => {
    const handleStateChange = () => {
      setGameState(gameEngine.getGameState());
    };

    gameEngine.setOnStateChange(handleStateChange);
    
    return () => {
      gameEngine.resetGame();
    };
  }, [gameEngine]);

  // Oyun bittiğinde skor kaydet
  useEffect(() => {
    if (gameState.isGameOver) {
      const gameResult = {
        id: Date.now().toString(),
        gameType: 'RenkDizisi' as const,
        gameDate: new Date().toISOString(),
        results: [{
          name: 'En Yüksek Dizi',
          score: gameState.score
        }],
        winner: 'Oyuncu'
      };
      saveGameRecord(gameResult);
    }
  }, [gameState.isGameOver, gameState.score]);

  // Oyunu manuel başlatma için hazırla
  useEffect(() => {
    // Oyun motorunu hazırla ama henüz başlatma
    gameEngine.resetGame();
  }, [gameEngine]);

  // Renk seçimi
  const handleColorSelect = useCallback((color: Color) => {
    if (!gameState.isUserTurn || isPaused) return;
    gameEngine.selectColor(color);
  }, [gameEngine, gameState.isUserTurn, isPaused]);

  // Sonraki seviye
  const handleNextLevel = useCallback(() => {
    // Küçük bir gecikmeyle yeni seviyeyi başlat
    setTimeout(() => {
      gameEngine.nextLevel();
    }, 500);
  }, [gameEngine]);

  // Yeni oyun
  const handleNewGame = useCallback(() => {
    gameEngine.startGame();
    setIsPaused(false);
  }, [gameEngine]);

  // Duraklat/Devam
  const handleTogglePause = useCallback(() => {
    if (!gameState.isGameOver && !gameState.isLevelComplete) {
      if (gameState.isUserTurn || isPaused) {
        setIsPaused(!isPaused);
        gameEngine.togglePause();
        setShowPauseModal(!showPauseModal);
      }
    }
  }, [gameEngine, gameState, isPaused, showPauseModal]);

  // Ana menüye dön - Eğer oyun başlamadıysa direkt git, başladıysa modal göster
  const handleGoHome = useCallback(() => {
    if (!gameState.isShowing && !gameState.isUserTurn && !gameState.isGameOver && !gameState.isLevelComplete) {
      // Oyun henüz başlamamış, direkt ana menüye git
      navigate('/');
    } else {
      // Oyun başlamış, çıkış onayı iste
      setShowExitModal(true);
    }
  }, [gameState, navigate]);

  // Oyundan çıkışı onayla
  const handleConfirmExit = useCallback(() => {
    gameEngine.resetGame();
    navigate('/');
  }, [gameEngine, navigate]);

  // Renk butonları için sınıflar
  const getColorClasses = (color: Color): string => {
    const baseClasses = 'w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-3xl border-4 transition-all duration-300 ease-out transform active:scale-90';
    const isActive = gameEngine.isColorActive(color);
    const isClickable = gameState.isUserTurn && !isPaused;
    
    const colorClasses = {
      blue: isActive 
        ? 'bg-blue-500 border-blue-700 shadow-2xl shadow-blue-500/60 ring-8 ring-blue-300/70 animate-color-flash' 
        : 'bg-blue-400 border-blue-600 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-400/40 hover:scale-105',
      green: isActive 
        ? 'bg-green-500 border-green-700 shadow-2xl shadow-green-500/60 ring-8 ring-green-300/70 animate-color-flash' 
        : 'bg-green-400 border-green-600 hover:bg-green-500 hover:shadow-xl hover:shadow-green-400/40 hover:scale-105',
      red: isActive 
        ? 'bg-red-500 border-red-700 shadow-2xl shadow-red-500/60 ring-8 ring-red-300/70 animate-color-flash' 
        : 'bg-red-400 border-red-600 hover:bg-red-500 hover:shadow-xl hover:shadow-red-400/40 hover:scale-105',
      yellow: isActive 
        ? 'bg-yellow-500 border-yellow-700 shadow-2xl shadow-yellow-500/60 ring-8 ring-yellow-300/70 animate-color-flash' 
        : 'bg-yellow-400 border-yellow-600 hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-400/40 hover:scale-105'
    };

    return `${baseClasses} ${colorClasses[color]} ${
      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
    }`;
  };

  // Seviye geçiş ekranı
  if (gameState.isLevelComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
        <Card className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-primary mb-2">Harika!</h2>
            <p className="text-muted-foreground mb-4">
              Seviye {gameState.level} tamamlandı!
            </p>
            <p className="text-lg font-semibold text-foreground">
              Şimdi {gameState.level + 3}'lü diziye hazır mısın?
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleNextLevel}
              variant="primary"
              size="lg"
              fullWidth
            >
              Sonraki Seviyeye Başla
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="ghost"
              size="md"
              fullWidth
            >
              Ana Menü
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Oyun bitti ekranı
  if (gameState.isGameOver) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
        <Card className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-danger mb-2">Oyun Bitti</h2>
            <p className="text-muted-foreground mb-4">
              Yanlış renk seçimi yaptınız
            </p>
            <div className="text-center p-4 bg-muted/50 rounded-xl mb-4">
              <p className="text-sm text-muted-foreground">Ulaşılan En Yüksek Dizi</p>
              <p className="text-3xl font-bold text-primary">{gameState.score}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleNewGame}
              variant="primary"
              size="lg"
              fullWidth
            >
              Yeniden Oyna
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="ghost"
              size="md"
              fullWidth
            >
              Ana Menü
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Oyun başlangıç ekranı
  if (!gameState.isShowing && !gameState.isUserTurn && !gameState.isGameOver && !gameState.isLevelComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
        <Card className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-primary mb-2">Renk Dizisi Takibi</h2>
            <p className="text-muted-foreground mb-4">
              Gösterilen renk dizisini hatırlayın ve aynı sırayla dokunun
            </p>
            <p className="text-sm text-muted-foreground">
              Her seviyede dizi uzuyor! Ne kadar uzun hatırlayabilirsiniz?
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleNewGame}
              variant="primary"
              size="lg"
              fullWidth
            >
              Oyunu Başlat
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="ghost"
              size="md"
              fullWidth
            >
              Ana Menü
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Ana oyun ekranı
  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background relative">
      {/* Header - Tabu oyunundaki gibi */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Renk Dizisi Takibi</h1>
          <button 
            onClick={handleTogglePause} 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={gameState.isShowing || gameState.isGameOver}
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        {/* Seviye Bilgisi */}
        <div className="pb-4 px-[18px] py-0 my-0 mx-0">
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md min-w-[120px]">
              <div className="font-medium text-xs sm:text-sm">Seviye {gameState.level}</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.isUserTurn ? `${gameState.userSequence.length + 1}/${gameState.sequence.length}` : 'Hazırlanın...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        {/* Durum göstergesi */}
        <div className="text-center mb-12">
          {gameState.isShowing && (
            <div className="text-2xl font-bold text-primary animate-pulse">
              Diziyi izleyin...
            </div>
          )}
          {isPaused && (
            <div className="text-2xl font-bold text-warning">
              Oyun duraklatıldı
            </div>
          )}
        </div>

        {/* Renk grid'i - Büyütülmüş ve merkezi */}
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          <button
            onClick={() => handleColorSelect('blue')}
            className={getColorClasses('blue')}
            disabled={!gameState.isUserTurn || isPaused}
          />
          <button
            onClick={() => handleColorSelect('green')}
            className={getColorClasses('green')}
            disabled={!gameState.isUserTurn || isPaused}
          />
          <button
            onClick={() => handleColorSelect('red')}
            className={getColorClasses('red')}
            disabled={!gameState.isUserTurn || isPaused}
          />
          <button
            onClick={() => handleColorSelect('yellow')}
            className={getColorClasses('yellow')}
            disabled={!gameState.isUserTurn || isPaused}
          />
        </div>
      </div>

      {/* Duraklatma Modalı */}
      {showPauseModal && (
        <PauseModal 
          onResume={() => {
            setShowPauseModal(false);
            setIsPaused(false);
            gameEngine.togglePause();
          }} 
          onGoHome={handleGoHome} 
        />
      )}

      {/* Çıkış Onayı Modalı */}
      <ExitGameModal 
        isOpen={showExitModal} 
        onClose={() => setShowExitModal(false)} 
        onConfirm={handleConfirmExit} 
      />
    </div>
  );
};