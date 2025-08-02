/**
 * Renk Dizisi Takibi oyunu için tip tanımlamaları
 */

export type Color = 'blue' | 'green' | 'red' | 'yellow';

export interface RenkDizisiState {
  level: number;
  sequence: Color[];
  userSequence: Color[];
  currentShowingIndex: number;
  isShowing: boolean;
  isUserTurn: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  score: number;
  highestScore: number;
  lives: number;        // Mevcut can sayısı
  maxLives: number;     // Maksimum can sayısı
}

export interface RenkDizisiSettings {
  showDuration: number;
  pauseDuration: number;
}