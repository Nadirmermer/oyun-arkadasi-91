import { 
  IkiDogruBirYalanSoru, 
  IkiDogruBirYalanSettings, 
  IkiDogruBirYalanGameState,
  IkiDogruBirYalanAction 
} from '@/types/ikidogrubiryalan';

/**
 * İki Doğru Bir Yalan oyunu için oyun motoru
 * Soru yönetimi, oyun akışı ve durum kontrolü işlemlerini yönetir
 * 
 * Oyun Döngüsü:
 * 1. 10 soruluk oturum sistemi
 * 2. Net başlangıç, ilerleme ve bitiş koşulları
 * 3. Tekrar oynanabilirlik için soru karıştırma
 */
export class IkiDogruBirYalanEngine {
  private sorular: IkiDogruBirYalanSoru[] = []; // Ana soru havuzu
  private sessionQuestions: IkiDogruBirYalanSoru[] = []; // Bu oturum için seçilen sorular
  private gameState: IkiDogruBirYalanGameState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.gameState = {
      currentSoru: null,
      isPlaying: false,
      isFinished: false,
      selectedAnswer: null,
      showAnswer: false,
      totalAnswered: 0,
      correctAnswers: 0,
      totalQuestionsInSession: 10, // Varsayılan oturum uzunluğu
      currentQuestionNumber: 1
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
   * Yeni oturum sistemi:
   * 1. Ana soru havuzunu karıştır
   * 2. İlk 10 soruyu seç
   * 3. Oyun durumunu başlat
   */
  startGame(customSettings?: IkiDogruBirYalanSettings): void {
    if (this.sorular.length === 0) {
      throw new Error('Sorular henüz yüklenmedi');
    }

    // Özel ayarları uygula
    const sessionLength = customSettings?.questionLimit || 10;

    this.resetGame();
    
    // Ana soru havuzunu karıştır (tekrar oynanabilirlik için)
    const shuffledQuestions = [...this.sorular].sort(() => Math.random() - 0.5);
    
    // Bu oturum için ilk N soruyu seç
    this.sessionQuestions = shuffledQuestions.slice(0, Math.min(sessionLength, shuffledQuestions.length));
    
    // Oyun durumunu başlat
    this.gameState.isPlaying = true;
    this.gameState.isFinished = false;
    this.gameState.totalQuestionsInSession = this.sessionQuestions.length;
    this.gameState.currentQuestionNumber = 1;
    
    console.log(`🎮 İki Doğru Bir Yalan oturumu başladı: ${this.sessionQuestions.length} soru`);
    
    this.nextQuestion();
    this.notifyListeners();
  }

  /**
   * Oyuncu cevabını işle
   * Yeni döngü sistemi ile iyileştirildi
   */
  handleAction(action: IkiDogruBirYalanAction, selectedIndex?: number): void {
    if (!this.gameState.isPlaying || this.gameState.isFinished) {
      return;
    }

    switch (action) {
      case 'select-answer':
        if (selectedIndex !== undefined && !this.gameState.showAnswer) {
          this.gameState.selectedAnswer = selectedIndex;
          this.gameState.showAnswer = true;
          
          // Doğru cevap kontrolü (yalan bulma oyunu - yalanı bulmak doğru)
          const correctAnswer = this.gameState.currentSoru?.ifadeler[selectedIndex];
          if (correctAnswer && !correctAnswer.dogruMu) {
            this.gameState.correctAnswers++;
          }
          this.gameState.totalAnswered++;
        }
        break;
      
      case 'next-question':
        // Sıradaki soruya geç veya oyunu bitir
        this.gameState.currentQuestionNumber++;
        
        if (this.gameState.currentQuestionNumber > this.gameState.totalQuestionsInSession) {
          this.endGame();
        } else {
          this.nextQuestion();
        }
        break;
        
      case 'restart':
        this.startGame();
        break;
    }

    this.notifyListeners();
  }

  /**
   * Oturumdaki sıradaki soruyu göster
   * Artık rastgele seçim değil, oturum sırası takip ediliyor
   */
  private nextQuestion(): void {
    if (this.sessionQuestions.length === 0) return;
    
    // Mevcut soru numarasına göre soruyu al (1-based index)
    const questionIndex = this.gameState.currentQuestionNumber - 1;
    
    if (questionIndex < this.sessionQuestions.length) {
      this.gameState.currentSoru = this.sessionQuestions[questionIndex];
      this.gameState.selectedAnswer = null;
      this.gameState.showAnswer = false;
      
      console.log(`📝 Soru ${this.gameState.currentQuestionNumber}/${this.gameState.totalQuestionsInSession}: ${this.gameState.currentSoru.konu}`);
    }
  }

  /**
   * Oyunu bitir ve sonuçları hesapla
   * KRITIK: Bu method eksikti ve oyun hiç bitmiyordu!
   */
  private endGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isFinished = true;
    
    // Oyun sonucu hesaplama (StandardGameResult hazırlığı)
    const accuracy = this.gameState.totalAnswered > 0 
      ? Math.round((this.gameState.correctAnswers / this.gameState.totalAnswered) * 100)
      : 0;
    
    const wrongAnswers = this.gameState.totalAnswered - this.gameState.correctAnswers;
    
    console.log(`🏁 İki Doğru Bir Yalan oturumu tamamlandı!`);
    console.log(`📊 SONUÇLAR:`);
    console.log(`   • Toplam Soru: ${this.gameState.totalQuestionsInSession}`);
    console.log(`   • Cevaplanan: ${this.gameState.totalAnswered}`);
    console.log(`   • Doğru (Yalan Bulma): ${this.gameState.correctAnswers}`);
    console.log(`   • Yanlış: ${wrongAnswers}`);
    console.log(`   • Doğruluk Oranı: %${accuracy}`);
    console.log(`   • Performans: ${this.getPerformanceLevel(accuracy)}`);
    
    this.notifyListeners();
  }

