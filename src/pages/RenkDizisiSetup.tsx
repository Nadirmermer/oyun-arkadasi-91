import { Play, Brain } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';

/**
 * Renk Dizisi oyunu ayarlar ekranı
 * Basit başlatma ekranı
 */
export const RenkDizisiSetup = () => {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate('/game/renkdizisi');
    };

    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background page-fade-in">
            <PageHeader
                title="Renk Dizisi Takibi"
                subtitle="Oyunu başlat"
                onGoBack={handleGoBack}
            />

            <div className="p-4 space-y-6">
                {/* Oyun Açıklaması */}
                <Card>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-success/10 rounded-2xl mx-auto flex items-center justify-center">
                            <Brain className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Renk Dizisi Takibi</h2>
                        <p className="text-muted-foreground">
                            Görsel hafıza oyunu. Gösterilen renk dizisini hatırlayın ve aynı sırayla dokunun.
                        </p>
                    </div>
                </Card>

                {/* Oyun Hakkında */}
                <Card>
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">Nasıl Oynanır?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Gösterilen renk dizisini dikkatli izleyin</li>
                            <li>• Dizi bittiğinde aynı sırayla renklere dokunun</li>
                            <li>• Her seviyede dizi bir renk daha uzar</li>
                            <li>• Yanlış seçim yaparsanız oyun biter</li>
                        </ul>
                    </div>
                </Card>

                {/* Başlat Butonu */}
                <Button
                    onClick={handleStartGame}
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