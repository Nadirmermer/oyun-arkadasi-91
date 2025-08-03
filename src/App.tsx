import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { SettingsPage } from "./pages/SettingsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { EtikProblemlerScreen } from "./pages/EtikProblemlerScreen";
import { EtikProblemlerSetup } from "./pages/EtikProblemlerSetup";
import { BilBakalimScreen } from "./pages/BilBakalimScreen";
import { BilBakalimSetup } from "./pages/BilBakalimSetup";
import { RenkDizisiScreen } from "./pages/RenkDizisiScreen";
import { RenkDizisiSetup } from "./pages/RenkDizisiSetup";
import { BenKimimSetup } from "./pages/BenKimimSetup";
import { BenKimimScreen } from "./pages/BenKimimScreen";
import { IstatistikScreen } from "./pages/IstatistikScreen";
import { IstatistikSetup } from "./pages/IstatistikSetup";
import { AppLayout } from "./components/shared/AppLayout";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { PWAInstallPrompt } from "./components/shared/PWAInstallPrompt";
import { PWAUpdatePrompt } from "./components/shared/PWAUpdatePrompt";
import { PWAInstallProvider } from "./contexts/PWAInstallContext";


const AppContent = () => {
  const location = useLocation();
  
  // Sayfa değiştiğinde en üste scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  

  
  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={
          <AppLayout showBottomNav={true}>
            <SettingsPage />
          </AppLayout>
        } />
        <Route path="/history" element={
          <AppLayout showBottomNav={true}>
            <HistoryPage />
          </AppLayout>
        } />
        <Route path="/game/etikproblemler/setup" element={<EtikProblemlerSetup />} />
        <Route path="/game/etikproblemler" element={<EtikProblemlerScreen />} />
        <Route path="/game/bilbakalim/setup" element={<BilBakalimSetup />} />
        <Route path="/game/bilbakalim" element={<BilBakalimScreen />} />
        <Route path="/game/renkdizisi/setup" element={<RenkDizisiSetup />} />
        <Route path="/game/renkdizisi" element={<RenkDizisiScreen />} />
        <Route path="/game/benkimim/setup" element={<BenKimimSetup onStartGame={(settings) => {
          // Ayarları kaydet ve oyun sayfasına yönlendir
          localStorage.setItem('benKimimGameSettings', JSON.stringify(settings));
          window.location.href = '/game/benkimim';
        }} onGoBack={() => window.history.back()} />} />
        <Route path="/game/benkimim" element={<BenKimimScreen />} />
        <Route path="/game/istatistik/setup" element={<IstatistikSetup />} />
        <Route path="/game/istatistik" element={<IstatistikScreen />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <PWAInstallProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
        </BrowserRouter>
      </PWAInstallProvider>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
