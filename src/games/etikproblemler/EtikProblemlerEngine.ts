import { EtikVaka, EtikProblemlerGameState } from '@/types/etikproblemler';

/**
 * Etik Problemler oyunu için oyun motoru
 * Vaka yönetimi ve oyun akışı işlemlerini yönetir
 */
export class EtikProblemlerEngine {
  private vakalar: EtikVaka[] = [];
  private gameState: EtikProblemlerGameState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      currentVaka: null,
      showTartisma: false,
      totalVakalar: 0,
      currentVakaIndex: 0
    };
  }

  /**
   * Vaka dosyasını yükle
   */
  async loadVakalar(): Promise<void> {
    try {
      const response = await fetch('/data/etik_vakalar.json');
      if (!response.ok) {
        throw new Error('Vaka dosyası yüklenemedi');
      }
      this.vakalar = await response.json();
      this.gameState.totalVakalar = this.vakalar.length;
    } catch (error) {
      console.error('Vakalar yüklenirken hata:', error);
    }
  }

  /**
   * Rastgele bir vaka seç
   */
  getRandomVaka(): void {
    if (this.vakalar.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * this.vakalar.length);
    this.gameState.currentVaka = this.vakalar[randomIndex];
    this.gameState.currentVakaIndex = randomIndex;
    this.gameState.showTartisma = false;
    this.notifyListeners();
  }

  /**
   * Tartışmayı göster/gizle
   */
  toggleTartisma(): void {
    this.gameState.showTartisma = !this.gameState.showTartisma;
    this.notifyListeners();
  }

  /**
   * Oyunu başlat
   */
  startGame(): void {
    if (this.vakalar.length === 0) {
      throw new Error('Vakalar henüz yüklenmedi');
    }
    
    this.getRandomVaka();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): EtikProblemlerGameState {
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