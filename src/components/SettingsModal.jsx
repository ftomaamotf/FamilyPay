import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../utils/defaultData';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Settings,
  Coins,
  Download,
  RefreshCcw,
  Check,
  ShieldCheck,
  Crown,
  Send,
  UserCheck,
  Lock,
  Unlock,
  Moon,
  Sun,
  KeyRound,
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Eye,
  EyeOff,
  QrCode,
  Sparkles,
  Plus,
  Bell,
  Smartphone
} from 'lucide-react';

export const SettingsModal = ({
  isOpen,
  onClose,
  onOpenCardsManager,
  onOpenJoinQr
}) => {
  const {
    settings,
    updateSettings,
    brothers,
    bankCards,
    sendingCard,
    transfers,
    monthlyArchives,
    yearlyArchives,
    activeAdminId,
    currentUser,
    transferAdminRole,
    transferPermissions,
    updateTransferPermissions,
    isCardFrozen,
    toggleCardFreeze,
    fundPin,
    changeFundPin,
    isBalanceHiddenByAdmin,
    toggleAdminBalanceVisibility,
    isPushSubscribed,
    subscribePushNotifications,
    sendTestPush
  } = useFinance();

  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'permissions' | 'security' | 'general'

  // Admin Delegation State
  const [selectedTargetAdminId, setSelectedTargetAdminId] = useState('');
  const [adminPinForDelegate, setAdminPinForDelegate] = useState('');
  const [delegateLoading, setDelegateLoading] = useState(false);
  const [delegateMsg, setDelegateMsg] = useState('');
  const [delegateSuccess, setDelegateSuccess] = useState(false);

  // Transfer Permissions State
  const [permMode, setPermMode] = useState(() => transferPermissions?.mode || 'admin_only');
  const [allowedSenders, setAllowedSenders] = useState(() => transferPermissions?.allowedSenderIds || [activeAdminId]);
  const [permPin, setPermPin] = useState('');
  const [permLoading, setPermLoading] = useState(false);
  const [permMsg, setPermMsg] = useState('');
  const [permSuccess, setPermSuccess] = useState(false);

  // Security PIN state
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  if (!isOpen) return null;

  const currentAdmin = brothers.find((b) => b.id === activeAdminId) || { name: 'الأدمن' };
  const isCurrentAdminUser = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const currency = settings.currencySymbol || 'د.ع';

  // Toggle sender permission for a specific brother
  const handleToggleSender = (brotherId) => {
    setAllowedSenders((prev) => {
      if (prev.includes(brotherId)) {
        return prev.filter((id) => id !== brotherId);
      } else {
        return [...prev, brotherId];
      }
    });
  };

  // Submit Admin Role Delegation
  const handleDelegateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedTargetAdminId) {
      setDelegateMsg('يرجى اختيار المستخدم المراد تفويضه كأدمن');
      return;
    }

    setDelegateLoading(true);
    setDelegateMsg('');
    const res = await transferAdminRole(selectedTargetAdminId, adminPinForDelegate.trim());
    setDelegateLoading(false);

    if (res.success) {
      setDelegateSuccess(true);
      setDelegateMsg(res.message);
      setAdminPinForDelegate('');
    } else {
      setDelegateSuccess(false);
      setDelegateMsg(res.message);
    }
  };

  // Save Transfer Permissions
  const handleSavePermissions = async (e) => {
    e.preventDefault();
    setPermLoading(true);
    setPermMsg('');

    const res = await updateTransferPermissions({
      mode: permMode,
      allowedSenderIds: allowedSenders,
      adminPin: permPin.trim()
    });
    setPermLoading(false);

    if (res.success) {
      setPermSuccess(true);
      setPermMsg(res.message || 'تم حفظ صلاحيات الإرسال بنجاح');
      setPermPin('');
    } else {
      setPermSuccess(false);
      setPermMsg(res.message || 'حدث خطأ في حفظ الصلاحيات');
    }
  };

  // Change Security PIN
  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 3) {
      setPinChangeMsg('يرجى إدخال رمز حماية مكون من 3 أرقام على الأقل');
      return;
    }
    const res = await changeFundPin(newPinInput.trim());
    if (res.success) {
      setPinChangeMsg('✅ تم تغيير رمز حماية الصندوق بنجاح!');
      setNewPinInput('');
    } else {
      setPinChangeMsg('❌ حدث خطأ أثناء تغيير الرمز');
    }
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2.6.0',
      exportedAt: new Date().toISOString(),
      settings,
      brothers,
      bankCards,
      transfers,
      monthlyArchives,
      yearlyArchives
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `نسخة_احتياطية_صندوق_الحسابات_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearLocalCache = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات المؤقتة على هذا الجهاز؟')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h2 className="font-black text-base sm:text-lg">
                إعدادات البرنامج وإدارة الصندوق
              </h2>
              <p className="text-xs text-emerald-200">البطاقات، الأمان، تحويل الأدمن، والصلاحيات</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-emerald-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: 4 Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-750 px-3 pt-3 border-b border-slate-200 dark:border-slate-700 text-xs font-bold gap-1.5 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>البطاقات والرصيد</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>حماية الصندوق</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 px-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'permissions'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>الأدمن والصلاحيات</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 text-teal-500" />
            <span>النسخ والمظهر</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* TAB 1: CARDS & BALANCE (البطاقات المصرفية ورصيد الصندوق) */}
          {activeTab === 'cards' && (
            <div className="space-y-5">
              
              {/* Main Card Overview */}
              <div className="p-4 rounded-3xl bg-gradient-to-l from-emerald-900 via-teal-950 to-slate-900 text-white border border-emerald-800/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span className="font-black text-sm">{sendingCard?.name || 'بطاقة الصندوق الرئيسية'}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    {sendingCard?.bankName || 'Qi Card'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div>
                    <span className="text-[11px] text-emerald-200 block">رقم الحساب / البطاقة:</span>
                    <span className="font-mono text-sm font-bold">{sendingCard?.accountNumber || '9256869125'}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-emerald-200 block">الرصيد المالي الحالي:</span>
                    <span className="font-mono text-base font-black text-emerald-300">
                      {formatMoney(sendingCard?.balance || 0)} {currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Visibility Toggle */}
              {isCurrentAdminUser && (
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 dark:text-white block">
                      إظهار أو إخفاء الرصيد الكلي عن المستخدمين 👁️
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isBalanceHiddenByAdmin
                        ? 'الرصيد مخفي حالياً عن باقي المستخدمين ومعروض لك كأدمن فقط'
                        : 'الرصيد معروض وظاهر لجميع المستخدمين حالياً'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAdminBalanceVisibility}
                    className={`px-3.5 py-2 rounded-2xl font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      isBalanceHiddenByAdmin
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {isBalanceHiddenByAdmin ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{isBalanceHiddenByAdmin ? 'إظهار للجميع' : 'إخفاء الرصيد'}</span>
                  </button>
                </div>
              )}

              {/* Cards Management Action */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">
                      إدارة البطاقات المصرفية للصندوق 💳
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      إضافة بطاقات جديدة، تغيير بطاقة الإرسال الرئيسية، وتعديل الأرصدة
                    </p>
                  </div>
                  {onOpenCardsManager && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCardsManager();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إدارة البطاقات</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & PIN (حماية وأمان الصندوق) */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              
              {/* Card Freeze / Unfreeze Toggle */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 dark:text-white block">
                    قفل وتجميد بطاقة الصندوق أمنياً 🔒
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isCardFrozen
                      ? 'البطاقة مجمدة ومقفلة حالياً ولا يمكن تحويل أي أموال منها'
                      : 'البطاقة نشطة وجاهزة لتحويل وصرف الأموال'}
                  </span>
                </div>
                {isCurrentAdminUser && (
                  <button
                    type="button"
                    onClick={toggleCardFreeze}
                    className={`px-3.5 py-2 rounded-2xl font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      isCardFrozen
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isCardFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{isCardFrozen ? 'فك التجميد' : 'قفل وتجميد'}</span>
                  </button>
                )}
              </div>

              {/* Change Fund PIN Form */}
              {isCurrentAdminUser && (
                <form onSubmit={handleChangePinSubmit} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-black text-slate-900 dark:text-white">
                      تغيير رمز حماية الصندوق (PIN) 🔑
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    رمز الحماية يُستخدم لحماية العمليات الحساسة وتفويض الأدمن
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="أدخل رمز حماية جديد..."
                      maxLength={8}
                      className="flex-1 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-none focus:border-emerald-500 text-right"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition active:scale-95"
                    >
                      حفظ الرمز
                    </button>
                  </div>
                  {pinChangeMsg && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {pinChangeMsg}
                    </p>
                  )}
                </form>
              )}

            </div>
          )}

          {/* TAB 3: ADMIN & PERMISSIONS (الأدمن وصلاحيات الإرسال) */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              
              {/* SECTION 1: SPECIFY WHO CAN SEND MONEY */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Send className="w-4 h-4 -rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      تحديد من يستطيع إرسال الأموال من الصندوق 💸
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      حدد من له صلاحية الضغط على زر التحويل وإرسال مبالغ للمستخدمين
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePermissions} className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <label
                      onClick={() => setPermMode('admin_only')}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        permMode === 'admin_only'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold block text-slate-900 dark:text-white">
                          👑 الأدمن فقط ({currentAdmin?.name})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          فقط الأدمن الحالي يستطيع تنفيذ وإرسال التحويلات
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="permMode"
                        checked={permMode === 'admin_only'}
                        onChange={() => setPermMode('admin_only')}
                        className="text-emerald-600"
                      />
                    </label>

                    <label
                      onClick={() => setPermMode('all')}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        permMode === 'all'
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold block text-slate-900 dark:text-white">
                          🌐 جميع المستخدمين المسجلين
                        </span>
                        <span className="text-[11px] text-slate-400">
                          صلاحية مفتوحة لأي مستخدم مسجل للتحويل عند الحاجة
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="permMode"
                        checked={permMode === 'all'}
                        onChange={() => setPermMode('all')}
                        className="text-blue-600"
                      />
                    </label>
                  </div>

                  {isCurrentAdminUser && (
                    <button
                      type="submit"
                      disabled={permLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{permLoading ? 'جاري الحفظ...' : 'حفظ صلاحيات الإرسال'}</span>
                    </button>
                  )}
                  {permMsg && (
                    <p className={`text-xs font-bold ${permSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {permMsg}
                    </p>
                  )}
                </form>
              </div>

              {/* SECTION 2: JOIN QR CODE FOR NEW USERS */}
              {onOpenJoinQr && (
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 dark:text-white block">
                      باركود انضمام وتسجيل مستخدم جديد 📷
                    </span>
                    <span className="text-[11px] text-slate-400">
                      عرض رمز QR للانضمام المباشر للصندوق عبر كاميرا الهاتف
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenJoinQr();
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-sm transition active:scale-95 flex items-center gap-1.5 border border-amber-400"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>عرض الباركود</span>
                  </button>
                </div>
              )}

              {/* SECTION 3: TRANSFER ADMIN ROLE */}
              {isCurrentAdminUser && (
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      تسليم وتفويض صلاحيات الأدمن 👑
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    اختر المستخدم الذي ترغب في تحويل إدارة الصندوق الكاملة إليه
                  </p>

                  <form onSubmit={handleDelegateAdmin} className="space-y-3 pt-1">
                    <select
                      value={selectedTargetAdminId}
                      onChange={(e) => setSelectedTargetAdminId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
                    >
                      <option value="">-- اختر المستخدم المراد تسليمه الأدمن --</option>
                      {brothers
                        .filter((b) => b.id !== activeAdminId)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} (حساب: #{b.accountNumber})
                          </option>
                        ))}
                    </select>

                    <button
                      type="submit"
                      disabled={delegateLoading || !selectedTargetAdminId}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Crown className="w-4 h-4" />
                      <span>{delegateLoading ? 'جاري التحويل...' : 'تسليم الأدمن الآن'}</span>
                    </button>
                    {delegateMsg && (
                      <p className={`text-xs font-bold ${delegateSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {delegateMsg}
                      </p>
                    )}
                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: GENERAL & BACKUP (النسخ والمظهر) */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              
              {/* SECTION: Push Notifications & Background Ringtone */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">
                        إشعارات ورنين الهاتف في الخلفية 📳
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        استقبال رنات المكالمات والتحويلات والرسائل عند إغلاق التطبيق
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    isPushSubscribed
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {isPushSubscribed ? 'مفعلة بنجاح ✅' : 'معطلة ⏸️'}
                  </span>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                  {!isPushSubscribed ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await subscribePushNotifications(currentUser?.id);
                        if (res?.message) alert(res.message);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      <span>تشغيل وتفعيل إشعارات الخلفية 📲</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await sendTestPush();
                          alert(res?.message || 'تم إرسال إشعار تجريبي فوري مع هزاز 📳');
                        }}
                        className="w-full sm:flex-1 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/40 font-black text-xs rounded-2xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>تجربة إرسال إشعار فوري مع هزاز 🧪</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('bait_finance_push_banner_dismissed', 'true');
                          alert('تم حفظ الإعدادات');
                        }}
                        className="w-full sm:w-auto py-2.5 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
                      >
                        إعادة ضبط
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Currency & Dark Mode */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white">
                  المظهر والعملة 🎨
                </h4>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">الوضع الليلي (Dark Mode):</span>
                  <button
                    type="button"
                    onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                    className="p-2 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                  >
                    {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* JSON Backup Export */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <h4 className="font-black text-slate-900 dark:text-white">
                    تصدير نسخة احتياطية من البيانات (JSON) 💾
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  تنزيل ملف كامل يحتوي على جميع المستخدمين والبطاقات والمصروفات والتحويلات
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير النسخة الاحتياطية الآن</span>
                </button>
              </div>

              {/* Clear Cache */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleClearLocalCache}
                  className="text-xs text-rose-500 hover:underline font-bold"
                >
                  إعادة تعيين الذاكرة المؤقتة على هذا الجهاز 🔄
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
