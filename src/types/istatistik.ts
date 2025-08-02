/**
 * İstatistik Sezgisi oyunu için tip tanımlamaları
 */

export interface IstatistikSoru {
  id: string;
  question: string;
  answer: number;
  unit: string;
  min: number;       // Minimum olası değer
  max: number;       // Maksimum olası değer
  explanation: string;
  source: string;
  link?: string;     // Orijinal bilimsel makale bağlantısı
}

export interface IstatistikSettings {
  gameDuration?: number; // Soru başına süre (saniye)
  scoreMultiplier?: number; // Puan çarpanı
}

export interface IstatistikGameState {
  currentSoru: IstatistikSoru | null;
  isPlaying: boolean;
  isPaused: boolean;
  isFinished: boolean;
  playerGuess: number | null; // Oyuncunun tahmini
  isAnswerRevealed: boolean; // Cevap gösterildi mi?
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number; // Toplam puan
  totalAnswered: number; // Cevaplanan soru sayısı
  averageAccuracy: number; // Ortalama doğruluk oranı
  settings: IstatistikSettings;
}

export interface IstatistikResult {
  playerGuess: number;
  correctAnswer: number;
  accuracy: number; // 0-100 arası doğruluk yüzdesi
  points: number; // Bu soru için kazanılan puan
  explanation: string;
  source: string;
  link?: string; // Orijinal bilimsel makale bağlantısı
}

export type IstatistikAction = 
  | 'submit-guess' 
  | 'next-question' 
  | 'pause' 
  | 'resume' 
  | 'restart' 
  | 'end-game';
