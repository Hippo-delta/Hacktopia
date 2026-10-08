import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AccountDrawer from './components/AccountDrawer';
import TransactionModal from './components/TransactionModal';
import CaseCreateModal from './components/CaseCreateModal';
import CompareAccountsModal from './components/CompareAccountsModal';
import FreezeSimulatorModal from './components/FreezeSimulatorModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import HelpModal from './components/HelpModal';
import ProfileModal from './components/ProfileModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import TraceTransactionPage from './pages/TraceTransactionPage';
import AccountInvestigationPage from './pages/AccountInvestigationPage';
import NetworkAnalysisPage from './pages/NetworkAnalysisPage';
import RiskAlertsPage from './pages/RiskAlertsPage';
import TransactionExplorerPage from './pages/TransactionExplorerPage';
import ReportsPage from './pages/ReportsPage';
import DataManagementPage from './pages/DataManagementPage';
import CaseManagementPage from './pages/CaseManagementPage';
import SettingsPage from './pages/SettingsPage';

// API & Services
import { 
  getAccount, 
  getTransaction, 
  getRiskAlerts, 
  getCases, 
  createCase, 
  addEvidenceToCase, 
  simulateFreezeAccount, 
  getAllAccounts,
  subscribeToDataChanges 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTraceTarget, setActiveTraceTarget] = useState('TXN-84921');
  const [activeAccountTarget, setActiveAccountTarget] = useState('A102');

  // Shared state
  const [alerts, setAlerts] = useState([]);
  const [cases, setCases] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);

  // Modals & Drawers state
  const [drawerAccount, setDrawerAccount] = useState(null);
  const [modalTransaction, setModalTransaction] = useState(null);
  const [isCaseCreateModalOpen, setIsCaseCreateModalOpen] = useState(false);
  const [caseTriggerEntity, setCaseTriggerEntity] = useState(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareAccA, setCompareAccA] = useState('A102');
  const [compareAccB, setCompareAccB] = useState('B552');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [freezeModalAccount, setFreezeModalAccount] = useState(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  // Load telemetry
  const refreshTelemetry = async () => {
    try {
      const [al, cs, accs] = await Promise.all([
        getRiskAlerts(),
        getCases(),
        getAllAccounts()
      ]);
      setAlerts(al);
      setCases(cs);
      setAllAccounts(accs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshTelemetry();
    const unsub = subscribeToDataChanges(refreshTelemetry);
    return () => unsub();
  }, []);

  // Navigation handlers
  const handleNavigateToAccount = (accountId) => {
    setActiveAccountTarget(accountId);
    setActiveTab('investigate');
    setDrawerAccount(null);
  };

  const handleNavigateToTrace = (target) => {
    setActiveTraceTarget(target);
    setActiveTab('trace');
    setDrawerAccount(null);
    setModalTransaction(null);
  };

  const handleOpenAccountDrawer = async (accountId) => {
    const acc = await getAccount(accountId);
    if (acc) setDrawerAccount(acc);
  };

  const handleOpenTxnModal = async (txnId) => {
    const txn = await getTransaction(txnId);
    if (txn) setModalTransaction(txn);
  };

  const handleOpenCompare = (accA = 'A102', accB = 'B552') => {
    setCompareAccA(accA);
    setCompareAccB(accB);
    setIsCompareModalOpen(true);
  };

  const handleAddToCase = async (evidenceItem) => {
    if (cases.length > 0) {
      await addEvidenceToCase(cases[0].id, evidenceItem);
      refreshTelemetry();
      alert(`Evidence "${evidenceItem.label}" attached to ${cases[0].id}`);
    } else {
      setCaseTriggerEntity(evidenceItem);
      setIsCaseCreateModalOpen(true);
    }
  };

  const handleCaseCreated = async (newCaseData) => {
    await createCase(newCaseData);
    refreshTelemetry();
    setActiveTab('cases');
  };

  const handleSimulateFreezeFromDrawer = (account) => {
    setFreezeModalAccount(account);
    setIsFreezeModalOpen(true);
  };

  const handleConfirmFreezeModal = async (accId, reason) => {
    await simulateFreezeAccount(accId, reason);
    refreshTelemetry();
  };

  // Global search selector
  const handleGlobalSearchSelect = (item) => {
    if (item.type === 'account') {
      handleNavigateToAccount(item.id);
    } else if (item.type === 'transaction') {
      handleNavigateToTrace(item.id);
    } else if (item.type === 'case') {
      setActiveTab('cases');
    }
  };

  return (
    <div className="flex h-screen bg-[#070d19] text-slate-100 overflow-hidden font-sans">
      {/* Global Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab}
        alertsCount={alerts.filter(a => a.status === 'New' || a.status === 'Investigating').length}
        casesCount={cases.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Bar */}
        <TopBar
          onSearchSelect={handleGlobalSearchSelect}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          unreadAlertsCount={alerts.filter(a => a.status === 'New').length}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-dark-950 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateToAccount={handleNavigateToAccount}
              onNavigateToTrace={handleNavigateToTrace}
              onNavigateToAlerts={() => setActiveTab('alerts')}
              onNavigateToNetwork={() => setActiveTab('network')}
              onOpenAccountDrawer={handleOpenAccountDrawer}
              onOpenTxnModal={handleOpenTxnModal}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {activeTab === 'trace' && (
            <TraceTransactionPage
              initialQuery={activeTraceTarget}
              onNavigateToAccount={handleNavigateToAccount}
              onOpenAccountDrawer={handleOpenAccountDrawer}
              onOpenTxnModal={handleOpenTxnModal}
              onAddToCase={handleAddToCase}
            />
          )}

          {activeTab === 'investigate' && (
            <AccountInvestigationPage
              initialAccountId={activeAccountTarget}
              onNavigateToTrace={handleNavigateToTrace}
              onOpenTxnModal={handleOpenTxnModal}
              onOpenCompare={handleOpenCompare}
              onAddToCase={handleAddToCase}
            />
          )}

          {activeTab === 'network' && (
            <NetworkAnalysisPage
              onNavigateToAccount={handleNavigateToAccount}
              onNavigateToTrace={handleNavigateToTrace}
              onOpenAccountDrawer={handleOpenAccountDrawer}
              onOpenTxnModal={handleOpenTxnModal}
              onAddToCase={handleAddToCase}
            />
          )}

          {activeTab === 'alerts' && (
            <RiskAlertsPage
              onNavigateToAccount={handleNavigateToAccount}
              onAddToCase={handleAddToCase}
            />
          )}

          {activeTab === 'cases' && (
            <CaseManagementPage
              onNavigateToAccount={handleNavigateToAccount}
              onNavigateToTrace={handleNavigateToTrace}
              onOpenCaseModal={() => {
                setCaseTriggerEntity(null);
                setIsCaseCreateModalOpen(true);
              }}
            />
          )}

          {activeTab === 'explorer' && (
            <TransactionExplorerPage
              onNavigateToTrace={handleNavigateToTrace}
              onNavigateToAccount={handleNavigateToAccount}
              onOpenTxnModal={handleOpenTxnModal}
              onAddToCase={handleAddToCase}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              onNavigateToAccount={handleNavigateToAccount}
              onNavigateToTrace={handleNavigateToTrace}
            />
          )}

          {activeTab === 'data' && (
            <DataManagementPage
              onNavigateToTrace={handleNavigateToTrace}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AccountDrawer
        isOpen={Boolean(drawerAccount)}
        account={drawerAccount}
        onClose={() => setDrawerAccount(null)}
        onInvestigate={handleNavigateToAccount}
        onTrace={handleNavigateToTrace}
        onSimulateFreeze={handleSimulateFreezeFromDrawer}
        onAddToCase={handleAddToCase}
        onCompare={(accId) => handleOpenCompare(accId, 'B552')}
      />

      <TransactionModal
        isOpen={Boolean(modalTransaction)}
        transaction={modalTransaction}
        onClose={() => setModalTransaction(null)}
        onTrace={handleNavigateToTrace}
        onAddToCase={handleAddToCase}
        onViewAccount={handleNavigateToAccount}
      />

      <CaseCreateModal
        isOpen={isCaseCreateModalOpen}
        onClose={() => setIsCaseCreateModalOpen(false)}
        onCaseCreated={handleCaseCreated}
        initialEntity={caseTriggerEntity}
      />

      <CompareAccountsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        accounts={allAccounts}
        initialAccountA={compareAccA}
        initialAccountB={compareAccB}
      />

      <FreezeSimulatorModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        account={freezeModalAccount}
        onConfirmFreeze={handleConfirmFreezeModal}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onInvestigateAlert={(alt) => {
          setIsNotificationsOpen(false);
          handleNavigateToAccount(alt.accountId);
        }}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
