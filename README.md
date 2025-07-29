# 🎮 PsikoOyun - Psikoloji Tabu Oyunu

Modern ve eğlenceli psikoloji oyunları koleksiyonu. React, TypeScript ve Tailwind CSS ile geliştirilmiş, Progressive Web App (PWA) desteği bulunan oyun platformu.

## 🌟 Özellikler

### 🎯 Oyunlar
- **Psikoloji Tabu**: Psikoloji terimleri ile takım tabanlı tabu oyunu
- **Ben Kimim?**: Psikoloji ünlülerini tahmin etme oyunu  
- **İki Doğru Bir Yalan**: Doğru bilgiyi bulma ve yanlışı ayıklama oyunu

### 🎨 Kullanıcı Deneyimi
- **Otomatik Tema**: Cihazın sistem ayarına göre dark/light mode
- **Duyarlı Tasarım**: Mobile-first yaklaşım, tüm cihazlarda mükemmel görünüm
- **PWA Desteği**: Offline kullanım, home screen'e ekleme
- **Hareket Sensörü**: Telefon hareketleriyle oyun kontrolü (isteğe bağlı)
- **Görsel Animasyonlar**: Smooth geçişler ve micro-interactions

### 🔧 Teknik Özellikler
- **Modern Stack**: React 18, TypeScript, Vite
- **Performans**: Optimize edilmiş bileşenler, lazy loading
- **Offline**: Service Worker ile cache stratejisi
- **Accessibility**: WCAG 2.1 uyumlu design patterns

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ 
- npm veya yarn package manager

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/your-username/psikooyun.git
cd psikooyun

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:8080` adresinde çalışacaktır.

### Build ve Deploy

```bash
# Production build
npm run build

# Build'i önizle
npm run preview

# TypeScript kontrolü
npm run type-check

# Linting
npm run lint
```

## 📁 Proje Yapısı

### Genel Mimari
```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── shared/         # Oyun-bağımsız ortak bileşenler
│   └── ui/            # shadcn/ui temel bileşenleri
├── games/             # Oyun motorları
│   ├── tabu/         # Tabu oyun motoru
│   ├── benkimim/     # Ben Kimim oyun motoru  
│   └── ikidogrubiryalan/ # İki Doğru Bir Yalan motoru
├── hooks/            # Custom React hook'ları
├── lib/              # Yardımcı fonksiyonlar ve utils
├── pages/            # Sayfa bileşenleri
├── types/            # TypeScript tip tanımları
└── data/             # Oyun verileri (JSON)
```

### Bileşen Kategorileri

#### 🎮 Shared Components (`src/components/shared/`)
- **AppLayout**: Ana layout wrapper, navigation yönetimi
- **Button**: Design system button komponenti (variants: primary, secondary, success, danger)
- **Card**: Tutarlı kart tasarımı için container
- **CircularTimer**: Oyunlarda kullanılan dairesel timer
- **LoadingSpinner**: Loading states için spinner
- **Modals**: PauseModal, ExitGameModal, AboutModal
- **Navigation**: BottomNavigation, PageHeader

#### 🧩 UI Components (`src/components/ui/`)
shadcn/ui kütüphanesinden gelen temel bileşenler:
- Form elementleri (input, button, select, etc.)
- Layout bileşenleri (card, separator, etc.)
- Feedback bileşenleri (toast, alert, etc.)
- Navigation bileşenleri (tabs, accordion, etc.)

#### 🎯 Game Engines (`src/games/`)
Her oyun için ayrı motor:

```typescript
// Örnek: TabuEngine
class TabuEngine {
  private gameState: GameState;
  private settings: GameSettings;
  private listeners: Function[];

  // Ana metodlar
  startGame(): void
  endGame(): void
  processAction(action: GameAction): void
  getState(): GameState
  getScoreboard(): Team[]
}
```

#### 🪝 Custom Hooks (`src/hooks/`)
- **use-mobile**: Mobil cihaz tespiti
- **use-motion-sensor**: Telefon hareket sensörü entegrasyonu
- **use-offline**: Offline durumu takibi
- **use-system-theme**: Sistem teması otomatik algılama
- **use-toast**: Toast notification yönetimi

#### 📊 State Management (`src/lib/storage.ts`)
LocalStorage tabanlı state persistence:

```typescript
// Veri tipleri
interface StoredSettings {
  darkMode: boolean;
  gameDuration: number;
  maxScore: number;
  passCount: number;
  motionSensorEnabled: boolean;
  motionSensitivity: 'low' | 'medium' | 'high';
}

