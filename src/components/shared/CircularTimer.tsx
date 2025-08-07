import { cn } from '@/lib/utils';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

/**
 * Dairesel zamanlayıcı bileşeni
 * Tasarım referanslarındaki yeşil dairesel timer'ı taklit eder
 */
export const CircularTimer = ({ timeLeft, totalTime, className }: CircularTimerProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Zamanın azalmasına göre renk değişimi
  const getColor = () => {
    if (progress > 50) return 'text-success'; // currentColor için text-* sınıfı
    if (progress > 25) return 'text-warning'; // Sarı (tema uyumlu)
    return 'text-danger'; // Kırmızı
  };

  const getBackgroundColor = () => {
    if (progress > 50) return 'text-success'; // Yeşil
    if (progress > 25) return 'text-warning'; // Sarı (tema uyumlu)
    return 'text-danger'; // Kırmızı
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* SVG Dairesel Progress */}
      <svg
        className="transform -rotate-90"
        width="120"
        height="120"
        viewBox="0 0 100 100"
      >
        {/* Arka plan dairesi */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-muted"
        />
        
        {/* Progress dairesi */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(getColor(), 'transition-all duration-1000 ease-linear')}
        />
      </svg>

      {/* Zaman metni */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center',
        'text-3xl font-bold transition-colors duration-300',
        getBackgroundColor()
      )}>
        {timeLeft}
      </div>
    </div>
  );
};