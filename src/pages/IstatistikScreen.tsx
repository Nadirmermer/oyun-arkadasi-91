import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Pause, Play, ExternalLink } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { IstatistikEngine } from '@/games/istatistik/IstatistikEngine';
import { IstatistikGameState, IstatistikResult } from '@/types/istatistik';
import { saveGameRecord } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { cn } from '@/lib/utils';
import { GameHeader } from '@/components/shared/GameHeader';

/**
 * İstatistik Sezgisi oyunu ana ekranı
 */
export const IstatistikScreen = () => {
  const navigate = useNavigate();
  const [gameEngine] = useState(() => new IstatistikEngine());
  const [gameState, setGameState] = useState<IstatistikGameState>(gameEngine.getGameState());
  const [currentGuess, setCurrentGuess] = useState<number>(50); // Başlangıç tahmini %50
  const [lastResult, setLastResult] = useState<IstatistikResult | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Tema uyumluluğunu sağla
  useSystemTheme();

  // Oyunu başlat
  useEffect(() => {
    const initGame = async () => {
      await gameEngine.loadQuestions();
      if (gameEngine.isLoaded()) {
        // Kaydedilen ayarları kontrol et ve kullan
        const savedSettings = localStorage.getItem('istatistikSettings');
        let settings = undefined;
        
        if (savedSettings) {
          try {
            settings = JSON.parse(savedSettings);
            console.log('Kaydedilen ayarlar yüklendi:', settings);
          } catch (error) {
            console.error('Ayarlar parse edilemedi:', error);
          }
        }
        
        gameEngine.startGame(settings);
        setGameState(gameEngine.getGameState());
        
        // Slider başlangıç değerini soru aralığının ortasına ayarla
        const currentQuestion = gameEngine.getGameState().currentSoru;
        if (currentQuestion) {
          const midPoint = Math.round((currentQuestion.min + currentQuestion.max) / 2);
          setCurrentGuess(midPoint);
        }
      }
    };
    initGame();
  }, [gameEngine]);

  // Oyun durumu güncellemelerini dinle
  useEffect(() => {
    const handleGameStateChange = () => {
      const newState = gameEngine.getGameState();
      setGameState(newState);
      setRemainingTime(gameEngine.getRemainingTime());
    };

    gameEngine.addListener(handleGameStateChange);

    return () => {
      gameEngine.removeListener(handleGameStateChange);
    };
  }, [gameEngine]);

  /**
   * Tahmini gönder
   */
  const handleSubmitGuess = () => {
    try {
      const result = gameEngine.submitGuess(currentGuess);
      setLastResult(result);
      setGameState(gameEngine.getGameState());
    } catch (error) {
      console.error('Tahmin gönderilirken hata:', error);
    }
  };

  /**
   * Sonraki soruya geç
   */
  const handleNextQuestion = () => {
    gameEngine.handleAction('next-question');
    setLastResult(null);
    
    // Yeni soru için slider değerini ortaya ayarla
    const newState = gameEngine.getGameState();
    if (newState.currentSoru) {
      const midPoint = Math.round((newState.currentSoru.min + newState.currentSoru.max) / 2);
      setCurrentGuess(midPoint);
    }
  };

  /**
   * Oyunu yeniden başlat
   */
  const handleNewGame = () => {
    gameEngine.resetGame();
    gameEngine.startGame();
    setLastResult(null);
    setGameState(gameEngine.getGameState());
    
    // Slider değerini yeni sorunun ortasına ayarla
    const currentQuestion = gameEngine.getGameState().currentSoru;
    if (currentQuestion) {
      const midPoint = Math.round((currentQuestion.min + currentQuestion.max) / 2);
      setCurrentGuess(midPoint);
    }
  };

  /**
   * Pause/Resume oyun
   */
  const handlePauseToggle = () => {
    if (gameState.isPaused) {
      gameEngine.handleAction('resume');
      setShowPauseModal(false);
    } else {
      gameEngine.handleAction('pause');
      setShowPauseModal(true);
    }
    setGameState(gameEngine.getGameState());
  };



  /**
   * Pause modal'dan devam et
   */
  const handleResumePause = () => {
    setShowPauseModal(false);
    gameEngine.handleAction('resume');
    setGameState(gameEngine.getGameState());
  };

  /**
   * Ana sayfaya dön (sonuçları kaydet)
   */
  const handleGoHome = () => {
    // Oyun sonuçlarını kaydet
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'IstatistikSezgisi' as const,
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
   * Kaynağa git (dış link)
   */
  const handleGoToSource = () => {
    if (lastResult?.link) {
      window.open(lastResult.link, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Exit modal onayı
   */
  const handleConfirmExit = () => {
    handleGoHome();
  };

  // Yükleniyor durumu
  if (!gameEngine.isLoaded() || !gameState.currentSoru) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">İstatistik soruları yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Oyun bitti ekranı
  if (gameState.isFinished) {
    const getPerformanceMessage = (accuracy: number) => {
      if (accuracy >= 80) return '🌟 Mükemmel! İstatistik sezgin çok güçlü!';
      if (accuracy >= 60) return '👍 İyi! Sezgilerin gelişiyor!';
      if (accuracy >= 40) return '📚 Fena değil! Daha fazla pratik yapmalısın!';
      return '💪 Endişelenme, herkes bir yerden başlar!';
    };
    
    return (
      <GameResultScreen
        icon={<TrendingUp className="w-10 h-10 text-success" />}
        metrics={{
          primary: { 
            label: "Toplam Puan", 
            value: gameState.score,
            color: "text-primary"
          },
          secondary: { 
            label: "Ortalama Doğruluk", 
            value: `%${gameState.averageAccuracy}`,
            color: "text-success"
          },
          tertiary: { 
            label: "Cevaplanan Soru", 
            value: `${gameState.totalAnswered}/${gameState.totalQuestions}`
          }
        }}
        performanceMessage={getPerformanceMessage(gameState.averageAccuracy)}
        onRestart={handleNewGame}
        onGoHome={handleGoHome}
      />
    );
  }

  // Ana oyun ekranı
  return (
    <div className="min-h-screen bg-background page-fade-in">
      <GameHeader
        title="İstatistik Sezgisi"
        isPaused={gameState.isPaused}
        onPauseToggle={handlePauseToggle}
      />

      {/* Skor ve İlerleme */}
      <div className="px-4 pb-4">
          {/* Zamanlayıcı - sadece tahmin aşamasında göster */}
          {!gameState.isAnswerRevealed && remainingTime > 0 && (
            <div className="mb-4 text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-lg ${
                remainingTime <= 10 ? 'bg-danger text-danger-foreground animate-pulse' : 
                remainingTime <= 20 ? 'bg-warning text-warning-foreground' : 
                'bg-info text-info-foreground'
              }`}>
                ⏱️ {remainingTime}s
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Puan</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-success text-success-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Doğruluk</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.totalAnswered > 0 ? `%${gameState.averageAccuracy}` : '%__'}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl text-center bg-info text-info-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Soru</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
              </div>
            </div>
          </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-6 md:px-8 mx-0 my-3">
        {/* Soru Kartı */}
        <Card className="text-center mb-6 p-6">
          <div className="mb-4">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          </div>
          
          <h2 className="text-lg font-bold text-foreground px-2 leading-relaxed mb-4">
            {gameState.currentSoru.question}
          </h2>
        </Card>

        {/* Tahmin Arayüzü veya Sonuç */}
        {!gameState.isAnswerRevealed ? (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-center mb-6">Senin Tahminin</h3>
            
            <Slider
              label="Tahmin"
              value={currentGuess}
              min={gameState.currentSoru.min}
              max={gameState.currentSoru.max}
              step={gameState.currentSoru.max - gameState.currentSoru.min > 100 ? 5 : 1}
              unit={gameState.currentSoru.unit}
              onChange={setCurrentGuess}
            />
            
            <Button 
              onClick={handleSubmitGuess}
              variant="primary" 
              size="lg" 
              fullWidth 
              className="mt-6"
            >
              Tahmini Gönder
            </Button>
          </Card>
        ) : (
          /* Sonuç Karşılaştırması */
          <div className="space-y-4 mb-6">
            {/* Tahmin vs Gerçek Karşılaştırması */}
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-info/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Senin Tahminin</p>
                  <p className="text-2xl font-bold text-info">
                    {gameState.playerGuess}{gameState.currentSoru.unit}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Gerçek Sonuç</p>
                  <p className="text-2xl font-bold text-success">
                    {gameState.currentSoru.answer}{gameState.currentSoru.unit}
                  </p>
                </div>
              </div>
              
              {lastResult && (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Doğruluk & Puan</p>
                  <p className="text-xl font-bold text-primary">
                    %{lastResult.accuracy} doğruluk - {lastResult.points} puan
                  </p>
                </div>
              )}
            </Card>

            {/* Açıklama */}
            {lastResult && (
              <Card className="p-6">
                <h4 className="font-semibold text-foreground mb-3">💡 Açıklama</h4>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {lastResult.explanation}
                </p>
                <p className="text-sm text-muted-foreground italic mb-4">
                  Kaynak: {lastResult.source}
                </p>
                
                {/* Kaynağa Git Butonu */}
                {lastResult.link && (
                  <Button
                    onClick={handleGoToSource}
                    variant="secondary" 
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Kaynağa Git
                  </Button>
                )}
              </Card>
            )}

            {/* Devam Butonu */}
            <Button 
              onClick={handleNextQuestion}
              variant="primary" 
              size="lg" 
              fullWidth
              className="mt-4"
            >
              {gameState.currentQuestionIndex + 1 < gameState.totalQuestions 
                ? 'Sonraki Soru' 
                : 'Sonuçları Gör'
              }
            </Button>
          </div>
        )}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal
          onResume={handleResumePause}
          onGoHome={() => {
            setShowPauseModal(false);
            setShowExitModal(true);
          }}
        />
      )}
      
      {/* Exit Confirmation Modal */}
      <ExitGameModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
};
