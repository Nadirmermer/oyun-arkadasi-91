/**
 * Bil Bakalım oyunu türleri
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
  correctAnswers: number;
  currentQuestion: BilBakalimSoru | null;
  shuffledOptions: Array<{ metin: string; dogruMu: boolean; originalIndex: number }>;
  selectedAnswer: number | null;
  showResult: boolean;
}