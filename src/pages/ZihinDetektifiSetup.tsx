import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { HelpCircle, Brain, Target, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ZihinDetektifiSetupProps {
  onStartGame?: (settings: any) => void;
  onGoBack?: () => void;
}

export const ZihinDetektifiSetup = ({ onStartGame, onGoBack }: ZihinDetektifiSetupProps) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'savunma_mekanizmasi' | 'bilissel_carpitma' | 'uyumsuz_sema' | null>(null);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate('/');
    }
  };

  const handleStartGame = () => {
    if (!selectedType) return;

    const settings = {
      selectedType,
      gameDuration: 300,
      targetScore: 10
    };

    if (onStartGame) {
      onStartGame(settings);
    } else {
      localStorage.setItem('zihinDetektifiGameSettings', JSON.stringify(settings));
      navigate('/game/zihindetektifi');
    }
  };

  const contentTypes = [
    {
      id: 'savunma_mekanizmasi' as const,
      title: 'Psikanalitik Teori',
      description: 'Vakalardaki Savunma Mekanizmalarını bul.',
      icon: Brain,
      color: 'bg-primary/10 text-primary'
    },
    {
      id: 'bilissel_carpitma' as const,
      title: 'Bilişsel Davranışçı Terapi',
      description: 'Metinlerdeki Bilişsel Çarpıtmaları tespit et.',
      icon: Target,
      color: 'bg-secondary/10 text-secondary'
    },
    {
      id: 'uyumsuz_sema' as const,
      title: 'Şema Terapi',
      description: 'Hikayelerdeki Uyumsuz Şemaları ortaya çıkar.',
      icon: Users,
      color: 'bg-accent/10 text-accent'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Zihin Dedektifi"
        onGoBack={handleGoBack}
        rightContent={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nasıl Oynanır?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong>Amaç:</strong> Size sunulan vaka metinlerindeki psikolojik kavramları doğru bir şekilde tespit etmek.
                </p>
                <p>
                  <strong>Oynayış:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Bir içerik türü seçin</li>
                  <li>Vaka metnini okuyun</li>
                  <li>Soruyu cevaplayın</li>
                  <li>Doğru cevabı ve açıklamasını öğrenin</li>
                </ul>
                <p>
                  <strong>Puanlama:</strong> Her doğru cevap için 1 puan alırsınız.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            İçerik Türü Seçin
          </h2>
          <p className="text-muted-foreground text-sm">
            Hangi psikolojik kavramları çalışmak istediğinizi seçin
          </p>
        </div>

        <div className="grid gap-4">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <div
                key={type.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                    : 'hover:bg-muted/50 hover:border-primary/20'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${type.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {type.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {type.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <Button
            onClick={handleStartGame}
            disabled={!selectedType}
            fullWidth
            size="lg"
            className="font-semibold"
          >
            Oyuna Başla
          </Button>
        </div>
      </div>
    </div>
  );
};