import { useState, useEffect } from 'react';
import { Users, Search, Filter, Scale, Lightbulb, Eye, TrendingUp } from 'lucide-react';
import logoImage from '/icons/icon-192x192.png';
import { Card } from '@/components/shared/Card';
import { AppLayout } from '@/components/shared/AppLayout';
import { TeamSetup } from './TeamSetup';
import { GameSettings as GameSettingsComponent } from './GameSettings';
import { GameScreen } from './GameScreen';
import { ScoreScreen } from './ScoreScreen';
import { BenKimimSetup } from './BenKimimSetup';
// Ben Kimim artık direkt route üzerinden çalışıyor
import { IkiDogruBirYalanSetup } from './IkiDogruBirYalanSetup';
import { IkiDogruBirYalanGame } from './IkiDogruBirYalanGame';
import { TabuEngine } from '@/games/tabu/TabuEngine';
import { BenKimimEngine } from '@/games/benkimim/BenKimimEngine';
import { IkiDogruBirYalanEngine } from '@/games/ikidogrubiryalan/IkiDogruBirYalanEngine';
import { Team, GameSettings } from '@/types/game';
import { BenKimimSettings } from '@/types/benkimim';
import { loadTeams, saveTeams, saveGameRecord } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useSystemTheme } from '@/hooks/use-system-theme';

type GamePhase = 'home' | 'team-setup' | 'settings' | 'playing' | 'score' | 'benkimim-setup' | 'benkimim-playing' | 'benkimim-score' | 'iki-dogru-bir-yalan-setup' | 'iki-dogru-bir-yalan-playing';

/**
 * PsikoOyun Ana Sayfa - Sadece oyun seçimi ve oyun akışı
 */
