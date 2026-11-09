/**
 * SMART ELEC — Root Application Component
 * Wires State Providers, i18n, Layout, and Active Tab Router.
 */

import React from 'react';
import { I18nProvider } from './i18n';
import { AppProvider, useApp } from './stores/appStore';
import { ProjectProvider } from './stores/projectStore';
import { Layout } from './components/layout/Layout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWizardPage } from './pages/ProjectWizardPage';
import { LoadsPage } from './pages/LoadsPage';
import { PowerBalancePage } from './pages/PowerBalancePage';
import { GeneratorPage } from './pages/GeneratorPage';
import { CablePage } from './pages/CablePage';
import { ProtectionPage } from './pages/ProtectionPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { ReportsPage } from './pages/ReportsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <Layout>
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'projects' && <ProjectsPage />}
      {activeTab === 'wizard' && <ProjectWizardPage />}
      {activeTab === 'loads' && <LoadsPage />}
      {activeTab === 'power_balance' && <PowerBalancePage />}
      {activeTab === 'generator' && <GeneratorPage />}
      {activeTab === 'cable' && <CablePage />}
      {activeTab === 'protection' && <ProtectionPage />}
      {activeTab === 'equipment' && <EquipmentPage />}
      {activeTab === 'reports' && <ReportsPage />}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AppProvider>
    </I18nProvider>
  );
};

export default App;
