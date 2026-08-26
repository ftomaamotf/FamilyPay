import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  Send,
  CreditCard,
  User,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export const RequestMoneyModal = ({ isOpen, onClose, initialBrotherId = null, initialFieldId = null }) => {
  const { currentUser, brothers, submitMoneyRequest, settings } = useFinance();
  const currency = settings.currencySymbol;

  const [selectedRequesterId, setSelectedRequesterId] = useState(initialBrotherId || currentUser?.id || '');
  const currentBrother = brothers.find((b) => b.id === selectedRequesterId) || brothers.find((b) => b.id === (initialBrotherId || currentUser?.id)) || currentUser;

  const [fieldId, setFieldId] = useState(initialFieldId || '');
  const [commodityName, setCommodityName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialBrotherId) {
        setSelectedRequesterId(initialBrotherId);
      } else if (currentUser?.id) {
        setSelectedRequesterId(currentUser.id);
      }
      setFieldId(initialFieldId || '');
      setCommodityName('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialBrotherId, initialFieldId]);

  if (!isOpen) return null;

  const selectedField = currentBrother?.approvedFields?.find((f) => f.id === fieldId);
  const fieldLimit = selectedField?.limit || 0;
  const fieldSpent = selectedField?.spent || 0;
  const fieldRemaining = Math.max(0, fieldLimit - fieldSpent);

  const isReasonValid = reason.trim().length >= 2;
  const isAmountValid = Number(amount) > 0;
  const isCommodityValid = Boolean(commodityName.trim()) || Boolean(fieldId);
  const canSubmit = isReasonValid && isAmountValid && isCommodityValid && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى كتابة مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!commodityName.trim() && !fieldId) {
      setErrorMsg('يرجى كتابة اسم السلعة المطلوبة');
      return;
    }
    if (!reason.trim() || reason.trim().length < 2) {
      setErrorMsg('⚠️ يرجى كتابة ملاحظات وتفاصيل إضافية عن سبب الصرف (إجباري لتفعيل إرسال الطلب)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const finalCommodity = commodityName.trim() || selectedField?.name || reason.trim() || 'مصروف عام';

    const res = await submitMoneyRequest({
      brotherId: currentBrother?.id || currentUser?.id,
      brotherName: currentBrother?.name || currentUser?.name,
      brotherAccountNumber: currentBrother?.accountNumber || currentUser?.accountNumber,
      accountNumber: currentBrother?.accountNumber || currentUser?.accountNumber,
      phone: currentBrother?.phone || currentUser?.phone,
      bankAccountNumber: currentBrother?.bankAccountNumber || currentUser?.bankAccountNumber,
      amount: numAmount,
      fieldId: commodityName.trim() ? null : (fieldId || null),
      commodityName: finalCommodity,
      reason: reason.trim()
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'تم إرسال طلبك بنجاح للأدمن');
      setAmount('');
      setReason('');
      setCommodityName('');
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.message || 'حدث خطأ أثناء إرسال الطلب');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-teal-700 via-emerald-800 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                طلب أموال إلى حسابك 📥
              </h3>
              <p className="text-xs text-teal-200">
                تسجيل السلعة وطلب المبلغ برقم الحساب لاعتماده من الصندوق
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-teal-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* If multiple brothers, allow selecting brother strictly by bank card */}
          {brothers.length > 1 && (
            <div>
              <label className="block font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>اختيار المستلم (البطاقة المصرفية) *:</span>
              </label>
              <select
                value={selectedRequesterId}
                onChange={(e) => {
                  setSelectedRequesterId(e.target.value);
                  setFieldId('');
                  setCommodityName('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl px-3 py-2.5 text-xs font-black text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-sm"
              >
                {brothers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (بطاقة: {b.bankAccountNumber}) {b.isAdmin ? '👑 الأدمن' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Details Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: currentBrother?.avatarColor || '#10b981' }}
              >
                {currentBrother?.name?.[0] || 'أ'}
              </span>
              <div>
                <span className="font-black text-slate-900 dark:text-white block">
                  {currentBrother?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                  بطاقة: {currentBrother?.bankAccountNumber}
                </span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold">رقم البطاقة المصرفية:</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 font-mono" dir="ltr">
                {currentBrother?.bankAccountNumber}
              </span>
            </div>
          </div>

          {/* 1. Amount Input (المبلغ أولاً) */}
          <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-800">
            <label className="block font-black text-slate-800 dark:text-slate-200 text-xs mb-1.5 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>1. المبلغ المطلوب تحويله ({currency}) *:</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="اكتب المبلغ هنا (مثال: 70000)"
              className="w-full bg-white dark:bg-slate-900 border-2 border-teal-400 dark:border-teal-600 rounded-xl px-4 py-2.5 text-base font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono text-center shadow-xs"
            />
          </div>

          {/* 2. Commodity / Field Selection (السلعة ثانياً) */}
          <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="block font-black text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>2. اسم السلعة / الغرض (تثبت في دائرتك فوراً) *:</span>
              </label>
              {commodityName && (
                <span className="text-[10px] text-teal-600 font-bold">
                  تُسجل تلقائياً
                </span>
              )}
            </div>

            {/* Custom Commodity Name Input */}
            <input
              type="text"
              required
              value={commodityName}
              onChange={(e) => setCommodityName(e.target.value)}
              placeholder="اكتب اسم السلعة هنا (مثال: بنزين، حليب للأطفال، مسواك البيت...)"
              className="w-full bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />

            {/* Or choose from existing items */}
            {currentBrother?.approvedFields?.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-slate-500 font-bold block mb-1">
                  أو اختر من السلع المثبتة مسبقاً في حسابك:
                </span>
                <select
                  value={fieldId}
                  onChange={(e) => {
                    setFieldId(e.target.value);
                    const f = currentBrother.approvedFields.find((item) => item.id === e.target.value);
                    if (f) setCommodityName(f.name);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                >
                  <option value="">-- اختر من السلع المثبتة في دائرتك --</option>
                  {currentBrother.approvedFields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (المصروف الحالي: {(f.spent || 0).toLocaleString()} {currency})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Commodity Chips */}
          <div>
            <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
              أو اختر بالضغط السريع على أي سلعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'بنزين ومواصلات ⛽', commodity: 'بنزين ومواصلات ⛽', reason: 'تعبئة بنزين ومواصلات' },
                { label: 'حليب للأطفال 🥛', commodity: 'حليب للأطفال 🥛', reason: 'شراء حليب ومستلزمات للأطفال' },
                { label: 'مواد غذائية ومسواك 🛒', commodity: 'مواد غذائية ومسواك 🛒', reason: 'شراء مواد غذائية ومسواك للبيت' },
                { label: 'صيدلية وأطباء 🩺', commodity: 'صيدلية وأطباء 🩺', reason: 'مراجعة طبيب وشراء أدوية' },
                { label: 'فواتير وانترنت ⚡', commodity: 'فواتير وانترنت ⚡', reason: 'سداد فاتورة انترنت وكهرباء' },
                { label: 'صيانة منزلية 🔧', commodity: 'صيانة منزلية 🔧', reason: 'أعمال صيانة وتصليح' },
                { label: 'أولاد وتعليم 📚', commodity: 'أولاد وتعليم 📚', reason: 'مستلزمات دراسية وكتب' },
                { label: 'ملابس واحتياجات 👕', commodity: 'ملابس واحتياجات 👕', reason: 'شراء ملابس واحتياجات' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCommodityName(chip.commodity);
                    setReason(chip.reason);
                    const match = currentBrother?.approvedFields?.find((f) =>
                      f.name.toLowerCase().includes(chip.commodity.split(' ')[0].toLowerCase())
                    );
                    if (match) setFieldId(match.id);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-750 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Reason / Notes Input (إجباري لتفعيل الإرسال) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-teal-500" />
                <span>3. ملاحظات وتفاصيل الصرف <span className="text-rose-500 font-black">* (إجباري لتفعيل الزر)</span>:</span>
              </span>
              {!isReasonValid ? (
                <span className="text-[10px] text-rose-500 font-bold animate-pulse">
                  🔒 مطلوب لتفعيل زر الإرسال *
                </span>
              ) : (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>تم إدخال الملاحظة</span>
                </span>
              )}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اكتب ملاحظة توضح سبب وتفاصيل الصرف بدقة هنا (مطلوبة لتفعيل زر الإرسال)..."
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Action (غير فعّال إلى أن يتم إدخال ملاحظات الصرف) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                canSubmit
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-teal-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-600 shadow-none'
              }`}
            >
              {loading ? (
                <span>جاري إرسال الطلب...</span>
              ) : !isReasonValid ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>اكتب ملاحظة الصرف أولاً لتفعيل زر الإرسال 🔒</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 -rotate-45" />
                  <span>إرسال طلب الأموال للأدمن 📤</span>
                </>
              )}
            </button>
            {!isReasonValid && (
              <p className="text-center text-[10px] text-rose-500 dark:text-rose-400 font-bold mt-1.5 animate-pulse">
                ⚠️ زر الإرسال غير فعّال حالياً — يرجى كتابة تفاصيل وملاحظات الصرف في الحقل أعلاه لتفعيله.
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
