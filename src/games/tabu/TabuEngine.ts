import { PsychologyWord, Team, GameSettings, GameState, GameAction } from '@/types/game';

/**
 * PsikoOyun Tabu oyun motoru
 * Oyunun tüm mantığını ve durumunu yönetir
 */
export class TabuEngine {
  private state: GameState;
  private words: PsychologyWord[] = [];
  private usedWords: Set<string> = new Set();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      teams: [],
      currentTeamIndex: 0,
      currentWord: null,
      settings: {
        gameDuration: 60,
        maxScore: 3,        // Tur sayısı
        passCount: 3,
        darkMode: false
      },
      isPlaying: false,
      isPaused: false,
      timeLeft: 60,
      passesUsed: 0,
      currentRound: 1
    };
  }

  /**
   * Psikoloji kelimelerini yükler
   */
  async loadWords(): Promise<void> {
    try {
      const response = await fetch('/data/psikoloji_words_tr.json');
      this.words = await response.json();
    } catch (error) {
      console.error('Kelimeler yüklenirken hata:', error);
      this.words = [];
    }
  }

  /**
   * Takım ekler
   */
  addTeam(name: string): void {
    const team: Team = {
      id: Date.now().toString(),
      name: name.trim(),
      score: 0
    };
    this.state.teams.push(team);
  }

  /**
   * Takım siler
   */
  removeTeam(teamId: string): void {
    this.state.teams = this.state.teams.filter(team => team.id !== teamId);
  }

  /**
   * Oyun ayarlarını günceller
   */
  updateSettings(settings: Partial<GameSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.state.timeLeft = this.state.settings.gameDuration;
  }

  /**
   * Mevcut takımı döndürür
   */
  getCurrentTeam(): Team | null {
    return this.state.teams[this.state.currentTeamIndex] || null;
  }

  /**
   * Sıradaki takıma geçer
   */
  nextTeam(): void {
    this.state.currentTeamIndex = (this.state.currentTeamIndex + 1) % this.state.teams.length;
    this.state.passesUsed = 0; // Yeni takım için pas sayısını sıfırla
  }

  /**
   * Rastgele kelime seçer (seçilen kategorilerden)
   */
  getRandomWord(): PsychologyWord | null {
    const availableWords = this.words.filter(word => {
      const isNotUsed = !this.usedWords.has(word.kelime);
      return isNotUsed;
    });

    if (availableWords.length === 0) {
      // Tüm kelimeler kullanıldıysa sıfırla
      this.usedWords.clear();
      return this.getRandomWord();
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];
    this.usedWords.add(selectedWord.kelime);
    
    return selectedWord;
  }

  /**
   * Oyunu başlatır
   */
  startGame(): void {
    if (this.state.teams.length < 2) {
      throw new Error('Oyun için en az 2 takım gerekli');
    }

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.timeLeft = this.state.settings.gameDuration;
    this.state.currentWord = this.getRandomWord();
    this.startTimer();
  }

  /**
   * Oyunu duraklatır/devam ettirir
   */
  togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
    
    if (this.state.isPaused) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  /**
   * Zamanlayıcıyı başlatır
   */
  private startTimer(): void {
    this.stopTimer(); // Önceki timer'ı temizle
    
    this.timer = setInterval(() => {
      if (!this.state.isPaused && this.state.isPlaying) {
        this.state.timeLeft--;
        
        if (this.state.timeLeft <= 0) {
          this.endTurn();
        }
      }
    }, 1000);
  }

  /**
   * Zamanlayıcıyı durdurur
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Turu bitirir - sadece oyunu durdurutr, tur geçişi yapmaz
   */
  private endTurn(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.stopTimer();
  }

  /**
   * Manual tur geçişi - TurnTransition component'i tarafından çağrılır
   */
  startNextTurn(): void {
    this.nextTeam();
    this.state.timeLeft = this.state.settings.gameDuration;
    this.state.currentWord = this.getRandomWord();
    
    // Eğer tüm takımlar oynadıysa tur sayısını artır
    if (this.state.currentTeamIndex === 0) {
      this.state.currentRound++;
    }
    
    // Oyun bitim kontrolü - tur sayısı kontrolü
    if (this.state.currentRound > this.state.settings.maxScore) {
      this.endGame();
      return;
    }
    
    this.state.isPlaying = true;
    this.startTimer();
  }

  /**
   * Tur geçişi gerekli mi kontrolü
   */
  needsTurnTransition(): boolean {
    return !this.state.isPlaying && this.state.timeLeft <= 0 && this.state.teams.length > 0 && this.state.currentRound <= this.state.settings.maxScore;
  }

  /**
   * Oyun aksiyonunu işler (doğru, tabu, pas)
   */
  processAction(action: GameAction): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    const currentTeam = this.getCurrentTeam();
    if (!currentTeam) return;

    switch (action) {
      case 'correct':
        currentTeam.score++;
        this.state.currentWord = this.getRandomWord();
        break;
        
      case 'tabu':
        // Tabu durumunda skor düşer (eğer 0'dan büyükse)
        if (currentTeam.score > 0) {
          currentTeam.score--;
        }
        this.state.currentWord = this.getRandomWord();
        break;
        
      case 'pass':
        if (this.state.passesUsed < this.state.settings.passCount) {
          this.state.passesUsed++;
          this.state.currentWord = this.getRandomWord();
        }
        break;
    }

    // Tur tabanlı oyunda puan tabanlı bitirme yok
  }

  /**
   * Oyunu bitirir
   */
  endGame(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.stopTimer();
  }

  /**
   * Oyunu sıfırlar
   */
  resetGame(): void {
    this.state.teams.forEach(team => team.score = 0);
    this.state.currentTeamIndex = 0;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.timeLeft = this.state.settings.gameDuration;
    this.state.passesUsed = 0;
    this.state.currentWord = null;
    this.state.currentRound = 1;
    this.usedWords.clear();
    this.stopTimer();
  }

  /**
   * Mevcut oyun durumunu döndürür
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Tüm kategorileri döndürür
   */
  getCategories(): string[] {
    return [...new Set(this.words.map(word => word.kategori))];
  }

  /**
   * Kazanan takımı döndürür
   */
  getWinner(): Team | null {
    // Sadece oyun gerçekten bittiyse kazanan döndür (tur sayısı aşıldıysa)
    if (!this.state.isPlaying && this.state.currentRound > this.state.settings.maxScore) {
      return this.state.teams.reduce((winner, team) => 
        team.score > (winner?.score || 0) ? team : winner, 
        null as Team | null
      );
    }
    return null;
  }

  /**
   * Skor tablosunu döndürür (büyükten küçüğe sıralı)
   */
  getScoreboard(): Team[] {
    return [...this.state.teams].sort((a, b) => b.score - a.score);
  }
}