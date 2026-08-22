import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DesktopNavTabs } from './components/DesktopNavTabs';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SendingCardBanner } from './components/SendingCardBanner';
import { LiveCountersBar } from './components/LiveCountersBar';
import { BrothersCards } from './components/BrothersCards';
import { BrotherCustomMatrix } from './components/BrotherCustomMatrix';
import { AllBrothersScheduleView } from './components/AllBrothersScheduleView';
import { ArchivesView } from './components/ArchivesView';
import { TransfersHistory } from './components/TransfersHistory';
import { QuickTransferModal } from './components/QuickTransferModal';
import { AdminTransferModal } from './components/AdminTransferModal';
import { BankCardsManager } from './components/BankCardsManager';
import { EditBrotherFieldsModal } from './components/EditBrotherFieldsModal';
import { AddEditBrotherModal } from './components/AddEditBrotherModal';
import { FundSecurityModal } from './components/FundSecurityModal';
import { SettingsModal } from './components/SettingsModal';
import { QrShareModal } from './components/QrShareModal';
import { JoinBrotherQrModal } from './components/JoinBrotherQrModal';
import { WhatsAppInviteModal } from './components/WhatsAppInviteModal';
import { RequestMoneyModal } from './components/RequestMoneyModal';
import { PendingRequestsModal } from './components/PendingRequestsModal';
import { NotificationToast } from './components/NotificationToast';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { BottomToolsBar } from './components/BottomToolsBar';

function MainApp() {
  const { currentUser, setCurrentUser } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferRecipientId, setTransferRecipientId] = useState(null);
  const [transferFieldId, setTransferFieldId] = useState(null);

  const [requestMoneyModalOpen, setRequestMoneyModalOpen] = useState(false);
  const [pendingRequestsModalOpen, setPendingRequestsModalOpen] = useState(false);

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [cardsManagerOpen, setCardsManagerOpen] = useState(false);
  const [fieldsModalOpen, setFieldsModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [addBrotherModalOpen, setAddBrotherModalOpen] = useState(false);
  const [whatsAppInviteOpen, setWhatsAppInviteOpen] = useState(false);
  const [brotherToEdit, setBrotherToEdit] = useState(null);
  const [editingBrotherFields, setEditingBrotherFields] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [joinQrOpen, setJoinQrOpen] = useState(false);

  // If not logged in, show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleOpenTransfer = (recipientId = null, fieldId = null) => {
    setTransferRecipientId(recipientId);
    setTransferFieldId(fieldId);
    setTransferModalOpen(true);
  };

  const handleOpenFieldsEdit = (brother) => {
    setEditingBrotherFields(brother);
    setFieldsModalOpen(true);
  };

  const handleOpenAddBrother = () => {
    setBrotherToEdit(null);
    setAddBrotherModalOpen(true);
  };

  const handleOpenEditBrother = (brother) => {
    setBrotherToEdit(brother);
    setAddBrotherModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Realtime Toast Notifications with Audio Chime */}
      <NotificationToast />

      {/* Top Navigation */}
      <Navbar
        onOpenTransferModal={() => handleOpenTransfer()}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenQrModal={() => setQrModalOpen(true)}
        onOpenWhatsAppInvite={() => setWhatsAppInviteOpen(true)}
        onOpenRequestMoney={() => setRequestMoneyModalOpen(true)}
        onOpenPendingRequests={() => setPendingRequestsModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* PWA Mobile Banner */}
      <PwaInstallBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Desktop View Switcher Tabs */}
        <DesktopNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Top Prominent Sending Card Banner with Security & Live Counters */}
        <SendingCardBanner
          onOpenTransferModal={() => handleOpenTransfer()}
          onOpenCardsManager={() => setCardsManagerOpen(true)}
          onOpenAdminModal={() => setAdminModalOpen(true)}
          onOpenSecurityModal={() => setSecurityModalOpen(true)}
        />

        <LiveCountersBar />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <BrothersCards
              onOpenTransferModal={handleOpenTransfer}
              onOpenFieldsModal={handleOpenFieldsEdit}
              onOpenAddBrother={handleOpenAddBrother}
              onOpenEditBrother={handleOpenEditBrother}
              onOpenWhatsAppInvite={() => setWhatsAppInviteOpen(true)}
              onOpenRequestMoney={() => setRequestMoneyModalOpen(true)}
            />
            <TransfersHistory onOpenTransferModal={handleOpenTransfer} />
          </div>
        )}

        {activeTab === 'brothers' && (
          <BrothersCards
            onOpenTransferModal={handleOpenTransfer}
            onOpenFieldsModal={handleOpenFieldsEdit}
            onOpenAddBrother={handleOpenAddBrother}
            onOpenEditBrother={handleOpenEditBrother}
            onOpenWhatsAppInvite={() => setWhatsAppInviteOpen(true)}
            onOpenJoinQr={() => setJoinQrOpen(true)}
            onOpenRequestMoney={() => setRequestMoneyModalOpen(true)}
          />
        )}

        {activeTab === 'my-schedule' && (
          <BrotherCustomMatrix onOpenTransferModal={handleOpenTransfer} />
        )}

        {activeTab === 'all-schedules' && (
          <AllBrothersScheduleView onOpenFieldsModal={handleOpenFieldsEdit} />
        )}

        {activeTab === 'archives' && <ArchivesView />}

        {activeTab === 'transfers' && (
          <TransfersHistory onOpenTransferModal={handleOpenTransfer} />
        )}

      </main>

      {/* Bottom Tools & Settings Bar (تنزيل شريط الإعدادات في الأسفل) */}
      <BottomToolsBar
        onOpenQrModal={() => setQrModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTransferModal={() => handleOpenTransfer()}
        onOpenRequestMoney={() => setRequestMoneyModalOpen(true)}
      />

      {/* Modals */}
      <QuickTransferModal
        isOpen={transferModalOpen}
        onClose={() => {
          setTransferModalOpen(false);
          setTransferRecipientId(null);
          setTransferFieldId(null);
        }}
        initialRecipientId={transferRecipientId}
        initialFieldId={transferFieldId}
      />

      <RequestMoneyModal
        isOpen={requestMoneyModalOpen}
        onClose={() => setRequestMoneyModalOpen(false)}
      />

      <PendingRequestsModal
        isOpen={pendingRequestsModalOpen}
        onClose={() => setPendingRequestsModalOpen(false)}
      />

      <AdminTransferModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      <BankCardsManager
        isOpen={cardsManagerOpen}
        onClose={() => setCardsManagerOpen(false)}
      />

      <AddEditBrotherModal
        isOpen={addBrotherModalOpen}
        onClose={() => {
          setAddBrotherModalOpen(false);
          setBrotherToEdit(null);
        }}
        brotherToEdit={brotherToEdit}
      />

      <WhatsAppInviteModal
        isOpen={whatsAppInviteOpen}
        onClose={() => setWhatsAppInviteOpen(false)}
      />

      <EditBrotherFieldsModal
        isOpen={fieldsModalOpen}
        onClose={() => {
          setFieldsModalOpen(false);
          setEditingBrotherFields(null);
        }}
        brother={editingBrotherFields}
      />

      <FundSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <QrShareModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <JoinBrotherQrModal
        isOpen={joinQrOpen}
        onClose={() => setJoinQrOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
