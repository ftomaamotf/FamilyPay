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
  Copy,
  ExternalLink,
  Smartphone,
  ArrowUpRight,
  Share2,
  Monitor,
  Home
} from 'lucide-react';
import { openPhoneAppsChooser, launchQiDirect, launchTransferProgram } from '../utils/bankAppLauncher';
import { AllProgramsModal } from './AllProgramsModal';

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
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedBankToast, setCopiedBankToast] = useState('');
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  const copyBankNumber = (accNumber) => {
    if (!accNumber) return;
    navigator.clipboard.writeText(String(accNumber).trim());
    setCopiedBankToast(`✅ تم نسخ رقم البطاقة (${accNumber}) بنجاح!`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(60);
    }
    setTimeout(() => setCopiedBankToast(''), 3500);
  };

  const handleGoHome = () => {
    const acc = selectedReq?.bankAccountNumber || selectedReq?.brotherAccountNumber;
    copyBankNumber(acc);
    launchTransferProgram({
      programId: 'home_screen',
      accountNumber: acc,
      amount: Number(selectedReq?.amount) || 0,
      recipientName: selectedReq?.brotherName || 'الأخ المستلم',
      reason: selectedReq?.reason || 'طلب أموال معتمد',
      launchType: 'home'
    });
    setCopiedBankToast('🏠 تم نسخ رقم البطاقة والانتقال لشاشة هاتفك الرئيسية!');
    setTimeout(() => setCopiedBankToast(''), 4000);
  };

  const handleOpenPhoneAppsSheet = () => {
    openPhoneAppsChooser({
      accountNumber: selectedReq?.bankAccountNumber || selectedReq?.brotherAccountNumber,
      amount: Number(selectedReq?.amount) || 0,
      recipientName: selectedReq?.brotherName || 'الأخ المستلم',
      reason: selectedReq?.reason || 'طلب أموال معتمد'
    });
    setCopiedBankToast('📲 تم نسخ رقم البطاقة وجاري فتح قائمة تطبيقات هاتفك...');
    setTimeout(() => setCopiedBankToast(''), 4000);
  };

  const handleOpenQiDirectly = () => {
    launchQiDirect(selectedReq?.bankAccountNumber || selectedReq?.brotherAccountNumber);
    setCopiedBankToast('🟡 تم نسخ رقم البطاقة وجاري تشغيل سوبر كي (Super Qi)...');
    setTimeout(() => setCopiedBankToast(''), 4000);
  };

  if (!isOpen) return null;

  const pendingRequests = fundRequests.filter((r) => r.status === 'pending');
  const selectedBrother = brothers.find((b) => b.id === selectedReq?.brotherId);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setLoading(true);
    setMsg('');

    const res = await approveMoneyRequest({
      requestId: selectedReq.id,
      targetFieldId: targetFieldId || selectedReq.fieldId,
      requestDetails: selectedReq
    });

    setLoading(false);

    if (res.success) {
      setIsSuccess(true);
      setMsg(res.message || '✅ تمت الموافقة وصرف المبلغ بنجاح!');

      // Automatically launch the phone's native apps sheet on the screen!
      openPhoneAppsChooser({
        accountNumber: selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber,
        amount: Number(selectedReq.amount),
        recipientName: selectedReq.brotherName || 'الأخ المستلم',
        reason: selectedReq.reason || 'طلب أموال معتمد'
      });

      setTimeout(() => {
        setSelectedReq(null);
        setActionType(null);
        setTargetFieldId('');
        setMsg('');
        setIsSuccess(false);
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
                <span>طلبات الأموال الواردة من المستخدمين</span>
                {pendingRequests.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pendingRequests.length} جديدة
                  </span>
                )}
              </h3>
              <p className="text-xs text-amber-100">
                مراجعة طلبات السحب والموافقة عليها وتحويلها فوراً لدائرة المستخدم
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
                عندما يطلب أي مستخدم مبالغ لسلعة معينة، ستظهر طلباته هنا لتوافق عليها وتُثبت في دائرته.
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            بطاقة: {req.bankAccountNumber}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-extrabold border border-teal-300/60 dark:border-teal-800">
                            🏷️ السلعة: {req.fieldName || 'مصروف عام'}
                          </span>
                        </div>
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

      {/* Approve Confirmation Modal with Real Banking Integration */}
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
                <span>الموافقة والتحويل البنكي للمال 💳</span>
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
                <button
                  type="button"
                  onClick={() => copyBankNumber(selectedReq.bankAccountNumber || selectedReq.brotherAccountNumber)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1 active:scale-95 shrink-0"
                  title="نسخ رقم البطاقة"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم 📋</span>
                </button>
              </div>
            </div>

            {/* Direct Native Phone Apps Chooser Button & Desktop All-Programs Hub */}
            <div className="space-y-2 pt-1">
              {/* Button 1: Go to Phone Home Screen (شاشة وتطبيقات الهاتف الرئيسية) */}
              <button
                type="button"
                onClick={handleGoHome}
                className="w-full py-3 px-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 border border-amber-300/50 cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-950 shrink-0" />
                <span>🏠 الانتقال لشاشة الهاتف الرئيسية لاختيار تطبيق التحويل (سوبر كي وغيره)</span>
              </button>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={handleOpenQiDirectly}
                  className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-black text-[10px] sm:text-[11px] rounded-xl flex items-center justify-center gap-1 transition active:scale-95 border border-amber-300 dark:border-amber-700 cursor-pointer"
                >
                  <span className="text-xs">🟡</span>
                  <span className="truncate">سوبر كي (Super Qi)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAllPrograms(true)}
                  className="py-2 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] sm:text-[11px] rounded-xl flex items-center justify-center gap-1 transition active:scale-95 border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5 text-teal-600" />
                  <span className="truncate">كافة البرامج 💻</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPhoneAppsSheet}
                  className="py-2 px-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-bold text-[10px] sm:text-[11px] rounded-xl flex items-center justify-center gap-1 transition active:scale-95 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">قائمة الهاتف 📲</span>
                </button>
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
                      : '✅ تأكيد وصرف والانتقال لقائمة تطبيقات هاتفك 🚀'}
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

      {/* All Programs Modal */}
      <AllProgramsModal
        isOpen={showAllPrograms}
        onClose={() => setShowAllPrograms(false)}
        recipientName={selectedReq?.brotherName}
        accountNumber={selectedReq?.bankAccountNumber || selectedReq?.brotherAccountNumber}
        amount={Number(selectedReq?.amount) || 0}
        reason={selectedReq?.reason || ''}
      />

    </div>
  );
};
