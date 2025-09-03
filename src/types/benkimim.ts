/**
 * Ben Kimim oyunu için tip tanımlamaları
 */

export interface BenKimimWord {
  kisi: string;            // Tahmin edilecek kişi/kavram
  kategori: string;        // Kategori (ör: "Psikanaliz")
  zorluk?: 'kolay' | 'orta' | 'zor'; // Zorluk seviyesi
}

export interface BenKimimSettings {
  gameDuration: number;    // Tur süresi (saniye)
  targetScore: number;     // Hedef skor
  difficulty: 'kolay' | 'orta' | 'zor' | 'karisik'; // Zorluk seviyesi
  controlType?: 'buttons' | 'motion'; // Kontrol tipi
}

export interface BenKimimGameState {
  currentWord: BenKimimWord | null; // Mevcut kelime
  settings: BenKimimSettings;       // Oyun ayarları
  isPlaying: boolean;               // Oyun durumu
  isPaused: boolean;                // Duraklatılma durumu
  timeLeft: number;                 // Kalan süre
  score: number;                    // Mevcut skor
  totalWords: number;               // Toplam gösterilen kelime sayısı
  wrongGuesses?: string[];          // Yanlış tahmin edilen kişiler
}

export type BenKimimAction = 
  | 'correct'                       // Doğru cevap
  | 'pass';                         // Pas geçildi