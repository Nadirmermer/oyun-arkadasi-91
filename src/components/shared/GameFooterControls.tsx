import { ReactNode } from 'react';

interface GameFooterControlsProps {
  children: ReactNode;
}

/**
 * Oyun içi alt kontrol çubuğu
 * Alt sabit alan ve gölge/border ile standardize eder
 */
export const GameFooterControls = ({ children }: GameFooterControlsProps) => {
  return (
    <div className="flex-none bg-card shadow-lg border-t border-border fixed bottom-0 left-0 right-0 z-20">
      <div className="p-3 sm:p-4 pb-4 sm:pb-6">
        {children}
      </div>
    </div>
  );
};


