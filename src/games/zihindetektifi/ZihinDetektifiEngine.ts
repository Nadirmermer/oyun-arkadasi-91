import { ZihinDetektifiCase, ZihinDetektifiSettings, ZihinDetektifiGameState, ZihinDetektifiAction } from '@/types/zihindetektifi';
import { saveGameRecord, GameRecord } from '@/lib/storage';

export class ZihinDetektifiEngine {
  private gameState: ZihinDetektifiGameState;
  private cases: ZihinDetektifiCase[] = [];
  private isLoading = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      status: 'idle',
      currentCase: null,
      score: 0,
      totalQuestions: 0,
      answeredQuestions: 0,
      settings: {
        selectedTypes: ['savunma_mekanizmasi', 'bilissel_carpitma', 'uyumsuz_sema'],
        questionCount: 10,
        timeLimit: 60
      }
    };
  }

  /**
   * Oyun verilerini yükle
   */
  async loadGameData(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Seçili kategorilerden veri yükle
      const promises = this.gameState.settings.selectedTypes.map(type => 
        this.loadCategoryData(type)
      );
      
      const categoryResults = await Promise.all(promises);
      this.cases = categoryResults.flat();
      
      console.log(`Zihin Detektifi: ${this.cases.length} vaka yüklendi`);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      this.cases = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Belirli bir kategoriden veri yükle
   */
  private async loadCategoryData(type: string): Promise<ZihinDetektifiCase[]> {
    try {
      const response = await fetch(`/data/zihindetektifi/${type}.json`);
      
      if (!response.ok) {
        throw new Error(`${type} kategorisi yüklenemedi`);
      }
      
      const data = await response.json();
      
      // Eğer data bir array ise direkt kullan, object ise cases property'sini al
      if (Array.isArray(data)) {
        return data;
      } else if (data.cases && Array.isArray(data.cases)) {
        return data.cases;
      } else {
        console.warn(`${type} kategorisi beklenmeyen formatta:`, data);
        return [];
      }
    } catch (error) {
      console.error(`${type} kategorisi yükleme hatası:`, error);
      return [];
    }
  }

  /**
   * Oyunu başlat
   */
  async startGame(): Promise<void> {
    if (this.cases.length === 0) {
      await this.loadGameData();
    }
    
    if (this.cases.length === 0) {
      throw new Error('Oyun verisi yüklenemedi');
    }

    this.gameState.status = 'playing';
    this.gameState.score = 0;
    this.gameState.totalQuestions = Math.min(
      this.gameState.settings.questionCount,
      this.cases.length
    );
    this.gameState.answeredQuestions = 0;
    
    this.nextCase();
    this.notifyListeners();
  }

  /**
   * Cevap seç
   */
  selectAnswer(answer: string): void {
    if (this.gameState.status !== 'playing') return;

    const isCorrect = answer === this.gameState.currentCase?.correct_answer;
    
    if (isCorrect) {
      this.gameState.score += 10;
    }
    
    this.gameState.answeredQuestions++;
    
    // Oyun bitti mi kontrol et
    if (this.gameState.answeredQuestions >= this.gameState.totalQuestions) {
      this.endGame();
    } else {
      this.nextCase();
    }
    
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
    
    // Doğru cevabı rastgele bir pozisyona yerleştir
    const insertPosition = Math.floor(Math.random() * (shuffledOthers.length + 1));
    shuffledOthers.splice(insertPosition, 0, correctAnswer);
    
    return shuffledOthers;
  }

  /**
   * Fisher-Yates shuffle algoritması
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
   * Oyunu bitir
   */
  private endGame(): void {
    this.gameState.status = 'finished';
    this.saveGameResult();
    this.notifyListeners();
  }

  /**
   * Oyun sonucunu kaydet
   */
  private saveGameResult(): void {
         const record: GameRecord = {
       id: `zihindetektifi_${Date.now()}`,
       gameType: 'ZihinDetektifi',
       gameDate: new Date().toISOString(),
       results: [{
         name: 'Oyuncu',
         score: this.gameState.score
       }],
       winner: this.gameState.score > 0 ? 'Oyuncu' : undefined
     };
    
    saveGameRecord(record);
  }

  /**
   * Oyunu sıfırla
   */
  resetGame(): void {
    this.gameState.status = 'idle';
    this.gameState.currentCase = null;
    this.gameState.score = 0;
    this.gameState.totalQuestions = 0;
    this.gameState.answeredQuestions = 0;
    this.notifyListeners();
  }

  /**
   * Oyun durumunu al
   */
  getGameState(): ZihinDetektifiGameState {
    return { ...this.gameState };
  }

  /**
   * Oyun metriklerini al
   */
  getGameMetrics() {
    return {
      score: this.gameState.score,
      totalQuestions: this.gameState.totalQuestions,
      answeredQuestions: this.gameState.answeredQuestions,
      remainingQuestions: this.gameState.totalQuestions - this.gameState.answeredQuestions,
      progress: this.gameState.totalQuestions > 0 ? (this.gameState.answeredQuestions / this.gameState.totalQuestions) * 100 : 0
    };
  }

  /**
   * Ayarları güncelle
   */
  updateSettings(settings: Partial<ZihinDetektifiSettings>): void {
    this.gameState.settings = { ...this.gameState.settings, ...settings };
    this.notifyListeners();
  }

  /**
   * Listener ekle
   */
  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Listener kaldır
   */
  removeListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Tüm listener'ları bilgilendir
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Engine'i temizle
   */
  destroy(): void {
    this.listeners = [];
    this.cases = [];
  }
}