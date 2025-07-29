import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * PsikoOyun için tasarlanmış buton bileşeni
 * Tasarım referanslarındaki mor, yeşil ve kırmızı butonları destekler
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props 
}: ButtonProps) => {
  const baseClasses = 'font-semibold rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap inline-flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.02] transform';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50',
    success: 'bg-success text-success-foreground hover:bg-success/90 focus:ring-success/50',
    danger: 'bg-danger text-danger-foreground hover:bg-danger/90 focus:ring-danger/50',
    ghost: 'text-foreground hover:bg-muted focus:ring-muted/50'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};