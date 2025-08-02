import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { IstatistikEngine } from '@/games/istatistik/IstatistikEngine';
import { IstatistikGameState, IstatistikResult } from '@/types/istatistik';
import { saveGameRecord } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { cn } from '@/lib/utils';

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

  // Tema uyumluluğunu sağla
  useSystemTheme();

  // Oyunu başlat
  useEffect(() => {
    const initGame = async () => {
      await gameEngine.loadQuestions();
      if (gameEngine.isLoaded()) {
        // Kaydedilen ayarları kontrol et
        const savedSettings = localStorage.getItem('istatistikSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          gameEngine.startGame(settings);
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
    const handleGameStateChange = () => {
      const newState = gameEngine.getGameState();
      setGameState(newState);
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
    setCurrentGuess(50); // Tahmini sıfırla
  };

  /**
   * Oyunu yeniden başlat
   */
  const handleNewGame = () => {
    gameEngine.resetGame();
    gameEngine.startGame();
    setLastResult(null);
    setCurrentGuess(50);
    setGameState(gameEngine.getGameState());
  };

  /**
   * Pause/Resume oyun
   */
  const handleTogglePause = () => {
    if (gameState.isPaused) {
      gameEngine.handleAction('resume');
    } else {
      gameEngine.handleAction('pause');
    }
    setGameState(gameEngine.getGameState());
  };

  /**
   * Pause modal'ı aç
   */
  const handleOpenPauseModal = () => {
    if (!gameState.isPaused) {
      gameEngine.handleAction('pause');
      setGameState(gameEngine.getGameState());
    }
    setShowPauseModal(true);
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
    return (
      <div className="min-h-screen bg-background page-fade-in">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Sonuç Kartı */}
            <Card className="text-center p-8">
              <div className="w-20 h-20 bg-success/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-success" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Oyun Tamamlandı! 🎉
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Toplam Puan:</span>
                  <span className="text-2xl font-bold text-primary">{gameState.score}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Ortalama Doğruluk:</span>
                  <span className="text-xl font-bold text-success">%{gameState.averageAccuracy}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Cevaplanan Soru:</span>
                  <span className="font-bold">{gameState.totalAnswered}/{gameState.totalQuestions}</span>
                </div>
              </div>

              {/* Performans Değerlendirmesi */}
              <div className="mb-6">
                {gameState.averageAccuracy >= 80 && <p className="text-lg text-success font-medium">🌟 Mükemmel! İstatistik sezgin çok güçlü!</p>}
                {gameState.averageAccuracy >= 60 && gameState.averageAccuracy < 80 && <p className="text-lg text-warning font-medium">👍 İyi! Sezgilerin gelişiyor!</p>}
                {gameState.averageAccuracy >= 40 && gameState.averageAccuracy < 60 && <p className="text-lg text-info font-medium">📚 Fena değil! Daha fazla pratik yapmalısın!</p>}
                {gameState.averageAccuracy < 40 && <p className="text-lg text-muted-foreground">💪 Endişelenme, herkes bir yerden başlar!</p>}
              </div>
            </Card>

            {/* Aksiyon Butonları */}
            <div className="space-y-4">
              <Button onClick={handleNewGame} variant="primary" size="lg" fullWidth>
                Yeniden Oyna
              </Button>

              <Button onClick={handleGoHome} variant="secondary" size="lg" fullWidth>
                Ana Menüye Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ana oyun ekranı
  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">İstatistik Sezgisi</h1>
          <button 
            onClick={handleOpenPauseModal} 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pause className="w-6 h-6" />
          </button>
        </div>

        {/* Skor ve İlerleme */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Puan</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">{gameState.score}</div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-success text-success-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Doğruluk</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.totalAnswered > 0 ? `%${gameState.averageAccuracy}` : '-%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 p-4 flex flex-col justify-center pb-32 min-h-0 relative z-10 px-[27px] py-0 mx-0 my-[13px]">
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
              label={`Tahmin: ${currentGuess}${gameState.currentSoru.unit}`}
              value={currentGuess}
              min={0}
              max={100}
              step={1}
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
                <p className="text-sm text-muted-foreground italic">
                  Kaynak: {lastResult.source}
                </p>
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
