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
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const QuickTransferModal = ({ isOpen, onClose, initialRecipientId = null, initialFieldId = null }) => {
  const { brothers, sendingCard, executeTransfer, settings, isCardFrozen, canCurrentUserSend, currentUser } = useFinance();
  const currency = settings.currencySymbol;

  const [recipientId, setRecipientId] = useState(initialRecipientId || '');
  const [fieldId, setFieldId] = useState(initialFieldId || '');
  const [commodityName, setCommodityName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedTransfer, setCompletedTransfer] = useState(null);

  const isSenderAuthorized = canCurrentUserSend ? canCurrentUserSend() : true;
  const selectedRecipient = brothers.find((b) => b.id === recipientId) || null;

  useEffect(() => {
    if (isOpen) {
      setCompletedTransfer(null);
      setAmount('');
      setReason('');
      if (initialRecipientId) {
        setRecipientId(initialRecipientId);
      } else {
        setRecipientId('');
      }
      setFieldId(initialFieldId || '');
      setCommodityName('');
      setErrorMsg('');
    }
  }, [isOpen, initialRecipientId]);

  const handleClose = () => {
    setErrorMsg('');
    setCompletedTransfer(null);
    setCommodityName('');
    setAmount('');
    setReason('');
    setRecipientId('');
    onClose();
  };

  if (!isOpen) return null;

  const copyAccountNumberSilently = (acc) => {
    if (!acc) return;
    try {
      navigator.clipboard.writeText(String(acc).trim());
    } catch {}
    if (window.navigator?.vibrate) {
      try {
        window.navigator.vibrate(60);
      } catch {}
    }
  };

  const isRecipientValid = Boolean(recipientId && selectedRecipient);
  const isReasonValid = reason.trim().length >= 2;
  const isCommodityValid = (commodityName.trim().length >= 2) || Boolean(fieldId);
  const isAmountValid = Number(amount) > 0;
  const canSubmit = isRecipientValid && isReasonValid && isCommodityValid && isAmountValid && !isCardFrozen && !loading && isSenderAuthorized;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRecipientValid) {
      setErrorMsg('⚠️ يرجى اختيار الأخ المستلم أولاً بالضغط على اسمه أو دائرته');
      return;
    }
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

    const targetRecipientId = recipientId;
    const finalCommodity = commodityName.trim() || selectedRecipient?.approvedFields?.find(f => f.id === fieldId)?.name || 'مصروف عام';
    const targetAccount = selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber;

    // Automatically copy recipient card number to clipboard on transfer button click!
    if (targetAccount) {
      copyAccountNumberSilently(targetAccount);
    }

    const res = await executeTransfer({
      recipientId: targetRecipientId,
      recipientAccountNumber: targetAccount,
      brotherAccountNumber: selectedRecipient?.accountNumber,
      bankAccountNumber: selectedRecipient?.bankAccountNumber,
      amount: Number(amount),
      fieldId: commodityName.trim() ? null : (fieldId || null),
      commodityName: finalCommodity,
      reason: reason.trim()
    });

    setLoading(false);

    if (res.success) {
      // Re-copy to ensure clipboard has it firmly
      if (targetAccount) {
        copyAccountNumberSilently(targetAccount);
      }

      setCompletedTransfer(res.transfer || {
        recipientName: selectedRecipient?.name || 'الأخ المستلم',
        recipientAccountNumber: targetAccount,
        amount: Number(amount),
        reason: reason.trim(),
        date: new Date().toISOString().split('T')[0],
        refNumber: 'SK-' + Date.now().toString().slice(-6)
      });
    } else {
      setErrorMsg(res.message || 'حدث خطأ أثناء التحويل');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
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
                توثيق فوري للحاجة وخصم المبلغ ونسخ رقم الحساب تلقائياً
              </p>
            </div>
          </div>

          <button onClick={handleClose} className="p-1 rounded-full text-emerald-200 hover:text-white cursor-pointer">
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
          <div className="p-6 space-y-4 text-center animate-fadeIn overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">
                تم تنفيذ التحويل وتوثيقه بنجاح! 🛡️⚡
              </h4>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-black mt-1">
                ✅ تم نسخ رقم بطاقة الأخ المستلم إلى الحافظة تلقائياً!
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
                <span className="font-bold text-slate-400">رقم الحساب / البطاقة:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm tracking-wider" dir="ltr">
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
                <span className="text-emerald-600 font-bold">تم الخصم والتوثيق 🔒</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow transition active:scale-95 cursor-pointer"
              >
                إغلاق النافذة
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

            {/* 2. Recipient Pre-Saved Bank Account Display */}
            {selectedRecipient && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>رقم البطاقة المصرفية للأخ ({selectedRecipient.name}):</span>
                  </span>
                  <span className="text-emerald-600 font-bold">بطاقة المستلم</span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
                  <strong className="text-emerald-700 dark:text-emerald-300 text-sm sm:text-base font-black tracking-wider" dir="ltr">
                    {selectedRecipient.bankAccountNumber}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-bold font-sans">
                    ⚡ سيتم نسخ الرقم تلقائياً عند الضغط على زر التحويل
                  </span>
                </div>
              </div>
            )}

            {/* 3. Amount Input (المبلغ) */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-700">
              <label className="block text-xs font-black text-emerald-900 dark:text-emerald-200 mb-1.5 flex items-center justify-between">
                <span>المبلغ المراد تحويله ({currency}) *:</span>
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

            {/* 3. Commodity / Item Entry (كتابة اسم السلعة) */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>اسم السلعة / الغرض *:</span>
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
            </div>

            {/* 5. Notes / Reason (ملاحظة الصرف) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>ملاحظة وتفاصيل سبب الصرف <span className="text-rose-500 font-black">* (إجباري لإتمام الإرسال)</span>:</span>
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
                placeholder="اكتب ملاحظة توضح سبب وتفاصيل الصرف..."
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
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
                  <span>جاري تنفيذ التحويل ونسخ رقم البطاقة...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 -rotate-45" />
                    <span>
                      تأكيد وتحويل الأموال فوراً 🚀
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
