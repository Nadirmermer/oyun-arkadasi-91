import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * PsikoOyun için özel tasarlanmış toggle (aç/kapa) bileşeni
 * Tasarım referanslarındaki karanlık mod toggle'ını taklit eder
 */
export const Toggle = ({ 
  checked, 
  onChange, 
  label, 
  icon,
  disabled = false,
  className 
}: ToggleProps) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Label ve İkon */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
        <span className="text-lg font-medium text-foreground">
          {label}
        </span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};