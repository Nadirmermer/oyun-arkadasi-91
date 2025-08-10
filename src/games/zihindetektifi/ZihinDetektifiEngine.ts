import { ZihinDetektifiCase, ZihinDetektifiSettings, ZihinDetektifiGameState, ZihinDetektifiAction } from '@/types/zihindetektifi';
import { saveGameRecord, GameRecord } from '@/lib/storage';

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
        selectedTypes: [],
        gameDuration: 180, // 3 dakika
        targetScore: 80
      },
      isPlaying: false,
      isPaused: false,
      timeLeft: 180,
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
    if (this.cases.length === 0 || this.gameState.settings.selectedTypes.length === 0) {
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
      // Temel puan: 10
      // Süre bonusu: Kalan sürenin 10'da 1'i kadar bonus (max 30 saniye bonus = 3 puan)
      const baseScore = 10;
      const timeBonus = Math.min(Math.floor(this.gameState.timeLeft / 10), 3);
      this.gameState.score += baseScore + timeBonus;
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
    if (this.gameState.settings.selectedTypes.length === 0) return;
    
    const filteredCases = this.cases.filter(c => 
      this.gameState.settings.selectedTypes.includes(c.type)
    );
    if (filteredCases.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filteredCases.length);
    const selectedCase = filteredCases[randomIndex];
    
    // Seçenekleri karıştır
    const shuffledOptions = this.shuffleOptions(selectedCase.options, selectedCase.correct_answer);
    
    // Karıştırılmış seçeneklerle yeni bir vaka objesi oluştur
    this.gameState.currentCase = {
      ...selectedCase,
      options: shuffledOptions
    };
  }

  /**
   * Seçenekleri rastgele karıştır (doğru cevabı takip et)
   */
  private shuffleOptions(options: string[], correctAnswer: string): string[] {
    // Doğru cevabı options array'inden çıkar
    const otherOptions = options.filter(option => option !== correctAnswer);
    
    // Diğer seçenekleri karıştır
    const shuffledOthers = this.fisherYatesShuffle([...otherOptions]);
    
    // Rastgele bir pozisyona doğru cevabı yerleştir
    const insertPosition = Math.floor(Math.random() * (shuffledOthers.length + 1));
    shuffledOthers.splice(insertPosition, 0, correctAnswer);
    
    return shuffledOthers;
  }

  /**
   * Fisher-Yates shuffle algoritması ile array'i karıştır
   */
  private fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
    this.saveGameResult();
    this.notifyListeners();
  }

  /**
   * Oyun sonucunu kaydet
   */
  private saveGameResult(): void {
    try {
      const metrics = this.getGameMetrics();
      const gameRecord: GameRecord = {
        id: `zihindetektifi_${Date.now()}`,
        gameType: 'ZihinDetektifi',
        gameDate: new Date().toISOString(),
        results: [{
          name: 'Oyuncu',
          score: `${metrics.finalScore} puan (${metrics.totalQuestions} soru)`
        }]
      };
      
      saveGameRecord(gameRecord);
    } catch (error) {
      console.error('Oyun sonucu kaydedilemedi:', error);
    }
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