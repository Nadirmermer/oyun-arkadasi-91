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
      highestScore: 0
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
   * Oyunu başlat
   */
  startGame() {
    this.state = this.getInitialState();
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
   * Sıradaki rengi göster
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
    this.showSequenceTimeout = setTimeout(() => {
      this.state.currentShowingIndex = -1;
      this.notifyStateChange();

      // Kısa bir duraklama sonra bir sonraki rengi göster
      this.showSequenceTimeout = setTimeout(() => {
        this.showNextColor(index + 1);
      }, this.settings.pauseDuration);
    }, this.settings.showDuration);
  }

  /**
   * Kullanıcı renk seçimi
   */
  selectColor(color: Color) {
    if (!this.state.isUserTurn || this.state.isGameOver) {
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
      // Yanlış seçim - oyun biter
      this.state.isGameOver = true;
      this.state.isUserTurn = false;
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
   * Oyunu yeniden başlat
   */
  resetGame() {
    if (this.showSequenceTimeout) {
      clearTimeout(this.showSequenceTimeout);
    }
    
    this.state = this.getInitialState();
    this.notifyStateChange();
  }

  /**
   * Oyunu duraklat/devam ettir
   */
  togglePause() {
    // Basit implementasyon - şu an için sadece user turn'u toggle edelim
    if (this.state.isUserTurn) {
      this.state.isUserTurn = false;
    } else if (!this.state.isShowing && !this.state.isGameOver && !this.state.isLevelComplete) {
      this.state.isUserTurn = true;
    }
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
}