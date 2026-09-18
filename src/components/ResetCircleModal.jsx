import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, toEnglishDigits } from '../utils/formatters';
import {
  X,
  RotateCcw,
  KeyRound,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Wallet,
  ShieldAlert
} from 'lucide-react';

export const ResetCircleModal = ({
  isOpen,
  onClose,
  targetBrother,
  currentAmount = 0
}) => {
  const { resetBrotherCircle, settings } = useFinance();
  const currency = settings?.currencySymbol || 'د.ع';

  const [reason, setReason] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [refundToSendingCard, setRefundToSendingCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setAdminPassword('');
      setShowAdminPassword(false);
      setRefundToSendingCard(false);
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen, targetBrother]);

  if (!isOpen || !targetBrother) return null;

  const isGeneral = targetBrother.id === 'b-general' || Boolean(targetBrother.isGeneral);
  const isReasonValid = reason.trim().length >= 2;
  const isPasswordValid = Boolean(adminPassword.trim());
  const canSubmit = isReasonValid && isPasswordValid && !loading;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isReasonValid) {
      setErrorMsg('⚠️ يرجى كتابة سبب تصفير وحذف مبالغ هذه الدائرة (إجباري)');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('⚠️ يرجى إدخال كلمة مرور الأدمن للتأكيد الأمني');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await resetBrotherCircle(targetBrother.id, {
      adminPassword: toEnglishDigits(adminPassword).trim(),
      reason: reason.trim(),
      refundToSendingCard
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || '✅ تم تصفير وحذف مبالغ الدائرة بنجاح وإعادة ضبط الحساب لـ 0');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message || 'حدث خطأ أثناء تصفير الدائرة');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border-2 border-rose-500/50 dark:border-rose-600/50 max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header with Security Gradient */}
        <div className="p-5 border-b border-rose-700/50 bg-gradient-to-l from-slate-950 via-rose-950 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-1.5">
                <span>تصفير مبالغ الدائرة</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-rose-500/30 text-rose-300 font-mono">0 {currency}</span>
              </h3>
              <p className="text-[11px] text-rose-200">
                إعادة ضبط العداد المالي وحذف المصروفات المسجلة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleResetSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* Target Brother Details Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/40 dark:from-slate-900 dark:to-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ${
                  isGeneral
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-2xl'
                    : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500'
                }`}
              >
                {isGeneral ? '📦' : targetBrother.name?.[0] || '👤'}
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">
                  {targetBrother.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isGeneral ? 'حساب المصاريف العامة المشتركة' : `رقم الحساب: ${targetBrother.accountNumber || targetBrother.bankAccountNumber || '---'}`}
                </span>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">المبلغ الحالي:</span>
              <span className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                {formatMoney(currentAmount, currency)}
              </span>
            </div>
          </div>

          {/* Security Alert Note */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <strong className="block font-black">إجراء أمني خاص بالأدمن 👑:</strong>
              <p className="text-amber-800 dark:text-amber-300">
                تصفير الدائرة سيقوم بمسح وحذف كافة السلع والمبالغ والتحويلات المسجلة لهذا الحساب نهائياً وإعادة العداد إلى <strong>0 {currency}</strong>.
              </p>
            </div>
          </div>

          {/* 1. Reason Input Field (إجباري) */}
          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>1. سبب تصفير وحذف المبلغ *:</span>
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">(إجباري)</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب تصفير المبلغ (مثال: تصفية الحساب، تسوية شهر جديد، تم إدخال مبالغ بالخطأ...)"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 transition resize-none shadow-xs"
            />
          </div>

          {/* 2. Admin Password Input Field (إجباري) */}
          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                <span>2. كلمة مرور الأدمن للتأكيد الأمني *:</span>
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">(حماية أمنية)</span>
            </label>
            <div className="relative">
              <input
                type={showAdminPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="أدخل كلمة مرور الأدمن للتأكيد"
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 transition pr-4 pl-10 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. Refund to Sending Card Option (اختياري) */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <input
              type="checkbox"
              checked={refundToSendingCard}
              onChange={(e) => setRefundToSendingCard(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 shrink-0"
            />
            <div className="space-y-0.5">
              <span className="font-black text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>استرجاع المبالغ المحذوفة إلى رصيد بطاقة الصندوق</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-tight">
                عند التفعيل: سيتم إضافة قيمة ({formatMoney(currentAmount, currency)}) إلى رصيد بطاقة الصندوق.
              </p>
            </div>
          </label>

          {/* Status / Error Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'جارٍ التحقق وتصفير الحساب...' : `تأكيد تصفير وحذف المبلغ (${formatMoney(currentAmount, currency)})`}</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
            >
              إلغاء والرجوع
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
