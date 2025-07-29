import { X, Trophy } from 'lucide-react';
import { Button } from './Button';
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hakkımızda modalı
 * Uygulama hakkında bilgi gösterir
 */
export const AboutModal = ({
  isOpen,
  onClose
}: AboutModalProps) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-card rounded-2xl shadow-elevated max-w-md w-full modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Hakkımızda
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 mx-0 text-left">PsikoOyun</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Psikoloji öğrencileri ve meraklıları için özel olarak tasarlanan eğlenceli oyun koleksiyonu. 
                Psikoloji terimlerini öğrenirken eğlenin, arkadaşlarınızla yarışın!
              </p>
            </div>
            
            
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">Yapan</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">Nadir Mermer tarafından geliştirilmiştir.</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="primary" size="md" fullWidth onClick={onClose}>
              Tamam
            </Button>
          </div>
        </div>
      </div>
    </div>;
};