interface GameRecord {
  id: string;
  gameType: 'Tabu' | 'BenKimim' | 'IkiDogruBirYalan';
  gameDate: string;
  results: Array<{name: string; score: number | string}>;
  winner?: string;
}
```

## 🎨 Design System

### Renk Paleti
Design system tamamen CSS Custom Properties ile yönetiliyor:

```css
:root {
  /* Temel renkler - HSL formatında */
  --primary: 252 83% 66%;        /* Mor #8B5CF6 */
  --success: 142 76% 46%;        /* Yeşil #22C55E */
  --danger: 0 84% 60%;           /* Kırmızı #EF4444 */
  --warning: 45 93% 47%;         /* Turuncu #F59E0B */
  
  /* Neutral renkler */
  --background: 219 25% 98%;     /* Açık gri */
  --card: 0 0% 100%;            /* Beyaz */
  --foreground: 222.2 84% 4.9%; /* Koyu gri */
}

.dark {
  /* Dark mode renkleri */
  --background: 224 71% 4%;      /* Koyu lacivert */
  --card: 224 71% 6%;           /* Hafif açık koyu */
  --foreground: 213 31% 91%;    /* Açık gri */
}
```

### Bileşen Varyantları

```typescript
// Button varyantları
const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", 
  success: "bg-success text-success-foreground hover:bg-success/90",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90"
}

// Size varyantları
const sizeVariants = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm", 
  lg: "h-12 px-6 text-base"
}
```

### Responsive Breakpoints

```javascript
// tailwind.config.ts
screens: {
  'xs': '475px',
  'sm': '640px', 
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px'
}
```

## 📱 PWA Özellikleri

### Service Worker
Vite PWA plugin ile otomatik service worker:

```typescript
// vite.config.ts PWA ayarları
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 yıl
          }
        }
      }
    ]
  }
})
```

### Manifest.json
```json
{
  "name": "PsikoOyun - Psikoloji Tabu Oyunu",
  "short_name": "PsikoOyun", 
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#8B5CF6",
  "background_color": "#F8FAFC",
  "categories": ["education", "games", "entertainment"],
  "shortcuts": [
    {
      "name": "Psikoloji Tabu",
      "url": "/",
      "description": "Psikoloji terimleri ile tabu oyunu"
    }
  ]
}
```

## 🔧 Geliştirme Rehberi

### Yeni Oyun Ekleme

1. **Game Engine Oluştur**:
```typescript
// src/games/yeni-oyun/YeniOyunEngine.ts
export class YeniOyunEngine {
  private gameState: YeniOyunState;
  
  constructor() {
    this.gameState = this.getInitialState();
  }
  
  startGame(): void { /* impl */ }
  processAction(action: YeniOyunAction): void { /* impl */ }
  getState(): YeniOyunState { /* impl */ }
}
```

2. **Tip Tanımları**:
```typescript
// src/types/yeni-oyun.ts
export interface YeniOyunState {
  isPlaying: boolean;
  currentData: any;
  score: number;
  // diğer state alanları
}

export type YeniOyunAction = 'start' | 'pause' | 'action1' | 'action2';
```

3. **Oyun Bileşenleri**:
```typescript
// src/pages/YeniOyunGame.tsx
export const YeniOyunGame = ({ gameEngine, onGameEnd, onGoHome }) => {
  // Oyun UI implementasyonu
}

// src/pages/YeniOyunSetup.tsx  
export const YeniOyunSetup = ({ onStartGame, onGoBack }) => {
  // Ayarlar UI implementasyonu
}
```

4. **Ana Sayfa Entegrasyonu**:
```typescript
// src/pages/HomePage.tsx içinde
const [yeniOyunEngine] = useState(() => new YeniOyunEngine());

// GamePhase type'ına ekle
type GamePhase = '...' | 'yeni-oyun-setup' | 'yeni-oyun-playing';
```

### Performans Optimizasyonu

#### React.memo Kullanımı
```typescript
// Ağır bileşenler için memo kullan
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  return <div>{/* render logic */}</div>;
});
```

#### useCallback ile Fonksiyon Optimizasyonu  
```typescript
const handleAction = useCallback((action: string) => {
  gameEngine.processAction(action);
  setGameState(gameEngine.getState());
}, [gameEngine]);
```

#### useMemo ile Hesaplama Optimizasyonu
```typescript
const sortedScores = useMemo(() => {
  return teams.sort((a, b) => b.score - a.score);
}, [teams]);
```

### State Yönetimi Patterns

#### Local State (useState)
```typescript
// Bileşen içi geçici state için
const [isLoading, setIsLoading] = useState(false);
const [inputValue, setInputValue] = useState('');
```

#### Game Engine State
```typescript
// Oyun durumu için engine pattern
const [gameState, setGameState] = useState(gameEngine.getState());

