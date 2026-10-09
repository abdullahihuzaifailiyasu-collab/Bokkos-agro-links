import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { DemoBanner } from './components/common/DemoBanner.tsx';

// Views
import { HomePage } from './views/HomePage.tsx';
import { MarketplacePage } from './views/MarketplacePage.tsx';
import { AuthPage } from './views/AuthPage.tsx';
import { FarmerDashboard } from './views/FarmerDashboard.tsx';
import { FarmerAddProduce } from './views/FarmerAddProduce.tsx';
import { FarmerRequestsView } from './views/FarmerRequestsView.tsx';
import { BuyerDashboard } from './views/BuyerDashboard.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { NotificationsView } from './views/NotificationsView.tsx';
import { HowItWorksPage } from './views/HowItWorksPage.tsx';
import { PriceMonitorView } from './views/PriceMonitorView.tsx';
import { BokkosMapView } from './views/BokkosMapView.tsx';
import { LogisticsHubView } from './views/LogisticsHubView.tsx';
import { PostHarvestAdvisoryView } from './views/PostHarvestAdvisoryView.tsx';
import { CooperativePoolsView } from './views/CooperativePoolsView.tsx';
import { QualityPassportView } from './views/QualityPassportView.tsx';
import { EscrowVaultView } from './views/EscrowVaultView.tsx';
import { UssdGatewayView } from './views/UssdGatewayView.tsx';
import { ProduceListing } from './types/index.ts';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduce, setSelectedProduce] = useState<ProduceListing | null>(null);
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('');

  const handleNavigate = (view: string, filterWard?: string) => {
    if (filterWard) {
      setSelectedWardFilter(filterWard);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={(listing) => {
              setSelectedProduce(listing);
              setCurrentView('marketplace');
            }}
          />
        );

      case 'marketplace':
        return (
          <MarketplacePage
            onNavigate={handleNavigate}
            selectedListing={selectedProduce}
            initialWard={selectedWardFilter}
          />
        );

      case 'prices':
        return <PriceMonitorView onNavigate={handleNavigate} />;

      case 'bokkos-map':
        return <BokkosMapView onNavigate={handleNavigate} />;

      case 'logistics':
        return <LogisticsHubView onNavigate={handleNavigate} />;

      case 'advisory':
        return <PostHarvestAdvisoryView onNavigate={handleNavigate} />;

      case 'cooperative-pools':
        return <CooperativePoolsView onNavigate={handleNavigate} />;

      case 'quality-passport':
        return <QualityPassportView onNavigate={handleNavigate} />;

      case 'escrow-vault':
        return <EscrowVaultView onNavigate={handleNavigate} />;

      case 'ussd-gateway':
        return <UssdGatewayView onNavigate={handleNavigate} />;

      case 'how-it-works':
        return <HowItWorksPage onNavigate={handleNavigate} />;

      case 'login':
        return <AuthPage mode="login" onNavigate={handleNavigate} />;

      case 'register':
        return <AuthPage mode="register" onNavigate={handleNavigate} />;

      case 'farmer-dashboard':
        return (
          <FarmerDashboard
            onNavigate={handleNavigate}
            onEditProduce={(produce) => {
              setSelectedProduce(produce);
              setCurrentView('farmer-add-produce');
            }}
          />
        );

      case 'farmer-add-produce':
        return (
          <FarmerAddProduce
            onNavigate={handleNavigate}
            editingProduce={selectedProduce}
          />
        );

      case 'farmer-requests':
        return <FarmerRequestsView onNavigate={handleNavigate} />;

      case 'buyer-dashboard':
      case 'buyer-requests':
      case 'buyer-purchases':
        return <BuyerDashboard onNavigate={handleNavigate} />;

      case 'admin-overview':
      case 'admin-users':
        return <AdminDashboard onNavigate={handleNavigate} />;

      case 'notifications':
        return <NotificationsView onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <DemoBanner />
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="flex-1 pb-16 md:pb-0">
        {renderView()}
      </main>

      <Footer onNavigate={handleNavigate} />
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
