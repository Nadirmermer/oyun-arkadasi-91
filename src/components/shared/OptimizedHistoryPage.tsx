import { memo, useState, useEffect, useCallback } from 'react';
import { Trash2, Trophy, Brain, MessageCircle, Calendar, Crown, TrashIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { GameRecord, loadGameRecords, deleteGameRecord, clearAllGameRecords } from '@/lib/storage';

// Memoized Game Record Component
const MemoizedGameRecord = memo(({ 
  record, 
  onDelete, 
  formatDate, 
  getGameIcon, 
  getGameTitle 
}: { 
  record: GameRecord;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  getGameIcon: (type: string) => JSX.Element;
  getGameTitle: (type: string) => string;
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDelete = useCallback(() => {
    setIsExiting(true);
    // Animasyon tamamlandıktan sonra sil
    setTimeout(() => {
      onDelete(record.id);
    }, 300);
  }, [record.id, onDelete]);

  return (
    <Card 
      key={record.id} 
      className={`p-4 relative transition-all duration-300 ${
        isExiting ? 'list-item-exit' : 'list-item-enter'
      }`}
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
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
  );
});

MemoizedGameRecord.displayName = 'MemoizedGameRecord';

// Memoized Empty State Component
const MemoizedEmptyState = memo(() => (
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
));

MemoizedEmptyState.displayName = 'MemoizedEmptyState';

/**
 * Performans optimize edilmiş Geçmiş Oyunlar sayfası
 * Animasyonlu silme, memoized components ve smooth transitions ile
 */
export const OptimizedHistoryPage = memo(() => {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Loading simulation için kısa bir gecikme
    const timer = setTimeout(() => {
      setRecords(loadGameRecords());
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    deleteGameRecord(id);
    setRecords(loadGameRecords());
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllGameRecords();
    setRecords([]);
    setShowClearAllModal(false);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getGameIcon = useCallback((gameType: string) => {
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
  }, []);

  const getGameTitle = useCallback((gameType: string) => {
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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Oyun geçmişi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card hover-lift">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Geçmiş Oyunlar</h1>
            <p className="text-muted-foreground mt-1">Skorlarını ve istatistiklerini gör</p>
          </div>
          {records.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearAllModal(true)}
              className="text-danger hover:bg-danger/10"
            >
              <TrashIcon className="w-4 h-4" />
              Tümünü Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {records.length === 0 ? (
          <MemoizedEmptyState />
        ) : (
          records.map((record) => (
            <MemoizedGameRecord
              key={record.id}
              record={record}
              onDelete={handleDeleteRecord}
              formatDate={formatDate}
              getGameIcon={getGameIcon}
              getGameTitle={getGameTitle}
            />
          ))
        )}
      </div>

      {/* Clear All Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-card rounded-2xl shadow-elevated max-w-sm w-full modal-content">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-danger/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <TrashIcon className="w-8 h-8 text-danger" />
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2">
                Tüm Oyun Geçmişini Sil
              </h3>
              <p className="text-muted-foreground mb-6">
                Bu işlem geri alınamaz. Tüm oyun kayıtları kalıcı olarak silinecektir.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  size="md" 
                  fullWidth 
                  onClick={() => setShowClearAllModal(false)}
                >
                  Vazgeç
                </Button>
                <Button 
                  variant="danger" 
                  size="md" 
                  fullWidth 
                  onClick={handleClearAll}
                >
                  Sil
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedHistoryPage.displayName = 'OptimizedHistoryPage';