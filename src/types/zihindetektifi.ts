/**
 * Zihin Dedektifi oyunu için tip tanımlamaları
 */

export interface ZihinDetektifiCase {
  id: number;
  type: 'savunma_mekanizmasi' | 'bilissel_carpitma' | 'uyumsuz_sema';
  case_text: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface ZihinDetektifiSettings {
  selectedType: 'savunma_mekanizmasi' | 'bilissel_carpitma' | 'uyumsuz_sema' | null;
  gameDuration: number;
  targetScore: number;
}

export interface ZihinDetektifiGameState {
  currentCase: ZihinDetektifiCase | null;
  settings: ZihinDetektifiSettings;
  isPlaying: boolean;
  isPaused: boolean;
  timeLeft: number;
  score: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean;
}

export type ZihinDetektifiAction = 
  | 'answer'
  | 'next'
  | 'pause'
  | 'resume';