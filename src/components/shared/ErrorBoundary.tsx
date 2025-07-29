import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Uygulama genelinde hata yakalama
 * React hata sınırı (Error Boundary)
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo);
    
    // Hata raporlama servisi buraya eklenebilir
    // analytics.track('error_boundary_triggered', { error: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            
            <h1 className="text-xl font-bold text-foreground mb-2">
              Bir Hata Oluştu
            </h1>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Üzgünüz, beklenmedik bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                size="lg"
                fullWidth
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sayfayı Yenile
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Ana Sayfaya Dön
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Hata Detayları (Geliştirici Modu)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}