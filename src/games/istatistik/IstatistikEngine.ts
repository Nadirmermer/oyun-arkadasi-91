import { 
  IstatistikSoru, 
  IstatistikSettings, 
  IstatistikGameState,
  IstatistikAction,
  IstatistikResult
} from '@/types/istatistik';

/**
 * İstatistik Sezgisi oyunu için oyun motoru
 * Soru yönetimi, puanlama sistemi ve oyun akışı işlemlerini yönetir
 */
export class IstatistikEngine {
  private sorular: IstatistikSoru[] = [];
  private originalSorular: IstatistikSoru[] = []; // Orijinal soru listesi (karıştırılmamış)
  private gameState: IstatistikGameState;
  private listeners: Array<() => void> = [];
  private timer: NodeJS.Timeout | null = null;
  private remainingTime: number = 0; // Kalan süre (saniye)

  constructor() {
    this.gameState = {
      currentSoru: null,
      isPlaying: false,
      isPaused: false,
      isFinished: false,
      playerGuess: null,
      isAnswerRevealed: false,
      currentQuestionIndex: 0,
      totalQuestions: 12, // Varsayılan değer (data dosyasındaki toplam soru sayısı)
      score: 0,
      totalAnswered: 0,
      averageAccuracy: 0,
      settings: {
        gameDuration: 30, // Her soru için 30 saniye
        scoreMultiplier: 1
      }
    };
  }

  /**
   * Soru dosyasını yükle
   */
  async loadQuestions(): Promise<void> {
    try {
      const response = await fetch('/data/istatistik_data_tr.json');
      if (!response.ok) {
        throw new Error('İstatistik soruları yüklenemedi');
      }
      this.sorular = await response.json();
      this.originalSorular = [...this.sorular]; // Orijinal listesini de sakla
      
      // Dinamik olarak toplam soru sayısını güncelle
      this.gameState.totalQuestions = this.sorular.length;
      
      console.log(`${this.sorular.length} İstatistik sorusu yüklendi`);
    } catch (error) {
      console.error('İstatistik soruları yüklenirken hata:', error);
      this.sorular = [];
      this.originalSorular = [];
    }
  }

  /**
   * Oyunu başlat
   */
  startGame(customSettings?: IstatistikSettings): void {
    if (this.sorular.length === 0) {
      throw new Error('Sorular henüz yüklenmedi');
    }

    // Özel ayarları uygula
    if (customSettings) {
      this.gameState.settings = { ...this.gameState.settings, ...customSettings };
    }

    this.resetGame();
    this.gameState.isPlaying = true;
    
    // Orijinal soru listesini koru
    this.originalSorular = [...this.sorular];
    
    // Tüm soruları kullan, rastgele sırala (orijinali bozmadan)
    this.gameState.totalQuestions = this.sorular.length;
    const shuffledQuestions = [...this.sorular].sort(() => Math.random() - 0.5);
    this.sorular = shuffledQuestions;

    this.nextQuestion();
    this.notifyListeners();
  }

  /**
   * Sonraki soruya geç
   */
  private nextQuestion(): void {
    if (this.gameState.currentQuestionIndex >= this.sorular.length) {
      this.endGame();
      return;
    }

    const currentQuestion = this.sorular[this.gameState.currentQuestionIndex];
    this.gameState.currentSoru = currentQuestion;
    this.gameState.playerGuess = null;
    this.gameState.isAnswerRevealed = false;

    // Zamanlayıcı başlat
    this.startTimer();

    this.notifyListeners();
  }

  /**
   * Zamanlayıcıyı başlat
   */
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.remainingTime = this.gameState.settings.gameDuration || 30;
    
