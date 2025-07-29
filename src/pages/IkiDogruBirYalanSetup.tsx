import { ArrowLeft, Target, Play } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

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
          <h1 className="text-xl font-bold text-foreground">İki Doğru Bir Yalan</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {/* Game Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Target className="w-10 h-10 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            İki Doğru Bir Yalan
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Psikoloji hakkında üç ifade göreceğin. İkisi doğru, biri yalan. 
            Amacın yalanı bulmak!
          </p>
        </div>

        {/* Game Rules */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-foreground" />
            Nasıl Oynanır?
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <p>Bir konu hakkında 3 ifade göreceksin</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <p>Yalan olduğunu düşündüğün ifadeye tıkla</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <p>Doğru cevabı öğren ve sonraki soruya geç</p>
            </div>
          </div>
        </Card>

        {/* Start Game Button */}
        <Button 
          onClick={onStartGame}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Oyunu Başlat
        </Button>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          Bilgin ne kadar geniş? Hadi test edelim!
        </p>
      </div>
    </div>
  );
};