/**
 * Zihin Dedektifi oyunu için tip tanımlamaları
 */

export interface ZihinDetektifiCase {
  type: 'savunma_mekanizmasi' | 'bilissel_carpitma' | 'uyumsuz_sema';
  case_text: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface ZihinDetektifiSettings {
  selectedTypes: ('savunma_mekanizmasi' | 'bilissel_carpitma' | 'uyumsuz_sema')[];
  questionCount: number;
  timeLimit: number;
}

export interface ZihinDetektifiGameState {
  status: 'idle' | 'playing' | 'paused' | 'finished';
  currentCase: ZihinDetektifiCase | null;
  settings: ZihinDetektifiSettings;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
  selectedAnswer?: string | null;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export type ZihinDetektifiAction = 
  | 'answer'
  | 'next'
  | 'pause'
  | 'resume';