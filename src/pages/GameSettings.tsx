import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Target, SkipForward, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Slider } from '@/components/shared/Slider';
import { Team, GameSettings as GameSettingsType } from '@/types/game';
import { loadSettings, saveSettings } from '@/lib/storage';

import { toast } from '@/hooks/use-toast';
import { TabuEngine } from '@/games/tabu/TabuEngine';

interface GameSettingsProps {
  teams: Team[];
  onStartGame: (settings: GameSettingsType) => void;
  onGoBack?: () => void;
  onEditTeams?: () => void;
}

/**
 * Oyun ayarları ekranı
 * Kullanıcıların oyun parametrelerini ayarlamasını sağlar
 */
export const GameSettings = ({ teams, onStartGame, onGoBack, onEditTeams }: GameSettingsProps) => {
  // Kaydedilmiş ayarları yükle
  const savedSettings = loadSettings();
  const [gameDuration, setGameDuration] = useState(savedSettings.gameDuration);
  const [maxScore, setMaxScore] = useState(savedSettings.maxScore);
  const [passCount, setPassCount] = useState(savedSettings.passCount);

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(savedSettings.selectedCategories);

  // Kategori listesini TabuEngine'den al
  useEffect(() => {
    const engine = new TabuEngine();
    engine.loadWords().then(() => {
      const cats = engine.getCategories();
      setAllCategories(cats);
    });
    // engine listener gerekmiyor burada
  }, []);

  /**
   * Oyunu başlat
   */
  const handleStartGame = async () => {
    const settings = {
      gameDuration,
      maxScore,
      passCount,
      darkMode: savedSettings.darkMode,
      selectedCategories
    };
    
    // Ayarları kaydet
    saveSettings({
      gameDuration,
      maxScore,
      passCount,
      darkMode: savedSettings.darkMode,
      selectedCategories
    });
    
    onStartGame(settings);
  };

  return (
    <div className="min-h-screen bg-background page-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-primary">Oyun Ayarları</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Takım Bilgileri */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Takımlar</h3>
              <p className="text-sm text-muted-foreground">Oyuna katılacak takımlar</p>
            </div>
          </div>

          <div className="space-y-2">
            {teams.map((team, index) => (
              <div 
                key={team.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="font-medium text-foreground">{team.name}</span>
                <span className="text-sm text-muted-foreground">Hazır</span>
              </div>
            ))}
          </div>

          {/* Takımları Düzenle Butonu */}
          {onEditTeams && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                onClick={onEditTeams}
                variant="secondary"
                size="md"
                fullWidth
                className="flex items-center justify-center gap-2 border border-border hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <Edit3 className="w-5 h-5" />
                Takımları Düzenle
              </Button>
            </div>
          )}
        </Card>

        {/* Oyun Ayarları */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Oyun Ayarları</h3>
              <p className="text-sm text-muted-foreground">Oyun kurallarını belirle</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <Slider
              label="Tur Süresi"
              value={gameDuration}
              min={30}
              max={120}
              step={10}
              unit="saniye"
              onChange={setGameDuration}
            />

            <Slider
              label="Tur Sayısı"
              value={maxScore}
              min={1}
              max={10}
              step={1}
              unit="tur"
              onChange={setMaxScore}
            />

            <Slider
              label="Pas Hakkı"
              value={passCount}
              min={1}
              max={5}
              step={1}
              unit="hak"
              onChange={setPassCount}
            />

            {/* Kategori Seçimi */}
            {allCategories.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Kategoriler</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategories.length === 0 
                        ? 'Tüm kategorilerden kelime gelecek' 
                        : selectedCategories.length === allCategories.length
                        ? 'Tüm kategoriler seçili'
                        : `${selectedCategories.length}/${allCategories.length} kategori seçili`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedCategories([])}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Tümü Kaldır
                    </Button>
                  </div>
                </div>

                {/* Kategori Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 sm:max-h-96 overflow-y-auto p-2 border border-border rounded-xl bg-muted/30">
                  {allCategories.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategories(prev => active ? prev.filter(c => c !== cat) : [...prev, cat])}
                        className={`relative p-3 rounded-lg border text-left transition-all group ${
                          active 
                            ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm leading-tight">{cat}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            active 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground group-hover:border-primary/50'
                          }`}>
                            {active && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bilgi Kutusu */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">💡</span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Kategori Seçimi Nasıl Çalışır?</p>
                      <p>
                        {selectedCategories.length === 0 
                          ? "🎯 Şu anda tüm kategorilerden kelime gelecek (varsayılan)"
                          : "🎯 Sadece seçili kategorilerden kelime gelecek"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>


      </div>

      {/* Başlat Butonu - Daha üstte ve padding ile */}
      <div className="p-4 pb-8">
        <Button
          onClick={handleStartGame}
          variant="primary"
          size="lg"
          fullWidth
          className="shadow-elevated"
        >
          Oyunu Başlat
        </Button>
      </div>
    </div>
  );
};