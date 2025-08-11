import { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils';
interface Team {
  id: string;
  name: string;
}
interface TeamSetupProps {
  initialTeams?: Team[];
  onTeamsReady: (teams: Team[]) => void;
  onGoBack?: () => void;
}

/**
 * Takım oluşturma ekranı
 * Kullanıcıların oyun için takımlarını oluşturmasını sağlar
 */
export const TeamSetup = ({
  initialTeams = [],
  onTeamsReady,
  onGoBack
}: TeamSetupProps) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [showModal, setShowModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  /**
   * Yeni takım ekleme modalini açar
   */
  const handleAddTeam = () => {
    if (teams.length >= 2) return; // Maksimum 2 takım
    setShowModal(true);
    setNewTeamName('');
  };

  /**
   * Takım ekleme işlemini tamamlar
   */
  const handleConfirmAdd = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName.trim()
      };
      setTeams([...teams, newTeam]);
      setShowModal(false);
      setNewTeamName('');
    }
  };

  /**
   * Takım ekleme modalini kapatır
   */
  const handleCancelAdd = () => {
    setShowModal(false);
    setNewTeamName('');
  };

  /**
   * Takımı siler
   */
  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  /**
   * Ayarlar ekranına geçiş
   */
  const handleProceedToSettings = () => {
    onTeamsReady(teams);
  };
  return <div className="min-h-screen bg-background page-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        {onGoBack && <button onClick={onGoBack} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>}
        <h1 className="text-xl font-bold text-primary flex-1 text-center">Takımları Oluştur</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="p-4">{/* Content wrapper */}

      {/* Takım Ekleme Butonu */}
      <Card className="mb-6">
        <button onClick={handleAddTeam} disabled={teams.length >= 2} className={cn("w-full flex items-center justify-center gap-3 py-4 rounded-xl transition-smooth", teams.length >= 2 ? "text-muted-foreground cursor-not-allowed" : "text-foreground hover:bg-muted")}>
          <Plus className="w-6 h-6 text-primary" />
          <span className="text-lg font-medium">
            {teams.length >= 2 ? "Maksimum 2 Takım Eklenebilir" : "Yeni Takım Ekle"}
          </span>
        </button>
      </Card>

      {/* Takımlar Listesi */}
      {teams.length > 0 && <div className="mb-8 space-y-4">
          {teams.map(team => <Card key={team.id} className="flex items-center justify-between">
              <span className="text-lg font-medium">{team.name}</span>
              <button onClick={() => handleRemoveTeam(team.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-smooth">
                <Trash2 className="w-5 h-5" />
              </button>
            </Card>)}
        </div>}

      {/* Boş durum görseli */}
      {teams.length === 0 && <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-lg">
            Henüz takım eklenmemiş. Oyunda başlayabilmek için 2 takım oluşturun.
          </p>
        </div>}

      {/* Devam Butonu */}
      {teams.length >= 2 && <div className="fixed bottom-4 left-4 right-4">
          <Button onClick={handleProceedToSettings} variant="primary" size="lg" fullWidth className="shadow-elevated">Oyun Ayarları</Button>
        </div>}
      </div> {/* Content wrapper kapanış */}

      {/* Takım Ekleme Modalı */}
      {showModal && <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 modal-backdrop">
          <Card className="w-full max-w-md m-4 mb-8 modal-content">
            <div className="text-center mb-6">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-bold text-primary">Yeni Takım Ekle</h2>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Takım adını giriniz" className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" autoFocus onKeyPress={e => e.key === 'Enter' && handleConfirmAdd()} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCancelAdd} variant="ghost" size="md" fullWidth>
                Vazgeç
              </Button>
              <Button onClick={handleConfirmAdd} variant="primary" size="md" fullWidth disabled={!newTeamName.trim()}>
                Ekle
              </Button>
            </div>
          </Card>
        </div>}
    </div>;
};