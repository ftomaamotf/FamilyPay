import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

export const API_BASE = 'https://familypay-aw26.onrender.com';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fund Global State
  const [activeAdminId, setActiveAdminId] = useState('b-2');
  const [currency, setCurrency] = useState('د.ع');
  const [monthlyFundAmount, setMonthlyFundAmount] = useState(1000000);
  const [sendingCard, setSendingCard] = useState(null);
  const [bankCards, setBankCards] = useState([]);
  const [brothers, setBrothers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [security, setSecurity] = useState({
    fundPin: '9988',
    isCardFrozen: false,
    isBalanceHiddenByAdmin: true,
    transferPermissions: { mode: 'admin_only', allowedSenderIds: ['b-2'] }
  });

  // 1. Load Stored User Session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('@familypay_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Error loading user session', e);
      } finally {
        fetchFundState();
      }
    };
    loadSession();
  }, []);

  // 2. Fetch Live Fund State from Cloud API
  const fetchFundState = async () => {
    try {
      const res = await fetch(${API_BASE}/api/fund-state);
      const data = await res.json();
      if (data.success && data.state) {
        const s = data.state;
        setActiveAdminId(s.activeAdminId || 'b-2');
        if (s.currency?.symbol) setCurrency(s.currency.symbol);
        if (s.monthlyFundAmount) setMonthlyFundAmount(s.monthlyFundAmount);
        if (s.bankCards) {
          setBankCards(s.bankCards);
          const activeCard = s.bankCards.find((c) => c.id === s.sendingCardId) || s.bankCards[0];
          setSendingCard(activeCard);
        }
        if (s.brothers) setBrothers(s.brothers);
        if (s.transfers) setTransfers(s.transfers);
        if (s.fundRequests) setFundRequests(s.fundRequests);
        if (s.notifications) setNotifications(s.notifications);
        if (s.security) setSecurity(s.security);
      }
    } catch (err) {
      console.log('Error fetching live fund state:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 3. User Login
  const login = async (identifier, password) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await fetch(${API_BASE}/api/auth/login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: identifier.trim(),
          password: password.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        await AsyncStorage.setItem('@familypay_user', JSON.stringify(data.user));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { success: true, user: data.user, message: data.message };
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: data.message || 'بيانات الدخول غير صحيحة' };
    } catch (e) {
      return { success: false, message: 'تعذر الاتصال بالسيرفر السحابي. تحقق من الإنترنت' };
    }
  };

  // 4. Biometrics Login (Fingerprint / Face ID)
  const authenticateBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        return { success: false, message: 'البصمة غير متوفرة أو غير مفعلة على جهازك' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تسجيل الدخول إلى FamilyPay عبر البصمة',
        fallbackLabel: 'استخدام كلمة المرور',
        cancelLabel: 'إلغاء'
      });

      if (result.success) {
        const saved = await AsyncStorage.getItem('@familypay_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return { success: true };
        }
      }
      return { success: false, message: 'فشل التحقق من البصمة' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@familypay_user');
      setCurrentUser(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.log('Error during logout', e);
    }
  };

  // 6. Execute Transfer
  const executeTransfer = async ({ recipientId, amount, fieldId, reason, securityPin }) => {
    try {
      const res = await fetch(${API_BASE}/api/transfers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id,
          recipientId,
          amount: Number(amount),
          fieldId,
          reason,
          securityPin
        })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'حدث خطأ أثناء تنفيذ التحويل' };
    }
  };

  // 7. Edit Transfer (Admin)
  const editTransfer = async (transferId, { amount, reason, date, fieldId }) => {
    try {
      const res = await fetch(${API_BASE}/api/transfers/, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason, date, fieldId })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر تعديل الطلب' };
    }
  };

  // 8. Delete Transfer (Admin)
  const deleteTransfer = async (transferId) => {
    try {
      const res = await fetch(${API_BASE}/api/transfers/, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر حذف الطلب' };
    }
  };

  // 9. Update Brother Commodities/Fields
  const updateBrotherFields = async (brotherId, approvedFields) => {
    try {
      const res = await fetch(${API_BASE}/api/brothers//fields, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedFields })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر تحديث السلع' };
    }
  };

  // 10. Submit Money Request
  const submitMoneyRequest = async ({ amount, reason, fieldId }) => {
    try {
      const res = await fetch(${API_BASE}/api/requests, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brotherId: currentUser?.id,
          brotherName: currentUser?.name,
          amount: Number(amount),
          fieldId,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر إرسال الطلب' };
    }
  };

  // 11. Approve Request
  const approveMoneyRequest = async (requestId, targetFieldId, securityPin) => {
    try {
      const res = await fetch(${API_BASE}/api/requests//approve, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser?.id,
          targetFieldId,
          securityPin
        })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر قبول الطلب' };
    }
  };

  // 12. Reject Request
  const rejectMoneyRequest = async (requestId, reason) => {
    try {
      const res = await fetch(${API_BASE}/api/requests//reject, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser?.id,
          reason
        })
      });
      const data = await res.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        fetchFundState();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'تعذر رفض الطلب' };
    }
  };

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isCurrentAdmin,
        activeAdminId,
        currency,
        monthlyFundAmount,
        sendingCard,
        bankCards,
        brothers,
        transfers,
        fundRequests,
        notifications,
        security,
        loading,
        refreshing,
        fetchFundState,
        login,
        logout,
        authenticateBiometrics,
        executeTransfer,
        editTransfer,
        deleteTransfer,
        updateBrotherFields,
        submitMoneyRequest,
        approveMoneyRequest,
        rejectMoneyRequest
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
