/**
 * Bil Bakalım Oyun Motoru
 * Psikoloji konulu çoktan seçmeli sorular oyunu
 */

export interface BilBakalimSoru {
  id: string;
  kategori: string;
  soru: string;
  secenekler: {
    metin: string;
    dogruMu: boolean;
  }[];
}

export interface BilBakalimGameState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  isFinished: boolean;
  isPaused: boolean;
  correctAnswers: number;
  currentQuestion: BilBakalimSoru | null;
  shuffledOptions: Array<{ metin: string; dogruMu: boolean; originalIndex: number }>;
  selectedAnswer: number | null;
  showResult: boolean;
  timeLeft: number;
  questionDuration: number;
}

export class BilBakalimEngine {
  private questions: BilBakalimSoru[] = [];
  private timer: NodeJS.Timeout | null = null;
  private gameState: BilBakalimGameState = {
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 10,
    isPlaying: false,
    isFinished: false,
    isPaused: false,
    correctAnswers: 0,
    currentQuestion: null,
    shuffledOptions: [],
    selectedAnswer: null,
    showResult: false,
    timeLeft: 15, // 15 saniye per soru
    questionDuration: 15
  };

  /**
   * Soruları yükle
   */
  async loadQuestions(): Promise<void> {
    try {
      const response = await fetch('/data/bilbakalim_sorular.json');
      if (!response.ok) {
        throw new Error('Sorular yüklenemedi');
      }
      this.questions = await response.json();
    } catch (error) {
      console.error('Sorular yüklenirken hata:', error);
      this.questions = [];
    }
  }

  /**
   * Oyunu başlat
   */
  startGame(): void {
    if (this.questions.length === 0) {
      console.error('Sorular yüklenmedi!');
      return;
    }

    // Soruları karıştır ve ilk 10'unu al
    const shuffledQuestions = [...this.questions].sort(() => Math.random() - 0.5);
    this.questions = shuffledQuestions.slice(0, this.gameState.totalQuestions);

    this.gameState = {
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: this.gameState.totalQuestions,
      isPlaying: true,
      isFinished: false,
      isPaused: false,
      correctAnswers: 0,
      currentQuestion: null,
      shuffledOptions: [],
      selectedAnswer: null,
      showResult: false,
      timeLeft: this.gameState.questionDuration,
      questionDuration: this.gameState.questionDuration
    };

    this.loadCurrentQuestion();
    this.startTimer();
  }

  /**
   * Mevcut soruyu yükle
   */
  private loadCurrentQuestion(): void {
    if (this.gameState.currentQuestionIndex >= this.questions.length) {
      this.endGame();
      return;
    }

    const question = this.questions[this.gameState.currentQuestionIndex];
    this.gameState.currentQuestion = question;

    // Seçenekleri karıştır
    const shuffledOptions = question.secenekler.map((option, index) => ({
      ...option,
      originalIndex: index
    })).sort(() => Math.random() - 0.5);

    this.gameState.shuffledOptions = shuffledOptions;
    this.gameState.selectedAnswer = null;
    this.gameState.showResult = false;
    this.gameState.timeLeft = this.gameState.questionDuration; // Her soruda süreyi resetle
  }

  /**
   * Cevap seç
   */
  selectAnswer(optionIndex: number): void {
    if (!this.gameState.isPlaying || this.gameState.showResult) {
      return;
    }

    this.gameState.selectedAnswer = optionIndex;
    this.gameState.showResult = true;

    const selectedOption = this.gameState.shuffledOptions[optionIndex];
    if (selectedOption.dogruMu) {
      // Doğru cevap 5 puan + kalan süre kadar bonus puan
      this.gameState.score += 5 + this.gameState.timeLeft;
      this.gameState.correctAnswers++;
    }

    // 2 saniye sonra sonraki soruya geç
    setTimeout(() => {
      this.nextQuestion();
    }, 2000);
  }

  /**
   * Sonraki soruya geç
   */
  private nextQuestion(): void {
    this.gameState.currentQuestionIndex++;
    this.loadCurrentQuestion();
  }

  /**
   * Oyunu bitir
   */
  private endGame(): void {
    this.stopTimer();
    this.gameState.isPlaying = false;
    this.gameState.isFinished = true;
  }

  /**
   * Timer başlat
   */
  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.gameState.isPlaying && !this.gameState.isPaused) {
        this.gameState.timeLeft--;
        
        if (this.gameState.timeLeft <= 0) {
          // Süre bitince sonraki soruya geç
          this.nextQuestion();
        }
      }
    }, 1000);
  }

  /**
   * Timer durdur
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Oyunu duraklatır/devam ettirir
   */
  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  /**
   * Oyunu resetle
   */
  resetGame(): void {
    this.stopTimer();
    this.gameState = {
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 10,
      isPlaying: false,
      isFinished: false,
      isPaused: false,
      correctAnswers: 0,
      currentQuestion: null,
      shuffledOptions: [],
      selectedAnswer: null,
      showResult: false,
      timeLeft: 15,
      questionDuration: 15
    };
  }

  /**
   * Oyun durumunu al
   */
  getGameState(): BilBakalimGameState {
    return { ...this.gameState };
  }

  /**
   * Sorular yüklenmiş mi?
   */
  isLoaded(): boolean {
    return this.questions.length > 0;
  }
}