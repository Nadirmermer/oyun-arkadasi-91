import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';


/**
 * Oyundan çıkış onay modalı
 * Kullanıcı aktif oyundan çıkmak istediğinde gösterilir
 */
interface ExitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExitGameModal = ({ isOpen, onClose, onConfirm }: ExitGameModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm modal-content">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-danger/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-bold text-foreground mb-2">
            Oyundan Çıkılsın mı?
          </h3>
          <p className="text-muted-foreground mb-6">
            Mevcut oyundaki ilerlemeniz kaydedilmeyecektir. Çıkmak istediğinize emin misiniz?
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              size="md" 
              fullWidth 
              onClick={onClose}
            >
              Vazgeç
            </Button>
            <Button 
              variant="danger" 
              size="md" 
              fullWidth 
              onClick={onConfirm}
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};