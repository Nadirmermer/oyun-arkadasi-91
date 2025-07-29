import { memo } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';

/**
 * Çevrimdışı durumu gösteren gösterge
 * Kullanıcıya internet bağlantısı hakkında bilgi verir
 */
export const OfflineIndicator = memo(() => {
  const { isOnline, wasOffline } = useOffline();

  if (isOnline && !wasOffline) {
    return null; // Çevrimiçi ve hiç çevrimdışı olmadıysa gösterme
  }

  return (
    <div className={cn(
      'fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm',
      'bg-card border border-border rounded-xl shadow-elevated p-3',
      'flex items-center gap-3 transition-all duration-300',
      isOnline ? 'animate-slide-in-up' : 'animate-fade-in'
    )}>
      {isOnline ? (
        <>
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <Wifi className="w-4 h-4 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Bağlantı Kuruldu</p>
            <p className="text-xs text-muted-foreground">İnternet bağlantısı yeniden aktif</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
            <WifiOff className="w-4 h-4 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Çevrimdışı Mod</p>
            <p className="text-xs text-muted-foreground">Oyun çevrimdışı olarak devam ediyor</p>
          </div>
        </>
      )}
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';