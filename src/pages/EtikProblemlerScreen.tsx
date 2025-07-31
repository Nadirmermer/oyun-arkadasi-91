import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, RefreshCw, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { EtikProblemlerEngine } from '@/games/etikproblemler/EtikProblemlerEngine';
import { EtikProblemlerGameState } from '@/types/etikproblemler';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { saveGameRecord } from '@/lib/storage';
import { useSystemTheme } from '@/hooks/use-system-theme';
export const EtikProblemlerScreen = () => {
  const [gameEngine] = useState(() => new EtikProblemlerEngine());
  const [gameState, setGameState] = useState<EtikProblemlerGameState | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const navigate = useNavigate();

  // Tema uyumluluğunu sağla
  useSystemTheme();
  useEffect(() => {
    // Oyun motoru dinleyicisini ekle
    const updateGameState = () => {
      setGameState(gameState);
    };
    gameEngine.addListener(updateGameState);

    // Vakaları yükle ve oyunu başlat
    const initializeGame = async () => {
      await gameEngine.loadVakalar();
      gameEngine.startGame();
      setGameState(gameEngine.getGameState());
    };
    initializeGame();

    // Cleanup
    return () => {
      gameEngine.removeListener(updateGameState);
      gameEngine.destroy();
    };
  }, [gameEngine]);
  const handleNewVaka = () => {
    gameEngine.getRandomVaka();
    setGameState(gameEngine.getGameState());
  };
  const handleToggleTartisma = () => {
    gameEngine.toggleTartisma();
    setGameState(gameEngine.getGameState());
  };
  const handleGoHome = () => {
    // Oyun kaydını kaydet - Etik Problemler sadece vaka sayısını takip eder
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'EtikProblemler' as const,
      gameDate: new Date().toISOString(),
      results: [{
        name: 'İncelenen Vaka',
        score: gameState?.currentVakaIndex ? gameState.currentVakaIndex + 1 : 1
      }],
      winner: 'Oyuncu'
    };
    saveGameRecord(gameResult);
    navigate('/');
  };
  if (!gameState || !gameState.currentVaka) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vakalar yükleniyor...</p>
        </div>
      </div>;
  }
  const {
    currentVaka,
    showTartisma
  } = gameState;
  return <div className="min-h-screen bg-background page-fade-in">
      {/* Header - Tabu tarzı minimal header */}
      <div className="flex-none bg-card shadow-sm relative z-10">
        <div className="flex justify-between items-center p-4">
          <div className="w-8" />
          <h1 className="text-xl font-bold text-primary">Etik Problemler</h1>
          <button onClick={() => setShowPauseModal(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Pause className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6">

      {/* Vaka Kartı */}
      <div className="max-w-4xl mx-auto">
        <Card className="relative">
          <div className="space-y-6">
            {/* Başlık */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {currentVaka.baslik}
              </h2>
            </div>

            {/* Senaryo */}
            <div>
              <p className="text-base text-foreground leading-relaxed">
                {currentVaka.senaryo}
              </p>
            </div>

            {/* Tartışmayı Göster Butonu */}
            {!showTartisma && <div className="flex justify-center">
                <Button variant="primary" onClick={handleToggleTartisma} className="gap-2">
                  Tartışmayı ve Yorumu Göster
                </Button>
              </div>}

            {/* Tartışma (Animasyonlu) */}
            {showTartisma && <div className="animate-fade-in border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Etik Değerlendirme:
                </h3>
                <p className="text-base text-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
                  {currentVaka.tartisma}
                </p>
              </div>}
          </div>

          {/* Kaynak Butonu */}
          <div className="absolute bottom-6 right-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground my-0 px-0 mx-0 py-0">
                  <Book className="w-4 h-4" />
                  Kaynak
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Kaynak Bilgisi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <p className="text-center text-muted-foreground">
                    Bu vaka, <span className="font-semibold">{currentVaka.kaynak.uyarlayan}</span> tarafından{' '}
                    <span className="font-semibold">{currentVaka.kaynak.yazarlar}</span>'in{' '}
                    <span className="font-semibold">"{currentVaka.kaynak.kitap}"</span> adlı eserinden uyarlanmıştır.
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="text-center text-muted-foreground">
                      <span className="font-semibold">Yayın:</span> {currentVaka.kaynak.bulten}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Alt Butonlar */}
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="primary" onClick={handleNewVaka} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Yeni Vaka
          </Button>
        </div>
      </div>
      </div>

      {/* Pause Modal */}
      {showPauseModal && <PauseModal onResume={() => setShowPauseModal(false)} onGoHome={() => setShowExitModal(true)} />}

      {/* Exit Game Modal */}
      <ExitGameModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} onConfirm={handleGoHome} />
    </div>;
};