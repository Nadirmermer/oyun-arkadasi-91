import { BenKimimWord, BenKimimSettings, BenKimimGameState, BenKimimAction } from '@/types/benkimim';
import { saveGameRecord, GameRecord } from '@/lib/storage';

// Global cache for words to avoid reloading
let globalWordsCache: BenKimimWord[] | null = null;

/**
 * Ben Kimim oyunu için oyun motoru
 * Kelime yönetimi, oyun akışı ve skor hesaplama işlemlerini yönetir
 */
export class BenKimimEngine {
  private words: BenKimimWord[] = [];
  private gameState: BenKimimGameState;
  private gameTimer: NodeJS.Timeout | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      currentWord: null,
      settings: {
        gameDuration: 90,
        targetScore: 15,
        controlType: 'buttons'
      },
      isPlaying: false,
      isPaused: false,
      timeLeft: 90,
      score: 0,
      totalWords: 0
    };
  }

  /**
   * Kelime dosyasını yükle
   */
  async loadWords(): Promise<void> {
    try {
      // Eğer kelimeler zaten yüklenmişse tekrar yükleme
      if (this.words.length > 0) {
        return;
      }

      // Global cache'den kontrol et
      if (globalWordsCache && globalWordsCache.length > 0) {
        this.words = globalWordsCache;
        return;
      }

      const response = await fetch('/data/benkimim_words_tr.json');
      if (!response.ok) {
        throw new Error('Kelime dosyası yüklenemedi');
      }
      const words = await response.json();
      
      // Cache'e kaydet
      globalWordsCache = words;
      this.words = words;
      
      // Kelimeler başarıyla yüklendi
    } catch (error) {
      console.error('Kelimeler yüklenirken hata:', error);
      // Hata durumunda boş array kullan
      this.words = [];
    }
  }

  /**
   * Oyun ayarlarını güncelle
   */
  updateSettings(settings: Partial<BenKimimSettings>): void {
    this.gameState.settings = { ...this.gameState.settings, ...settings };
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.notifyListeners();
  }

  /**
   * Oyunu başlat
   */
  startGame(): void {
    // Kelimeler yüklenmemişse bekle
    if (this.words.length === 0) {
      console.warn('Kelimeler henüz yüklenmedi, oyun başlatılamıyor');
      return;
    }

    this.resetGame();
    this.gameState.isPlaying = true;
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.nextWord();
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
   * Oyuncu aksiyonu işle
   */
  handleAction(action: BenKimimAction): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused) {
      return;
    }

    switch (action) {
      case 'correct':
        this.gameState.score++;
        break;
      case 'pass':
        // Pas geçmek skoru etkilemez
        break;
    }

    this.gameState.totalWords++;
    
    // Hedef skora ulaşıldı mı kontrol et
    if (this.gameState.score >= this.gameState.settings.targetScore) {
      this.endGame();
      return;
    }

    this.nextWord();
    this.notifyListeners();
  }

  /**
   * Rastgele bir sonraki kelimeyi seç
   */
  private nextWord(): void {
    if (this.words.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * this.words.length);
    this.gameState.currentWord = this.words[randomIndex];
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
        id: `benkimim_${Date.now()}`,
        gameType: 'BenKimim',
        gameDate: new Date().toISOString(),
        results: [{
          name: 'Oyuncu',
          score: `${metrics.finalScore}/${metrics.totalWords}`
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
    this.gameState.totalWords = 0;
    this.gameState.currentWord = null;
    this.gameState.timeLeft = this.gameState.settings.gameDuration;
    this.stopTimer();
    this.notifyListeners();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): BenKimimGameState {
    return { ...this.gameState };
  }

  /**
   * Oyun sonucu metriklerini al (GameResultScreen için)
   */
  getGameMetrics() {
    const accuracy = this.gameState.totalWords > 0 ? 
      Math.round((this.gameState.score / this.gameState.totalWords) * 100) : 0;
    
    return {
      finalScore: this.gameState.score,
      totalWords: this.gameState.totalWords,
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