export const HomePage = () => {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('home');
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameEngine] = useState(() => new TabuEngine());
  const [benKimimEngine] = useState(() => new BenKimimEngine());
  const [ikiDogruBirYalanEngine] = useState(() => new IkiDogruBirYalanEngine());
  const navigate = useNavigate();

  // Sistem temasını uygula
  useSystemTheme();

  // Oyun motorlarını başlat ve ayarları yükle
  useEffect(() => {
    gameEngine.loadWords();
    benKimimEngine.loadWords();
    ikiDogruBirYalanEngine.loadQuestions();

    // Kaydedilmiş takımları yükle
    const savedTeams = loadTeams();
    if (savedTeams.length > 0) {
      setTeams(savedTeams.map(team => ({
        ...team,
        score: 0
      })));
    }
  }, [gameEngine, benKimimEngine, ikiDogruBirYalanEngine]);

  /**
   * Ana menüye dön - skor ekranından gelince history'ye yönlendir
   */
  const handleGoHome = () => {
    setCurrentPhase('home');
    gameEngine.resetGame();
    // Score ekranından gelince history'ye yönlendir
    navigate('/history');
  };

  /**
   * Takım kurulumu tamamlandığında
   */
  const handleTeamsReady = (newTeams: Team[]) => {
    setTeams(newTeams);

    // Takımları kaydet
    saveTeams(newTeams.map(team => ({
      id: team.id,
      name: team.name
    })));

    // Oyun motorunu resetle ve yeni takımları ekle
    gameEngine.resetGame();
    newTeams.forEach(team => {
      gameEngine.addTeam(team.name);
    });
    setCurrentPhase('settings');
  };

  /**
   * Oyunu başlat
   */
  const handleStartGame = (settings: GameSettings) => {
    gameEngine.updateSettings(settings);
    gameEngine.startGame();
    setCurrentPhase('playing');
  };

  /**
   * Oyun bittiğinde skor ekranına geç
   */
  const handleGameEnd = () => {
    // Oyun sonuçlarını kaydet
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'Tabu' as const,
      gameDate: new Date().toISOString(),
      results: gameEngine.getScoreboard().map(team => ({
        name: team.name,
        score: team.score
      })),
      winner: gameEngine.getWinner()?.name
    };
    saveGameRecord(gameResult);
    setCurrentPhase('score');
  };

  /**
   * Yeni oyun başlat
   */
  const handleNewGame = () => {
    gameEngine.resetGame();
    teams.forEach(team => {
      gameEngine.addTeam(team.name);
    });
    setCurrentPhase('settings');
  };

  /**
   * Ben Kimim oyunu başlat
   */
  const handleStartBenKimim = (settings: BenKimimSettings) => {
    benKimimEngine.updateSettings(settings);
    benKimimEngine.startGame();
    setCurrentPhase('benkimim-playing');
  };

  /**
   * Ben Kimim oyunu bittiğinde
   */
  const handleBenKimimGameEnd = () => {
    // Ben Kimim oyun sonuçlarını kaydet
    const gameResult = {
      id: Date.now().toString(),
      gameType: 'BenKimim' as const,
      gameDate: new Date().toISOString(),
      results: [{
        name: 'Oyuncu',
        score: benKimimEngine.getGameState().score
      }],
      winner: 'Oyuncu'
    };
    saveGameRecord(gameResult);
    setCurrentPhase('benkimim-score');
  };

  /**
   * İki Doğru Bir Yalan oyunu başlat
   */
  const handleStartIkiDogruBirYalan = () => {
    ikiDogruBirYalanEngine.startGame();
    setCurrentPhase('iki-dogru-bir-yalan-playing');
  };

  /**
   * Ben Kimim yeni oyun
   */
  const handleBenKimimNewGame = () => {
    benKimimEngine.resetGame();
    setCurrentPhase('benkimim-setup');
  };

  // Ana menü harici her şey navigation olmadan
  if (currentPhase === 'team-setup') {
    // Eğer takımlar zaten varsa (düzenleme modundaysa), geri butonu settings'e götürür
    const goBackTarget = teams.length >= 2 ? 'settings' : 'home';
    return <TeamSetup 
      initialTeams={teams} 
      onTeamsReady={handleTeamsReady} 
      onGoBack={() => setCurrentPhase(goBackTarget)} 
    />;
  }
  if (currentPhase === 'settings') {
    return <GameSettingsComponent 
      teams={teams} 
      onStartGame={handleStartGame} 
      onGoBack={() => setCurrentPhase('home')}
      onEditTeams={() => setCurrentPhase('team-setup')}
    />;
  }
  if (currentPhase === 'playing') {
    return <GameScreen gameEngine={gameEngine} onGameEnd={handleGameEnd} onGoHome={handleGoHome} />;
  }
  if (currentPhase === 'score') {
    return <ScoreScreen teams={gameEngine.getScoreboard()} onNewGame={handleNewGame} onGoHome={handleGoHome} />;
  }
  if (currentPhase === 'benkimim-setup') {
    return <BenKimimSetup onStartGame={handleStartBenKimim} onGoBack={() => setCurrentPhase('home')} />;
  }
  if (currentPhase === 'benkimim-playing') {
    // Ben Kimim artık direkt route üzerinden çalışıyor
    navigate('/game/benkimim');
    return null;
  }
  if (currentPhase === 'iki-dogru-bir-yalan-setup') {
    return <IkiDogruBirYalanSetup onStartGame={handleStartIkiDogruBirYalan} onGoBack={() => setCurrentPhase('home')} />;
  }
  if (currentPhase === 'iki-dogru-bir-yalan-playing') {
    return <IkiDogruBirYalanGame gameEngine={ikiDogruBirYalanEngine} onGoHome={() => {
      // İki Doğru Bir Yalan oyun sonuçlarını kaydet
      const gameState = ikiDogruBirYalanEngine.getGameState();
      const gameResult = {
        id: Date.now().toString(),
        gameType: 'IkiDogruBirYalan' as const,
        gameDate: new Date().toISOString(),
        results: [{
          name: 'Oyuncu',
          score: `${gameState.correctAnswers}/${gameState.totalAnswered}`
        }],
        winner: 'Oyuncu'
      };
      saveGameRecord(gameResult);
      handleGoHome();
    }} />;
  }

  // Ana menü - Bottom navigation ile
  return <AppLayout showBottomNav={true}>
    <div className="min-h-screen bg-background page-fade-in flex flex-col justify-center mx-0 my-0 py-0 px-0">
      {/* Header - Ortalanmış */}
      <div className="text-center mb-12 py-0 px-0 mx-0 my-[14px]">
        <div className="w-40 h-40 mx-auto mb-10">
          <img src={logoImage} alt="PsikOyun Logo" className="w-full h-full rounded-3xl shadow-elevated object-cover" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-3">PsikOyun</h1>
        <p className="text-base text-muted-foreground px-6 max-w-sm mx-auto">
          Psikoloji oyunları ile eğlenceli vakit geçir!
        </p>
      </div>

      {/* Oyun Kategorileri */}
      <div className="px-6 pb-8 my-[13px]">
        {/* Grup Oyunları */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 text-center mx-0 py-0 px-0 my-0">Grup Oyunları</h2>
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
          <Card className="p-0 overflow-hidden shadow-card">
            <button onClick={() => {
                // Kaydedilmiş takımları yükle 
                const savedTeams = loadTeams();
                if (savedTeams.length >= 2) {
                  // Eğer kaydedilmiş takımlar varsa doğrudan ayarlara git
                  const teamsWithScore = savedTeams.map(team => ({
                    ...team,
                    score: 0
                  }));
                  setTeams(teamsWithScore);
                  gameEngine.resetGame();
                  teamsWithScore.forEach(team => {
                    gameEngine.addTeam(team.name);
                  });
                  setCurrentPhase('settings');
                } else {
                  // Yoksa takım kurulumuna git
                  setCurrentPhase('team-setup');
                }
              }} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Psikoloji Tabu</h3>
                  <p className="text-xs text-muted-foreground">
                    {teams.length >= 2 ? 'Devam Et' : 'Psikoloji terimleri'}
                  </p>
                </div>
              </div>
            </button>
          </Card>

            <Card className="p-0 overflow-hidden shadow-card">
            <button onClick={() => navigate('/game/benkimim/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Ben Kimim?</h3>
                  <p className="text-xs text-muted-foreground">Psikoloji ünlüleri</p>
                </div>
              </div>
            </button>
          </Card>

          <Card className="p-0 overflow-hidden shadow-card">
            <button onClick={() => navigate('/game/etikproblemler/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Scale className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Etik mi ?</h3>
                  <p className="text-xs text-muted-foreground">Psikoloji etik vakaları</p>
                </div>
              </div>
            </button>
          </Card>
          </div>
        </div>

        {/* Tek Kişi Oyunları */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 text-center mx-0 py-0">Tek Kişi Oyunları</h2>
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
            <Card className="p-0 overflow-hidden shadow-card">
              <button onClick={() => setCurrentPhase('iki-dogru-bir-yalan-setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
                <div className="text-center">
                  <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-6 h-6 text-danger" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">İki Doğru Bir Yalan</h3>
                    <p className="text-xs text-muted-foreground">Doğru bilgiyi bul</p>
                  </div>
                </div>
              </button>
            </Card>

            <Card className="p-0 overflow-hidden shadow-card">
              <button onClick={() => navigate('/game/bilbakalim/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
                <div className="text-center">
                  <div className="w-12 h-12 bg-info/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Bil Bakalım</h3>
                    <p className="text-xs text-muted-foreground">Bilgi yarışması</p>
                  </div>
                </div>
              </button>
            </Card>

            <Card className="p-0 overflow-hidden shadow-card">
              <button onClick={() => navigate('/game/renkdizisi/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Renk Dizisi Takibi</h3>
                    <p className="text-xs text-muted-foreground">Görsel hafıza oyunu</p>
                  </div>
                </div>
              </button>
            </Card>

            <Card className="p-0 overflow-hidden shadow-card">
              <button onClick={() => navigate('/game/istatistik/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">İstatistik Sezgisi</h3>
                    <p className="text-xs text-muted-foreground">Psikoloji istatistikleri</p>
                  </div>
                </div>
              </button>
            </Card>

            <Card className="p-0 overflow-hidden shadow-card">
              <button onClick={() => navigate('/game/zihindetektifi/setup')} className="w-full p-4 text-left hover:bg-primary/5 transition-smooth hover-lift">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Zihin Dedektifi</h3>
                    <p className="text-xs text-muted-foreground">Psikolojik kavramları bul</p>
                  </div>
                </div>
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>;
};