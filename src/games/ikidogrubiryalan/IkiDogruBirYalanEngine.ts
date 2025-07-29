import { 
  IkiDogruBirYalanSoru, 
  IkiDogruBirYalanSettings, 
  IkiDogruBirYalanGameState,
  IkiDogruBirYalanAction 
} from '@/types/ikidogrubiryalan';

/**
 * İki Doğru Bir Yalan oyunu için oyun motoru
 * Soru yönetimi, oyun akışı ve durum kontrolü işlemlerini yönetir
 */
export class IkiDogruBirYalanEngine {
  private sorular: IkiDogruBirYalanSoru[] = [];
  private gameState: IkiDogruBirYalanGameState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      currentSoru: null,
      isPlaying: false,
      selectedAnswer: null,
      showAnswer: false,
      totalAnswered: 0,
      correctAnswers: 0
    };
  }

  /**
   * Soru dosyasını yükle
   */
  async loadQuestions(): Promise<void> {
    try {
      const response = await fetch('/data/ikidogrubiryalan_data_tr.json');
      if (!response.ok) {
        throw new Error('Soru dosyası yüklenemedi');
      }
      this.sorular = await response.json();
      // Sorular başarıyla yüklendi
    } catch (error) {
      console.error('Sorular yüklenirken hata:', error);
    }
  }

  /**
   * Oyunu başlat
   */
  startGame(): void {
    if (this.sorular.length === 0) {
      throw new Error('Sorular henüz yüklenmedi');
    }

    this.resetGame();
    this.gameState.isPlaying = true;
    this.nextQuestion();
    this.notifyListeners();
  }

  /**
   * Oyuncu cevabını işle
   */
  handleAction(action: IkiDogruBirYalanAction, selectedIndex?: number): void {
    if (!this.gameState.isPlaying) {
      return;
    }

    switch (action) {
      case 'select-answer':
        if (selectedIndex !== undefined && !this.gameState.showAnswer) {
          this.gameState.selectedAnswer = selectedIndex;
          this.gameState.showAnswer = true;
          
          // Doğru cevap kontrolü
          const correctAnswer = this.gameState.currentSoru?.ifadeler[selectedIndex];
          if (correctAnswer && !correctAnswer.dogruMu) {
            this.gameState.correctAnswers++;
          }
          this.gameState.totalAnswered++;
        }
        break;
      
      case 'next-question':
        this.nextQuestion();
        break;
        
      case 'restart':
        this.startGame();
        break;
    }

    this.notifyListeners();
  }

  /**
   * Rastgele bir sonraki soruyu seç
   */
  private nextQuestion(): void {
    if (this.sorular.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * this.sorular.length);
    this.gameState.currentSoru = this.sorular[randomIndex];
    this.gameState.selectedAnswer = null;
    this.gameState.showAnswer = false;
  }

  /**
   * Oyunu sıfırla
   */
  resetGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.currentSoru = null;
    this.gameState.selectedAnswer = null;
    this.gameState.showAnswer = false;
    this.gameState.totalAnswered = 0;
    this.gameState.correctAnswers = 0;
    this.notifyListeners();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): IkiDogruBirYalanGameState {
    return { ...this.gameState };
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
    this.listeners = [];
  }
}