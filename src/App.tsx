import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
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
import { AppLayout } from "./components/shared/AppLayout";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { InstallPrompt } from "./components/shared/InstallPrompt";

import { OfflineIndicator } from "./components/shared/OfflineIndicator";

const AppContent = () => {
  const location = useLocation();
  
  // Sayfa değiştiğinde en üste scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  

  
  return (
    <div className="min-h-screen bg-background">
      {/* PWA Bileşenleri */}
      <OfflineIndicator />
      <InstallPrompt />
      
      <Routes>
        <Route path="/" element={<Index />} />
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
