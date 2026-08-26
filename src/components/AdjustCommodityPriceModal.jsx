import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Edit3,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Lock,
  Crown
} from 'lucide-react';

export const AdjustCommodityPriceModal = ({
  isOpen,
  onClose,
  brother,
  field,
  currentPrice = 0
}) => {
  const { adjustCommodityPrice, settings, currentUser, activeAdminId } = useFinance();
  const currency = settings?.currencySymbol || 'د.ع';

  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  useEffect(() => {
    if (isOpen) {
      setNewPrice(currentPrice !== undefined && currentPrice !== null ? String(currentPrice) : '0');
      setReason('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentPrice]);

  if (!isOpen || !brother || !field) return null;

  const numCurrent = Number(currentPrice) || 0;
  const numNew = Number(newPrice);
  const isValidNewPrice = !isNaN(numNew) && numNew >= 0;
  const diff = isValidNewPrice ? numNew - numCurrent : 0;
  const isReduction = diff < 0;
  const isIncrease = diff > 0;
  const refundAmount = Math.abs(diff);

  const isReasonValid = reason.trim().length >= 2;
  const canSubmit = isCurrentAdmin && isValidNewPrice && diff !== 0 && isReasonValid && !loading;

  const handleQuickAdjust = (delta) => {
    const current = Number(newPrice) || 0;
    const nextVal = Math.max(0, current + delta);
    setNewPrice(String(nextVal));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCurrentAdmin) {
      setErrorMsg('⚠️ صلاحية تعديل السعر متاحة حصرياً للأدمن فقط');
      return;
    }
    if (!isValidNewPrice) {
      setErrorMsg('⚠️ يرجى إدخال سعر صحيح أكبر من أو يساوي الصفر');
      return;
    }
    if (diff === 0) {
      setErrorMsg('⚠️ لم يتم تغيير السعر، السعر الجديد يطابق السعر الحالي');
      return;
    }
    if (!isReasonValid) {
      setErrorMsg('⚠️ يرجى كتابة ملاحظة وسبب تعديل السعر (إجباري)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await adjustCommodityPrice({
      brotherId: brother.id,
      fieldId: field.id,
      fieldName: field.name,
      oldPrice: numCurrent,
      newPrice: numNew,
      reason: reason.trim()
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || '✅ تم تعديل السعر وتحديث رصيد الصندوق بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1600);
    } else {
      setErrorMsg(res.message || '❌ حدث خطأ أثناء تعديل السعر');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <Edit3 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">تعديل سعر السلعة</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  للأدمن فقط
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                تصحيح الأخطاء المالية مع استرجاع أو خصم الفارق تلقائياً من الصندوق
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Target Brother & Commodity Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                style={{ backgroundColor: brother.avatarColor || '#059669' }}
              >
                {brother.name?.[0] || 'أ'}
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm text-slate-900 dark:text-white block truncate">
                  {brother.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                  #{brother.accountNumber || brother.bankAccountNumber}
                </span>
              </div>
            </div>

            <div className="text-left shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">السلعة المستهدفة:</span>
              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                <span>{field.name}</span>
                <span>🛒</span>
              </span>
            </div>
          </div>

          {/* Current Price vs New Price Comparison Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Current Registered Price */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">
                السعر المسجل الحالي:
              </span>
              <span className="text-lg font-black font-mono text-slate-700 dark:text-slate-200 block">
                {formatMoney(numCurrent, currency)}
              </span>
              <span className="text-[10px] text-slate-400 block">المسجل في حساب الأخ</span>
            </div>

            {/* New Price Input Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500/80 space-y-1 text-center">
              <label className="text-[11px] font-black text-emerald-900 dark:text-emerald-200 block">
                السعر الجديد بعد التعديل *:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="أدخل السعر الجديد..."
                  className="w-full text-lg font-black bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-1.5 text-center text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                />
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                {isValidNewPrice ? formatMoney(numNew, currency) : '---'}
              </span>
            </div>

          </div>

          {/* Quick Adjustment Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              تعديل سريع بالسحب أو الزيادة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '-10,000', val: -10000, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
                { label: '-5,000', val: -5000, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
                { label: '-1,000', val: -1000, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
                { label: '+1,000', val: 1000, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
                { label: '+5,000', val: 5000, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
                { label: '+10,000', val: 10000, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdjust(chip.val)}
                  className={"text-[10px] font-black px-2.5 py-1 rounded-lg border transition active:scale-95 " + chip.color}
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setNewPrice(String(numCurrent))}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                إعادة ضبط
              </button>
            </div>
          </div>

          {/* Live Financial Impact / Difference Banner */}
          {diff !== 0 && isValidNewPrice && (
            <div className={"p-4 rounded-2xl border transition-all " + (
              isReduction
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                {isReduction ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="font-black text-xs">
                  {isReduction ? '🔄 حركة استرجاع مالي إلى الصندوق:' : '💸 حركة خصم مالي إضافي:'}
                </span>
              </div>

              {isReduction ? (
                <p className="text-xs leading-relaxed font-bold">
                  سيتم <span className="font-black text-emerald-700 dark:text-emerald-300 underline">استرجاع مبلغ ({formatMoney(refundAmount, currency)})</span> وإيداعه فوراً في بطاقة الصندوق الرئيسية، وتخفيض السعر في دائرة الأخ ({brother.name}) إلى ({formatMoney(numNew, currency)}).
                </p>
              ) : (
                <p className="text-xs leading-relaxed font-bold">
                  سيتم <span className="font-black text-amber-700 dark:text-amber-300 underline">خصم مبلغ إضافي ({formatMoney(diff, currency)})</span> من بطاقة الصندوق الرئيسية وإضافته إلى حساب وسعر سلعة الأخ ({brother.name}).
                </p>
              )}
            </div>
          )}

          {/* Reason / Notes Input (Mandatory) */}
          <div className="space-y-1.5">
            <label className="block font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>سبب وملاحظة تعديل السعر <span className="text-rose-500 font-black">* (إجباري)</span>:</span>
              </span>
              {!isReasonValid ? (
                <span className="text-[10px] text-rose-500 font-bold animate-pulse">
                  مطلوب للتأكيد *
                </span>
              ) : (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> تم إدخال السبب
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب التعديل (مثال: تصحيح خطأ إدخال المبلغ من 15 ألف إلى 10 آلاف)..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
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

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition active:scale-95"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={"flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg " + (
                canSubmit
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-600 shadow-none'
              )}
            >
              {loading ? (
                <span>جاري معالجة وتحديث الحسابات...</span>
              ) : !isReasonValid ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>اكتب سبب التعديل لتفعيل الحفظ 🔒</span>
                </>
              ) : diff === 0 ? (
                <span>السعر لم يتغير</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وحفظ تعديل السعر 💾</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
