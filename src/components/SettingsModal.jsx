import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../utils/defaultData';
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
  Moon,
  Sun,
  KeyRound,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    brothers,
    bankCards,
    transfers,
    monthlyArchives,
    yearlyArchives,
    activeAdminId,
    currentUser,
    transferAdminRole,
    transferPermissions,
    updateTransferPermissions
  } = useFinance();

  const [activeTab, setActiveTab] = useState('permissions'); // 'permissions' | 'general' | 'backup'

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

  if (!isOpen) return null;

  const currentAdmin = brothers.find((b) => b.id === activeAdminId) || { name: 'الأدمن' };
  const isCurrentAdminUser = currentUser?.id === activeAdminId || currentUser?.isAdmin;

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
      setDelegateMsg('يرجى اختيار الأخ المراد تفويضه كأدمن');
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

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2.5.0',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                إعدادات البرنامج وإدارة الصلاحيات
              </h2>
              <p className="text-xs text-slate-400">تحويل الأدمن، تحديد من يرسل الأموال، والنسخ الاحتياطي</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: 3 Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-750 px-4 pt-3 border-b border-slate-200 dark:border-slate-700 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>الأدمن وصلاحيات الإرسال</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>العملة والمظهر</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>النسخ الاحتياطي</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* TAB 1: ADMIN DELEGATION & TRANSFER PERMISSIONS (تحويل الأدمن وصلاحيات الإرسال) */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              
              {/* SECTION 1: SPECIFY WHO CAN SEND MONEY (تحديد من يستطيع إرسال الأموال) */}
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
                      حدد من له صلاحية الضغط على زر التحويل وإرسال مبالغ للإخوة
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePermissions} className="space-y-3 pt-1">
                  
                  {/* Mode Selector */}
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
                          👑 الأدمن فقط (الأكثر أماناً وحوكمة)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          فقط الأدمن الحالي ({currentAdmin?.name}) يستطيع تنفيذ وإرسال التحويلات
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
                      onClick={() => setPermMode('custom')}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        permMode === 'custom'
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold block text-slate-900 dark:text-white">
                          👥 الأدمن + أشخاص محددين بالاسم
                        </span>
                        <span className="text-[11px] text-slate-400">
                          تحديد إخوة معينين يُسمح لهم بإرسال الأموال من الصندوق
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="permMode"
                        checked={permMode === 'custom'}
                        onChange={() => setPermMode('custom')}
                        className="text-teal-600"
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
                          🌐 جميع الإخوة المشتركين
                        </span>
                        <span className="text-[11px] text-slate-400">
                          صلاحية مفتوحة لأي أخ مسجل لتحويل الأموال عند الحاجة
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

                  {/* If custom mode: Brother toggles list */}
                  {permMode === 'custom' && (
                    <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                      <span className="font-bold text-[11px] text-slate-500 dark:text-slate-400 block">
                        اختر الإخوة المصرح لهم بالإرسال:
                      </span>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {brothers.map((b) => {
                          const isAllowed = allowedSenders.includes(b.id);
                          const isAdmin = b.id === activeAdminId;
                          return (
                            <div
                              key={b.id}
                              onClick={() => !isAdmin && handleToggleSender(b.id)}
                              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                isAllowed
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-6 h-6 rounded-lg text-white text-[10px] font-bold flex items-center justify-center"
                                  style={{ backgroundColor: b.avatarColor }}
                                >
                                  {b.name[0]}
                                </span>
                                <span className="font-bold text-xs">{b.name}</span>
                                {isAdmin && (
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                                    الأدمن الأساسي
                                  </span>
                                )}
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                                isAllowed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {isAllowed ? <Check className="w-3 h-3" /> : null}
                                <span>{isAllowed ? 'مصرّح له بالإرسال' : 'غير مصرح'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {permMsg && (
                    <div className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                      permSuccess
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}>
                      {permMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={permLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{permLoading ? 'جاري الحفظ...' : 'حفظ وتطبيق صلاحيات الإرسال 💾'}</span>
                  </button>

                </form>
              </div>

              {/* SECTION 2: TRANSFER ADMIN ROLE (تحويل وتفويض الأدمن) */}
              <div className="p-4 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      تحويل وتفويض صلاحية الأدمن لشخص آخر 👑
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      تسليم إدارة الصندوق والتحكم الكامل لأحد الإخوة
                    </p>
                  </div>
                </div>

                {/* Current Admin Badge */}
                <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">الأدمن الحالي المسئول:</span>
                  <div className="flex items-center gap-1.5 font-black text-xs text-amber-600 dark:text-amber-400">
                    <Crown className="w-3.5 h-3.5" />
                    <span>{currentAdmin?.name} (#{currentAdmin?.accountNumber})</span>
                  </div>
                </div>

                <form onSubmit={handleDelegateAdmin} className="space-y-3">
                  
                  {/* Select New Admin */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر الأخ المراد تسليمه صلاحية الأدمن *:
                    </label>
                    <select
                      value={selectedTargetAdminId}
                      onChange={(e) => setSelectedTargetAdminId(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    >
                      <option value="">-- اضغط لاختيار الأخ --</option>
                      {brothers.map((b) => (
                        <option key={b.id} value={b.id} disabled={b.id === activeAdminId}>
                          {b.name} (#{b.accountNumber}) {b.id === activeAdminId ? '← (الأدمن الحالي)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {delegateMsg && (
                    <div className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                      delegateSuccess
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}>
                      {delegateMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={delegateLoading || !selectedTargetAdminId}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{delegateLoading ? 'جاري التحويل...' : 'تسليم وتفويض صلاحية الأدمن فوراً 👑'}</span>
                  </button>

                </form>
              </div>

            </div>
          )}

          {/* TAB 2: GENERAL SETTINGS (العملة والمظهر) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              
              {/* Currency Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>العملة الافتراضية للمعاملات:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CURRENCIES.map((curr) => {
                    const isSelected = settings?.currencyCode === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => updateSettings({ currencyCode: curr.code, currencySymbol: curr.symbol })}
                        className={`p-2.5 rounded-2xl border transition flex items-center justify-between text-xs font-bold ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{curr.name}</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{curr.symbol}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dark Mode */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-white block">الوضع الليلي (Dark Mode)</span>
                  <span className="text-[11px] text-slate-400">تفعيل المظهر الداكن المريح للعين</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition ${
                    settings.darkMode
                      ? 'bg-slate-700 text-amber-300 border-slate-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{settings.darkMode ? 'مفعل' : 'معطل'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: BACKUP & MAINTENANCE (النسخ الاحتياطي) */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              
              {/* Export Backup Card */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  حفظ نسخة من جميع الحسابات، التحويلات، السجلات، والأرشيف المالي في ملف يمكنك استرجاعه بأي وقت.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition mt-1"
                >
                  تحميل النسخة الاحتياطية الآن
                </button>
              </div>

              {/* Reset Cache */}
              <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                <h4 className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <RefreshCcw className="w-4 h-4 text-rose-600" />
                  <span>إعادة تعيين الذاكرة المؤقتة</span>
                </h4>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  إذا واجهت أي بيانات قديمة عالقة في المتصفح، يمكنك مسح الذاكرة المؤقتة لجهازك.
                </p>
                <button
                  type="button"
                  onClick={handleClearLocalCache}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  مسح الذاكرة المؤقتة وتحديث الصفحة
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
