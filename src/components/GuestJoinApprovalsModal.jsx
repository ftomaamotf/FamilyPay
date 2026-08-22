import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  UserCheck,
  Phone,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  User
} from 'lucide-react';

export const GuestJoinApprovalsModal = ({ isOpen, onClose }) => {
  const { currentUser, brothers } = useFinance();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/brothers/guest-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
      setSelectedReq(null);
      setAdminPassword('');
      setActionMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setActionMsg('⚠️ كلمة مرور الأدمن مطلوبة لتأكيد الموافقة');
      return;
    }

    setActionLoading(true);
    setActionMsg('');

    try {
      const res = await fetch('/api/brothers/approve-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          adminPassword: adminPassword.trim(),
          requestingAdminId: currentUser?.id
        })
      });
      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setActionSuccess(true);
        setActionMsg(data.message);
        setTimeout(() => {
          setSelectedReq(null);
          setAdminPassword('');
          setActionMsg('');
          fetchRequests();
        }, 1500);
      } else {
        setActionSuccess(false);
        setActionMsg(data.message || 'فشلت عملية الموافقة');
      }
    } catch (e) {
      setActionLoading(false);
      setActionSuccess(false);
      setActionMsg('حدث خطأ في الاتصال بالسيرفر');
    }
  };

  const handleReject = async (reqId) => {
    const pass = prompt('يرجى إدخال كلمة مرور الأدمن لتأكيد الرفض:');
    if (!pass) return;

    try {
      const res = await fetch('/api/brothers/reject-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqId,
          adminPassword: pass.trim(),
          requestingAdminId: currentUser?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم رفض الطلب بنجاح');
        fetchRequests();
      } else {
        alert(data.message || 'فشل رفض الطلب');
      }
    } catch (e) {
      alert('حدث خطأ أثناء رفض الطلب');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-amber-800 via-slate-900 to-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">طلبات انضمام الضيوف للصندوق 📋</h3>
              <p className="text-xs text-amber-200">الموافقة مشروطة بكلمة مرور الأدمن 🔑</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {selectedReq ? (
            /* Approval Form with Admin Password */
            <form onSubmit={handleApprove} className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">اسم الضيف:</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{selectedReq.name}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">رقم الهاتف:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold" dir="ltr">{selectedReq.phone}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">رقم بطاقة ماستر كي:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold" dir="ltr">{selectedReq.bankAccountNumber}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  🔐 أدخل كلمة مرور الأدمن لتأكيد اعتماد وإضافة الأخ للصندوق:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="كلمة مرور الأدمن (مثال: 1988)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {actionMsg && (
                <div className={`p-3 rounded-2xl border text-xs font-bold text-center ${
                  actionSuccess
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                }`}>
                  {actionMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? 'جاري التحقق...' : 'تأكيد القبول بكلمة المرور 🚀'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setAdminPassword(''); setActionMsg(''); }}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            /* List of Requests */
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    لا توجد طلبات انضمام معلقة حالياً
                  </p>
                  <p className="text-[11px] text-slate-400">
                    عندما يقوم أي ضيف بمسح الباركود، سيظهر طلبه هنا فوراً للموافقة عليه بكلمة المرور.
                  </p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-black text-slate-800 dark:text-white">
                          {req.name}
                        </strong>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          بانتظار موافقتك
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 font-mono" dir="ltr">
                        <span>📱 {req.phone}</span>
                        <span>💳 {req.bankAccountNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>موافقة بكلمة المرور</span>
                      </button>

                      <button
                        onClick={() => handleReject(req.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                        title="رفض الطلب"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
