import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { BenKimimGame } from '../BenKimimGame';
import { BenKimimLandscape } from './BenKimimLandscape';
import { BenKimimScore } from './BenKimimScore';
import { saveGameRecord } from '@/lib/storage';

export const BenKimimGameWrapper = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new BenKimimEngine());
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  useEffect(() => {
    const initGame = async () => {
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

      await gameEngine.loadWords();
      gameEngine.startGame();
      setGameStarted(true);
    };

    initGame();
  }, [gameEngine]);

  const handleGameEnd = () => {
    const gameState = gameEngine.getGameState();
    
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
    
    setIsGameEnded(true);
  };

  const handleGoHome = () => {
    gameEngine.destroy();
    navigate('/');
  };

  const handlePlayAgain = () => {
    setIsGameEnded(false);
    gameEngine.resetGame();
    gameEngine.startGame();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Oyun hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (isGameEnded) {
    return (
      <BenKimimScore
        gameEngine={gameEngine}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    );
  }

  if (isLandscapeMode) {
    return (
      <BenKimimLandscape
        gameEngine={gameEngine}
        onGameEnd={handleGameEnd}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <BenKimimGame
      gameEngine={gameEngine}
      onGameEnd={handleGameEnd}
      onGoHome={handleGoHome}
    />
  );
};