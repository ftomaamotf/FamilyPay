import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Send,
  CreditCard,
  User,
  AlertCircle,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  ExternalLink,
  Share2,
  ChevronDown,
  ChevronUp,
  Monitor
} from 'lucide-react';
import { openPhoneAppsChooser, launchQiDirect } from '../utils/bankAppLauncher';
import { AllProgramsModal } from './AllProgramsModal';

export const QuickTransferModal = ({ isOpen, onClose, initialRecipientId = null, initialFieldId = null }) => {
  const { brothers, sendingCard, executeTransfer, settings, isCardFrozen, canCurrentUserSend, currentUser } = useFinance();
  const currency = settings.currencySymbol;

  const [recipientId, setRecipientId] = useState(initialRecipientId || brothers[0]?.id || 'b-1');
  const [fieldId, setFieldId] = useState(initialFieldId || '');
  const [commodityName, setCommodityName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [bankAppToast, setBankAppToast] = useState('');
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  const isSenderAuthorized = canCurrentUserSend ? canCurrentUserSend() : true;
  const selectedRecipient = brothers.find((b) => b.id === recipientId) || brothers[0];

  useEffect(() => {
    if (isOpen) {
      setCompletedTransfer(null);
      setAmount('');
      setReason('');
      if (initialRecipientId) {
        setRecipientId(initialRecipientId);
      } else if (brothers.length > 0) {
        const found = brothers.find((b) => b.id !== currentUser?.id) || brothers[0];
        setRecipientId(found.id);
      }
      setFieldId(initialFieldId || '');
      setCommodityName('');
      setErrorMsg('');
      setBankAppToast('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setErrorMsg('');
    setCompletedTransfer(null);
    setCommodityName('');
    setAmount('');
    setReason('');
    setBankAppToast('');
    onClose();
  };

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    const acc = selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber;
    if (!acc) return;
    navigator.clipboard.writeText(acc);
    setCopied(true);
    if (window.navigator?.vibrate) window.navigator.vibrate(50);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPhoneAppsSheet = () => {
    openPhoneAppsChooser({
      accountNumber: selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber,
      amount: Number(amount) || 0,
      recipientName: selectedRecipient?.name || 'الأخ المستلم',
      reason: reason.trim() || 'تحويل مالي'
    });
    setCopied(true);
    setBankAppToast('📲 تم نسخ رقم البطاقة وجاري فتح قائمة تطبيقات هاتفك...');
    setTimeout(() => {
      setCopied(false);
      setBankAppToast('');
    }, 4000);
  };

  const handleOpenQiDirectly = () => {
    launchQiDirect(selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber);
    setCopied(true);
    setBankAppToast('📲 تم نسخ رقم البطاقة وجاري فتح تطبيق ماستر كي / Qi...');
    setTimeout(() => {
      setCopied(false);
      setBankAppToast('');
    }, 4000);
  };

  const isReasonValid = reason.trim().length >= 2;
  const isCommodityValid = (commodityName.trim().length >= 2) || Boolean(fieldId);
  const isAmountValid = Number(amount) > 0;
  const canSubmit = isReasonValid && isCommodityValid && isAmountValid && !isCardFrozen && !loading && isSenderAuthorized;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCardFrozen) {
      setErrorMsg('🔒 بطاقة الصندوق مجمدة حالياً لحمايتها. يرجى إلغاء التجميد من الأدمن أولاً.');
      return;
    }
    if (!isAmountValid) {
      setErrorMsg('⚠️ يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!commodityName.trim() && !fieldId) {
      setErrorMsg('⚠️ يرجى تحديد أو كتابة اسم السلعة المطلوبة');
      return;
    }
    if (!reason.trim() || reason.trim().length < 2) {
      setErrorMsg('⚠️ لا يمكن إرسال أو تحويل الأموال إلا بعد كتابة ملاحظة توضح سبب وتفاصيل الصرف بدقة!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const targetRecipientId = recipientId || selectedRecipient?.id || brothers[0]?.id;
    const finalCommodity = commodityName.trim() || selectedRecipient?.approvedFields?.find(f => f.id === fieldId)?.name || 'مصروف عام';

    const res = await executeTransfer({
      recipientId: targetRecipientId,
      recipientAccountNumber: selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber,
      brotherAccountNumber: selectedRecipient?.accountNumber,
      bankAccountNumber: selectedRecipient?.bankAccountNumber,
      amount: Number(amount),
      fieldId: commodityName.trim() ? null : (fieldId || null),
      commodityName: finalCommodity,
      reason: reason.trim()
    });

    setLoading(false);

    if (res.success) {
      setCompletedTransfer(res.transfer || {
        recipientName: selectedRecipient?.name || 'الأخ المستلم',
        recipientAccountNumber: selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber,
        amount: Number(amount),
        reason: reason.trim(),
        date: new Date().toISOString().split('T')[0],
        refNumber: 'SK-' + Date.now().toString().slice(-6)
      });

      // Automatically launch the phone's native apps sheet on the screen!
      openPhoneAppsChooser({
        accountNumber: selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber,
        amount: Number(amount),
        recipientName: selectedRecipient?.name || 'الأخ المستلم',
        reason: reason.trim()
      });
    } else {
      setErrorMsg(res.message || 'حدث خطأ أثناء التحويل');
    }
  };

  const quickReasonChips = ['حليب للأطفال 🥛', 'بنزين للسيارة ⛽', 'تموين ومواد غذائية 🍞', 'أدوية وصيدلية 💊', 'فاتورة كهرباء ⚡', 'صيانة وتصليح 🔧'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <Send className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                تحويل مالي مباشر من بطاقة الصندوق 💸
              </h3>
              <p className="text-xs text-emerald-200">
                توثيق فوري للحاجة وخصم المبلغ وإشعار الإخوة
              </p>
            </div>
          </div>

          <button onClick={handleClose} className="p-1 rounded-full text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Frozen Warning */}
        {isCardFrozen && (
          <div className="p-3 bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 animate-bounce" />
            <span>تنبيه: بطاقة الصندوق مجمدة ومقفلة أمنياً حالياً. لن يتم قبول أي تحويل!</span>
          </div>
        )}

        {/* Unauthorized Sender Warning */}
        {!isSenderAuthorized && !isCardFrozen && (
          <div className="p-3 bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>تنبيه: إرسال الأموال محصور للأدمن أو الأشخاص المصرح لهم من الأدمن في الإعدادات.</span>
          </div>
        )}

        {/* Success Voucher View */}
        {completedTransfer ? (
          <div className="p-6 space-y-5 text-center animate-fadeIn overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">
                تم تنفيذ التحويل الآمن وإشعار جميع الإخوة! 🛡️⚡
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                تم التحقق من رمز حماية الصندوق وخصم المبلغ وتحديث العدادات الحية
              </p>
            </div>

            {/* Official Digital Voucher */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs text-right space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-400">رقم العملية المرجعي:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {completedTransfer.id || `REF-SK-${Date.now().toString().slice(-6)}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">المستلم:</span>
                <strong className="text-slate-800 dark:text-white font-extrabold">{completedTransfer.recipientName}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">رقم الحساب المحول إليه:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {completedTransfer.recipientAccountNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">المبلغ المحول:</span>
                <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatMoney(completedTransfer.amount, currency)}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">سبب الصرف (الحاجة):</span>
                <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                  {completedTransfer.reason}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400">
                <span>تاريخ التنفيذ: {completedTransfer.date}</span>
                <span className="text-emerald-600 font-bold">حماية مشفرة ومعتمدة 🔒</span>
              </div>
            </div>

            {/* Real Transfer Launch Action Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white space-y-3 text-right shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>إتمام التحويل المالي الفعلي 💳:</span>
                </span>
                <span className="text-[10px] text-teal-200">اختر وسيلة الفتح</span>
              </div>

              <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-2xl border border-white/10 font-mono text-xs">
                <span className="font-black text-amber-300 tracking-wider" dir="ltr">{completedTransfer.recipientAccountNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'تم النسخ ✅' : 'نسخ الرقم'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllPrograms(true)}
                  className="py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>كافة البرامج 💻</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPhoneAppsSheet}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>قائمة الهاتف 📲</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenQiDirectly}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ماستر كي / Qi 💳</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow transition active:scale-95"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `🔔 إشعار تحويل مالي موثق:\nتم تحويل ${completedTransfer.amount} ${currency} إلى الأخ ${completedTransfer.recipientName} على رقم الحساب (${completedTransfer.recipientAccountNumber}) لحاجة [${completedTransfer.reason}].`;
                  navigator.clipboard.writeText(text);
                  alert('تم نسخ نص الإشعار لمشاركته!');
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-white font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Copy className="w-4 h-4 text-emerald-500" />
                <span>نسخ الإيصال الكامل 📋</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Sending Card Live Balance */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-bold">البطاقة المصرفية الرئيسية:</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{sendingCard.name}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-400 text-[10px] block">الرصيد المتاح:</span>
                <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-black">
                  {formatMoney(sendingCard.balance, currency)}
                </strong>
              </div>
            </div>

            {/* 1. Recipient Brother Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                1. اختر الأخ المستلم (يتم جلب حسابه تلقائياً):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {brothers.map((b) => {
                  const isSelected = recipientId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setRecipientId(b.id);
                        setFieldId('');
                        setCommodityName('');
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition border text-xs font-bold ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                        style={{ backgroundColor: b.avatarColor }}
                      >
                        {b.name[0]}
                      </span>
                      <span className="truncate font-black">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{b.bankAccountNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient Pre-Saved Bank Account & Native Phone Apps Launcher */}
            {selectedRecipient && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-2.5">
                
                {/* Toast feedback upon choosing bank app or copy */}
                {bankAppToast && (
                  <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center animate-bounce shadow-md">
                    {bankAppToast}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>رقم البطاقة المصرفية للأخ ({selectedRecipient.name}):</span>
                  </span>
                  <span className="text-emerald-600 font-bold">بطاقة المستلم</span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
                  <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-black tracking-wider" dir="ltr">
                    {selectedRecipient.bankAccountNumber}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg transition flex items-center gap-1 text-[10px] font-black"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ ✅' : 'نسخ رقم البطاقة 📋'}</span>
                  </button>
                </div>

                {/* Direct Native Phone Apps Chooser Button & Desktop All-Programs Hub */}
                <div className="space-y-2 pt-1">
                  
                  {/* Big Desktop & Mobile All Programs Hub Button */}
                  <button
                    type="button"
                    onClick={() => setShowAllPrograms(true)}
                    className="w-full py-3 px-3.5 bg-gradient-to-r from-teal-700 via-slate-800 to-indigo-800 hover:from-teal-600 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 border border-teal-400/40 cursor-pointer"
                  >
                    <Monitor className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>💻 فتح مركز كافة برامج وتطبيقات التحويل (سطح المكتب والهاتف) 🔍</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleOpenPhoneAppsSheet}
                      className="py-2 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تطبيقات الهاتف 📲</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenQiDirectly}
                      className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تطبيق ماستر كي / Qi 💳</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. Amount Input (المبلغ أولاً) */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-700">
              <label className="block text-xs font-black text-emerald-900 dark:text-emerald-200 mb-1.5 flex items-center justify-between">
                <span>2. المبلغ المراد تحويله ({currency}) *:</span>
                <span className="text-[10px] text-emerald-600 font-bold">المبلغ المطلوب بدقة</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="اكتب المبلغ هنا (مثال: 70000)"
                className="w-full text-2xl font-black bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono shadow-xs"
              />
            </div>

            {/* 3. Commodity / Item Entry (السلعة ثانياً) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. اسم السلعة / الغرض (تُسجل وتُثبت في دائرة الأخ فوراً) *:</span>
                </label>
                {commodityName && (
                  <span className="text-[10px] text-emerald-600 font-bold">
                    تُحسب في دائرته
                  </span>
                )}
              </div>

              {/* Custom Commodity Name Input */}
              <input
                type="text"
                required
                value={commodityName}
                onChange={(e) => {
                  setCommodityName(e.target.value);
                  if (!reason) setReason(e.target.value);
                }}
                placeholder="اكتب اسم السلعة هنا (مثال: بنزين، حليب للأطفال، صيانة، مسواك...)"
                className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />

              {/* Or Select from existing approved items */}
              {selectedRecipient?.approvedFields?.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">
                    أو اختر من السلع المثبتة مسبقاً في دائرته:
                  </span>
                  <select
                    value={fieldId}
                    onChange={(e) => {
                      setFieldId(e.target.value);
                      const f = selectedRecipient.approvedFields.find((item) => item.id === e.target.value);
                      if (f) {
                        setCommodityName(f.name);
                        if (!reason) setReason(f.name);
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- اختر من السلع المثبتة في دائرته --</option>
                    {selectedRecipient.approvedFields.map((f) => (
                      <option key={f.id} value={f.id} className="dark:bg-slate-800">
                        {f.name} (المصروف الحالي: {(f.spent || 0).toLocaleString()} {currency})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Commodity Chips */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                اختيار سريع لنوع السلعة:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'بنزين ومواصلات ⛽', commodity: 'بنزين ومواصلات ⛽', reason: 'بنزين ومواصلات' },
                  { label: 'حليب للأطفال 🥛', commodity: 'حليب للأطفال 🥛', reason: 'حليب للأطفال' },
                  { label: 'مواد غذائية ومسواك 🛒', commodity: 'مواد غذائية ومسواك 🛒', reason: 'تموين ومواد غذائية' },
                  { label: 'صيدلية وأدوية 🩺', commodity: 'صيدلية وأدوية 🩺', reason: 'أدوية وصيدلية' },
                  { label: 'فواتير وكهرباء ⚡', commodity: 'فواتير وكهرباء ⚡', reason: 'فاتورة كهرباء وانترنت' },
                  { label: 'صيانة وتصليح 🔧', commodity: 'صيانة وتصليح 🔧', reason: 'صيانة وتصليح' },
                  { label: 'أولاد وتعليم 📚', commodity: 'أولاد وتعليم 📚', reason: 'احتياجات دراسية وتعليم' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCommodityName(chip.commodity);
                      setReason(chip.reason);
                      const match = selectedRecipient?.approvedFields?.find((f) =>
                        f.name.toLowerCase().includes(chip.commodity.split(' ')[0].toLowerCase())
                      );
                      if (match) setFieldId(match.id);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 font-bold border border-emerald-200 dark:border-emerald-800 transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Notes / Reason (إجباري 100% لإتمام التحويل) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>4. ملاحظة وتفاصيل سبب الصرف <span className="text-rose-500 font-black">* (إجباري لإتمام الإرسال)</span>:</span>
                </label>
                {!isReasonValid && (
                  <span className="text-[10px] text-rose-600 font-bold animate-pulse">
                    مطلوب قبل الإرسال *
                  </span>
                )}
              </div>

              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اكتب ملاحظة توضح سبب وتفاصيل الصرف (إجباري ولا يمكن الإرسال بدونها)..."
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95 ${
                  canSubmit
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 text-white shadow-emerald-600/30 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>جاري تنفيذ التحويل وتحديث الحسابات...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 -rotate-45" />
                    <span>
                      تأكيد وتحويل الأموال فوراً والانتقال لقائمة تطبيقات هاتفك 🚀
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* All Programs & Apps Chooser Modal */}
        <AllProgramsModal
          isOpen={showAllPrograms}
          onClose={() => setShowAllPrograms(false)}
          recipientName={selectedRecipient?.name}
          accountNumber={selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber}
          amount={Number(amount) || 0}
          reason={reason.trim()}
        />

      </div>
    </div>
  );
};
