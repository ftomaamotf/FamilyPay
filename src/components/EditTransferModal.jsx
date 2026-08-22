import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Edit3,
  DollarSign,
  FileText,
  Calendar,
  Layers,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const EditTransferModal = ({ isOpen, onClose, transfer }) => {
  const { editTransfer, deleteTransfer, brothers, settings, activeAdminId, currentUser } = useFinance();
  const currency = settings.currencySymbol;

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const recipientBrother = transfer
    ? brothers.find(
        (b) =>
          b.id === transfer.recipientId ||
          (b.name && transfer.recipientName && b.name.trim().toLowerCase() === transfer.recipientName.trim().toLowerCase())
      )
    : null;

  useEffect(() => {
    if (transfer) {
      setAmount(String(transfer.amount || ''));
      setReason(transfer.reason || '');
      setDate(transfer.date || (transfer.timestamp ? transfer.timestamp.split('T')[0] : ''));
      setFieldId(transfer.fieldId || '');
      setFieldName(transfer.fieldName || 'مصروف عام');
      setMsg('');
    }
  }, [transfer, isOpen]);

  if (!isOpen || !transfer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setIsSuccess(false);
      setMsg('⚠️ يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!reason.trim()) {
      setIsSuccess(false);
      setMsg('⚠️ يجب كتابة سبب الصرف (الحاجة)');
      return;
    }

    setLoading(true);
    setMsg('');

    const res = await editTransfer(transfer.id, {
      amount: numAmount,
      reason: reason.trim(),
      date,
      fieldId: fieldId || null,
      fieldName: fieldName || 'مصروف عام'
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg('✅ تم تعديل المبلغ وتحديث حسابات الصندوق والأخ بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setIsSuccess(false);
      setMsg(res.message || 'حدث خطأ أثناء تعديل المبلغ');
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف هذه الحوالة بمبلغ (${formatMoney(transfer.amount, currency)})؟\nسيتم استرجاع المبلغ فوراً إلى بطاقة الصندوق وتحديث عداد الأخ.`
      )
    ) {
      return;
    }

    setLoading(true);
    setMsg('');

    const res = await deleteTransfer(transfer.id);
    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg('✅ تم حذف الحوالة واسترجاع المبلغ للصندوق بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setIsSuccess(false);
      setMsg(res.message || 'حدث خطأ أثناء حذف العملية');
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border-2 border-emerald-500/40 overflow-hidden text-slate-800 dark:text-slate-100 animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                تعديل المبلغ المصروف
              </h3>
              <p className="text-xs text-emerald-100">
                المستلم: الأخ ({transfer.recipientName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {msg && (
            <div
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300'
              }`}
            >
              {isSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg}</span>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>المبلغ المصروف ({currency}) *:</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ المعدل..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-2xl px-3.5 py-3 text-base font-black font-mono text-slate-900 dark:text-white outline-none transition"
                required
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Reason Field */}
          <div>
            <label className="block font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>سبب الصرف (الحاجة) *:</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="توضيح سبب الصرف..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition"
              required
            />
          </div>

          {/* Commodity Field Selector (if brother has fields) */}
          <div>
            <label className="block font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-500" />
              <span>السلعة أو البند المحسوب عليه:</span>
            </label>
            <select
              value={fieldId}
              onChange={(e) => {
                setFieldId(e.target.value);
                const selected = recipientBrother?.approvedFields?.find((f) => f.id === e.target.value);
                if (selected) setFieldName(selected.name);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition"
            >
              <option value="">{fieldName || 'مصروف عام 🛒'}</option>
              {recipientBrother?.approvedFields?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (السقف: {formatMoney(f.limit, currency)})
                </option>
              ))}
            </select>
          </div>

          {/* Date Field */}
          <div>
            <label className="block font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>تاريخ العملية:</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات ✅'}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-black text-xs rounded-2xl transition active:scale-95 flex items-center gap-1"
              title="حذف هذه العملية واسترجاع المبلغ للصندوق"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
