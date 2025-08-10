import { ZihinDetektifiCase, ZihinDetektifiSettings, ZihinDetektifiGameState, ZihinDetektifiAction } from '@/types/zihindetektifi';

let globalCasesCache: ZihinDetektifiCase[] | null = null;

/**
 * Zihin Dedektifi oyunu için oyun motoru
 */
export class ZihinDetektifiEngine {
  private cases: ZihinDetektifiCase[] = [];
  private gameState: ZihinDetektifiGameState;
  private gameTimer: NodeJS.Timeout | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      currentCase: null,
      settings: {
        selectedType: null,
        gameDuration: 300, // 5 dakika
        targetScore: 10
      },
      isPlaying: false,
      isPaused: false,
      timeLeft: 300,
      score: 0,
      totalQuestions: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: false
    };
  }

  /**
   * Vaka dosyasını yükle
   */
  async loadCases(): Promise<void> {
    try {
      if (this.cases.length > 0) {
        return;
      }

      if (globalCasesCache && globalCasesCache.length > 0) {
        this.cases = globalCasesCache;
        return;
      }

      const response = await fetch('/data/zihindetektifi_vakalar.json');
      if (!response.ok) {
        throw new Error('Vaka dosyası yüklenemedi');
      }
      const cases = await response.json();
      
      globalCasesCache = cases;
      this.cases = cases;
    } catch (error) {
      console.error('Vakalar yüklenirken hata:', error);
      this.cases = [];
    }
  }

  /**
   * Oyun ayarlarını güncelle
   */
  updateSettings(settings: Partial<ZihinDetektifiSettings>): void {
    this.gameState.settings = { ...this.gameState.settings, ...settings };
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.notifyListeners();
  }

  /**
   * Oyunu başlat
   */
  startGame(): void {
    if (this.cases.length === 0 || !this.gameState.settings.selectedType) {
      console.warn('Vakalar yüklenmedi veya tür seçilmedi');
      return;
    }

    this.resetGame();
    this.gameState.isPlaying = true;
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.nextCase();
    this.startTimer();
    this.notifyListeners();
  }

  /**
   * Oyunu duraklat/devam ettir
   */
  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
    
    if (this.gameState.isPaused) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
    
    this.notifyListeners();
  }

  /**
   * Cevap seç
   */
  selectAnswer(answer: string): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.showFeedback) {
      return;
    }

    this.gameState.selectedAnswer = answer;
    this.gameState.isCorrect = answer === this.gameState.currentCase?.correct_answer;
    this.gameState.showFeedback = true;
    
    if (this.gameState.isCorrect) {
      this.gameState.score++;
    }
    
    this.gameState.totalQuestions++;
    this.notifyListeners();
  }

  /**
   * Sonraki soruya geç
   */
  nextQuestion(): void {
    if (!this.gameState.showFeedback) return;

    // Hedef skora ulaşıldı mı kontrol et
    if (this.gameState.score >= this.gameState.settings.targetScore) {
      this.endGame();
      return;
    }

    this.gameState.selectedAnswer = null;
    this.gameState.showFeedback = false;
    this.gameState.isCorrect = false;
    this.nextCase();
    this.notifyListeners();
  }

  /**
   * Rastgele bir sonraki vakayı seç
   */
  private nextCase(): void {
    if (!this.gameState.settings.selectedType) return;
    
    const filteredCases = this.cases.filter(c => c.type === this.gameState.settings.selectedType);
    if (filteredCases.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filteredCases.length);
    this.gameState.currentCase = filteredCases[randomIndex];
  }

  /**
   * Zamanlayıcıyı başlat
   */
  private startTimer(): void {
    this.stopTimer();
    
    this.gameTimer = setInterval(() => {
      if (this.gameState.timeLeft > 0) {
        this.gameState.timeLeft--;
        this.notifyListeners();
      } else {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Zamanlayıcıyı durdur
   */
  private stopTimer(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  /**
   * Oyunu bitir
   */
  private endGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    this.stopTimer();
    this.notifyListeners();
  }

  /**
   * Oyunu sıfırla
   */
  resetGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    this.gameState.score = 0;
    this.gameState.totalQuestions = 0;
    this.gameState.currentCase = null;
    this.gameState.selectedAnswer = null;
    this.gameState.showFeedback = false;
    this.gameState.isCorrect = false;
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.stopTimer();
    this.notifyListeners();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): ZihinDetektifiGameState {
    return { ...this.gameState };
  }

  /**
   * Oyun sonucu metriklerini al
   */
  getGameMetrics() {
    const accuracy = this.gameState.totalQuestions > 0 ? 
      Math.round((this.gameState.score / this.gameState.totalQuestions) * 100) : 0;
    
    return {
      finalScore: this.gameState.score,
      totalQuestions: this.gameState.totalQuestions,
      accuracy: accuracy,
      targetScore: this.gameState.settings.targetScore,
      timeUsed: this.gameState.settings.gameDuration - this.gameState.timeLeft
    };
  }

  /**
   * Dinleyici ekle
   */
  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Dinleyici kaldır
   */
  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Tüm dinleyicileri bilgilendir
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Kaynakları temizle
   */
  destroy(): void {
    this.stopTimer();
    this.listeners = [];
  }
}