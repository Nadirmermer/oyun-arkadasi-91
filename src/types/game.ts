/**
 * PsikoOyun Tabu oyunu için tip tanımlamaları
 */

export interface PsychologyWord {
  kelime: string;          // Anlatılacak ana kelime
  yasaklar: string[];      // Yasaklı kelimeler listesi
  kategori: string;        // Kelimenin kategorisi (ör: "Klinik Psikoloji")
}

export interface Team {
  id: string;              // Benzersiz takım kimliği
  name: string;            // Takım adı
  score: number;           // Takım skoru
}

export interface GameSettings {
  gameDuration: number;    // Oyun süresi (saniye)
  maxScore: number;        // Toplam tur sayısı
  passCount: number;       // Pas hakkı sayısı
  darkMode: boolean;       // Karanlık mod durumu
  controlType?: 'buttons' | 'motion'; // Kontrol tipi (opsiyonel)
}

export interface GameState {
  teams: Team[];           // Takımlar listesi
  currentTeamIndex: number; // Aktif takımın indeksi
  currentWord: PsychologyWord | null; // Mevcut kelime
  settings: GameSettings;   // Oyun ayarları
  isPlaying: boolean;      // Oyun durumu
  isPaused: boolean;       // Duraklatılma durumu
  timeLeft: number;        // Kalan süre
  passesUsed: number;      // Kullanılan pas sayısı
  currentRound: number;    // Mevcut tur sayısı
}

export type GameAction = 
  | 'correct'              // Doğru cevap
  | 'tabu'                 // Tabu kelime kullanıldı
  | 'pass';                // Pas geçildi