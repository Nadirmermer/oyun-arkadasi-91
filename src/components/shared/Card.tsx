import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'card' | 'elevated';
}

/**
 * PsikoOyun için tasarlanmış kart bileşeni
 * Tasarım referanslarındaki beyaz, yuvarlak köşeli kartları taklit eder
 */
export const Card = ({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'card' 
}: CardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={cn(
        'bg-card rounded-2xl border border-border transition-smooth',
        shadow === 'card' ? 'shadow-card' : 'shadow-elevated',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};