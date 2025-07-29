import { useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Settings } from 'lucide-react';

/**
 * Alt navigasyon çubuğu bileşeni
 * Tüm sayfalarda sabit kalacak navigasyon
 */
export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      label: 'Oyunlar',
      icon: Home,
    },
    {
      path: '/history',
      label: 'Geçmiş',
      icon: History,
    },
    {
      path: '/settings',
      label: 'Ayarlar',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/98 backdrop-blur-lg border-t border-border z-50 shadow-elevated">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 p-2 px-3 rounded-xl transition-smooth ${
                isActive 
                  ? 'text-primary bg-primary/10 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium transition-all ${isActive ? 'font-bold text-primary' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};