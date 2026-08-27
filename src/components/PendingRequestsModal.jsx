import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  Check,
  Ban,
  Clock,
  Inbox,
  User,
  DollarSign,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CreditCard,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';

export const PendingRequestsModal = ({ isOpen, onClose }) => {
  const {
    fundRequests,
    approveMoneyRequest,
    rejectMoneyRequest,
    settings,
    brothers
  } = useFinance();
  const currency = settings.currencySymbol;

  const [selectedReq, setSelectedReq] = useState(null);
  const [targetFieldId, setTargetFieldId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedBankToast, setCopiedBankToast] = useState('');

  const copyBankNumber = (accNumber) => {
    if (!accNumber) return;
    try {
      navigator.clipboard.writeText(String(accNumber).trim());
    } catch {}
    setCopiedBankToast(`✅ تم نسخ رقم البطاقة (${accNumber}) بنجاح!`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
    setTimeout(() => setCopiedBankToast(''), 3500);
  };

  if (!isOpen) return null;

  const pendingRequests = fundRequests.filter((r) => r.status === 'pending');
  const selectedBrother = brothers.find((b) => b.id === selectedReq?.brotherId);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setLoading(true);
    setMsg('');

    const targetAccount = selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber;
    if (targetAccount) {
      copyBankNumber(targetAccount);
    }

    const res = await approveMoneyRequest({
      requestId: selectedReq.id,
      targetFieldId: targetFieldId || selectedReq.fieldId,
      requestDetails: selectedReq
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg(res.message || `✅ تمت الموافقة وصرف المبلغ ونسخ رقم البطاقة (${targetAccount || ''}) إلى الحافظة!`);

      setTimeout(() => {
        setSelectedReq(null);
        setActionType(null);
        setTargetFieldId('');
        setMsg('');
        setIsSuccess(false);
      }, 2000);
    } else {
      setIsSuccess(false);
      setMsg(res.message);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setLoading(true);
    setMsg('');

    const res = await rejectMoneyRequest({
      requestId: selectedReq.id,
      rejectReason: rejectReason.trim() || 'تم الاعتذار عن الطلب من قبل الإدارة'
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg('تم رفض الطلب وإشعار الأخ بنجاح');
      setTimeout(() => {
        setSelectedReq(null);
        setActionType(null);
        setRejectReason('');
        setMsg('');
        setIsSuccess(false);
      }, 1500);
    } else {
      setIsSuccess(false);
      setMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>صندوق طلبات الأموال الواردة</span>
                <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {pendingRequests.length} معلق
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                مراجعة طلبات الإخوة والموافقة والصرف المباشر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 animate-pulse" />
              <p className="font-bold text-sm">لا توجد طلبات أموال معلقة حالياً</p>
              <p className="text-xs text-slate-400">أي طلب جديد يرسله أحد الإخوة سيظهر هنا مباشرة للموافقة عليه.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 text-right flex-1">
                    {req.isGeneralExpense && (
                      <div className="mb-2.5 p-3 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 rounded-xl text-amber-800 dark:text-amber-300 flex items-start gap-2.5 shadow-sm">
                        <span className="text-xl leading-none">📦</span>
                        <div>
                          <p className="font-black text-[13px] leading-tight">هذا الطلب مخصص للمصاريف العامة للصندوق</p>
                          <p className="text-[10px] font-bold opacity-90 mt-0.5">الأخ يطلب توجيه المبلغ للمصاريف العامة، وليس لحسابه الشخصي.</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {req.brotherName}
                      </span>
                      {req.isGeneralExpense ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          🌐 توجيه: مصاريف عامة
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                          {req.fieldName || 'طلب عام'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>المبلغ المطلوب:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {Number(req.amount).toLocaleString()} {currency}
                      </strong>
                    </div>

                    {req.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                        {req.reason}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>
                        {req.isGeneralExpense ? (
                          <strong className="text-amber-600 dark:text-amber-400">توجيه: مصاريف عامة مشتركة (بدون رقم حساب) 🌐</strong>
                        ) : (
                          <>رقم الحساب: <strong className="font-mono" dir="ltr">{req.bankAccountNumber || req.brotherAccountNumber}</strong></>
                        )}
                      </span>
                      <span>•</span>
                      <span>{req.date || req.createdAt?.split('T')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('approve');
                        setTargetFieldId(req.fieldId || '');
                        setMsg('');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{req.isGeneralExpense ? 'صرف للمصاريف العامة 📦' : 'موافقة وصرف'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('reject');
                        setRejectReason('');
                        setMsg('');
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Approve Confirmation Modal with Direct Copy */}
      {selectedReq && actionType === 'approve' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center text-slate-800 dark:text-slate-100">
            
            {/* Toast feedback upon copying */}
            {copiedBankToast && (
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs animate-bounce shadow-lg">
                {copiedBankToast}
              </div>
            )}

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <span>الموافقة وصرف المال للأخ 💳</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                تحويل مبلغ <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{Number(selectedReq.amount).toLocaleString()} {currency}</strong> إلى حساب الأخ (<strong>{selectedReq.brotherName}</strong>)
              </p>
            </div>

            {/* Recipient Bank Card Quick Copy Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-right space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  رقم بطاقة المستلم:
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                  {selectedReq.fieldName || 'مصروف عام'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-black font-mono text-sm sm:text-base text-slate-900 dark:text-white tracking-wider" dir="ltr">
                  {selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-sans">
                  ⚡ سيتم نسخ الرقم تلقائياً عند تأكيد الصرف
                </span>
              </div>
            </div>

            <form onSubmit={handleApprove} className="space-y-3 text-xs text-right pt-1">
              {/* Target Commodity Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  السلعة / البند المعتمد لتسجيل المبلغ فيه 🎯:
                </label>
                <select
                  value={targetFieldId || selectedReq.fieldId || ''}
                  onChange={(e) => setTargetFieldId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={selectedReq.fieldId || ''}>
                    التوجيه التلقائي: {selectedReq.fieldName}
                  </option>
                  {selectedBrother?.approvedFields?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (السقف: {f.limit.toLocaleString()} {currency})
                    </option>
                  ))}
                </select>
              </div>

              {msg && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  {msg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'جاري التوثيق والصرف...'
                      : '✅ تأكيد وصرف المبلغ 🚀'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {selectedReq && actionType === 'reject' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                رفض طلب الأموال
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                سيتم إشعار الأخ (<strong>{selectedReq.brotherName}</strong>) بالاعتذار عن تنفيذ هذا الطلب.
              </p>
            </div>

            <form onSubmit={handleReject} className="space-y-3 text-xs">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="سبب الرفض (اختياري)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
              />

              {msg && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {msg}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow transition cursor-pointer active:scale-95"
                >
                  {loading ? 'جاري الرفض...' : 'تأكيد الرفض ❌'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
