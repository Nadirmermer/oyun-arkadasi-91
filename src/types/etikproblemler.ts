/**
 * Etik Problemler oyunu için tip tanımlamaları
 */

export interface EtikVaka {
  id: string;
  baslik: string;
  senaryo: string;
  tartisma: string;
  kaynak: {
    kitap: string;
    yazarlar: string;
    uyarlayan: string;
    bulten: string;
  };
}

export interface EtikProblemlerGameState {
  currentVaka: EtikVaka | null;
  showTartisma: boolean;
  totalVakalar: number;
  currentVakaIndex: number;
}