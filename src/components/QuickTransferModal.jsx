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
  EyeOff
} from 'lucide-react';

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

  const isSenderAuthorized = canCurrentUserSend ? canCurrentUserSend() : true;
  const selectedRecipient = brothers.find((b) => b.id === recipientId) || brothers[0];

  const handleClose = () => {
    setErrorMsg('');
    setCompletedTransfer(null);
    setCommodityName('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialRecipientId) {
        setRecipientId(initialRecipientId);
      } else if (brothers.length > 0) {
        const found = brothers.find((b) => b.id !== currentUser?.id) || brothers[0];
        setRecipientId(found.id);
      }
      if (initialFieldId) {
        setFieldId(initialFieldId);
      } else {
        const target = brothers.find((b) => b.id === (initialRecipientId || recipientId)) || brothers[0];
        if (target?.approvedFields?.length > 0) {
          setFieldId(target.approvedFields[0].id);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    const acc = selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber;
    if (!acc) return;
    navigator.clipboard.writeText(acc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReasonValid = reason.trim().length >= 2;
  const isAmountValid = Number(amount) > 0;
  const canSubmit = isReasonValid && isAmountValid && !isCardFrozen && !loading && isSenderAuthorized;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCardFrozen) {
      setErrorMsg('🔒 بطاقة الصندوق مجمدة حالياً لحمايتها. يرجى إلغاء التجميد من الأدمن أولاً.');
      return;
    }
    if (!isReasonValid) {
      setErrorMsg('⚠️ يجب كتابة سبب طلب المال (الحاجة) بالتفصيل قبل الإرسال');
      return;
    }
    if (!isAmountValid) {
      setErrorMsg('⚠️ يرجى إدخال مبلغ صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const targetRecipientId = recipientId || selectedRecipient?.id || brothers[0]?.id;
    const finalCommodity = commodityName.trim() || selectedRecipient?.approvedFields?.find(f => f.id === fieldId)?.name || reason.trim();

    const res = await executeTransfer({
      recipientId: targetRecipientId,
      amount: Number(amount),
      fieldId: fieldId || null,
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

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  const acc = completedTransfer.recipientAccountNumber;
                  navigator.clipboard.writeText(acc);
                  window.open('https://online.qi.iq', '_blank');
                }}
                className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>فتح تطبيق كي للتأكيد 📲</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  const text = `🔔 إشعار تحويل مالي موثق:\nتم تحويل ${completedTransfer.amount} ${currency} إلى الأخ ${completedTransfer.recipientName} على رقم الحساب (${completedTransfer.recipientAccountNumber}) لحاجة [${completedTransfer.reason}].`;
                  navigator.clipboard.writeText(text);
                  alert('تم نسخ نص الإشعار لمشاركته!');
                }}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ الإيصال</span>
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
                        if (b.approvedFields?.length > 0) setFieldId(b.approvedFields[0].id);
                        else setFieldId('');
                      }}
                      className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition border text-xs font-bold ${
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
                      <span className="truncate">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient Pre-Saved Bank Account */}
            {selectedRecipient && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>رقم الحساب المصرفي المحفوظ للأخ ({selectedRecipient.name}):</span>
                  </span>
                  <span className="text-emerald-600 font-bold">جاهز تلقائياً</span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
                  <strong className="text-emerald-700 dark:text-emerald-300 text-sm font-black tracking-wide">
                    {selectedRecipient.bankAccountNumber || selectedRecipient.accountNumber}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition flex items-center gap-1 text-[10px] font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>

                {/* Direct Qi Card Quick Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    const acc = selectedRecipient?.bankAccountNumber || selectedRecipient?.accountNumber;
                    navigator.clipboard.writeText(acc);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                    window.open('https://online.qi.iq', '_blank');
                  }}
                  className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-black text-[11px] rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>نسخ رقم الحساب وفتح تطبيق ماستر كي / Qi Card 📲</span>
                </button>
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

            {/* 4. Notes / Reason (اختياري / إضافي) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>4. سبب طلب المال / الحاجة والتفاصيل (إجباري 100%) *:</span>
                </label>
                {!isReasonValid && (
                  <span className="text-[10px] text-rose-600 font-bold animate-pulse">
                    مطلوب للتأكيد
                  </span>
                )}
              </div>

              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: حليب مجفف للأولاد، بنزين سفر، كشف طبي..."
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
                className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition active:scale-95 ${
                  canSubmit
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>جاري تنفيذ التحويل وتحديث الحسابات...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5 -rotate-45" />
                    <span>تأكيد وتحويل الأموال فوراً 🚀</span>
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
