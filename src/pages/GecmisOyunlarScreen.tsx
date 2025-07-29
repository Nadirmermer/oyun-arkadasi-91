import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Trophy, Brain, MessageCircle, Calendar, Crown } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { GameRecord, loadGameRecords, deleteGameRecord } from '@/lib/storage';

interface GecmisOyunlarScreenProps {
  onGoBack: () => void;
}

/**
 * Geçmiş oyun kayıtlarını gösteren ekran
 */
export const GecmisOyunlarScreen = ({ onGoBack }: GecmisOyunlarScreenProps) => {
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    setRecords(loadGameRecords());
  }, []);

  const handleDeleteRecord = (id: string) => {
    deleteGameRecord(id);
    setRecords(loadGameRecords());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'Tabu':
        return <MessageCircle className="w-6 h-6" />;
      case 'BenKimim':
        return <Brain className="w-6 h-6" />;
      case 'IkiDogruBirYalan':
        return <Trophy className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  const getGameTitle = (gameType: string) => {
    switch (gameType) {
      case 'Tabu':
        return 'Psikoloji Tabu';
      case 'BenKimim':
        return 'Ben Kimim?';
      case 'IkiDogruBirYalan':
        return 'İki Doğru Bir Yalan';
      default:
        return gameType;
    }
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Menü
          </Button>
          <h1 className="text-xl font-bold text-foreground">Geçmiş Oyunlar</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Henüz oynanmış bir oyun yok
            </h3>
            <p className="text-muted-foreground">
              Oyun oynadığınızda skorlarınız burada görünecek
            </p>
          </div>
        ) : (
          records.map((record) => (
            <Card key={record.id} className="p-4 relative">
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteRecord(record.id)}
                className="absolute top-3 right-3 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Game Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {getGameIcon(record.gameType)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {getGameTitle(record.gameType)}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.gameDate)}
                  </div>
                </div>
              </div>

              {/* Game Results */}
              <div className="space-y-2">
                {record.gameType === 'Tabu' ? (
                  // Tabu: İki takım skorları
                  record.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        {record.winner === result.name && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`${record.winner === result.name ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {result.name}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {result.score}
                      </span>
                    </div>
                  ))
                ) : (
                  // Diğer oyunlar: Tek skor
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">
                      {record.results[0]?.name}
                    </span>
                    <span className="font-medium text-foreground">
                      {record.results[0]?.score}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};