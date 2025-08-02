/**
 * Renk Dizisi Takibi Oyun Ekranı
 * Diğer oyunlarla tutarlı tasarım ve mobil responsive
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Palette } from 'lucide-react';
import { RenkDizisiEngine } from '@/games/renkdizisi/RenkDizisiEngine';
import { Color } from '@/types/renkdizisi';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { saveGameRecord } from '@/lib/storage';
import { useSystemTheme } from '@/hooks/use-system-theme';

export const RenkDizisiScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new RenkDizisiEngine());
  const [gameState, setGameState] = useState(() => gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Tema uyumluluğunu sağla
  useSystemTheme();

  // Oyun başlatma - manuel başlatma sistemi
  useEffect(() => {
    gameEngine.resetGame();
  }, [gameEngine]);

  // Oyun durumu güncellemelerini dinle - BilBakalim pattern'i
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
    return () => {
      clearInterval(interval);
      gameEngine.destroy(); // Bellek temizliği
    };
  }, [gameEngine]);

  // Oyun bittiğinde skor kaydet - BilBakalim pattern'i
  useEffect(() => {
    if (gameState.isGameOver) {
      const gameResult = {
        id: Date.now().toString(),
        gameType: 'RenkDizisi' as const,
        gameDate: new Date().toISOString(),
        results: [{
          name: 'En Yüksek Seviye',
          score: gameState.highestScore
        }],
        winner: 'Oyuncu'
      };
      saveGameRecord(gameResult);
    }
  }, [gameState.isGameOver, gameState.highestScore]);

  /**
   * Renk seçimi - basit ve güvenilir
   */
  const handleColorSelect = useCallback((color: Color) => {
    if (!gameState.isUserTurn || gameState.isPaused) return;
    gameEngine.selectColor(color);
  }, [gameEngine, gameState.isUserTurn, gameState.isPaused]);

  /**
   * Sonraki seviye
   */
  const handleNextLevel = useCallback(() => {
    gameEngine.nextLevel();
  }, [gameEngine]);

  /**
   * Yeni oyun başlat - BilBakalim pattern'i
   */
  const handleNewGame = useCallback(() => {
    gameEngine.resetGame();
    gameEngine.startGame();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  /**
   * Duraklat/Devam - BilBakalim pattern'i
   */
  const handlePauseToggle = () => {
    gameEngine.togglePause();
  };

  /**
   * Ana menüye dön
   */
  const handleGoHome = useCallback(() => {
    gameEngine.resetGame();
    navigate('/');
  }, [gameEngine, navigate]);

  /**
   * Oyundan çıkışı onayla
   */
  const handleConfirmExit = useCallback(() => {
    gameEngine.resetGame();
    navigate('/');
  }, [gameEngine, navigate]);

  // Renk butonları için sınıflar - basit ve responsive
  const getColorClasses = (color: Color): string => {
    const baseClasses = 'w-full aspect-square rounded-2xl border-4 transition-all duration-300 ease-out transform active:scale-95';
    const isActive = gameEngine.isColorActive(color);
    const isClickable = gameState.isUserTurn && !gameState.isPaused;
    
    const colorClasses = {
      blue: isActive 
        ? 'bg-blue-500 border-blue-700 shadow-xl shadow-blue-500/50 scale-110 ring-4 ring-blue-300/70' 
        : 'bg-blue-400 border-blue-600 hover:bg-blue-500 hover:shadow-lg hover:scale-105',
      green: isActive 
        ? 'bg-green-500 border-green-700 shadow-xl shadow-green-500/50 scale-110 ring-4 ring-green-300/70' 
        : 'bg-green-400 border-green-600 hover:bg-green-500 hover:shadow-lg hover:scale-105',
      red: isActive 
        ? 'bg-red-500 border-red-700 shadow-xl shadow-red-500/50 scale-110 ring-4 ring-red-300/70' 
        : 'bg-red-400 border-red-600 hover:bg-red-500 hover:shadow-lg hover:scale-105',
      yellow: isActive 
        ? 'bg-yellow-500 border-yellow-700 shadow-xl shadow-yellow-500/50 scale-110 ring-4 ring-yellow-300/70' 
        : 'bg-yellow-400 border-yellow-600 hover:bg-yellow-500 hover:shadow-lg hover:scale-105'
    };

    return `${baseClasses} ${colorClasses[color]} ${
      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
    }`;
  };

  // Yükleniyor durumu - BilBakalim pattern'i
  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Oyun hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // Oyun bitti ekranı - GameResultScreen pattern'i
  if (gameState.isGameOver) {
    const metrics = gameEngine.getGameMetrics();
    
    const getPerformanceMessage = (level: number) => {
      if (level >= 8) return '🌟 İnanılmaz! Hafıza şampiyonusunuz!';
      if (level >= 6) return '🎯 Mükemmel! Harika bir hafızanız var!';
      if (level >= 4) return '👏 Harika! Çok iyi gidiyorsunuz!';
      if (level >= 2) return '💪 İyi başlangıç! Daha fazla pratik yapın!';
      return '🎮 Merak etmeyin, herkes bir yerden başlar!';
    };
    
    return (
      <GameResultScreen
        icon={<Palette className="w-10 h-10 text-primary" />}
        metrics={{
          primary: { 
            label: "Ulaşılan En Yüksek Seviye", 
            value: metrics.finalLevel.toString(),
            color: "text-primary"
          },
          secondary: { 
            label: "Kalan Can", 
            value: `${metrics.remainingLives}/${metrics.maxLives}`,
            color: metrics.remainingLives > 0 ? "text-success" : "text-danger"
          },
          tertiary: { 
            label: "Son Seviye Dizisi", 
            value: `${metrics.level + 2} renk`
          }
        }}
        performanceMessage={getPerformanceMessage(metrics.finalLevel)}
        onRestart={handleNewGame}
        onGoHome={handleGoHome}
      />
    );
  }

  // Seviye geçiş ekranı - BilBakalim pattern'i
  if (gameState.isLevelComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Card className="text-center max-w-sm w-full">
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

  // Oyun başlangıç ekranı - BilBakalim pattern'i
  if (!gameState.isShowing && !gameState.isUserTurn && !gameState.isGameOver && !gameState.isLevelComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Card className="text-center max-w-sm w-full">
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

  // Ana oyun ekranı - BilBakalim/IstatistikScreen pattern'i
  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tutarlı header yapısı */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Renk Dizisi Takibi</h1>
          <button 
            onClick={handlePauseToggle} 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={gameState.isShowing || gameState.isGameOver}
          >
            {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>

        {/* Skor ve İlerleme - IstatistikScreen pattern'i */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Seviye</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.level}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-success text-success-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Can</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.lives}/{gameState.maxLives}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-muted text-muted-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">İlerleme</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.isUserTurn ? `${gameState.userSequence.length + 1}/${gameState.sequence.length}` : '...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı - BilBakalim pattern'i */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10">
        {/* Durum göstergesi */}
        <div className="text-center mb-6">
          {gameState.isShowing && (
            <div className="text-2xl font-bold text-primary animate-pulse">
              Diziyi izleyin...
            </div>
          )}
          {gameState.isPaused && (
            <div className="text-2xl font-bold text-warning">
              Oyun duraklatıldı
            </div>
          )}
          {gameState.isUserTurn && (
            <div className="text-lg text-muted-foreground">
              Gördüğünüz sırayla renklere dokunun
            </div>
          )}
        </div>

        {/* Renk Grid'i - Mobil responsive */}
        <div className="max-w-sm mx-auto w-full">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleColorSelect('blue')}
              className={getColorClasses('blue')}
              disabled={!gameState.isUserTurn || gameState.isPaused}
            />
            <button
              onClick={() => handleColorSelect('green')}
              className={getColorClasses('green')}
              disabled={!gameState.isUserTurn || gameState.isPaused}
            />
            <button
              onClick={() => handleColorSelect('red')}
              className={getColorClasses('red')}
              disabled={!gameState.isUserTurn || gameState.isPaused}
            />
            <button
              onClick={() => handleColorSelect('yellow')}
              className={getColorClasses('yellow')}
              disabled={!gameState.isUserTurn || gameState.isPaused}
            />
          </div>
        </div>
      </div>

      {/* Duraklatma Modalı */}
      {showPauseModal && (
        <PauseModal 
          onResume={() => {
            setShowPauseModal(false);
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
