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
import { GuestJoinBanner } from './components/GuestJoinBanner';
import { GuestJoinApprovalsModal } from './components/GuestJoinApprovalsModal';
import { GuestPortalView } from './components/GuestPortalView';
import { CircleChatModal } from './components/CircleChatModal';
import { UserCheck, Send, Bell, X } from 'lucide-react';

const PushNotificationBanner = () => {
  const { isPushSubscribed, subscribePushNotifications, currentUser } = useFinance();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('bait_finance_push_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Completely disappear once approved or dismissed (available in Settings)
  if (isPushSubscribed || dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem('bait_finance_push_banner_dismissed', 'true');
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-teal-500/40 relative animate-fadeIn" dir="rtl">
      <div className="flex items-center gap-3 text-right">
        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-lg font-black shrink-0 border border-teal-400/30">
          🔔
        </div>
        <div>
          <span className="font-black text-xs sm:text-sm text-white block">
            تفعيل تنبيهات ورنين الهاتف عند إغلاق التطبيق 📳
          </span>
          <span className="text-[11px] text-teal-200/80 block">
            اضغط زر السماح لتصلك رنات المكالمات وصرف الأموال عند إغلاق التطبيق (يمكنك التحكم بها لاحقاً من الإعدادات ⚙️).
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={async () => {
            const res = await subscribePushNotifications(currentUser?.id);
            handleDismiss();
            if (res && res.message) alert(res.message);
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
        >
          <span>تفعيل والسماح بالإشعارات 📲</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          title="إخفاء"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const GlobalIncomingCallBanner = () => {
  const { incomingCall, acceptVoiceCall, rejectVoiceCall } = useFinance();
  if (!incomingCall || incomingCall.status !== 'ringing') return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-rose-500 animate-bounce flex items-center justify-between gap-3 shadow-rose-950/80" dir="rtl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center text-xl shrink-0">
          📞
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-rose-300 font-bold block">مكالمة صوتية واردة 📲</span>
          <span className="font-black text-sm text-white truncate block">{incomingCall.callerName}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => acceptVoiceCall(incomingCall.id)}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-1"
        >
          <span>رد 🟢</span>
        </button>
        <button
          type="button"
          onClick={() => rejectVoiceCall(incomingCall.id)}
          className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-1"
        >
          <span>رفض 🔴</span>
        </button>
      </div>
    </div>
  );
};

function MainApp() {
  const { currentUser, setCurrentUser, activeAdminId, guestRequests, fundRequests } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const pendingMoneyRequests = (fundRequests || []).filter((r) => r.status === 'pending');

  // Modals state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState('all');

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferRecipientId, setTransferRecipientId] = useState(null);
  const [transferFieldId, setTransferFieldId] = useState(null);

  const [requestMoneyModalOpen, setRequestMoneyModalOpen] = useState(false);
  const [pendingRequestsModalOpen, setPendingRequestsModalOpen] = useState(false);
  const [guestApprovalsOpen, setGuestApprovalsOpen] = useState(false);

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
  const [requestMoneyBrotherId, setRequestMoneyBrotherId] = useState(null);
  const [requestMoneyFieldId, setRequestMoneyFieldId] = useState(null);

  const handleOpenChat = (recipientId = 'all') => {
    setChatRecipientId(recipientId);
    setChatModalOpen(true);
  };

  const handleOpenTransfer = (recipientId = null, fieldId = null) => {
    setTransferRecipientId(recipientId);
    setTransferFieldId(fieldId);
    setTransferModalOpen(true);
  };

  const handleOpenFieldsEdit = (brother) => {
    setEditingBrotherFields(brother);
    setFieldsModalOpen(true);
  };

  const handleOpenRequestMoney = (brother = null, field = null) => {
    setRequestMoneyBrotherId(brother?.id || currentUser?.id);
    setRequestMoneyFieldId(field?.id || null);
    setRequestMoneyModalOpen(true);
  };

  const handleOpenAddBrother = () => {
    setBrotherToEdit(null);
    setAddBrotherModalOpen(true);
  };

  const handleOpenEditBrother = (brother) => {
    setBrotherToEdit(brother);
    setAddBrotherModalOpen(true);
  };

  // 1. If not logged in, show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  // 2. If in Guest Mode, show Dedicated Isolated Guest Portal (No access to Admin/Dashboard)
  if (currentUser.isGuest) {
    return <GuestPortalView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Global Floating Incoming Call Banner (Never miss an incoming call) */}
      <GlobalIncomingCallBanner />

      {/* Realtime Toast Notifications with Audio Chime & Direct Action Buttons */}
      <NotificationToast
        onOpenPendingRequests={() => setPendingRequestsModalOpen(true)}
        onOpenGuestApprovals={() => setGuestApprovalsOpen(true)}
      />

      {/* Top Navigation */}
      <Navbar
        onOpenTransferModal={() => handleOpenTransfer()}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenQrModal={() => setQrModalOpen(true)}
        onOpenGuestApprovals={() => setGuestApprovalsOpen(true)}
        onOpenRequestMoney={(brother, field) => handleOpenRequestMoney(brother, field)}
        onOpenPendingRequests={() => setPendingRequestsModalOpen(true)}
        onOpenChat={handleOpenChat}
        onLogout={() => {
          try {
            localStorage.removeItem('bait_finance_current_user');
            localStorage.removeItem('bait_finance_guest_account');
          } catch {}
          setCurrentUser(null);
        }}
      />

      {/* PWA Mobile Banner */}
      <PwaInstallBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Push Notification Activator & Tester Banner */}
        <PushNotificationBanner />

        {/* Guest Onboarding Camera QR Banner (للمستخدمين في وضع الضيف) */}
        <GuestJoinBanner />

        {/* 🚨 Admin Pending Guest Join Requests Alert Banner 🚨 */}
        {isCurrentAdmin && guestRequests && guestRequests.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-amber-300 animate-pulse" dir="rtl">
            <div className="flex items-center gap-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-black/20">
                {guestRequests.length}
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-slate-950 block">
                  🔔 لديك ({guestRequests.length}) طلب انضمام ضيف جديد بانتظار موافقتك!
                </span>
                <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                  الأخ ({guestRequests[0].name}) بانتظار إدخال كلمة المرور لتفعيل حسابه في الصندوق
                </span>
              </div>
            </div>
            <button
              onClick={() => setGuestApprovalsOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95 shrink-0 flex items-center justify-center gap-2 border border-amber-400/40"
            >
              <UserCheck className="w-4 h-4" />
              <span>مراجعة واعتماد الطلب بكلمة المرور 🔑</span>
            </button>
          </div>
        )}

        {/* 💰 Admin Pending Money Requests (طلبات الصرف المعلقة) Alert Banner 💰 */}
        {isCurrentAdmin && pendingMoneyRequests && pendingMoneyRequests.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-emerald-300 animate-pulse" dir="rtl">
            <div className="flex items-center gap-3 text-right">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-300 flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-black/20">
                {pendingMoneyRequests.length}
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-white block">
                  📥 لديك ({pendingMoneyRequests.length}) طلب صرف أموال جديد من الإخوة!
                </span>
                <span className="text-xs font-bold text-emerald-100 mt-0.5 block">
                  طلب الأخ ({pendingMoneyRequests[0].brotherName}) مبلغ {pendingMoneyRequests[0].amount} لـ [{pendingMoneyRequests[0].fieldName}] - ({pendingMoneyRequests[0].reason})
                </span>
              </div>
            </div>
            <button
              onClick={() => setPendingRequestsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 text-emerald-300 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95 shrink-0 flex items-center justify-center gap-2 border border-emerald-400/40"
            >
              <Send className="w-4 h-4 -rotate-45" />
              <span>مراجعة وصرف المبلغ الآن 💸</span>
            </button>
          </div>
        )}

        {/* Desktop View Switcher Tabs */}
        <DesktopNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <BrothersCards
              onOpenTransferModal={handleOpenTransfer}
              onOpenFieldsModal={handleOpenFieldsEdit}
              onOpenAddBrother={handleOpenAddBrother}
              onOpenEditBrother={handleOpenEditBrother}
              onOpenJoinQr={() => setJoinQrOpen(true)}
              onOpenGuestApprovals={() => setGuestApprovalsOpen(true)}
              onOpenRequestMoney={(brother, field) => handleOpenRequestMoney(brother, field)}
              onOpenChat={handleOpenChat}
            />

            {/* Live Counters & Summary Stats Bar (تم النقل أسفل بطاقة المستخدم) */}
            <LiveCountersBar
              onOpenPendingRequests={() => setPendingRequestsModalOpen(true)}
              onOpenGuestApprovals={() => setGuestApprovalsOpen(true)}
            />
          </div>
        )}

        {activeTab === 'brothers' && (
          <BrothersCards
            onOpenTransferModal={handleOpenTransfer}
            onOpenFieldsModal={handleOpenFieldsEdit}
            onOpenAddBrother={handleOpenAddBrother}
            onOpenEditBrother={handleOpenEditBrother}
            onOpenJoinQr={() => setJoinQrOpen(true)}
            onOpenGuestApprovals={() => setGuestApprovalsOpen(true)}
            onOpenRequestMoney={(brother, field) => handleOpenRequestMoney(brother, field)}
            onOpenChat={handleOpenChat}
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
        onOpenChat={handleOpenChat}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTransferModal={() => handleOpenTransfer()}
        onOpenRequestMoney={(brother, field) => handleOpenRequestMoney(brother, field)}
        onOpenChat={handleOpenChat}
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
        onClose={() => {
          setRequestMoneyModalOpen(false);
          setRequestMoneyBrotherId(null);
          setRequestMoneyFieldId(null);
        }}
        initialBrotherId={requestMoneyBrotherId}
        initialFieldId={requestMoneyFieldId}
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
        onOpenCardsManager={() => setCardsManagerOpen(true)}
        onOpenJoinQr={() => setJoinQrOpen(true)}
      />

      <QrShareModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <JoinBrotherQrModal
        isOpen={joinQrOpen}
        onClose={() => setJoinQrOpen(false)}
      />

      <GuestJoinApprovalsModal
        isOpen={guestApprovalsOpen}
        onClose={() => setGuestApprovalsOpen(false)}
      />

      <CircleChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        initialRecipientId={chatRecipientId}
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
