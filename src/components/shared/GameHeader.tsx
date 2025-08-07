import { ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  isPaused?: boolean;
  onPauseToggle?: () => void;
  pauseDisabled?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

/**
 * Oyun içi standart başlık bileşeni
 * Tüm oyunlarda tutarlı başlık yapısı sağlar
 */
export const GameHeader = ({
  title,
  isPaused = false,
  onPauseToggle,
  pauseDisabled = false,
  leftSlot,
  rightSlot
}: GameHeaderProps) => {
  return (
    <div className="flex-none bg-card shadow-sm relative z-10">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center min-w-[2rem]">
          {leftSlot ?? <div className="w-8" />}
        </div>
        <h1 className="text-xl font-bold text-primary text-center">
          {title}
        </h1>
        <div className="flex items-center gap-2 min-w-[2rem] justify-end">
          {rightSlot}
          {onPauseToggle && (
            <button
              onClick={onPauseToggle}
              disabled={pauseDisabled}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


