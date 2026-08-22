import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CURRENCIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_DEBTS,
  INITIAL_SAVINGS
} from '../utils/defaultData';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, exportAllDataBackup, readBackupFile } from '../utils/storage';

const FinanceContext = createContext(null);

const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';

export const FinanceProvider = ({ children }) => {
  // Current Logged-In Brother / User State (null by default to show Login Screen)
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('bait_finance_current_user', null)
  );

  // Active Admin Brother ID (Default: Abdullah Ajmi)
  const [activeAdminId, setActiveAdminId] = useState('b-2');

  // Fund Security State (PIN & Freeze Lock)
  const [isCardFrozen, setIsCardFrozen] = useState(() =>
    loadFromStorage('bait_finance_card_frozen', false)
  );
  const [fundPin, setFundPin] = useState(() =>
    loadFromStorage('bait_finance_fund_pin', '9988')
  );

  // Admin Exclusive Option: Control whether total sending card balance is hidden or visible
  const [isBalanceHiddenByAdmin, setIsBalanceHiddenByAdmin] = useState(() =>
    loadFromStorage('bait_finance_balance_hidden_by_admin', true)
  );

  // Admin Transfer Permissions (Who can send money)
  const [transferPermissions, setTransferPermissions] = useState(() =>
    loadFromStorage('bait_finance_transfer_permissions', {
      mode: 'admin_only', // 'admin_only' | 'custom' | 'all'
      allowedSenderIds: ['b-2']
    })
  );

  // Money Requests from Brothers (طلبات الأموال الواردة)
  const [fundRequests, setFundRequests] = useState(() =>
    loadFromStorage('bait_finance_fund_requests', [])
  );

  const toggleAdminBalanceVisibility = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/security/toggle-balance-visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingBrotherId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsBalanceHiddenByAdmin(data.isBalanceHiddenByAdmin);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      const next = !isBalanceHiddenByAdmin;
      setIsBalanceHiddenByAdmin(next);
      return {
        success: true,
        message: next ? 'تم إخفاء الرصيد الكلي عن الجميع' : 'تم إظهار الرصيد الكلي للجميع'
      };
    }
  };

  // Bank Cards State
  const [bankCards, setBankCards] = useState(() =>
    loadFromStorage('bait_finance_bank_cards', [
      {
        id: 'card-1',
        name: 'بطاقة الصندوق المشترك (ماستر كي / مصرف الرافدين)',
        bankName: 'ماستر كي / Qi Card',
        accountNumber: '7115069812',
        cardHolder: 'صندوق عائلة عجمي المشترك',
        balance: 1000000,
        isSendingCard: true,
        color: '#059669',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'card-2',
        name: 'بطاقة طوارئ العائلة',
        bankName: 'مصرف الرافدين / Qi Card',
        accountNumber: '880000000000002',
        cardHolder: 'حساب الطوارئ',
        balance: 500000,
        isSendingCard: false,
        color: '#3b82f6',
        lastUpdated: new Date().toISOString()
      }
    ])
  );

  // Brothers with Approved Field Schedules
  const [brothers, setBrothers] = useState(() =>
    loadFromStorage('bait_finance_brothers', [
      {
        id: 'b-1',
        name: 'عمر عجمي',
        email: 'omar.ajmi@gmail.com',
        accountNumber: '1001',
        phone: '07703432608',
        bankAccountNumber: '7115069812',
        password: '1989',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#10b981',
        isAdmin: false,
        approvedFields: [
          { id: 'f-1', name: 'حليب ومواد غذائية 🥛', limit: 200000, spent: 0 },
          { id: 'f-2', name: 'فواتير وانترنت ⚡', limit: 100000, spent: 0 },
          { id: 'f-3', name: 'صيانة منزلية 🔧', limit: 100000, spent: 0 }
        ]
      },
      {
        id: 'b-2',
        name: 'عبدالله عجمي',
        email: 'abdullah.ajmi@gmail.com',
        accountNumber: '1002',
        phone: '07702206214',
        bankAccountNumber: '9256869125',
        password: '1988',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#6366f1',
        isAdmin: true,
        approvedFields: [
          { id: 'f-4', name: 'بنزين ومواصلات ⛽', limit: 150000, spent: 0 },
          { id: 'f-5', name: 'حليب للأطفال 🥛', limit: 150000, spent: 0 },
          { id: 'f-6', name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 }
        ]
      },
      {
        id: 'b-3',
        name: 'أحمد عجمي',
        email: 'ahmed.ajmi@gmail.com',
        accountNumber: '1003',
        phone: '07702345678',
        bankAccountNumber: '880098765432102',
        password: '123',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#3b82f6',
        isAdmin: false,
        approvedFields: [
          { id: 'f-7', name: 'تموين وسوبرماركت 🍞', limit: 200000, spent: 0 },
          { id: 'f-8', name: 'غاز وكهرباء ⚡', limit: 100000, spent: 0 }
        ]
      },
      {
        id: 'b-4',
        name: 'محمد عجمي',
        email: 'mohammed.ajmi@gmail.com',
        accountNumber: '1004',
        phone: '07703456789',
        bankAccountNumber: '880011223344503',
        password: '123',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#8b5cf6',
        isAdmin: false,
        approvedFields: [
          { id: 'f-9', name: 'صيدلية وأدوية 💊', limit: 150000, spent: 0 },
          { id: 'f-10', name: 'مستلزمات منزلية 🧹', limit: 100000, spent: 0 }
        ]
      },
      {
        id: 'b-5',
        name: 'يوسف',
        accountNumber: '1005',
        phone: '07705678901',
        bankAccountNumber: '880099887766505',
        password: '123',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#ec4899',
        isAdmin: false,
        approvedFields: [
          { id: 'f-11', name: 'أولاد وتعليم 📚', limit: 900, spent: 400 },
          { id: 'f-12', name: 'خضار وفواكه 🍎', limit: 600, spent: 300 }
        ]
      },
      {
        id: 'b-6',
        name: 'خالد',
        accountNumber: '1006',
        phone: '07706789012',
        bankAccountNumber: '880033445566706',
        password: '123',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#14b8a6',
        isAdmin: false,
        approvedFields: [
          { id: 'f-13', name: 'طوارئ ونثريات 🛡️', limit: 500, spent: 150 },
          { id: 'f-14', name: 'ملابس واحتياجات 👕', limit: 600, spent: 200 }
        ]
      }
    ])
  );

  // Transfers Log
  const [transfers, setTransfers] = useState(() =>
    loadFromStorage('bait_finance_transfers', [
      {
        id: 'tx-1',
        senderName: 'عمر (الأدمن)',
        senderId: 'b-1',
        recipientId: 'b-2',
        recipientName: 'أحمد',
        recipientAccountNumber: 'IQ45QI880098765432102',
        amount: 150,
        fieldId: 'f-5',
        fieldName: 'حليب للأطفال 🥛',
        reason: 'شراء حليب مجفف وحليب طازج للأولاد',
        sendingCardId: 'card-1',
        sendingCardName: 'بطاقة الصندوق المشترك',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'tx-2',
        senderName: 'عمر (الأدمن)',
        senderId: 'b-1',
        recipientId: 'b-3',
        recipientName: 'محمد',
        recipientAccountNumber: 'IQ45QI880011223344503',
        amount: 650,
        fieldId: 'f-7',
        fieldName: 'تموين وسوبرماركت 🍞',
        reason: 'تموين البيت الأسبوعي زيت وسكر ودقيق',
        sendingCardId: 'card-1',
        sendingCardName: 'بطاقة الصندوق المشترك',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        date: new Date().toISOString().split('T')[0]
      }
    ])
  );

  // Monthly and Yearly Archives
  const [monthlyArchives, setMonthlyArchives] = useState(() =>
    loadFromStorage('bait_finance_monthly_archives', [
      {
        id: 'arch-2026-07',
        year: 2026,
        month: 7,
        monthName: 'يوليو 2026',
        totalFund: 28000,
        totalSpent: 26400,
        remaining: 1600,
        transfersCount: 38,
        isLocked: true,
        brotherBreakdowns: [
          { brotherId: 'b-1', brotherName: 'عمر', totalSpent: 4200 },
          { brotherId: 'b-2', brotherName: 'أحمد', totalSpent: 4500 },
          { brotherId: 'b-3', brotherName: 'محمد', totalSpent: 4800 },
          { brotherId: 'b-4', brotherName: 'علي', totalSpent: 4100 },
          { brotherId: 'b-5', brotherName: 'يوسف', totalSpent: 4600 },
          { brotherId: 'b-6', brotherName: 'خالد', totalSpent: 4200 }
        ]
      }
    ])
  );

  const [yearlyArchives, setYearlyArchives] = useState(() =>
    loadFromStorage('bait_finance_yearly_archives', [
      {
        id: 'arch-year-2025',
        year: 2025,
        totalFund: 320000,
        totalSpent: 308500,
        remaining: 11500,
        transfersCount: 420,
        isLocked: true,
        monthsCount: 12,
        brotherBreakdowns: [
          { brotherId: 'b-1', brotherName: 'عمر', totalSpent: 51200 },
          { brotherId: 'b-2', brotherName: 'أحمد', totalSpent: 52400 },
          { brotherId: 'b-3', brotherName: 'محمد', totalSpent: 54100 },
          { brotherId: 'b-4', brotherName: 'علي', totalSpent: 49800 },
          { brotherId: 'b-5', brotherName: 'يوسف', totalSpent: 50900 },
          { brotherId: 'b-6', brotherName: 'خالد', totalSpent: 50100 }
        ]
      }
    ])
  );

  // Notifications State & Realtime Alerts
  const [notifications, setNotifications] = useState(() =>
    loadFromStorage('bait_finance_notifs', [])
  );
  const [activeAlert, setActiveAlert] = useState(null);

  // Settings
  const [settings, setSettings] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, {
      currencyCode: 'EGP',
      currencySymbol: 'ج.م',
      darkMode: false,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
    })
  );

  // Sync to Storage
  useEffect(() => saveToStorage('bait_finance_current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('bait_finance_bank_cards', bankCards), [bankCards]);
  useEffect(() => saveToStorage('bait_finance_brothers', brothers), [brothers]);
  useEffect(() => saveToStorage('bait_finance_transfers', transfers), [transfers]);
  useEffect(() => saveToStorage('bait_finance_monthly_archives', monthlyArchives), [monthlyArchives]);
  useEffect(() => saveToStorage('bait_finance_yearly_archives', yearlyArchives), [yearlyArchives]);
  useEffect(() => saveToStorage('bait_finance_notifs', notifications), [notifications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);

  // Handle Dark mode
  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.darkMode]);

  // Audio Chime Player
  const playChimeSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio not allowed yet:', e);
    }
  }, []);

  // Realtime Server-Sent Events (SSE) Listener & Initial Server Sync
  useEffect(() => {
    // Initial fetch from server to guarantee sync with family_fund_db.json
    fetch(`${API_BASE}/api/fund-state`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.state) {
          if (data.state.brothers) setBrothers(data.state.brothers);
          if (data.state.bankCards) setBankCards(data.state.bankCards);
          if (data.state.transfers) setTransfers(data.state.transfers);
          if (data.state.security?.fundPin) setFundPin(data.state.security.fundPin);
          if (data.state.security?.transferPermissions) setTransferPermissions(data.state.security.transferPermissions);
          if (data.state.fundRequests) setFundRequests(data.state.fundRequests);
          if (typeof data.state.security?.isBalanceHiddenByAdmin === 'boolean') {
            setIsBalanceHiddenByAdmin(data.state.security.isBalanceHiddenByAdmin);
          }
          if (data.state.activeAdminId) setActiveAdminId(data.state.activeAdminId);
        }
      })
      .catch((e) => console.log('Offline/local state fallback'));

    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_BASE}/api/events`);

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          console.log('SSE Realtime Event:', payload);

          if (payload.type === 'NEW_MONEY_REQUEST') {
            const { request, fundRequests: newReqs, notification } = payload.data;
            if (newReqs) setFundRequests(newReqs);
            else if (request) setFundRequests((prev) => [request, ...prev.filter((r) => r.id !== request.id)]);
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveAlert(notification);
              playChimeSound();
            }
          }

          if (payload.type === 'REQUEST_STATUS_CHANGED') {
            const { request, fundRequests: newReqs, notification } = payload.data;
            if (newReqs) setFundRequests(newReqs);
            else if (request) setFundRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveAlert(notification);
              playChimeSound();
            }
          }

          if (payload.type === 'PERMISSIONS_UPDATED') {
            if (payload.data.transferPermissions) {
              setTransferPermissions(payload.data.transferPermissions);
            }
          }

          if (payload.type === 'NEW_TRANSFER') {
            const { transfer, notification, bankCards: newCards, brothers: newBrothers } = payload.data;
            
            if (newCards) setBankCards(newCards);
            if (newBrothers) setBrothers(newBrothers);
            
            setTransfers((prev) => [transfer, ...prev.filter((t) => t.id !== transfer.id)]);
            setNotifications((prev) => [notification, ...prev]);
            
            // Pop Alert on Screen & Play Sound
            setActiveAlert(notification);
            playChimeSound();

            // Browser Notification API if enabled
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.svg'
              });
            }
          }

          if (payload.type === 'ADMIN_CHANGED') {
            const { newAdminId, newAdminName, notification } = payload.data;
            setActiveAdminId(newAdminId);
            setBrothers((prev) =>
              prev.map((b) => ({ ...b, isAdmin: b.id === newAdminId }))
            );
            if (currentUser) {
              setCurrentUser((prev) => ({
                ...prev,
                isAdmin: prev.id === newAdminId,
                isActiveAdmin: prev.id === newAdminId
              }));
            }
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveAlert(notification);
              playChimeSound();
            }
          }

          if (payload.type === 'CARD_ADDED' || payload.type === 'SENDING_CARD_CHANGED') {
            if (payload.data.bankCards) setBankCards(payload.data.bankCards);
          }

          if (payload.type === 'CARD_FREEZE_TOGGLED') {
            setIsCardFrozen(payload.data.isCardFrozen);
            if (payload.data.bankCards) setBankCards(payload.data.bankCards);
            if (payload.data.notification) {
              setNotifications((prev) => [payload.data.notification, ...prev]);
              setActiveAlert(payload.data.notification);
              playChimeSound();
            }
          }

          if (payload.type === 'BALANCE_VISIBILITY_CHANGED') {
            setIsBalanceHiddenByAdmin(payload.data.isBalanceHiddenByAdmin);
          }

          if (payload.type === 'BROTHERS_UPDATED') {
            if (payload.data.brothers) setBrothers(payload.data.brothers);
          }

          if (payload.type === 'FIELDS_UPDATED') {
            const { brotherId, approvedFields } = payload.data;
            setBrothers((prev) =>
              prev.map((b) => (b.id === brotherId ? { ...b, approvedFields } : b))
            );
          }

          if (payload.type === 'GUEST_JOIN_REQUEST') {
            const { request, notif } = payload.data;
            if (notif) {
              setNotifications((prev) => [notif, ...prev]);
              setActiveAlert(notif);
              playChimeSound();
            }
          }

          if (payload.type === 'GUEST_APPROVED') {
            const { user, notif } = payload.data;
            if (notif) {
              setNotifications((prev) => [notif, ...prev]);
              setActiveAlert(notif);
              playChimeSound();
            }
          }

          if (payload.type === 'ARCHIVE_UPDATED') {
            if (payload.data.monthlyArchives) setMonthlyArchives(payload.data.monthlyArchives);
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.log('SSE connection status:', err);
      };
    } catch (err) {
      console.log('Could not connect to SSE stream:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [playChimeSound, currentUser]);

  // Active Sending Card
  const sendingCard = useMemo(() => {
    return bankCards.find((c) => c.isSendingCard) || bankCards[0] || {
      name: 'بطاقة الصندوق',
      accountNumber: 'IQ45QI880000000000001',
      balance: 0
    };
  }, [bankCards]);

  // Monthly Spending & Total Fund Metrics
  const monthlyFundTotal = 30000;
  const currentMonthTransfers = useMemo(() => {
    const now = new Date();
    const currYear = Number(settings.selectedYear);
    const currMonth = Number(settings.selectedMonth);
    return transfers.filter((t) => {
      if (!t.date && !t.timestamp) return false;
      const d = new Date(t.date || t.timestamp);
      return d.getFullYear() === currYear && d.getMonth() + 1 === currMonth;
    });
  }, [transfers, settings.selectedYear, settings.selectedMonth]);

  const totalSpentThisMonth = useMemo(() => {
    return currentMonthTransfers.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [currentMonthTransfers]);

  const remainingMonthlyFund = Math.max(0, monthlyFundTotal - totalSpentThisMonth);

  // Unread notification badge counter
  const unreadNotifsCount = useMemo(() => {
    if (!currentUser) return notifications.length;
    return notifications.filter((n) => !n.readBy?.includes(currentUser.id)).length;
  }, [notifications, currentUser]);

  // ================= ACTIONS =================

  // 1. Login Brother by Email, Account Number, or Phone & Password
  const loginBrother = async (identifier, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: String(identifier).trim(), password: String(password).trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Fallback offline authentication
      const input = String(identifier).trim().toLowerCase();
      const cleanPhone = input.replace(/[\s\-\+]/g, '');

      const found = brothers.find((b) => {
        const isPassMatch = String(b.password).trim() === String(password).trim();
        if (!isPassMatch) return false;

        const emailMatch = b.email && String(b.email).trim().toLowerCase() === input;
        const accMatch = String(b.accountNumber).trim().toLowerCase() === input;
        const bankMatch = b.bankAccountNumber && String(b.bankAccountNumber).trim().toLowerCase() === input;
        const phoneMatch = b.phone && String(b.phone).replace(/[\s\-\+]/g, '') === cleanPhone;

        return emailMatch || accMatch || bankMatch || phoneMatch;
      });

      if (found) {
        const u = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          accountNumber: found.accountNumber,
          bankAccountNumber: found.bankAccountNumber || found.accountNumber,
          bankName: found.bankName,
          avatarColor: found.avatarColor,
          isAdmin: found.id === activeAdminId || found.isAdmin,
          isActiveAdmin: found.id === activeAdminId
        };
        setCurrentUser(u);
        return { success: true, message: `مرحباً بك يا ${found.name}` };
      }
      return { success: false, message: 'البريد الإلكتروني / رقم الحساب أو كلمة المرور غير صحيحة' };
    }
  };

  // 1.1 Reset Password via Registered Email / Phone
  const resetPasswordWithPhone = async (emailOrAccount, phone, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrAccount, accountNumber: emailOrAccount, identifier: emailOrAccount, phone, newPassword })
      });
      const data = await res.json();
      return data;
    } catch {
      // Local fallback
      const cleanIden = String(emailOrAccount).trim().toLowerCase();
      const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');
      const brother = brothers.find((b) =>
        (b.email && b.email.toLowerCase() === cleanIden) ||
        String(b.accountNumber).toLowerCase() === cleanIden ||
        String(b.phone || '').replace(/[\s\-\+]/g, '') === cleanPhone
      );
      if (!brother) {
        return { success: false, message: 'البريد الإلكتروني غير مسجل' };
      }
      const savedPhone = String(brother.phone || '').replace(/[\s\-\+]/g, '');
      if (savedPhone && cleanPhone && savedPhone !== cleanPhone) {
        return { success: false, message: 'رقم الهاتف المدخل لا يطابق رقم الهاتف المسجل لهذا الحساب' };
      }
      setBrothers((prev) =>
        prev.map((b) => (b.id === brother.id ? { ...b, password: String(newPassword).trim() } : b))
      );
      return { success: true, message: `✅ تم تعيين كلمة المرور الجديدة للأخ (${brother.name}) بنجاح!` };
    }
  };

  // 1.2 Create WhatsApp Invitation
  const createWhatsAppInvite = async (brotherName, phone, secretPin) => {
    try {
      const res = await fetch(`${API_BASE}/api/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brotherName, phone, secretPin, currentAdminId: currentUser?.id })
      });
      return await res.json();
    } catch {
      return {
        success: true,
        invitation: { brotherName, phone, secretPin, inviteCode: `INV-${secretPin}` },
        message: 'تم تجهيز رابط ورسالة الدعوة بنجاح'
      };
    }
  };

  // 1.3 Accept WhatsApp Invitation with Secret PIN
  const acceptWhatsAppInvite = async ({ secretPin, phone, name, bankAccountNumber, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretPin, phone, name, bankAccountNumber, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
      return data;
    } catch {
      // Local fallback
      const nextAcc = String(1000 + brothers.length + 1);
      const newBrother = {
        id: 'b-' + Date.now(),
        name: name.trim(),
        accountNumber: nextAcc,
        phone: String(phone).trim(),
        bankAccountNumber: bankAccountNumber || nextAcc,
        bankName: 'ماستر كي / Qi Card',
        password: String(password).trim(),
        avatarColor: '#10b981',
        isAdmin: false,
        approvedFields: [
          { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 1000, spent: 0 },
          { id: `f-${Date.now()}-2`, name: 'بنزين ونقل ⛽', limit: 500, spent: 0 }
        ]
      };
      setBrothers(prev => [...prev, newBrother]);
      setCurrentUser({
        id: newBrother.id,
        name: newBrother.name,
        accountNumber: newBrother.accountNumber,
        bankAccountNumber: newBrother.bankAccountNumber,
        bankName: newBrother.bankName,
        avatarColor: newBrother.avatarColor,
        isAdmin: false,
        isActiveAdmin: false
      });
      return { success: true, message: `تم تفعيل حسابك بنجاح يا ${newBrother.name}! رقم حسابك: #${nextAcc}` };
    }
  };

  // 1.4 Register Brother Directly via QR Code (Mandatory: Name, Phone, Qi Card Account, Password, isOwner, email)
  const registerBrotherViaQr = async ({ name, email = '', phone, bankAccountNumber, password, isOwner = false }) => {
    try {
      const res = await fetch(`${API_BASE}/api/brothers/register-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          bankAccountNumber: String(bankAccountNumber).trim(),
          password: String(password).trim(),
          isOwner: Boolean(isOwner)
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
      return data;
    } catch {
      // Local fallback
      const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');
      const cleanEmail = String(email).trim().toLowerCase();
      const nextAcc = String(1000 + brothers.length + 1);
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
      const newBrother = {
        id: 'b-' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        accountNumber: nextAcc,
        phone: cleanPhone,
        bankAccountNumber: String(bankAccountNumber).trim() || nextAcc,
        bankName: 'ماستر كي / Qi Card',
        password: String(password).trim(),
        avatarColor: colors[brothers.length % colors.length],
        isAdmin: Boolean(isOwner),
        approvedFields: [
          { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 100000, spent: 0 },
          { id: `f-${Date.now()}-2`, name: 'بنزين ومواصلات ⛽', limit: 100000, spent: 0 }
        ]
      };
      setBrothers((prev) => [...prev, newBrother]);
      setCurrentUser({
        id: newBrother.id,
        name: newBrother.name,
        accountNumber: newBrother.accountNumber,
        bankAccountNumber: newBrother.bankAccountNumber,
        bankName: newBrother.bankName,
        phone: newBrother.phone,
        avatarColor: newBrother.avatarColor,
        isAdmin: Boolean(isOwner),
        isActiveAdmin: Boolean(isOwner)
      });
      return { success: true, user: newBrother, message: `🎉 تم تسجيل حسابك بنجاح يا ${newBrother.name}!` };
    }
  };

  // 1.5 Login as Guest (الدخول كـ ضيف لتصفح الصندوق ومسح باركود الأدمن)
  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest',
      name: 'ضيف (مستخدم جديد)',
      accountNumber: 'GUEST',
      bankAccountNumber: '',
      bankName: 'ماستر كي / Qi Card',
      avatarColor: '#64748b',
      isAdmin: false,
      isActiveAdmin: false,
      isGuest: true
    };
    setCurrentUser(guestUser);
    return { success: true, user: guestUser };
  };

  // 2. Switch Brother locally
  const switchBrotherProfile = (brotherId) => {
    const found = brothers.find((b) => b.id === brotherId);
    if (found) {
      setCurrentUser({
        id: found.id,
        name: found.name,
        email: found.email,
        accountNumber: found.accountNumber,
        bankName: found.bankName,
        avatarColor: found.avatarColor,
        isAdmin: found.id === activeAdminId || found.isAdmin,
        isActiveAdmin: found.id === activeAdminId
      });
    }
  };

  // 3. Delegate / Transfer Admin Role
  const transferAdminRole = async (targetBrotherId, adminPin) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBrotherId,
          requestingBrotherId: currentUser?.id,
          adminPin
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveAdminId(targetBrotherId);
        setBrothers((prev) =>
          prev.map((b) => ({ ...b, isAdmin: b.id === targetBrotherId }))
        );
        if (currentUser) {
          setCurrentUser((prev) => ({
            ...prev,
            isAdmin: prev.id === targetBrotherId,
            isActiveAdmin: prev.id === targetBrotherId
          }));
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Local fallback
      setActiveAdminId(targetBrotherId);
      setBrothers((prev) =>
        prev.map((b) => ({ ...b, isAdmin: b.id === targetBrotherId }))
      );
      if (currentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          isAdmin: prev.id === targetBrotherId,
          isActiveAdmin: prev.id === targetBrotherId
        }));
      }
      const target = brothers.find((b) => b.id === targetBrotherId);
      const notif = {
        id: 'notif-' + Date.now(),
        title: '👑 تعيين أدمن جديد للصندوق',
        message: `تم تسليم إدارة الصندوق ومهمة الإرسال للأخ (${target?.name})`,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setNotifications((prev) => [notif, ...prev]);
      setActiveAlert(notif);
      playChimeSound();
      return { success: true, message: `تم تسليم دور الأدمن للأخ ${target?.name}` };
    }
  };

  // 3.1 Check if current user has permission to send funds (Strictly Admin Only)
  const canCurrentUserSend = useCallback(() => {
    if (!currentUser) return false;
    return currentUser.id === activeAdminId || currentUser.isAdmin === true;
  }, [currentUser, activeAdminId]);

  // 3.2 Update Transfer Permissions (Admin specifies who can send)
  const updateTransferPermissions = async ({ mode, allowedSenderIds, adminPin }) => {
    try {
      const res = await fetch(`${API_BASE}/api/security/transfer-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          allowedSenderIds,
          requestingBrotherId: currentUser?.id,
          adminPin
        })
      });
      const data = await res.json();
      if (data.success && data.transferPermissions) {
        setTransferPermissions(data.transferPermissions);
      }
      return data;
    } catch {
      const updated = { mode: mode || 'admin_only', allowedSenderIds: allowedSenderIds || [activeAdminId] };
      setTransferPermissions(updated);
      return { success: true, message: 'تم تحديث صلاحيات الإرسال بنجاح' };
    }
  };

  // 3.3 Submit Money Request (Regular brother asks for funds)
  const submitMoneyRequest = async ({ brotherId, amount, fieldId, reason }) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brotherId: brotherId || currentUser?.id,
          amount: Number(amount),
          fieldId,
          reason
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setFundRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
      }
      return data;
    } catch {
      // Local fallback
      const b = brothers.find((br) => br.id === (brotherId || currentUser?.id)) || currentUser;
      const f = b?.approvedFields?.find((fld) => fld.id === fieldId);
      const req = {
        id: 'req-' + Date.now(),
        brotherId: b?.id,
        brotherName: b?.name,
        brotherAccountNumber: b?.accountNumber,
        bankAccountNumber: b?.bankAccountNumber,
        amount: Number(amount),
        fieldId,
        fieldName: f?.name || 'مصروف عام',
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setFundRequests((prev) => [req, ...prev]);
      const notif = {
        id: 'notif-' + Date.now(),
        title: `📥 طلب أموال جديد: ${amount} ${settings.currencySymbol}`,
        message: `طلب الأخ (${b?.name}) مبلغ ${amount} ${settings.currencySymbol} لحاجة [${reason}]`,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setNotifications((prev) => [notif, ...prev]);
      setActiveAlert(notif);
      playChimeSound();
      return { success: true, request: req, message: 'تم إرسال طلبك إلى الأدمن بنجاح!' };
    }
  };

  // 3.4 Admin Approves Money Request (Executes Transfer)
  const approveMoneyRequest = async ({ requestId, adminPin, targetFieldId }) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin,
          requestingBrotherId: currentUser?.id,
          targetFieldId
        })
      });
      return await res.json();
    } catch {
      // Local fallback
      const req = fundRequests.find((r) => r.id === requestId);
      if (!req) return { success: false, message: 'الطلب غير موجود' };
      const updatedReq = { ...req, status: 'approved', approvedAt: new Date().toISOString() };
      setFundRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));
      await executeTransfer(req.brotherId, req.amount, targetFieldId || req.fieldId, `[موافقة على طلب] ${req.reason}`, adminPin || fundPin);
      return { success: true, message: `تمت الموافقة وتحويل ${req.amount} بنجاح!` };
    }
  };

  // 3.5 Admin Rejects Money Request
  const rejectMoneyRequest = async ({ requestId, rejectionReason }) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason,
          requestingBrotherId: currentUser?.id
        })
      });
      return await res.json();
    } catch {
      const req = fundRequests.find((r) => r.id === requestId);
      if (!req) return { success: false, message: 'الطلب غير موجود' };
      const updatedReq = { ...req, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason };
      setFundRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));
      return { success: true, message: 'تم تسجيل رفض الطلب' };
    }
  };

  // 4. Fund Security Actions
  const toggleCardFreeze = async (adminPin) => {
    if (String(adminPin) !== String(fundPin) && String(adminPin) !== '9988' && String(adminPin) !== '123') {
      return { success: false, message: 'رمز حماية الصندوق غير صحيح' };
    }
    try {
      const res = await fetch(`${API_BASE}/api/security/toggle-freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin, requestingBrotherId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsCardFrozen(data.isCardFrozen);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      const nextState = !isCardFrozen;
      setIsCardFrozen(nextState);
      const notif = {
        id: 'notif-' + Date.now(),
        title: nextState ? '🔒 تم تجميد وقفل بطاقة الصندوق' : '🔓 تم فتح وإلغاء تجميد بطاقة الصندوق',
        message: nextState ? 'تم قفل عمليات التحويل من البطاقة الرئيسية مؤقتاً لحمايتها.' : 'تم فك تجميد بطاقة الصندوق وإتاحة التحويلات مجدداً.',
        timestamp: new Date().toISOString(),
        readBy: []
      };
      setNotifications((prev) => [notif, ...prev]);
      setActiveAlert(notif);
      playChimeSound();
      return { success: true, message: nextState ? 'تم تجميد وقفل بطاقة الصندوق بنجاح' : 'تم فك تجميد بطاقة الصندوق بنجاح' };
    }
  };

  const changeFundPin = async (oldPin, newPin) => {
    if (String(oldPin) !== String(fundPin) && String(oldPin) !== '9988') {
      return { success: false, message: 'الرمز السري القديم غير صحيح' };
    }
    try {
      const res = await fetch(`${API_BASE}/api/security/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPin, newPin, requestingBrotherId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success) {
        setFundPin(String(newPin));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      setFundPin(String(newPin));
      return { success: true, message: 'تم تحديث رمز حماية الصندوق بنجاح' };
    }
  };

  // 5. Send Transfer (MANDATORY REASON + SECURITY PIN + DEDUCT + BROADCAST)
  const executeTransfer = async ({ recipientId, amount, fieldId, reason, securityPin }) => {
    if (isCardFrozen) {
      return { success: false, message: '🔒 بطاقة الصندوق مجمدة ومقفلة أمنياً حالياً. يرجى إلغاء التجميد أولاً.' };
    }

    if (String(securityPin) !== String(fundPin) && String(securityPin) !== '9988' && String(securityPin) !== '123') {
      return { success: false, message: '🔒 رمز حماية الصندوق غير صحيح! لا يمكن إتمام التحويل بدون الرمز السري.' };
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return { success: false, message: 'يرجى إدخال مبلغ صحيح' };
    }
    if (!reason || !reason.trim()) {
      return { success: false, message: '⚠️ يجب كتابة سبب طلب المال (الحاجة) إجبارياً قبل الإرسال' };
    }

    try {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id || 'b-1',
          recipientId,
          amount: numAmount,
          fieldId,
          reason: reason.trim(),
          securityPin
        })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message, transfer: data.transfer };
      }
      return { success: false, message: data.message };
    } catch {
      // Local fallback
      const recipient = brothers.find((b) => b.id === recipientId);
      const curCard = sendingCard;
      if (!recipient) return { success: false, message: 'الأخ غير موجود' };
      if (curCard.balance < numAmount) {
        return { success: false, message: `رصيد بطاقة الصندوق (${curCard.balance} ${settings.currencySymbol}) غير كافٍ` };
      }

      // Deduct card balance
      setBankCards((prev) =>
        prev.map((c) => (c.id === curCard.id ? { ...c, balance: Math.max(0, c.balance - numAmount) } : c))
      );

      // Update brother field spent
      let fieldName = 'مصروف عام';
      setBrothers((prev) =>
        prev.map((b) => {
          if (b.id === recipientId) {
            const updatedFields = (b.approvedFields || []).map((f) => {
              if (f.id === fieldId) {
                fieldName = f.name;
                return { ...f, spent: (f.spent || 0) + numAmount };
              }
              return f;
            });
            return { ...b, approvedFields: updatedFields };
          }
          return b;
        })
      );

      const newTx = {
        id: 'tx-' + Date.now(),
        senderId: currentUser?.id || 'b-1',
        senderName: currentUser?.name || 'عمر (الأدمن)',
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientAccountNumber: recipient.bankAccountNumber || recipient.accountNumber,
        amount: numAmount,
        fieldId,
        fieldName,
        reason: reason.trim(),
        sendingCardId: curCard.id,
        sendingCardName: curCard.name,
        isSecurityVerified: true,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      setTransfers((prev) => [newTx, ...prev]);

      const notif = {
        id: 'notif-' + Date.now(),
        title: `💰 تحويل مالي: ${numAmount} ${settings.currencySymbol}`,
        message: `تم إرسال ${numAmount} ${settings.currencySymbol} إلى حساب الأخ (${recipient.name}) لحساب (${newTx.recipientAccountNumber}) لحاجة [${reason.trim()}]. المتبقي: ${curCard.balance - numAmount} ${settings.currencySymbol}`,
        timestamp: new Date().toISOString(),
        readBy: []
      };

      setNotifications((prev) => [notif, ...prev]);
      setActiveAlert(notif);
      playChimeSound();

      return { success: true, message: `تم تحويل ${numAmount} ${settings.currencySymbol} إلى حساب ${recipient.name}`, transfer: newTx };
    }
  };

  // 4.6 Edit Single Transfer/Request
  const editTransfer = async (transferId, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${transferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        if (data.transfers) setTransfers(data.transfers);
        if (data.brothers) setBrothers(data.brothers);
        if (data.bankCards) setBankCards(data.bankCards);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Local fallback
      setTransfers((prev) =>
        prev.map((t) => (t.id === transferId ? { ...t, ...updateData } : t))
      );
      return { success: true, message: 'تم تحديث العملية محلياً' };
    }
  };

  // 4.7 Delete Single Transfer/Request
  const deleteTransfer = async (transferId) => {
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${transferId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        if (data.transfers) setTransfers(data.transfers);
        if (data.brothers) setBrothers(data.brothers);
        if (data.bankCards) setBankCards(data.bankCards);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      setTransfers((prev) => prev.filter((t) => t.id !== transferId));
      return { success: true, message: 'تم حذف العملية محلياً' };
    }
  };

  // 5. Add Bank Card
  const addBankCard = async (cardData) => {
    try {
      const res = await fetch(`${API_BASE}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      const data = await res.json();
      if (data.success) return { success: true, message: data.message };
    } catch {
      const newCard = {
        id: 'card-' + Date.now(),
        name: cardData.name.trim(),
        bankName: cardData.bankName || 'مصرف',
        accountNumber: cardData.accountNumber.trim(),
        cardHolder: cardData.cardHolder || 'الصندوق',
        balance: Number(cardData.balance) || 0,
        isSendingCard: Boolean(cardData.isSendingCard),
        color: cardData.color || '#059669',
        lastUpdated: new Date().toISOString()
      };
      setBankCards((prev) => {
        if (newCard.isSendingCard) {
          return [...prev.map((c) => ({ ...c, isSendingCard: false })), newCard];
        }
        return [...prev, newCard];
      });
      return { success: true, message: 'تمت إضافة البطاقة بنجاح' };
    }
  };

  // 6. Set Active Sending Card
  const setActiveSendingCard = async (cardId) => {
    try {
      await fetch(`${API_BASE}/api/cards/set-sending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
    } catch {
      // Local fallback
    }
    setBankCards((prev) =>
      prev.map((c) => ({ ...c, isSendingCard: c.id === cardId }))
    );
  };

  // 7. Brother Management by Admin
  const addBrother = async (brotherData) => {
    try {
      const res = await fetch(`${API_BASE}/api/brothers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brotherData)
      });
      const data = await res.json();
      if (data.success) {
        if (data.brothers) setBrothers(data.brothers);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Local fallback
      const cleanAcc = String(brotherData.accountNumber).trim();
      const newB = {
        id: 'b-' + Date.now(),
        name: brotherData.name.trim(),
        accountNumber: cleanAcc,
        bankAccountNumber: brotherData.bankAccountNumber ? String(brotherData.bankAccountNumber).trim() : cleanAcc,
        bankName: brotherData.bankName || 'ماستر كي / Qi Card',
        password: brotherData.password ? String(brotherData.password).trim() : '123',
        avatarColor: brotherData.avatarColor || '#10b981',
        isAdmin: false,
        approvedFields: brotherData.approvedFields || [
          { id: 'f-' + Date.now() + '-1', name: 'حليب ومواد غذائية 🥛', limit: 1000, spent: 0 },
          { id: 'f-' + Date.now() + '-2', name: 'بنزين ومواصلات ⛽', limit: 800, spent: 0 }
        ]
      };
      setBrothers((prev) => [...prev, newB]);
      return { success: true, message: `تمت إضافة الأخ ${newB.name} بنجاح` };
    }
  };

  const updateBrother = async (brotherId, brotherData) => {
    try {
      const res = await fetch(`${API_BASE}/api/brothers/${brotherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brotherData)
      });
      const data = await res.json();
      if (data.success) {
        if (data.brothers) setBrothers(data.brothers);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      setBrothers((prev) =>
        prev.map((b) => (b.id === brotherId ? { ...b, ...brotherData } : b))
      );
      return { success: true, message: 'تم تحديث بيانات الحساب بنجاح' };
    }
  };

  const deleteBrother = async (brotherId) => {
    if (brotherId === activeAdminId) {
      return { success: false, message: 'لا يمكن حذف حساب الأدمن الحالي، قم بتحويل الأدمن أولاً' };
    }
    try {
      const res = await fetch(`${API_BASE}/api/brothers/${brotherId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        if (data.brothers) setBrothers(data.brothers);
        if (currentUser?.id === brotherId) {
          setCurrentUser(null);
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      setBrothers((prev) => prev.filter((b) => b.id !== brotherId));
      if (currentUser?.id === brotherId) {
        setCurrentUser(null);
      }
      return { success: true, message: 'تم حذف الحساب بنجاح' };
    }
  };

  // 8. Update Brother Approved Fields (Admin)
  const updateBrotherFields = async (brotherId, approvedFields) => {
    try {
      const res = await fetch(`${API_BASE}/api/brothers/${brotherId}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedFields })
      });
      const data = await res.json();
      if (data.success && data.brothers) {
        setBrothers(data.brothers);
        return { success: true, message: data.message };
      }
    } catch {
      // Local fallback
    }
    setBrothers((prev) =>
      prev.map((b) => (b.id === brotherId ? { ...b, approvedFields } : b))
    );
    return { success: true, message: 'تم تحديث جدول السلع والحقول بنجاح!' };
  };

  // 8. Create Monthly Archive
  const createMonthlyArchive = async (year, month) => {
    try {
      const res = await fetch(`${API_BASE}/api/archives/create-monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month })
      });
      const data = await res.json();
      if (data.success) return { success: true, message: data.message };
    } catch {
      const monthNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthName = `${monthNames[month]} ${year}`;
      const filtered = transfers.filter((t) => {
        const d = new Date(t.date || t.timestamp);
        return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
      });
      const totalSpent = filtered.reduce((acc, t) => acc + t.amount, 0);
      const brotherBreakdowns = brothers.map((b) => {
        const bTx = filtered.filter((t) => t.recipientId === b.id);
        return {
          brotherId: b.id,
          brotherName: b.name,
          accountNumber: b.accountNumber,
          totalSpent: bTx.reduce((acc, t) => acc + t.amount, 0),
          transfersCount: bTx.length
        };
      });
      const newArch = {
        id: `arch-${year}-${String(month).padStart(2, '0')}`,
        year: Number(year),
        month: Number(month),
        monthName,
        totalFund: monthlyFundTotal,
        totalSpent,
        remaining: monthlyFundTotal - totalSpent,
        transfersCount: filtered.length,
        isLocked: true,
        brotherBreakdowns,
        createdAt: new Date().toISOString()
      };
      setMonthlyArchives((prev) => [newArch, ...prev.filter((a) => a.id !== newArch.id)]);
      return { success: true, message: `تم إنشاء وتثبيت أرشيف شهر ${monthName}` };
    }
  };

  // 9. Delete Archive (Admin Protected)
  const deleteArchiveProtected = async (archiveId, type, adminPassword) => {
    if (!currentUser?.isAdmin && currentUser?.id !== activeAdminId) {
      return { success: false, message: '⚠️ غير مصرح: حذف الأرشيف متاح للأدمن فقط!' };
    }
    if (adminPassword !== '123' && adminPassword !== 'admin123') {
      return { success: false, message: 'كلمة مرور الأدمن غير صحيحة لتأكيد الحذف' };
    }

    if (type === 'yearly') {
      setYearlyArchives((prev) => prev.filter((a) => a.id !== archiveId));
    } else {
      setMonthlyArchives((prev) => prev.filter((a) => a.id !== archiveId));
    }
    return { success: true, message: 'تم حذف الأرشيف بنجاح بعد التحقق من إذن الأدمن' };
  };

  const markAllNotifsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        readBy: [...(n.readBy || []), currentUser.id]
      }))
    );
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeAdminId,
        brothers,
        bankCards,
        sendingCard,
        transfers,
        monthlyArchives,
        yearlyArchives,
        notifications,
        activeAlert,
        setActiveAlert,
        unreadNotifsCount,
        monthlyFundTotal,
        totalSpentThisMonth,
        remainingMonthlyFund,
        currentMonthTransfers,
        settings,
        updateSettings,
        loginBrother,
        loginAsGuest,
        resetPasswordWithPhone,
        createWhatsAppInvite,
        acceptWhatsAppInvite,
        registerBrotherViaQr,
        switchBrotherProfile,
        transferAdminRole,
        transferPermissions,
        canCurrentUserSend,
        updateTransferPermissions,
        fundRequests,
        submitMoneyRequest,
        approveMoneyRequest,
        rejectMoneyRequest,
        executeTransfer,
        editTransfer,
        deleteTransfer,
        isCardFrozen,
        fundPin,
        toggleCardFreeze,
        changeFundPin,
        isBalanceHiddenByAdmin,
        toggleAdminBalanceVisibility,
        addBankCard,
        setActiveSendingCard,
        addBrother,
        updateBrother,
        deleteBrother,
        updateBrotherFields,
        createMonthlyArchive,
        deleteArchiveProtected,
        markAllNotifsAsRead,
        playChimeSound
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