useEffect(() => {
  const updateState = () => setGameState(gameEngine.getState());
  gameEngine.addListener(updateState);
  return () => gameEngine.removeListener(updateState);
}, [gameEngine]);
```

#### Persistent State (localStorage)
```typescript
// Kalıcı veriler için storage utilities
import { saveSettings, loadSettings } from '@/lib/storage';

const handleSettingChange = (newSetting: any) => {
  const settings = loadSettings();
  saveSettings({ ...settings, ...newSetting });
};
```

## 🧪 Test Stratejisi

### Unit Testing
```bash
# Jest ve React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### E2E Testing  
```bash
# Playwright önerili
npm install --save-dev @playwright/test
```

### Test Dosya Yapısı
```
src/
├── __tests__/           # Unit testler
│   ├── components/
│   ├── games/
│   └── utils/
└── e2e/                # E2E testler
    ├── game-flow.spec.ts
    └── navigation.spec.ts
```

## 📈 Ölçeklendirme Stratejileri

### Performans Metrikleri
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Bundle Size Optimizasyonu
```typescript
// Lazy loading ile code splitting
const LazyGameScreen = lazy(() => import('./pages/GameScreen'));
const LazySettingsPage = lazy(() => import('./pages/SettingsPage'));

// Route bazlı splitting
<Routes>
  <Route path="/game" element={
    <Suspense fallback={<LoadingSpinner />}>
      <LazyGameScreen />
    </Suspense>
  } />
</Routes>
```

### Veri Yönetimi Scaling

#### Büyük Veri Setleri İçin
```typescript
// Pagination pattern
interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// Virtualization büyük listeler için
import { FixedSizeList as List } from 'react-window';
```

#### API Entegrasyonu Hazırlığı
```typescript
// Abstract data layer
interface DataProvider {
  getWords(): Promise<Word[]>;
  getQuestions(): Promise<Question[]>;
  saveGameRecord(record: GameRecord): Promise<void>;
}

// Local implementation
class LocalStorageProvider implements DataProvider {
  // localStorage implementation
}

// Future API implementation  
class ApiProvider implements DataProvider {
  // API calls implementation
}
```

### Modüler Mimari

#### Plugin Sistemi
```typescript
// Oyun pluginleri için interface
interface GamePlugin {
  name: string;
  version: string;
  engine: GameEngine;
  setupComponent: React.ComponentType;
  gameComponent: React.ComponentType;
}

// Plugin registry
class GameRegistry {
  private plugins: Map<string, GamePlugin> = new Map();
  
  register(plugin: GamePlugin): void {
    this.plugins.set(plugin.name, plugin);
  }
  
  getPlugin(name: string): GamePlugin | undefined {
    return this.plugins.get(name);
  }
}
```

## 🚀 Deployment

### Static Hosting (Önerilen)
```bash
# Vercel
npm install -g vercel
vercel --prod

# Netlify  
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# GitHub Pages
npm run build
# dist/ klasörünü gh-pages branch'ine push
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Ortam Değişkenleri
```bash
# .env.production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=PsikoOyun
```

## 🤝 Katkıda Bulunma

### Geliştirme Akışı
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: açıklama'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

### Commit Mesaj Formatı
```
feat: yeni özellik ekleme
fix: bug düzeltme  
docs: dokümantasyon güncellemesi
style: kod formatı değişikliği
refactor: kod refaktörü
test: test ekleme/düzeltme
chore: build araçları, dependency güncellemeleri
```

### Code Review Checklist
- [ ] TypeScript hataları yok
- [ ] Responsive design test edildi
- [ ] Dark/Light mode test edildi  
- [ ] Performance impact değerlendirildi
- [ ] Accessibility standartlarına uygun
- [ ] Test coverage yeterli

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - UI library

---

**PsikoOyun** ile psikoloji öğrenmeyi eğlenceli hale getiriyoruz! 🎓✨