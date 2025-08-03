import { useContext } from 'react';
import { PWAInstallContext } from '@/contexts/PWAInstallContext';

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  if (context === undefined) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};
