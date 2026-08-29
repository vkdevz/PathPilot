import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatbotDrawer } from './components/ChatbotDrawer';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CareerSelectionPage } from './pages/CareerSelectionPage';
import { SkillMapPage } from './pages/SkillMapPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { SkillReportPage } from './pages/SkillReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { activeView, user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Unauthenticated views without sidebar
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Navbar onOpenChat={() => setIsChatOpen(true)} />
        <LandingPage />
        <ChatbotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    );
  }

  if (activeView === 'auth') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />

      <div className="flex flex-1">
        <Sidebar onOpenChat={() => setIsChatOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {activeView === 'career-selection' && <CareerSelectionPage />}
          {activeView === 'skill-map' && <SkillMapPage />}
          {activeView === 'assessment' && <AssessmentPage />}
          {activeView === 'skill-report' && <SkillReportPage />}
          {activeView === 'dashboard' && <DashboardPage />}
          {activeView === 'leaderboard' && <LeaderboardPage />}
          {activeView === 'analytics' && <AnalyticsPage />}
          {activeView === 'settings' && <SettingsPage />}
        </main>
      </div>

      <ChatbotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
