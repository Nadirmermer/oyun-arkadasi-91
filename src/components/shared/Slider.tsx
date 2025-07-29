import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * PsikoOyun için özel tasarlanmış slider bileşeni
 * Tasarım referanslarındaki mor slider görünümünü taklit eder
 */
export const Slider = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '',
  onChange,
  className 
}: SliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label ve Değer */}
      <div className="flex justify-between items-center">
        <label className="text-lg font-medium text-foreground">
          {label}
        </label>
        <span className="text-lg font-semibold text-primary">
          {value} {unit}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Track (Arka plan çizgisi) */}
        <div className="w-full h-2 bg-muted rounded-full relative">
          {/* Active Track (Dolu kısım) */}
          <div 
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb (Kaydırma düğmesi) */}
          <div 
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary rounded-full shadow-md transition-all duration-200',
              isDragging && 'scale-110 shadow-lg'
            )}
            style={{ left: `calc(${percentage}% - 12px)` }}
          />
        </div>

        {/* Gizli HTML input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};