    this.timer = setInterval(() => {
      this.remainingTime--;
      
      if (this.remainingTime <= 0) {
        this.handleTimeUp();
      }
      
      this.notifyListeners();
    }, 1000);
  }

  /**
   * Süre dolduğunda çağrılır
   */
  private handleTimeUp(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (!this.gameState.isAnswerRevealed && this.gameState.currentSoru) {
      // Otomatik olarak orta değeri tahmin et
      const midPoint = Math.round((this.gameState.currentSoru.min + this.gameState.currentSoru.max) / 2);
      this.submitGuess(midPoint);
    }
  }

  /**
   * Kalan süreyi al
   */
  getRemainingTime(): number {
    return this.remainingTime;
  }

  /**
   * Oyuncunun tahminini işle
   */
  submitGuess(guess: number): IstatistikResult {
    if (!this.gameState.currentSoru || this.gameState.isAnswerRevealed) {
      throw new Error('Geçersiz oyun durumu');
    }

    // Zamanlayıcıyı durdur
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.gameState.playerGuess = guess;
    this.gameState.isAnswerRevealed = true;
    this.gameState.totalAnswered++;

    const correctAnswer = this.gameState.currentSoru.answer;
    const accuracy = this.calculateAccuracy(guess, correctAnswer);
    const points = this.calculatePoints(accuracy);

    this.gameState.score += points;
    this.updateAverageAccuracy(accuracy);

    const result: IstatistikResult = {
      playerGuess: guess,
      correctAnswer,
      accuracy,
      points,
      explanation: this.gameState.currentSoru.explanation,
      source: this.gameState.currentSoru.source,
      link: this.gameState.currentSoru.link // Kaynağa ulaş özelliği için link bilgisi
    };

    this.notifyListeners();
    return result;
  }

  /**
   * Doğruluk oranını hesapla (0-100 arası) - Dinamik aralık desteği
   */
  private calculateAccuracy(guess: number, correct: number): number {
    if (!this.gameState.currentSoru) return 0;
    
    const { min, max } = this.gameState.currentSoru;
    const range = max - min;
    
    if (range === 0) {
      return guess === correct ? 100 : 0;
    }
    
    const error = Math.abs(correct - guess);
    const accuracy = Math.max(0, 100 - (error / range) * 100);
    return Math.round(accuracy);
  }

  /**
   * Doğruluk oranına göre puan hesapla
   */
  private calculatePoints(accuracy: number): number {
    const basePoints = Math.round((accuracy / 100) * 100); // 0-100 arası
    const multiplier = this.gameState.settings.scoreMultiplier || 1;
    return Math.round(basePoints * multiplier);
  }

  /**
   * Ortalama doğruluk oranını güncelle
   */
  private updateAverageAccuracy(newAccuracy: number): void {
    const total = this.gameState.averageAccuracy * (this.gameState.totalAnswered - 1) + newAccuracy;
    this.gameState.averageAccuracy = Math.round(total / this.gameState.totalAnswered);
  }

  /**
   * Sonraki soruya geç (oyuncu aksiyonu)
   */
  handleAction(action: IstatistikAction): void {
    switch (action) {
      case 'next-question':
        this.gameState.currentQuestionIndex++;
        this.nextQuestion();
        break;
      
      case 'pause':
        this.gameState.isPaused = true;
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        break;
      
      case 'resume':
        this.gameState.isPaused = false;
        if (!this.gameState.isAnswerRevealed) {
          this.startTimer();
        }
        break;
      
      case 'restart':
        this.startGame();
        break;
      
      case 'end-game':
        this.endGame();
        break;
    }
    
    this.notifyListeners();
  }

  /**
   * Oyunu bitir
   */
  private endGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isFinished = true;
    this.notifyListeners();
  }

  /**
   * Oyunu sıfırla
   */
  resetGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    this.gameState.isFinished = false;
    this.gameState.currentSoru = null;
    this.gameState.playerGuess = null;
    this.gameState.isAnswerRevealed = false;
    this.gameState.currentQuestionIndex = 0;
    this.gameState.score = 0;
    this.gameState.totalAnswered = 0;
    this.gameState.averageAccuracy = 0;
    this.notifyListeners();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): IstatistikGameState {
    return { ...this.gameState };
  }

  /**
   * Sorular yüklenmiş mi?
   */
  isLoaded(): boolean {
    return this.sorular.length > 0;
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
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.listeners = [];
  }
}
