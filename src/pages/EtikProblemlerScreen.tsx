import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, RefreshCw, Pause, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PauseModal } from '@/components/shared/PauseModal';
import { ExitGameModal } from '@/components/shared/ExitGameModal';
import { EtikProblemlerEngine } from '@/games/etikproblemler/EtikProblemlerEngine';
import { EtikProblemlerGameState } from '@/types/etikproblemler';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      // Not: Önceki implementasyon closure'daki eski state'i tekrar set ediyordu.
      // Motorun güncel durumunu okuyarak state'i güncellemek gerekir.
      setGameState(gameEngine.getGameState());
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
    // Etik Problemler oyunu eğitim amaçlıdır, puanlanmaz ve kaydedilmez
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
                
                {/* Kaynak Bilgisi - Tartışma altında */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 hover:underline">
                        <Book className="w-3 h-3" />
                        Kaynak bilgisini görüntüle
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-center">Kaynak Bilgisi</DialogTitle>
                        <DialogDescription className="text-center text-sm text-muted-foreground">
                          Bu etik vakanın akademik kaynak bilgileri
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div className="text-center space-y-3">
                          <div>
                            <p className="text-muted-foreground">
                              Bu vaka, <span className="font-semibold text-foreground">{currentVaka.kaynak.uyarlayan}</span> tarafından uyarlanmıştır.
                            </p>
                          </div>
                          
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="font-semibold text-foreground mb-1">Orijinal Kaynak:</p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">{currentVaka.kaynak.yazarlar}</span>
                            </p>
                            <p className="text-muted-foreground">
                              "{currentVaka.kaynak.kitap}"
                            </p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground border-t border-border pt-3">
                            <p>
                              <span className="font-medium">Yayın:</span> {currentVaka.kaynak.bulten}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>}
          </div>
        </Card>

        {/* Alt Butonlar */}
        <div className="flex justify-center mt-8">
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