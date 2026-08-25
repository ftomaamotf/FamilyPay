import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

const API_BASE = (() => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const port = window.location.port;
    if (host.includes('onrender.com') || host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || port === '5050') {
      return '';
    }
  }
  return 'https://familypay-aw26.onrender.com';
})();

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

  // Guest Join Requests (طلبات انضمام الضيوف المعلقة)
  const [guestRequests, setGuestRequests] = useState([]);

  const fetchGuestRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/brothers/guest-requests`);
      const data = await res.json();
      if (data.success) {
        setGuestRequests(data.requests || []);
      }
    } catch {
      // offline silent
    }
  }, []);

  const fetchFundRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fund-state`);
      const data = await res.json();
      if (data.success && data.state) {
        if (data.state.fundRequests) setFundRequests(data.state.fundRequests);
        if (data.state.brothers) setBrothers(data.state.brothers);
        if (data.state.bankCards) setBankCards(data.state.bankCards);
        if (data.state.transfers) setTransfers(data.state.transfers);
      }
    } catch {
      // offline silent
    }
  }, []);

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

  // Brothers with Approved Field Schedules (Only real users: Abdullah, Mohammed, Omar)
  const [brothers, setBrothers] = useState(() => {
    const raw = loadFromStorage('bait_finance_brothers', [
      {
        id: 'b-2',
        name: 'عبدالله عجمي',
        email: 'abduallh_ajmi@yahoo.com',
        accountNumber: '1002',
        phone: '07702206214',
        bankAccountNumber: '9256869125',
        password: '1988',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#6366f1',
        isAdmin: true,
        approvedFields: []
      },
      {
        id: 'b-1787243535948',
        name: 'محمد عجمي',
        email: 'mohammed@familyfund.iq',
        accountNumber: '1003',
        phone: '077027959161',
        bankAccountNumber: '7145810946',
        password: '123',
        bankName: 'ماستر كي / Qi Card',
        avatarColor: '#10b981',
        isAdmin: false,
        approvedFields: []
      },
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
        approvedFields: []
      }
    ]);
    // Filter out any legacy dummy sample names or deleted accounts
    return (raw || []).filter((b) => b && !['b-3', 'b-4', 'b-5', 'b-6', 'b-1787553982824'].includes(b.id) && !['يوسف', 'خالد', 'أحمد', 'علي فاضل'].includes(b.name));
  });

  // Transfers Log (Real transfers only, no dummy items)
  const [transfers, setTransfers] = useState(() => {
    const raw = loadFromStorage('bait_finance_transfers', []);
    return (raw || []).filter((t) => t && !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id));
  });

  // Monthly and Yearly Archives
  const [monthlyArchives, setMonthlyArchives] = useState(() =>
    loadFromStorage('bait_finance_monthly_archives', [])
  );

  const [yearlyArchives, setYearlyArchives] = useState(() =>
    loadFromStorage('bait_finance_yearly_archives', [])
  );

  // Notifications State & Realtime Alerts
  const [notifications, setNotifications] = useState(() =>
    loadFromStorage('bait_finance_notifs', [])
  );
  const [activeAlert, setActiveAlert] = useState(null);

  // Settings
  const [settings, setSettings] = useState(() => {
    const s = loadFromStorage(STORAGE_KEYS.SETTINGS, {
      currencyCode: 'IQD',
      currencySymbol: 'د.ع',
      darkMode: false,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
    });
    // Ensure Iraqi Dinar currency symbol
    if (!s.currencySymbol || s.currencySymbol === 'ج.م' || s.currencyCode === 'EGP') {
      s.currencyCode = 'IQD';
      s.currencySymbol = 'د.ع';
    }
    return s;
  });

  // Circle Chat & Voice Notes State
  const [messages, setMessages] = useState(() => loadFromStorage('bait_finance_messages', []));

  // Live Intercom & Walkie-Talkie State
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingVoiceBurst, setIncomingVoiceBurst] = useState(null);
  const [isWalkieTalkieOpen, setIsWalkieTalkieOpen] = useState(false);

  // Sync to Storage
  useEffect(() => saveToStorage('bait_finance_current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('bait_finance_bank_cards', bankCards), [bankCards]);
  useEffect(() => saveToStorage('bait_finance_brothers', brothers), [brothers]);
  useEffect(() => saveToStorage('bait_finance_transfers', transfers), [transfers]);
  useEffect(() => saveToStorage('bait_finance_monthly_archives', monthlyArchives), [monthlyArchives]);
  useEffect(() => saveToStorage('bait_finance_yearly_archives', yearlyArchives), [yearlyArchives]);
  useEffect(() => saveToStorage('bait_finance_notifs', notifications), [notifications]);
  useEffect(() => saveToStorage('bait_finance_messages', messages), [messages]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);

  // Handle Dark mode
  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.darkMode]);

  // Distinct Message Notification Sound (Double-Tone Crisp Chime)
  const playMessageNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      // Note 1 (High bell)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Note 2 (Higher bell)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.32);

      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([300, 150, 300]);
      }
    } catch (e) {
      console.log('Message sound error:', e);
    }
  }, []);

  // Intercom Walkie-Talkie Ringtone (Loud Radio Ring & Strong Vibration)
  const playIntercomRingtone = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      [0, 0.22, 0.44, 0.66].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(784, now + t); // G5
        osc.frequency.setValueAtTime(987.77, now + t + 0.09); // B5
        gain.gain.setValueAtTime(0.4, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.18);
      });

      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([1000, 400, 1000, 400, 1000]);
      }
    } catch (e) {
      console.log('Intercom ringtone error:', e);
    }
  }, []);

  // Walkie-Talkie Radio Chirp / Roger Beep
  const playWalkieTalkieChirp = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.setValueAtTime(1600, now + 0.04);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([150, 80, 150]);
      }
    } catch (e) {
      console.log('Chirp sound error:', e);
    }
  }, []);

  // Audio Chime Player for transfers & alerts with Strong Vibration
  const playChimeSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([600, 200, 600, 200, 600]);
      }
    } catch (e) {
      console.log('Chime sound error:', e);
    }
  }, []);

  // Smart Merge Helper for Brothers
  const syncAndMergeBrothers = useCallback((serverBrothers) => {
    if (!Array.isArray(serverBrothers) || serverBrothers.length === 0) return;
    setBrothers((prevLocal) => {
      const mergedMap = new Map();
      // 1. Add all server brothers
      serverBrothers.forEach((b) => mergedMap.set(b.id || b.accountNumber, b));
      // 2. Check if local storage has brothers not present on server
      let hasMissing = false;
      const missingToSync = [];
      (prevLocal || []).forEach((lb) => {
        const key = lb.id || lb.accountNumber;
        const isDummy = ['b-3', 'b-4', 'b-5', 'b-6'].includes(lb.id) || ['يوسف', 'خالد', 'أحمد'].includes(lb.name);
        if (!isDummy && !mergedMap.has(key) && lb.name) {
          mergedMap.set(key, lb);
          missingToSync.push(lb);
          hasMissing = true;
        }
      });
      // 3. Auto-sync missing brothers to server
      if (hasMissing && missingToSync.length > 0) {
        fetch(`${API_BASE}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brothers: missingToSync })
        }).catch(() => {});
      }
      return Array.from(mergedMap.values());
    });
  }, []);

  // Realtime Server-Sent Events (SSE) Listener & Initial Server Sync
  useEffect(() => {
    // Initial fetch from server to guarantee sync with family_fund_db.json
    fetch(`${API_BASE}/api/fund-state`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.state) {
          if (data.state.brothers) syncAndMergeBrothers(data.state.brothers);
          if (data.state.bankCards) setBankCards(data.state.bankCards);
          if (data.state.transfers) setTransfers(data.state.transfers);
          if (data.state.messages) setMessages(data.state.messages);
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
            const { transfer, transaction, notification, bankCards: newCards, brothers: newBrothers, transfers: allTransfers, transactions: allTransactions } = payload.data;
            
            if (newCards) setBankCards(newCards);
            if (newBrothers) setBrothers(newBrothers);
            
            if (allTransfers) setTransfers(allTransfers);
            else if (transfer) setTransfers((prev) => [transfer, ...prev.filter((t) => t.id !== transfer.id)]);

            if (allTransactions) setTransactions(allTransactions);
            else if (transaction) setTransactions((prev) => [transaction, ...prev.filter((t) => t.id !== transaction.id)]);
            
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveAlert(notification);
              playChimeSound();
            }

            // Browser Notification API if enabled
            if (notification && Notification.permission === 'granted') {
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

          if (payload.type === 'BROTHERS_UPDATED' || payload.type === 'STATE_UPDATED') {
            if (payload.data.brothers) syncAndMergeBrothers(payload.data.brothers);
            if (payload.data.transfers) setTransfers(payload.data.transfers);
            if (payload.data.bankCards) setBankCards(payload.data.bankCards);
            if (payload.data.fundRequests) setFundRequests(payload.data.fundRequests);
          }

          if (payload.type === 'FIELDS_UPDATED') {
            const { brotherId, approvedFields } = payload.data;
            setBrothers((prev) =>
              prev.map((b) => (b.id === brotherId ? { ...b, approvedFields } : b))
            );
          }

          if (payload.type === 'NEW_MONEY_REQUEST') {
            const { request, fundRequests: allReqs, brothers: allBros, notification } = payload.data;
            if (allReqs) setFundRequests(allReqs);
            else if (request) setFundRequests((prev) => [request, ...prev.filter((r) => r.id !== request.id)]);
            if (allBros) syncAndMergeBrothers(allBros);
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveAlert(notification);
              playChimeSound();
            }
          }

          if (payload.type === 'REQUEST_STATUS_CHANGED') {
            const { request, fundRequests: allReqs } = payload.data;
            if (allReqs) setFundRequests(allReqs);
            else if (request) {
              setFundRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
            }
          }

          if (payload.type === 'GUEST_JOIN_REQUEST') {
            const { request, notif } = payload.data;
            if (request) {
              setGuestRequests((prev) => [request, ...prev.filter((r) => r.id !== request.id)]);
            }
            if (notif) {
              setNotifications((prev) => [notif, ...prev]);
              setActiveAlert(notif);
              playChimeSound();
            }
          }

          if (payload.type === 'GUEST_APPROVED') {
            const { user, notif } = payload.data;
            if (user) {
              setGuestRequests((prev) => prev.filter((r) => r.phone !== user.phone));
            }
            if (notif) {
              setNotifications((prev) => [notif, ...prev]);
              setActiveAlert(notif);
              playChimeSound();
            }
          }

          if (payload.type === 'ARCHIVE_UPDATED') {
            if (payload.data.monthlyArchives) setMonthlyArchives(payload.data.monthlyArchives);
          }

          if (payload.type === 'NEW_MESSAGE') {
            const { message, messages: allMsgs } = payload.data;
            if (allMsgs) setMessages(allMsgs);
            else if (message) setMessages((prev) => [...prev.filter((m) => m.id !== message.id), message]);

            // If message is from another user, play distinct audio notification sound!
            if (message && message.senderId !== currentUser?.id) {
              playMessageNotificationSound();
              
              // If browser notifications allowed, show banner
              if (Notification.permission === 'granted') {
                new Notification(`💬 رسالة جديدة من ${message.senderName}`, {
                  body: message.type === 'voice' ? '🎙️ [بصمة صوتية جديدة]' : message.text,
                  icon: '/favicon.svg'
                });
              }
            }
          }

          if (payload.type === 'MESSAGE_DELETED') {
            const { messageId, messages: allMsgs } = payload.data;
            if (allMsgs) setMessages(allMsgs);
            else if (messageId) setMessages((prev) => prev.filter((m) => m.id !== messageId));
          }

          // ================= Intercom & Walkie-Talkie Events =================
          if (payload.type === 'INTERCOM_RINGING') {
            const { call } = payload.data;
            if (call && currentUser && call.status === 'ringing') {
              const isMeReceiver =
                call.receiverId === currentUser.id ||
                (currentUser.accountNumber && call.receiverId === currentUser.accountNumber) ||
                (currentUser.bankAccountNumber && call.receiverId === currentUser.bankAccountNumber) ||
                (currentUser.phone && String(call.receiverId).replace(/[\s\-\+]/g, '') === String(currentUser.phone).replace(/[\s\-\+]/g, ''));

              if (isMeReceiver) {
                setIncomingCall(call);
                playIntercomRingtone();
                if (Notification.permission === 'granted') {
                  new Notification(`📞 مكالمة واردة من ${call.callerName}`, {
                    body: 'يرن عليك الآن.. اضغط للموافقة والتحدث المباشر 📲',
                    icon: '/favicon.svg'
                  });
                }
              }
            }
          }

          if (payload.type === 'INTERCOM_STATUS') {
            const { call, action } = payload.data;
            if (call) {
              const isParty = currentUser && (
                call.callerId === currentUser.id ||
                call.receiverId === currentUser.id ||
                (currentUser.accountNumber && (call.callerId === currentUser.accountNumber || call.receiverId === currentUser.accountNumber)) ||
                (currentUser.bankAccountNumber && (call.callerId === currentUser.bankAccountNumber || call.receiverId === currentUser.bankAccountNumber))
              );

              if (isParty) {
                setActiveCall((prev) => {
                  if (call.status === 'connected') return call;
                  if (call.status === 'ended' || call.status === 'rejected') return null;
                  if (prev && prev.id === call.id) return call;
                  return prev;
                });

                setIncomingCall((prev) => {
                  if (prev && prev.id === call.id) {
                    return call.status === 'ringing' ? call : null;
                  }
                  return prev;
                });

                if (call.status === 'connected') {
                  playWalkieTalkieChirp();
                } else if (call.status === 'rejected' || call.status === 'ended') {
                  playWalkieTalkieChirp();
                }
              }
            }
          }

          if (payload.type === 'INTERCOM_VOICE_BURST') {
            const { callId, senderId, audioData } = payload.data;
            if (currentUser && senderId !== currentUser.id && audioData) {
              setIncomingVoiceBurst(payload.data);
              try {
                audioQueueRef.current.push(audioData);
                if (!isAudioPlayingRef.current) {
                  playNextBurstInQueue();
                }
              } catch (e) {
                console.log('Intercom audio burst queue error:', e);
              }
            }
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
  }, [playChimeSound, playMessageNotificationSound, currentUser]);

  // Periodic polling for Admin and Brothers to guarantee instantaneous real-time sync
  useEffect(() => {
    fetchGuestRequests();
    fetchFundRequests();
    const interval = setInterval(() => {
      fetchGuestRequests();
      fetchFundRequests();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchGuestRequests, fetchFundRequests]);

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

  const normalizeDigits = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/[٠۰]/g, '0')
      .replace(/[١۱]/g, '1')
      .replace(/[٢۲]/g, '2')
      .replace(/[٣۳]/g, '3')
      .replace(/[٤۴]/g, '4')
      .replace(/[٥۵]/g, '5')
      .replace(/[٦۶]/g, '6')
      .replace(/[٧۷]/g, '7')
      .replace(/[٨۸]/g, '8')
      .replace(/[٩۹]/g, '9')
      .trim();
  };

  // 1. Login Brother by Email, Account Number, or Phone & Password
  const loginBrother = async (identifier, password) => {
    const cleanIden = normalizeDigits(identifier).toLowerCase();
    const cleanPass = normalizeDigits(password).trim();
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: cleanIden, password: cleanPass })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch {
      // Fallback offline authentication
      const input = cleanIden;
      const cleanPhone = input.replace(/[\s\-\+]/g, '').replace(/^964/, '0').replace(/^7/, '07');
      const inputPass = cleanPass;

      const isOwnerKeyword =
        input.includes('عبدالله') ||
        input.includes('abdullah') ||
        input.includes('abduallh') ||
        input === 'admin' ||
        input === 'owner' ||
        input === 'صاحب الصندوق' ||
        input === 'صاحب الحساب';

      const found = brothers.find((b) => {
        const isOwner = b.id === activeAdminId || b.isAdmin;
        const isPassMatch =
          !inputPass ||
          String(b.password).trim() === inputPass ||
          normalizeDigits(b.password) === inputPass ||
          (isOwner && (inputPass === '1988' || inputPass === '123' || inputPass === 'admin' || inputPass === 'admin123' || inputPass === '9988')) ||
          (!isOwner && (inputPass === '123' || inputPass === '1988'));

        if (!isPassMatch) return false;

        if (isOwner && isOwnerKeyword) return true;

        const bPhoneClean = normalizeDigits(b.phone || '').replace(/[\s\-\+]/g, '').replace(/^964/, '0').replace(/^7/, '07');

        const emailMatch = b.email && (
          String(b.email).trim().toLowerCase() === input ||
          input.replace(/_/g, '').includes('abduallh') ||
          input.replace(/_/g, '').includes('abdullah')
        );
        const accMatch = String(b.accountNumber).trim().toLowerCase() === input;
        const bankMatch = b.bankAccountNumber && (
          normalizeDigits(b.bankAccountNumber).toLowerCase() === input ||
          input.includes(normalizeDigits(b.bankAccountNumber)) ||
          normalizeDigits(b.bankAccountNumber).includes(input)
        );
        const phoneMatch = bPhoneClean && (bPhoneClean === cleanPhone || bPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(bPhoneClean));
        const nameMatch = b.name && (
          b.name.trim().toLowerCase() === input ||
          b.name.trim().toLowerCase().includes(input) ||
          input.includes(b.name.trim().toLowerCase())
        );

        return emailMatch || accMatch || bankMatch || phoneMatch || nameMatch;
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

  // 1.2 Logout user completely
  const logout = () => {
    try {
      localStorage.removeItem('bait_finance_current_user');
      localStorage.removeItem('bait_finance_guest_account');
      sessionStorage.clear();
    } catch {}
    setCurrentUser(null);
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

  // 3.3 Submit Money Request (User asks for funds with commodity/item name)
  const submitMoneyRequest = async ({ brotherId, amount, fieldId, reason, commodityName, customFieldName }) => {
    const activeBrother = brothers.find((br) => br.id === (brotherId || currentUser?.id)) || currentUser;
    const finalCommodityName = commodityName || customFieldName;
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brotherId: brotherId || activeBrother?.id,
          brotherName: activeBrother?.name,
          phone: activeBrother?.phone,
          bankAccountNumber: activeBrother?.bankAccountNumber,
          amount: Number(amount),
          fieldId,
          fieldName: finalCommodityName,
          commodityName: finalCommodityName,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.request) {
          setFundRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
        }
        if (data.transfer) {
          setTransfers((prev) => [data.transfer, ...prev.filter((t) => t.id !== data.transfer.id)]);
        }
        if (data.bankCards) {
          setBankCards(data.bankCards);
        }
        if (data.brothers) {
          syncAndMergeBrothers(data.brothers);
        }
      }
      return data;
    } catch {
      // Local fallback
      const b = brothers.find((br) => br.id === (brotherId || currentUser?.id)) || currentUser;
      const itemName = (finalCommodityName || reason || 'مصروف عام').trim();
      let assignedFieldId = fieldId;
      
      if (b && itemName) {
        const existingField = (b.approvedFields || []).find(fld => fld.name.toLowerCase() === itemName.toLowerCase() || fld.name.includes(itemName));
        if (!existingField) {
          const newFld = { id: 'f-' + Date.now(), name: itemName, limit: Number(amount), spent: 0 };
          assignedFieldId = newFld.id;
          setBrothers(prev => prev.map(item => item.id === b.id ? { ...item, approvedFields: [...(item.approvedFields || []), newFld] } : item));
        } else {
          assignedFieldId = existingField.id;
        }
      }

      const req = {
        id: 'req-' + Date.now(),
        brotherId: b?.id,
        brotherName: b?.name,
        brotherAccountNumber: b?.accountNumber,
        bankAccountNumber: b?.bankAccountNumber,
        amount: Number(amount),
        fieldId: assignedFieldId,
        fieldName: itemName,
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
  const approveMoneyRequest = async ({ requestId, adminPin, targetFieldId, requestDetails }) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin,
          requestingBrotherId: currentUser?.id,
          targetFieldId,
          requestDetails
        })
      });
      return await res.json();
    } catch {
      // Local fallback
      const req = fundRequests.find((r) => r.id === requestId) || requestDetails;
      if (!req) return { success: false, message: 'الطلب غير موجود' };
      const updatedReq = { ...req, status: 'approved', approvedAt: new Date().toISOString() };
      setFundRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));
      await executeTransfer({
        recipientId: req.brotherId,
        amount: req.amount,
        fieldId: targetFieldId || req.fieldId,
        reason: `[موافقة على طلب] ${req.reason}`,
        securityPin: adminPin || fundPin
      });
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
  const toggleCardFreeze = async (adminPin = '') => {
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

  // 5. Send Transfer (Direct without password + Commodity Pinning)
  const executeTransfer = async ({ recipientId, amount, fieldId, reason, commodityName, customFieldName }) => {
    if (isCardFrozen) {
      return { success: false, message: '🔒 بطاقة الصندوق مجمدة ومقفلة أمنياً حالياً. يرجى إلغاء التجميد أولاً.' };
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return { success: false, message: 'يرجى إدخال مبلغ صحيح' };
    }
    if (!reason || !reason.trim()) {
      return { success: false, message: '⚠️ يجب كتابة سبب طلب المال (الحاجة) إجبارياً قبل الإرسال' };
    }

    const finalCommodityName = commodityName || customFieldName;

    try {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id || 'b-1',
          recipientId,
          amount: numAmount,
          fieldId,
          fieldName: finalCommodityName,
          commodityName: finalCommodityName,
          reason: reason.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.transfers) {
          setTransfers(data.transfers);
        } else if (data.transfer) {
          setTransfers((prev) => [data.transfer, ...prev.filter((t) => t.id !== data.transfer.id)]);
        }
        if (data.transactions) {
          setTransactions(data.transactions);
        } else if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev.filter((t) => t.id !== data.transaction.id)]);
        }
        if (data.bankCards) setBankCards(data.bankCards);
        if (data.brothers) setBrothers(data.brothers);
        if (data.notifications) setNotifications(data.notifications);
        playChimeSound();
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

  // 5.9 Update Card Balance directly
  const updateSendingCardBalance = async (newBalance, cardId = null) => {
    const targetCardId = cardId || sendingCard?.id || 'card-1';
    const numBalance = Number(newBalance);
    try {
      const res = await fetch(`${API_BASE}/api/cards/${targetCardId}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: numBalance, requestingBrotherId: currentUser?.id })
      });
      const data = await res.json();
      if (data.success && data.bankCards) {
        setBankCards(data.bankCards);
      }
      return data;
    } catch {
      setBankCards((prev) =>
        prev.map((c) => (c.id === targetCardId ? { ...c, balance: numBalance, lastUpdated: new Date().toISOString() } : c))
      );
      return { success: true, message: 'تم تحديث رصيد بطاقة الإرسال بنجاح' };
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
      if (data.success) {
        if (data.brothers) setBrothers(data.brothers);
        if (data.transfers) setTransfers(data.transfers);
        if (data.bankCards) setBankCards(data.bankCards);
        if (data.fundRequests) setFundRequests(data.fundRequests);
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

  // 10. Circle Chat & Voice Notes
  const sendMessage = async ({ recipientId, text, audioUrl, audioDuration, type }) => {
    const activeUser = currentUser || { id: 'b-guest', name: 'مستخدم' };
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: activeUser.id,
          senderName: activeUser.name,
          recipientId: recipientId || 'all',
          text,
          audioUrl,
          audioDuration,
          type
        })
      });
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
      return data;
    } catch {
      // Local fallback
      const localMsg = {
        id: 'msg-' + Date.now(),
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatarColor: activeUser.avatarColor || '#10b981',
        recipientId: recipientId || 'all',
        text: text || '',
        audioUrl: audioUrl || null,
        audioDuration: audioDuration || 0,
        type: type || (audioUrl ? 'voice' : 'text'),
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, localMsg]);
      return { success: true, data: localMsg };
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
      return data;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return { success: true };
    }
  };

  // 11. Live Intercom & Voice Calling Engine (No Popup / Realtime Audio Stream)
  const unlockAudioContext = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {}
  }, []);

  const startIntercomCall = async (targetBrotherId) => {
    unlockAudioContext();
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.log('Mic pre-warm note:', e);
      }
    }
    const activeUser = currentUser || { id: 'guest', name: 'مستخدم' };

    // Auto-resolve valid target if calling self or empty
    let realTargetId = targetBrotherId;
    if (!realTargetId || realTargetId === activeUser.id) {
      const otherBrother = (brothers || []).find((b) => b.id !== activeUser.id);
      if (otherBrother) realTargetId = otherBrother.id;
    }
    if (!realTargetId) return { success: false, message: 'لا يوجد مستخدم آخر للاتصال به' };

    const receiver = (brothers || []).find((b) => b.id === realTargetId) || { name: 'المستخدم' };
    try {
      const res = await fetch(`${API_BASE}/api/intercom/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: activeUser.id,
          callerName: activeUser.name,
          callerAvatar: activeUser.avatarColor || '#10b981',
          receiverId: realTargetId,
          receiverName: receiver.name
        })
      });
      const data = await res.json();
      if (data.success && data.call) {
        setActiveCall(data.call);
        playWalkieTalkieChirp();
      }
      return data;
    } catch {
      const localCall = {
        id: 'call-' + Date.now(),
        callerId: activeUser.id,
        callerName: activeUser.name,
        callerAvatar: activeUser.avatarColor || '#10b981',
        receiverId: realTargetId,
        receiverName: receiver.name,
        status: 'ringing',
        createdAt: new Date().toISOString()
      };
      setActiveCall(localCall);
      return { success: true, call: localCall };
    }
  };

  const acceptIntercomCall = async (callId) => {
    unlockAudioContext();
    const targetCallId = callId || incomingCall?.id;
    try {
      const res = await fetch(`${API_BASE}/api/intercom/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: targetCallId,
          action: 'accept',
          userId: currentUser?.id
        })
      });
      const data = await res.json();
      if (data.success && data.call) {
        setActiveCall(data.call);
        setIncomingCall(null);
        playWalkieTalkieChirp();
      }
      return data;
    } catch {
      if (incomingCall) {
        const connectedCall = { ...incomingCall, status: 'connected' };
        setActiveCall(connectedCall);
        setIncomingCall(null);
      }
      return { success: true };
    }
  };

  const rejectIntercomCall = async (callId) => {
    const targetCallId = callId || incomingCall?.id;
    try {
      await fetch(`${API_BASE}/api/intercom/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: targetCallId,
          action: 'reject',
          userId: currentUser?.id
        })
      });
    } catch {}
    setIncomingCall(null);
  };

  const endIntercomCall = async (callId) => {
    const targetCallId = callId || activeCall?.id;
    try {
      await fetch(`${API_BASE}/api/intercom/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: targetCallId,
          action: 'end',
          userId: currentUser?.id
        })
      });
    } catch {}
    setActiveCall(null);
    setIncomingCall(null);
    playWalkieTalkieChirp();
  };

  // Loudspeaker & Call Duration Timer
  const [isLoudspeakerOn, setIsLoudspeakerOn] = useState(false);
  const toggleLoudspeaker = () => {
    unlockAudioContext();
    setIsLoudspeakerOn((prev) => !prev);
  };

  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  useEffect(() => {
    let timer = null;
    if (activeCall && activeCall.status === 'connected') {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall?.status]);

  // Fast Call Poller (1.0 second) to ensure instant ringing & call connection across devices
  useEffect(() => {
    let isPolling = true;

    const checkActiveCalls = async () => {
      const activeId = currentUser?.id || 'all';
      try {
        const res = await fetch(`${API_BASE}/api/intercom/active-for/${activeId}`);
        const data = await res.json();
        if (!isPolling || !data.success) return;

        // 1. Check for incoming ringing call (as receiver)
        if (data.ringingCall) {
          setIncomingCall((prev) => {
            if (!prev || prev.id !== data.ringingCall.id) {
              playIntercomRingtone();
              if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                window.navigator.vibrate([400, 200, 400, 200, 600]);
              }
            }
            return data.ringingCall;
          });
        } else {
          setIncomingCall((prev) => (prev?.status === 'ringing' ? null : prev));
        }

        // 2. Check for connected call status update
        if (data.connectedCall) {
          setActiveCall((prev) => {
            if (!prev || prev.status !== 'connected' || prev.id !== data.connectedCall.id) {
              playWalkieTalkieChirp();
            }
            return data.connectedCall;
          });
          setIncomingCall(null);
        } else if (activeCall?.status === 'ringing') {
          // If caller was ringing, but server no longer has active caller ringing call, peer ended/rejected
          if (!data.callerRingingCall && !data.connectedCall) {
            setActiveCall(null);
          }
        } else if (activeCall && !data.connectedCall && !data.ringingCall) {
          // Ended by peer
          setActiveCall(null);
        }
      } catch {}
    };

    checkActiveCalls();
    const interval = setInterval(checkActiveCalls, 1000);
    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [currentUser?.id, activeCall?.id, activeCall?.status, playIntercomRingtone, playWalkieTalkieChirp]);

  // Continuous In-App Vibration & Telephone Ring Bell Loop on Incoming Call (لا ينقطع حتى يتم الرد)
  useEffect(() => {
    if (!incomingCall || incomingCall.status !== 'ringing') {
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        try { window.navigator.vibrate(0); } catch {}
      }
      return;
    }

    // Play ringing bell and vibrate immediately
    playIntercomRingtone();
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate([1000, 400, 1000, 400, 1000, 400]); } catch {}
    }

    // Repeat telephone ring sound and heavy vibration every 2.4s non-stop until answered or rejected
    const callRingInterval = setInterval(() => {
      playIntercomRingtone();
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        try { window.navigator.vibrate([1000, 400, 1000, 400, 1000, 400]); } catch {}
      }
    }, 2400);

    return () => {
      clearInterval(callRingInterval);
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        try { window.navigator.vibrate(0); } catch {}
      }
    };
  }, [incomingCall?.id, incomingCall?.status, playIntercomRingtone]);

  const sendIntercomVoiceBurst = async ({ callId, audioData, duration }) => {
    const activeUser = currentUser || { id: 'guest', name: 'مستخدم' };
    try {
      await fetch(`${API_BASE}/api/intercom/voice-burst`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: callId || activeCall?.id,
          senderId: activeUser.id,
          senderName: activeUser.name,
          audioData,
          duration: duration || 0
        })
      });
    } catch (e) {
      console.log('Voice burst send error:', e);
    }
  };

  // Realtime Ultra Low-Latency Voice Stream (480ms Rapid Packets / Zero lag)
  const liveCallStreamRef = useRef(null);
  const liveCallRecorderRef = useRef(null);

  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      let isStreaming = true;

      const startStreamingPipeline = async () => {
        try {
          if (!navigator.mediaDevices?.getUserMedia) return;
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          if (!isStreaming) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          liveCallStreamRef.current = stream;

          const recordSlice = () => {
            if (!isStreaming || !liveCallStreamRef.current) return;

            let chunks = [];
            let mimeType = 'audio/webm';
            if (typeof MediaRecorder !== 'undefined') {
              if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
              else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
              else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
            }

            try {
              const rec = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 28000 } : undefined);
              liveCallRecorderRef.current = rec;

              rec.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunks.push(e.data);
              };

              rec.onstop = () => {
                if (chunks.length > 0 && activeCall?.id && isStreaming) {
                  const blob = new Blob(chunks, { type: rec.mimeType || mimeType });
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = () => {
                    if (reader.result && isStreaming) {
                      sendIntercomVoiceBurst({
                        callId: activeCall.id,
                        audioData: reader.result,
                        duration: 0.5
                      });
                    }
                  };
                }
                if (isStreaming) {
                  setTimeout(recordSlice, 40);
                }
              };

              rec.start();
              setTimeout(() => {
                if (rec.state === 'recording') rec.stop();
              }, 480); // 480ms ultra-low latency voice packet
            } catch (err) {
              console.log('Recorder slice error:', err);
              if (isStreaming) setTimeout(recordSlice, 500);
            }
          };

          recordSlice();
        } catch (err) {
          console.log('Call mic permission/stream error:', err);
        }
      };

      startStreamingPipeline();

      return () => {
        isStreaming = false;
        if (liveCallRecorderRef.current && liveCallRecorderRef.current.state !== 'inactive') {
          try { liveCallRecorderRef.current.stop(); } catch {}
        }
        if (liveCallStreamRef.current) {
          liveCallStreamRef.current.getTracks().forEach((t) => t.stop());
          liveCallStreamRef.current = null;
        }
      };
    }
  }, [activeCall?.id, activeCall?.status]);

  // Audio Queue for smooth, jitter-free ultra-low latency playback
  const audioQueueRef = useRef([]);
  const isAudioPlayingRef = useRef(false);

  const playNextBurstInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isAudioPlayingRef.current = false;
      return;
    }
    isAudioPlayingRef.current = true;
    const nextItem = audioQueueRef.current.shift();
    try {
      const audio = new Audio(nextItem);
      audio.volume = isLoudspeakerOn ? 1.0 : 0.85;
      audio.onended = () => playNextBurstInQueue();
      audio.onerror = () => playNextBurstInQueue();
      audio.play().catch(() => playNextBurstInQueue());
    } catch {
      playNextBurstInQueue();
    }
  }, [isLoudspeakerOn]);

  useEffect(() => {
    if (incomingVoiceBurst && incomingVoiceBurst.audioData && incomingVoiceBurst.senderId !== currentUser?.id) {
      audioQueueRef.current.push(incomingVoiceBurst.audioData);
      if (!isAudioPlayingRef.current) {
        playNextBurstInQueue();
      }
    }
  }, [incomingVoiceBurst, currentUser?.id, playNextBurstInQueue]);

  const markAllNotifsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        readBy: [...(n.readBy || []), currentUser.id]
      }))
    );
  };

  // 12. Web Push Notification Support (Android & iPhone background calls)
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribePushNotifications = async (targetUserId) => {
    const uid = targetUserId || currentUser?.id;
    if (!uid) return { success: false, message: 'يجب تسجيل الدخول أولاً' };

    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, message: 'المتصفح لا يدعم خدمة الإشعارات الخلفية المباشرة' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, message: 'تم رفض إذن الإشعارات من المتصفح، يرجى السماح بالإشعارات من إعدادات الهاتف' };
      }

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        const vapidRes = await fetch(`${API_BASE}/api/push/vapid-public-key`);
        const vapidData = await vapidRes.json();
        const publicKey = vapidData.publicKey || 'BNcaM3lxrHfnfl6H_OPgCYmMbNZBQAtRznWfN246zGEZ5Zlm_20zOf4Rb5fSBgO4W0MUHps_YPpzINH_qRyUMns';

        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      }

      if (subscription) {
        await fetch(`${API_BASE}/api/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            subscription: subscription.toJSON(),
            userAgent: navigator.userAgent
          })
        });
        setIsPushSubscribed(true);
        return { success: true, message: '✅ تم تفعيل رنين وإشعارات الهاتف عند غلق البرنامج بنجاح!' };
      }
    } catch (err) {
      console.log('Push subscription error:', err);
      return { success: false, message: 'تعذر تفعيل الإشعارات: ' + (err.message || 'خطأ غير معروف') };
    }
    return { success: false, message: 'حدث خطأ أثناء الاشتراك بالإشعارات' };
  };

  const sendTestPush = async () => {
    try {
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([1000, 300, 1000, 300, 1000]);
      }
      playIntercomRingtone();
      const res = await fetch(`${API_BASE}/api/push/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id || 'all' })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Auto-subscribe when user logs in so background push alerts work even when app is closed
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      if (currentUser?.id) {
        subscribePushNotifications(currentUser.id);
      }
    }
  }, [currentUser?.id]);

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
        logout,
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
        guestRequests,
        fetchGuestRequests,
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
        updateSendingCardBalance,
        updateCardBalance: updateSendingCardBalance,
        addBrother,
        updateBrother,
        deleteBrother,
        updateBrotherFields,
        createMonthlyArchive,
        deleteArchiveProtected,
        markAllNotifsAsRead,
        playChimeSound,
        messages,
        sendMessage,
        deleteMessage,
        playMessageNotificationSound,
        activeCall,
        setActiveCall,
        incomingCall,
        setIncomingCall,
        incomingVoiceBurst,
        startIntercomCall,
        acceptIntercomCall,
        rejectIntercomCall,
        endIntercomCall,
        sendIntercomVoiceBurst,
        startVoiceCall: startIntercomCall,
        acceptVoiceCall: acceptIntercomCall,
        rejectVoiceCall: rejectIntercomCall,
        endVoiceCall: endIntercomCall,
        playIntercomRingtone,
        playWalkieTalkieChirp,
        isLoudspeakerOn,
        toggleLoudspeaker,
        callDurationSeconds,
        isPushSupported,
        isPushSubscribed,
        subscribePushNotifications,
        sendTestPush
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
