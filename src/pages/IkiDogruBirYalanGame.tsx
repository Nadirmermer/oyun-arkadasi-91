import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Home, CheckCircle, XCircle, Target, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { GameResultScreen } from '@/components/shared/GameResultScreen';
import { IkiDogruBirYalanEngine } from '@/games/ikidogrubiryalan/IkiDogruBirYalanEngine';

interface IkiDogruBirYalanGameProps {
  gameEngine: IkiDogruBirYalanEngine;
  onGoHome: () => void;
}

/**
 * İki Doğru Bir Yalan oyun ekranı
 */
export const IkiDogruBirYalanGame = ({ gameEngine, onGoHome }: IkiDogruBirYalanGameProps) => {
  const [gameState, setGameState] = useState(gameEngine.getGameState());
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const updateGameState = () => {
      setGameState(gameEngine.getGameState());
    };

    gameEngine.addListener(updateGameState);
    return () => gameEngine.removeListener(updateGameState);
  }, [gameEngine]);

  const handleAnswerSelect = (index: number) => {
    gameEngine.handleAction('select-answer', index);
  };

  const handleNextQuestion = () => {
    gameEngine.handleAction('next-question');
  };

  const handleRestart = () => {
    gameEngine.resetGame();
    gameEngine.startGame();
  };

  const getAnswerButtonStyle = (index: number) => {
    if (!gameState.showAnswer) {
      return "w-full p-4 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors";
    }

    const ifade = gameState.currentSoru?.ifadeler[index];
    const isSelected = gameState.selectedAnswer === index;
    const isCorrectAnswer = !ifade?.dogruMu; // Yalan olan ifade doğru cevap
    
    if (isCorrectAnswer) {
      return "w-full p-4 text-left border-2 border-success bg-success/10 rounded-lg";
    } else if (isSelected) {
      return "w-full p-4 text-left border-2 border-danger bg-danger/10 rounded-lg";
    } else {
      return "w-full p-4 text-left border border-border rounded-lg opacity-60";
    }
  };

  const getAnswerIcon = (index: number) => {
    if (!gameState.showAnswer) {
      return null;
    }

    const ifade = gameState.currentSoru?.ifadeler[index];
    const isSelected = gameState.selectedAnswer === index;
    const isCorrectAnswer = !ifade?.dogruMu;
    
    if (isCorrectAnswer) {
      return <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />;
    } else if (isSelected) {
      return <XCircle className="w-5 h-5 text-danger flex-shrink-0" />;
    } else {
      return null;
    }
  };

  // Oyun bitti ekranı - Ortak bileşeni kullan
  if (gameState.isFinished) {
    const metrics = gameEngine.getGameMetrics();
    
    return (
      <GameResultScreen
        metrics={{
          primary: { 
            label: "Doğru Cevaplar", 
            value: `${metrics.correctAnswers}/${metrics.totalQuestions}`,
            color: "text-primary"
          },
          secondary: { 
            label: "Başarı Oranı", 
            value: `%${metrics.accuracy}`,
            color: "text-success"
          },
          tertiary: { 
            label: "Cevaplanan Soru", 
            value: `${metrics.totalAnswered}/${metrics.totalQuestions}`
          }
        }}
        performanceMessage={metrics.performanceLevel}
        onRestart={handleRestart}
        onGoHome={onGoHome}
      />
    );
  }

  if (!gameState.currentSoru) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Soru yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">İki Doğru Bir Yalan</h1>
          <button
            onClick={() => setShowPauseModal(true)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pause className="w-6 h-6" />
          </button>
        </div>

        {/* Skor ve İlerleme */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 sm:p-4 rounded-xl text-center bg-primary text-primary-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Skor</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.correctAnswers}/{gameState.totalAnswered}
              </div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl text-center bg-info text-info-foreground shadow-md">
              <div className="font-medium text-xs sm:text-sm">Soru</div>
              <div className="text-xl sm:text-2xl font-bold mt-1">
                {gameState.currentQuestionNumber}/{gameState.totalQuestionsInSession}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* Question Header */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-sm text-accent-foreground mb-4">
              <Target className="w-4 h-4" />
              {gameState.currentSoru.kategori}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {gameState.currentSoru.konu}
            </h2>
            <p className="text-muted-foreground">
              Hangisi yalan? İkisi doğru, biri yanlış!
            </p>
          </div>
        </Card>

        {/* Answer Options */}
        <div className="space-y-4 mb-6">
          {gameState.currentSoru.ifadeler.map((ifade, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={gameState.showAnswer}
              className={getAnswerButtonStyle(index)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-primary">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium text-left">
                    {ifade.metin}
                  </p>
                </div>
                {getAnswerIcon(index)}
              </div>
            </button>
          ))}
        </div>

        {/* Next Question Button */}
        {gameState.showAnswer && (
          <div className="text-center">
            <Button 
              onClick={handleNextQuestion}
              className="w-full sm:w-auto"
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Sonraki Soru
            </Button>
            
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {gameState.selectedAnswer !== null && gameState.currentSoru && 
                 !gameState.currentSoru.ifadeler[gameState.selectedAnswer].dogruMu 
                  ? "🎉 Tebrikler! Doğru cevap verdin."
                  : "😔 Maalesef yanlış. Doğru cevap yukarıda işaretli."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <PauseModal 
          onResume={() => setShowPauseModal(false)}
          onGoHome={() => setShowExitModal(true)}
        />
      )}

      {/* Exit Game Modal */}
      <ExitGameModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={onGoHome}
      />
    </div>
  );
};