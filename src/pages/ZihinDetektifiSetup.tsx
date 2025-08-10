import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Slider } from '@/components/shared/Slider';
import { HelpCircle, Brain, Target, Users, Clock, Play } from 'lucide-react';
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
  const [settings, setSettings] = useState({
    gameDuration: 300,
    targetScore: 10
  });

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate('/');
    }
  };

  const handleStartGame = () => {
    if (!selectedType) return;

    const gameSettings = {
      selectedType,
      gameDuration: settings.gameDuration,
      targetScore: settings.targetScore
    };

    if (onStartGame) {
      onStartGame(gameSettings);
    } else {
      localStorage.setItem('zihinDetektifiGameSettings', JSON.stringify(gameSettings));
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
    <div className="min-h-screen bg-background page-fade-in">
      <PageHeader 
        title="Zihin Dedektifi"
        subtitle="Oyun ayarlarını belirle"
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

      <div className="p-4 space-y-6">
        {/* Oyun Açıklaması */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
              <Brain className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Zihin Dedektifi</h2>
            <p className="text-muted-foreground">
              Psikolojik kavramları keşfet ve analiz et!
            </p>
          </div>
        </Card>

        {/* Ayarlar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground px-2">Oyun Ayarları</h3>
          
          {/* Oyun Süresi */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Oyun Süresi</h4>
                <p className="text-sm text-muted-foreground">
                  Toplam oyun süresi
                </p>
              </div>
            </div>
            
            <Slider
              label="Süre"
              value={settings.gameDuration}
              min={180}
              max={600}
              step={60}
              unit="saniye"
              onChange={(value) => setSettings(prev => ({ ...prev, gameDuration: value }))}
            />
          </Card>

          {/* Hedef Skor */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Hedef Skor</h4>
                <p className="text-sm text-muted-foreground">
                  Oyunu tamamlamak için kaç doğru cevap gerekli
                </p>
              </div>
            </div>
            
            <Slider
              label="Hedef"
              value={settings.targetScore}
              min={5}
              max={20}
              step={5}
              unit="doğru"
              onChange={(value) => setSettings(prev => ({ ...prev, targetScore: value }))}
            />
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            İçerik Türü Seçin
          </h3>
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

        {/* Başlat Butonu */}
        <Button
          onClick={handleStartGame}
          disabled={!selectedType}
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