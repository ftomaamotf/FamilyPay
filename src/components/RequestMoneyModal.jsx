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
  Lock
} from 'lucide-react';

export const RequestMoneyModal = ({ isOpen, onClose, initialBrotherId = null, initialFieldId = null }) => {
  const { currentUser, brothers, submitMoneyRequest, settings } = useFinance();
  const currency = settings.currencySymbol;

  const [selectedRequesterId, setSelectedRequesterId] = useState(initialBrotherId || currentUser?.id || '');
  const currentBrother = brothers.find((b) => b.id === selectedRequesterId) || brothers.find((b) => b.id === (initialBrotherId || currentUser?.id)) || currentUser;

  const [fieldId, setFieldId] = useState(initialFieldId || '');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
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
      if (initialFieldId) {
        setFieldId(initialFieldId);
      } else {
        const br = brothers.find((b) => b.id === (initialBrotherId || currentUser?.id)) || currentUser;
        if (br?.approvedFields?.length > 0) {
          setFieldId(br.approvedFields[0].id);
        }
      }
      setErrorMsg('');
      setSuccessMsg('');
      setPassword('');
    }
  }, [isOpen, initialBrotherId, initialFieldId]);

  if (!isOpen) return null;

  const selectedField = currentBrother?.approvedFields?.find((f) => f.id === fieldId);
  const fieldLimit = selectedField?.limit || 0;
  const fieldSpent = selectedField?.spent || 0;
  const fieldRemaining = Math.max(0, fieldLimit - fieldSpent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى كتابة مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('يرجى توضيح سبب طلب الأموال (الحاجة)');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('🔒 يرجى إدخال كلمة مرور حسابك لتأكيد إرسال الطلب');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await submitMoneyRequest({
      brotherId: currentBrother?.id || currentUser?.id,
      brotherName: currentBrother?.name || currentUser?.name,
      phone: currentBrother?.phone || currentUser?.phone,
      bankAccountNumber: currentBrother?.bankAccountNumber || currentUser?.bankAccountNumber,
      amount: numAmount,
      fieldId,
      reason: reason.trim(),
      password: password.trim()
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'تم إرسال طلبك بنجاح للأدمن');
      setAmount('');
      setReason('');
      setPassword('');
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
                تقديم طلب أموال من الصندوق
              </h3>
              <p className="text-xs text-teal-200">
                إرسال طلب مصروف للأدمن للموافقة والتحويل
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-teal-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* If multiple brothers, allow selecting brother */}
          {brothers.length > 1 && (
            <div>
              <label className="block font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>اختيار الأخ صاحب الطلب *:</span>
              </label>
              <select
                value={selectedRequesterId}
                onChange={(e) => {
                  setSelectedRequesterId(e.target.value);
                  const br = brothers.find((b) => b.id === e.target.value);
                  if (br?.approvedFields?.length > 0) {
                    setFieldId(br.approvedFields[0].id);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl px-3 py-2.5 text-xs font-black text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-sm"
              >
                {brothers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (حساب: #{b.accountNumber}) {b.isAdmin ? '👑 الأدمن' : ''}
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
                <span className="text-[10px] text-slate-400 font-mono">
                  حساب رقم: #{currentBrother?.accountNumber}
                </span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold">الحساب المصرفي المستلم:</span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono" dir="ltr">
                {currentBrother?.bankAccountNumber || currentBrother?.accountNumber}
              </span>
            </div>
          </div>

          {/* Field Selection */}
          {currentBrother?.approvedFields?.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                بند / حقل المصروف المطلوب *:
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-bold"
              >
                {currentBrother.approvedFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (المتبقي من السقف: {Math.max(0, f.limit - f.spent).toLocaleString()} {currency})
                  </option>
                ))}
              </select>

              {selectedField && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] bg-teal-50/50 dark:bg-teal-950/20 px-3 py-1.5 rounded-xl border border-teal-200/50 dark:border-teal-800/40 text-teal-700 dark:text-teal-300">
                  <span>سقف هذا البند: <strong>{fieldLimit.toLocaleString()} {currency}</strong></span>
                  <span>المتبقي: <strong className="text-emerald-600 dark:text-emerald-400">{fieldRemaining.toLocaleString()} {currency}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              المبلغ المطلوب ({currency}) *:
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثال: 50000"
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Quick Commodity Chips */}
          <div>
            <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اختيار سريع لنوع السلعة / المصروف:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'بنزين ونقل ⛽', reason: 'تعبئة بنزين ومواصلات' },
                { label: 'حليب ومواد غذائية 🥛', reason: 'شراء حليب ومواد غذائية للبيت' },
                { label: 'صيدلية وأطباء 🩺', reason: 'مراجعة طبيب وشراء أدوية من الصيدلية' },
                { label: 'فواتير وانترنت ⚡', reason: 'سداد فاتورة انترنت وكهرباء' },
                { label: 'صيانة منزلية 🔧', reason: 'أعمال صيانة وتصليح في المنزل' },
                { label: 'أولاد وتعليم 📚', reason: 'شراء احتياجات وكتب ومستلزمات دراسية' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReason(chip.reason);
                    // Find if field exists
                    const match = currentBrother?.approvedFields?.find((f) =>
                      f.name.toLowerCase().includes(chip.label.split(' ')[0].toLowerCase())
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

          {/* Reason / Purpose */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              سبب طلب الأموال (الحاجة / التفاصيل) *:
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اكتب سبب طلب المبلغ (مثلاً: بنزين للسيارة، حليب للأطفال، دكتور وصيدلية...)"
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            </div>
          </div>

          {/* User Password Confirmation (كلمة المرور الخاصة بالمستخدم لتأكيد الطلب) */}
          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-black text-teal-900 dark:text-teal-300 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>كلمة مرور حسابك لتأكيد إرسال الطلب 🔒 *:</span>
              </label>
              {!password.trim() && (
                <span className="text-[10px] text-rose-600 font-bold animate-pulse">
                  إجبارية
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور حسابك لتأكيد طلب المال"
                className="w-full bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-teal-500"
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 -rotate-45" />
              <span>{loading ? 'جاري إرسال الطلب...' : 'إرسال طلب الأموال للأدمن 📤'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
