import { Filter, Play, Search } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PageHeader } from '@/components/shared/PageHeader';

interface IkiDogruBirYalanSetupProps {
  onStartGame: () => void;
  onGoBack: () => void;
}

/**
 * İki Doğru Bir Yalan oyunu kurulum ekranı
 */
export const IkiDogruBirYalanSetup = ({ onStartGame, onGoBack }: IkiDogruBirYalanSetupProps) => {
  return (
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader
        title="İki Doğru Bir Yalan"
        subtitle="Oyunu başlat"
        onGoBack={onGoBack}
      />

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <Filter className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">İki Doğru Bir Yalan</h2>
            <p className="text-muted-foreground">
              Psikoloji hakkında üç ifade göreceksin. İkisi doğru, biri yalan. 
              Amacın yalanı bulmak!
            </p>
          </div>
        </Card>

        {/* Oyun Hakkında */}
        <Card>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Nasıl Oynanır?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Bir konu hakkında 3 ifade göreceksin</li>
              <li>• Yalan olduğunu düşündüğün ifadeye tıkla</li>
              <li>• Doğru cevabı öğren ve sonraki soruya geç</li>
              <li>• Bilgin ne kadar geniş? Hadi test edelim!</li>
            </ul>
          </div>
        </Card>

        {/* Başlat Butonu */}
        <Button
          onClick={onStartGame}
          variant="primary"
          size="lg"
          fullWidth
          className="mt-8 shadow-elevated"
        >
          <Play className="w-5 h-5" />
          Oyunu Başlat
        </Button>
      </div>
    </div>
  );
};