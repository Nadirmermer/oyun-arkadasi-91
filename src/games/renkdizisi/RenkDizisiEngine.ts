/**
 * Renk Dizisi Takibi Oyun Motoru
 * Görsel hafızaya dayalı tek kişilik oyun
 */

import { Color, RenkDizisiState, RenkDizisiSettings } from '@/types/renkdizisi';

export class RenkDizisiEngine {
  private state: RenkDizisiState;
  private settings: RenkDizisiSettings;
  private onStateChange?: () => void;
  private showSequenceTimeout?: NodeJS.Timeout;
  private activeTimeouts: NodeJS.Timeout[] = []; // Tüm timeout'ları takip et

  constructor() {
    this.state = this.getInitialState();
    this.settings = {
      showDuration: 800,
      pauseDuration: 200
    };
  }

  private getInitialState(): RenkDizisiState {
    return {
      level: 1,
      sequence: [],
      userSequence: [],
      currentShowingIndex: -1,
      isShowing: false,
      isUserTurn: false,
      isGameOver: false,
      isLevelComplete: false,
      score: 0,
      highestScore: 0,
      lives: 3,        // Başlangıçta 3 can
      maxLives: 3,     // Maksimum 3 can
      isPaused: false  // Başlangıçta duraklatma yok
    };
  }

  /**
   * Durum değişikliği dinleyicisi
   */
  setOnStateChange(callback: () => void) {
    this.onStateChange = callback;
  }

  /**
   * Durum değişikliğini bildir
   */
  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  /**
   * Mevcut oyun durumunu döndür
   */
  getGameState(): RenkDizisiState {
    return { ...this.state };
  }

  /**
   * Oyunu başlat - Can sistemi ile
   */
  startGame() {
    this.state = this.getInitialState();
    this.state.maxLives = 3;
    this.state.lives = 3;
    this.generateSequence();
    this.showSequence();
    this.notifyStateChange();
  }

  /**
   * Seviye için rastgele renk dizisi oluştur
   */
  private generateSequence() {
    const colors: Color[] = ['blue', 'green', 'red', 'yellow'];
    const sequenceLength = this.state.level + 2;
    this.state.sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      this.state.sequence.push(colors[randomIndex]);
    }
    
    this.state.userSequence = [];
  }

  /**
   * Diziyi kullanıcıya göster
   */
  private showSequence() {
    this.state.isShowing = true;
    this.state.isUserTurn = false;
    this.state.currentShowingIndex = -1;
    this.notifyStateChange();

    this.showNextColor(0);
  }

  /**
   * Sıradaki rengi göster - Timeout takip sistemi ile
   */
  private showNextColor(index: number) {
    if (index >= this.state.sequence.length) {
      // Dizi gösterimi tamamlandı
      this.state.isShowing = false;
      this.state.isUserTurn = true;
      this.state.currentShowingIndex = -1;
      this.notifyStateChange();
      return;
    }

    // Rengi göster
    this.state.currentShowingIndex = index;
    this.notifyStateChange();

    // Belirtilen süre sonra söndür ve bir sonrakine geç
    const timeout1 = setTimeout(() => {
      this.state.currentShowingIndex = -1;
      this.notifyStateChange();

      // Kısa bir duraklama sonra bir sonraki rengi göster
      const timeout2 = setTimeout(() => {
        this.showNextColor(index + 1);
      }, this.settings.pauseDuration);
      
      this.activeTimeouts.push(timeout2);
    }, this.settings.showDuration);
    
    this.activeTimeouts.push(timeout1);
  }

  /**
   * Kullanıcı renk seçimi - Can sistemi ile
   */
  selectColor(color: Color) {
    if (!this.state.isUserTurn || this.state.isGameOver || this.state.isPaused) {
      return;
    }

    const currentIndex = this.state.userSequence.length;
    const expectedColor = this.state.sequence[currentIndex];

    if (color === expectedColor) {
      // Doğru seçim
      this.state.userSequence.push(color);

      // Seviye tamamlandı mı?
      if (this.state.userSequence.length === this.state.sequence.length) {
        this.state.isLevelComplete = true;
        this.state.isUserTurn = false;
        this.state.score = this.state.level + 1; // Seviye tamamlandığında skor artır
        
        if (this.state.score > this.state.highestScore) {
          this.state.highestScore = this.state.score;
        }
      }
    } else {
      // Yanlış seçim - Can azalt
      this.state.lives--;
      
      if (this.state.lives <= 0) {
        // Canlar bittiyse oyun biter
        this.state.isGameOver = true;
        this.state.isUserTurn = false;
      } else {
        // Can kaldıysa aynı seviyeyi tekrar göster
        this.state.userSequence = [];
        this.showSequence();
      }
    }

    this.notifyStateChange();
  }

  /**
   * Sonraki seviyeye geç
   */
  nextLevel() {
    if (!this.state.isLevelComplete) {
      return;
    }

    this.state.level++;
    this.state.isLevelComplete = false;
    this.generateSequence();
    this.showSequence();
    this.notifyStateChange();
  }

  /**
   * Oyunu yeniden başlat - Bellek temizliği ile
   */
  resetGame() {
    this.clearAllTimeouts();
    this.state = this.getInitialState();
    this.notifyStateChange();
  }

  /**
   * Tüm timeout'ları temizle - Bellek sızıntısını önle
   */
  private clearAllTimeouts() {
    // Aktif timeout'ları temizle
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeTimeouts = [];
    
    // Eski showSequenceTimeout'u da temizle
    if (this.showSequenceTimeout) {
      clearTimeout(this.showSequenceTimeout);
      this.showSequenceTimeout = undefined;
    }
  }

  /**
   * Motor temizliği - Component unmount'ta çağrılacak
   */
  destroy() {
    this.clearAllTimeouts();
    this.onStateChange = undefined;
  }

  /**
   * Oyunu duraklat/devam ettir - Merkezileştirilmiş durum yönetimi
   */
  togglePause() {
    if (this.state.isGameOver || this.state.isLevelComplete || this.state.isShowing) {
      return; // Bu durumlarda duraklatamazsın
    }
    
    this.state.isPaused = !this.state.isPaused;
    this.notifyStateChange();
  }

  /**
   * Hangi rengin aktif olarak gösterildiğini kontrol et
   */
  isColorActive(color: Color): boolean {
    if (!this.state.isShowing || this.state.currentShowingIndex === -1) {
      return false;
    }
    
    return this.state.sequence[this.state.currentShowingIndex] === color;
  }

  /**
   * Oyun metrikleri - GameResultScreen için
   */
  getGameMetrics() {
    return {
      finalLevel: this.state.highestScore,
      remainingLives: this.state.lives,
      maxLives: this.state.maxLives,
      level: this.state.level
    };
  }
}