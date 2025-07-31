/**
 * İki Doğru Bir Yalan oyunu için tip tanımlamaları
 */

export interface IkiDogruBirYalanIfade {
  metin: string;
  dogruMu: boolean;
}

export interface IkiDogruBirYalanSoru {
  konu: string;
  kategori: string;
  ifadeler: IkiDogruBirYalanIfade[];
}

export interface IkiDogruBirYalanSettings {
  // Oyun ayarları için rezerve edilmiş interface
  gameDuration?: number; // Oyun süresi (saniye)
  questionLimit?: number; // Maksimum soru sayısı
}

export interface IkiDogruBirYalanGameState {
  currentSoru: IkiDogruBirYalanSoru | null;
  isPlaying: boolean;
  selectedAnswer: number | null; // Seçilen ifadenin index'i
  showAnswer: boolean; // Cevap gösterilsin mi?
  totalAnswered: number; // Toplam cevaplanan soru sayısı
  correctAnswers: number; // Doğru cevap sayısı
}

export type IkiDogruBirYalanAction = 'select-answer' | 'next-question' | 'restart';