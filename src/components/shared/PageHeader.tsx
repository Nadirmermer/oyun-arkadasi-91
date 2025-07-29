import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onGoBack?: () => void;
  rightContent?: ReactNode;
  centered?: boolean;
}

/**
 * Standardized page header component
 * Tüm sayfalarda tutarlı başlık yapısı için
 */
export const PageHeader = ({ 
  title, 
  subtitle, 
  onGoBack, 
  rightContent,
  centered = false 
}: PageHeaderProps) => {
  if (centered) {
    return (
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          {onGoBack ? (
            <button
              onClick={onGoBack}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="w-10 flex justify-end">
            {rightContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {rightContent && (
          <div>{rightContent}</div>
        )}
      </div>
    </div>
  );
};