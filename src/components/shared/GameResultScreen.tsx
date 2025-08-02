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
