import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Team } from '@/types/game';
import { cn } from '@/lib/utils';

interface ScoreScreenProps {
  teams: Team[];
  onNewGame: () => void;
  onGoHome: () => void;
}

/**
 * Skor tablosu / Oyun sonu ekranı
 * Oyun bitiminde takımların skorlarını gösterir
 */
export const ScoreScreen = ({ teams, onNewGame, onGoHome }: ScoreScreenProps) => {
  // Takımları skora göre sırala (büyükten küçüğe)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="text-center pt-8 pb-8 p-4">
        <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-primary mb-2">Oyun Bitti!</h1>
        <p className="text-lg text-muted-foreground">Tebrikler tüm takımlara</p>
      </div>

      <div className="px-4">{/* Content wrapper */}

      {/* Skor Tablosu */}
      <div className="space-y-4 mb-8">
        {sortedTeams.map((team, index) => (
          <Card 
            key={`${team.id}-${team.score}-${index}`} 
            className={cn(
              'relative overflow-hidden transition-all duration-300',
              index === 0 && 'ring-2 ring-primary shadow-elevated'
            )}
          >
            {/* Kazanan takım için altın arka plan efekti */}
            {index === 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
            )}
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Sıralama */}
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                  index === 0 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </div>

                {/* Takım İsmi */}
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {team.name}
                    {index === 0 && <Trophy className="w-5 h-5 text-primary" />}
                  </h3>
                  {index === 0 && (
                    <p className="text-sm text-primary font-medium">🎉 Kazanan!</p>
                  )}
                </div>
              </div>

              {/* Skor */}
              <div className="text-right">
                <div className={cn(
                  'text-2xl font-bold',
                  index === 0 ? 'text-primary' : 'text-foreground'
                )}>
                  {team.score}
                </div>
                <div className="text-sm text-muted-foreground">puan</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Kazanan Mesajı */}
      {winner && (
        <Card className="text-center mb-8 bg-primary/5 border-primary/20">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              🏆 {winner.name} Kazandı!
            </h2>
            <p className="text-lg text-primary/80">
              {winner.score} puanla birinci oldu
            </p>
          </div>
        </Card>
      )}

      {/* Aksiyon Butonları */}
      <div className="space-y-4">
        <Button
          onClick={onNewGame}
          variant="primary"
          size="lg"
          fullWidth
          className="flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Oyun</span>
        </Button>

        <Button
          onClick={onGoHome}
          variant="secondary"
          size="lg"
          fullWidth
          className="flex items-center justify-center gap-3"
        >
          <Home className="w-5 h-5" />
          <span>Ana Menüye Dön</span>
        </Button>
      </div>

      {/* İstatistikler */}
      <Card className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Oyun İstatistikleri</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{teams.length}</div>
            <div className="text-sm text-muted-foreground">Takım</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {teams.reduce((total, team) => total + team.score, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Puan</div>
          </div>
        </div>
      </Card>
      </div> {/* Content wrapper kapanış */}
    </div>
  );
};