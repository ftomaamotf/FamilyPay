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
  CreditCard
} from 'lucide-react';

export const PendingRequestsModal = ({ isOpen, onClose }) => {
  const {
    fundRequests,
    approveMoneyRequest,
    rejectMoneyRequest,
    settings,
    brothers,
    fundPin
  } = useFinance();
  const currency = settings.currencySymbol;

  const [selectedReq, setSelectedReq] = useState(null);
  const [targetFieldId, setTargetFieldId] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const pendingRequests = fundRequests.filter((r) => r.status === 'pending');
  const selectedBrother = selectedReq ? brothers.find((b) => b.id === selectedReq.brotherId) : null;

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setLoading(true);
    setMsg('');
    const res = await approveMoneyRequest({
      requestId: selectedReq.id,
      adminPin: adminPin.trim() || fundPin,
      targetFieldId: targetFieldId || selectedReq.fieldId
    });
    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg(res.message);
      setTimeout(() => {
        setSelectedReq(null);
        setActionType(null);
        setAdminPin('');
        setTargetFieldId('');
        setMsg('');
      }, 1500);
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
      rejectionReason: rejectReason.trim() || 'اعتذر الأدمن عن تنفيذ الطلب حالياً'
    });
    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg(res.message);
      setTimeout(() => {
        setSelectedReq(null);
        setActionType(null);
        setRejectReason('');
        setMsg('');
      }, 1500);
    } else {
      setIsSuccess(false);
      setMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-amber-600 via-teal-800 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>طلبات الأموال الواردة من الإخوة</span>
                {pendingRequests.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pendingRequests.length} جديدة
                  </span>
                )}
              </h3>
              <p className="text-xs text-amber-100">
                مراجعة طلبات السحب والموافقة عليها وتحويلها فوراً
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                لا توجد طلبات أموال معلقة حالياً
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                عندما يطلب أي أخ مبالغ لمصروفاته، ستظهر طلباته هنا فوراً لتوافق عليها بلمسة واحدة.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-750 space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                        {req.brotherName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {req.brotherName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{req.brotherAccountNumber} • بند: {req.fieldName}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {Number(req.amount).toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(req.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="p-2.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    <span className="font-bold text-slate-400 block text-[10px] mb-0.5">سبب الحاجة:</span>
                    {req.reason}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('approve');
                        setAdminPin('');
                        setMsg('');
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>موافقة وتحويل الأموال فوراً ✅</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType('reject');
                        setRejectReason('');
                        setMsg('');
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition flex items-center justify-center gap-1"
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

      {/* Approve Confirmation Modal */}
      {selectedReq && actionType === 'approve' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                تأكيد الموافقة وتحويل المبلغ 💸
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                سيتم تحويل <strong>{Number(selectedReq.amount).toLocaleString()} {currency}</strong> إلى حساب الأخ (<strong>{selectedReq.brotherName}</strong>) وخصمه من بطاقة الصندوق فوراً.
              </p>
            </div>

            <form onSubmit={handleApprove} className="space-y-3 text-xs text-right">
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
                <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {msg}
                </div>
              )}

              {/* Qi Card Direct Quick Launcher */}
              <button
                type="button"
                onClick={() => {
                  const acc = selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber;
                  navigator.clipboard.writeText(acc);
                  window.open('https://online.qi.iq', '_blank');
                }}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>نسخ الحساب (#{selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber}) وفتح تطبيق كي 📲</span>
              </button>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  {loading ? 'جاري التحويل...' : 'تأكيد التحويل الآن 🚀'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Ban className="w-7 h-7" />
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow transition"
                >
                  {loading ? 'جاري الرفض...' : 'تأكيد الرفض ❌'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
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
