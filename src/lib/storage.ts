/**
 * LocalStorage yardımcı fonksiyonları
 * Gelişmiş hata yönetimi ve güvenli veri işleme
 */

/**
 * LocalStorage kullanılabilir mi kontrol et
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Güvenli localStorage okuma
 */
const safeLocalStorageGet = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('LocalStorage kullanılamıyor');
    }
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`LocalStorage okuma hatası (${key}):`, error);
    }
    return null;
  }
};

/**
 * Güvenli localStorage yazma
 */
const safeLocalStorageSet = (key: string, value: string): boolean => {
  if (!isLocalStorageAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('LocalStorage kullanılamıyor');
    }
    showStorageError();
    return false;
  }
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`LocalStorage yazma hatası (${key}):`, error);
    }
    
    // Quota hatası kontrolü
    if (error instanceof DOMException && error.code === 22) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('LocalStorage doldu, eski kayıtları temizleniyor...');
      }
      clearOldGameRecords();
      
      // Temizlikten sonra tekrar dene
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        showStorageError();
        return false;
      }
    }
    
    showStorageError();
    return false;
  }
};

/**
 * Kullanıcıya storage hatası göster
 */
const showStorageError = () => {
  // Production'da sadece geliştirici konsoluna yaz
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Veri kaydedilemiyor: Tarayıcı depolama alanı dolu veya devre dışı');
  }
  
  // TODO: Kullanıcıya toast bildirimi göster
  // toast({ title: "Uyarı", description: "Veriler kaydedilemiyor. Tarayıcı ayarlarınızı kontrol edin." });
};

/**
 * Eski oyun kayıtlarını temizle (storage dolduğunda)
 */
const clearOldGameRecords = () => {
  try {
    const records = loadGameRecords();
    // Son 50 kaydı tut, gerisini sil
    const recentRecords = records.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.GAME_RECORDS, JSON.stringify(recentRecords));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Eski kayıtlar temizlendi: ${records.length - recentRecords.length} kayıt silindi`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Eski kayıtlar temizlenirken hata:', error);
    }
  }
};

export interface StoredTeam {
  id: string;
  name: string;
}

export interface StoredSettings {
  darkMode: boolean;
  gameDuration: number;
  maxScore: number;        // Tur sayısı olarak kullanılacak
  passCount: number;
  // Hareket sensörü ayarları
  motionSensorEnabled: boolean;
  motionSensitivity: 'low' | 'medium' | 'high';
  motionPermissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

export interface GameRecord {
  id: string;
  gameType: 'Tabu' | 'BenKimim' | 'IkiDogruBirYalan' | 'BilBakalim' | 'RenkDizisi';
  gameDate: string;
  results: {
    name: string;
    score: number | string;
  }[];
  winner?: string;
}

const STORAGE_KEYS = {
  TEAMS: 'psikooyun_teams',
  SETTINGS: 'psikooyun_settings',
  GAME_RECORDS: 'psikoOyunScores'
} as const;

/**
 * Takımları localStorage'a kaydet
 */
export const saveTeams = (teams: StoredTeam[]): boolean => {
  return safeLocalStorageSet(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
};

/**
 * Takımları localStorage'dan yükle
 */
export const loadTeams = (): StoredTeam[] => {
  const stored = safeLocalStorageGet(STORAGE_KEYS.TEAMS);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Takımlar parse edilirken hata:', error);
    }
    return [];
  }
};

/**
 * Ayarları localStorage'a kaydet
 */
export const saveSettings = (settings: StoredSettings): boolean => {
  return safeLocalStorageSet(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

/**
 * Ayarları localStorage'dan yükle
 */
export const loadSettings = (): StoredSettings => {
  const defaultSettings: StoredSettings = {
    darkMode: false,
    gameDuration: 60,
    maxScore: 3,
    passCount: 3,
    motionSensorEnabled: false,
    motionSensitivity: 'medium' as const,
    motionPermissionStatus: 'prompt' as const
  };
  
  const stored = safeLocalStorageGet(STORAGE_KEYS.SETTINGS);
  if (!stored) return defaultSettings;
  
  try {
    const parsed = JSON.parse(stored);
    // Eksik alanları varsayılan değerlerle doldur
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Ayarlar parse edilirken hata:', error);
    }
    return defaultSettings;
  }
};

/**
 * Oyun kaydını localStorage'a kaydet
 */
export const saveGameRecord = (record: GameRecord): boolean => {
  const records = loadGameRecords();
  records.unshift(record);
  
  // Maksimum 100 kayıt tut
  const limitedRecords = records.slice(0, 100);
  
  return safeLocalStorageSet(STORAGE_KEYS.GAME_RECORDS, JSON.stringify(limitedRecords));
};

/**
 * Oyun kayıtlarını localStorage'dan yükle
 */
export const loadGameRecords = (): GameRecord[] => {
  const stored = safeLocalStorageGet(STORAGE_KEYS.GAME_RECORDS);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Oyun kayıtları parse edilirken hata:', error);
    }
    return [];
  }
};

/**
 * Oyun kaydını localStorage'dan sil
 */
export const deleteGameRecord = (id: string): boolean => {
  const records = loadGameRecords();
  const filteredRecords = records.filter(record => record.id !== id);
  return safeLocalStorageSet(STORAGE_KEYS.GAME_RECORDS, JSON.stringify(filteredRecords));
};

/**
 * Tüm oyun kayıtlarını localStorage'dan sil
 */
export const clearAllGameRecords = (): boolean => {
  return safeLocalStorageSet(STORAGE_KEYS.GAME_RECORDS, JSON.stringify([]));
};