import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { OfflineIndicator } from './OfflineIndicator';

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

/**
 * Uygulama layout bileşeni
 * Alt navigasyon çubuğu ile sarmalayıcı
 */
export const AppLayout = ({ children, showBottomNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <div className={showBottomNav ? 'pb-24' : ''}>
        {children}
      </div>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};