  /**
   * Performans seviyesi hesapla (StandardGameResult hazırlığı)
   */
  private getPerformanceLevel(accuracy: number): string {
    if (accuracy >= 90) return 'Mükemmel - Yalan Dedektifi! 🕵️';
    if (accuracy >= 75) return 'Çok İyi - İyi Sezgilerin Var! 👍';
    if (accuracy >= 60) return 'İyi - Gelişiyor! 📈';
    if (accuracy >= 40) return 'Orta - Pratik Gerekli 💪';
    return 'Başlangıç - Devam Et! 🎯';
  }

  /**
   * Oyunu sıfırla
   * Yeni alanlar da dahil olmak üzere tam sıfırlama
   */
  resetGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isFinished = false;
    this.gameState.currentSoru = null;
    this.gameState.selectedAnswer = null;
    this.gameState.showAnswer = false;
    this.gameState.totalAnswered = 0;
    this.gameState.correctAnswers = 0;
    this.gameState.currentQuestionNumber = 1;
    this.gameState.totalQuestionsInSession = 10;
    
    // Oturum sorularını temizle
    this.sessionQuestions = [];
    
    this.notifyListeners();
  }

  /**
   * Mevcut oyun durumunu al
   */
  getGameState(): IkiDogruBirYalanGameState {
    return { ...this.gameState };
  }

  /**
   * Oyun bitmiş mi kontrolü
   */
  isGameFinished(): boolean {
    return this.gameState.isFinished;
  }

  /**
   * Oyun sonucu metrikleri (StandardGameResult hazırlığı)
   */
  getGameMetrics() {
    const accuracy = this.gameState.totalAnswered > 0 
      ? Math.round((this.gameState.correctAnswers / this.gameState.totalAnswered) * 100)
      : 0;
    
    return {
      totalQuestions: this.gameState.totalQuestionsInSession,
      totalAnswered: this.gameState.totalAnswered,
      correctAnswers: this.gameState.correctAnswers,
      wrongAnswers: this.gameState.totalAnswered - this.gameState.correctAnswers,
      accuracy: accuracy,
      performanceLevel: this.getPerformanceLevel(accuracy)
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
    this.listeners = [];
  }
}