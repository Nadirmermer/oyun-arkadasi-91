import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedCircularTimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

/**
 * Performans optimize edilmiş dairesel zamanlayıcı bileşeni
 * Gereksiz re-render'ları önlemek için React.memo kullanır
 */
export const OptimizedCircularTimer = memo(({ timeLeft, totalTime, className }: OptimizedCircularTimerProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  // Hesaplamaları memoize et
  const { progress, strokeDashoffset, color, textColor } = useMemo(() => {
    const progressValue = (timeLeft / totalTime) * 100;
    const offset = circumference - (progressValue / 100) * circumference;
    
    // Renk hesaplaması
    let colorClass = 'stroke-success';
    let textColorClass = 'text-success';
    
    if (progressValue <= 25) {
      colorClass = 'stroke-danger';
      textColorClass = 'text-danger';
    } else if (progressValue <= 50) {
      colorClass = 'stroke-yellow-500';
      textColorClass = 'text-yellow-500';
    }
    
    return {
      progress: progressValue,
      strokeDashoffset: offset,
      color: colorClass,
      textColor: textColorClass
    };
  }, [timeLeft, totalTime, circumference]);

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
          className={cn(color, 'transition-all duration-1000 ease-linear')}
        />
      </svg>

      {/* Zaman metni */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center',
        'text-3xl font-bold transition-colors duration-300',
        textColor
      )}>
        {timeLeft}
      </div>
    </div>
  );
});

OptimizedCircularTimer.displayName = 'OptimizedCircularTimer';