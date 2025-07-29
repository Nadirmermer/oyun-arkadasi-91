import { Play } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Team } from '@/types/game';

interface TurnTransitionProps {
  currentTeam: Team | null;
  onContinue: () => void;
  scoreboard: Team[];
}

/**
 * Tur geçişi modal componenti
 * Süre bitince gösterilir, manuel geçiş için
 */
export const TurnTransition = ({ currentTeam, onContinue, scoreboard }: TurnTransitionProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm m-4">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-bold text-primary mb-2">Tur Bitti!</h2>
          
          <p className="text-muted-foreground mb-4">
            Sıra şimdi <span className="font-semibold text-foreground">{currentTeam?.name}</span> takımında
          </p>

          {/* Puan Durumu */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground">Puan Durumu</h3>
            {scoreboard.map((team) => (
              <div key={`${team.id}-${team.score}`} className="flex justify-between items-center">
                <span className={`text-sm ${team.id === currentTeam?.id ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {team.name}
                </span>
                <span className={`text-sm font-semibold ${team.id === currentTeam?.id ? 'text-primary' : 'text-foreground'}`}>
                  {team.score}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={onContinue}
            variant="primary"
            size="lg"
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Başla</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};