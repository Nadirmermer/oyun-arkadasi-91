import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';


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
      <div className={showBottomNav ? 'pb-24' : ''}>
        {children}
      </div>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};