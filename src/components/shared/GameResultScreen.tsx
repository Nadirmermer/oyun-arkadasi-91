import { ReactNode } from 'react';
import { Target, Trophy, RotateCcw, Home } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface GameResultScreenProps {
  title?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  metrics: {
    primary: { label: string; value: string | number; color?: string };
    secondary?: { label: string; value: string | number; color?: string };
    tertiary?: { label: string; value: string | number; color?: string };
  };
  performanceMessage?: string;
  wrongGuesses?: string[]; // Yanlış tahmin edilen kişiler
  onRestart: () => void;
  onGoHome: () => void;
  restartButtonText?: string;
  homeButtonText?: string;
}

/**
 * Tüm oyunlar için ortak kullanılacak sonuç ekranı bileşeni
 * Kod tekrarını önler ve tutarlı tasarım sağlar
 */
export const GameResultScreen = ({
  title = "Oyun Tamamlandı! 🎉",
  icon = <Target className="w-10 h-10 text-success" />,
  iconBgColor = "bg-success/10",
  metrics,
  performanceMessage,
  wrongGuesses = [], // Yanlış tahmin edilen kişiler
  onRestart,
  onGoHome,
  restartButtonText = "Yeniden Oyna",
  homeButtonText = "Ana Menüye Dön"
}: GameResultScreenProps) => {
  return (
    <div className="min-h-screen bg-background page-fade-in">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Sonuç Kartı */}
          <Card className="text-center p-8">
            <div className={`w-20 h-20 ${iconBgColor} rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
              {icon}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {title}
            </h2>
            
            <div className="space-y-4 mb-6">
              {/* Primary Metric */}
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{metrics.primary.label}:</span>
                <span className={`text-2xl font-bold ${metrics.primary.color || 'text-primary'}`}>
                  {metrics.primary.value}
                </span>
              </div>
              
              {/* Secondary Metric */}
              {metrics.secondary && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{metrics.secondary.label}:</span>
                  <span className={`text-xl font-bold ${metrics.secondary.color || 'text-success'}`}>
                    {metrics.secondary.value}
                  </span>
                </div>
              )}
              
              {/* Tertiary Metric */}
              {metrics.tertiary && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{metrics.tertiary.label}:</span>
                  <span className="font-bold">{metrics.tertiary.value}</span>
                </div>
              )}
            </div>

            {/* Yanlış Tahmin Edilen Kişiler */}
            {wrongGuesses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-destructive mb-3">
                  Yanlış Tahmin Edilen Kişiler ❌
                </h3>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive/70 mb-3 text-center">
                    Kişi hakkında daha fazla bilgi almak için tıklayın
                  </p>
                  <div className="space-y-2">
                    {wrongGuesses.map((person, index) => (
                      <a
                        key={index}
                        href={`https://www.google.com/search?q=${encodeURIComponent(person)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 bg-destructive/20 text-destructive text-base font-medium rounded-lg border border-destructive/30 hover:bg-destructive/30 hover:border-destructive/40 transition-colors duration-200 text-center"
                        onClick={(e) => {
                          // PWA'da tarayıcı açılıp açılmadığını kontrol et
                          const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                                       (window.navigator as any).standalone === true;
                          
                          if (isPWA) {
                            // PWA'da ise kullanıcıya bilgi ver
                            e.preventDefault();
                            if (confirm(`${person} hakkında daha fazla bilgi almak istiyor musunuz? Tarayıcı açılacak.`)) {
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(person)}`, '_blank');
                            }
                          }
                          // Tarayıcıda normal şekilde çalışır
                        }}
                      >
                        🔍 {person}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performans Değerlendirmesi */}
            {performanceMessage && (
              <div className="mb-6">
                <p className="text-lg font-medium text-primary">{performanceMessage}</p>
              </div>
            )}
          </Card>

          {/* Aksiyon Butonları */}
          <div className="space-y-4">
            <Button 
              onClick={onRestart} 
              variant="primary" 
              size="lg" 
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {restartButtonText}
            </Button>

            <Button 
              onClick={onGoHome} 
              variant="secondary" 
              size="lg" 
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {homeButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
