import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  User,
  Phone,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';

export const GuestRegisterModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const { registerBrotherViaQr, setCurrentUser } = useFinance();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pending approval state
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  // Poll status while pending
  useEffect(() => {
    let interval = null;
    if (pendingRequestId && !isApproved) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/brothers/guest-status/${pendingRequestId}`);
          const data = await res.json();
          if (data.success && data.status === 'approved' && data.user) {
            setIsApproved(true);
            setCurrentUser(data.user);
            setTimeout(() => {
              if (onRegisterSuccess) onRegisterSuccess(data.user);
              onClose();
            }, 1800);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingRequestId, isApproved]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('⚠️ الاسم الكامل (الثلاثي) إجباري');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('⚠️ رقم الهاتف إجباري');
      return;
    }
    if (!bankAccountNumber.trim()) {
      setErrorMsg('⚠️ رقم بطاقة ماستر كي / Qi Card إجباري لاستلام الحوالات');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('⚠️ كلمة المرور إجبارية');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await registerBrotherViaQr({
      name: name.trim(),
      phone: phone.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      password: password.trim(),
      isOwner: false
    });
    setLoading(false);

    if (res.success) {
      if (res.status === 'pending' && res.requestId) {
        setPendingRequestId(res.requestId);
      } else if (res.user) {
        if (onRegisterSuccess) onRegisterSuccess(res.user);
        onClose();
      }
    } else {
      setErrorMsg(res.message || 'حدث خطأ أثناء إتمام التسجيل');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">إكمال الانضمام لصندوق العائلة 📋</h3>
              <p className="text-xs text-emerald-200">بانتظار موافقة الأدمن بكلمة المرور</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {pendingRequestId ? (
          /* Waiting Screen while Admin approves with password */
          <div className="p-6 space-y-4 text-center animate-fadeIn">
            {isApproved ? (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  🎉 تمت موافقة الأدمن بكلمة المرور بنجاح!
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  تم اعتماد حسابك في الصندوق، جاري نقلك إلى لوحة التحكم فوراً...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  تم إرسال طلب انضمامك إلى الأدمن ⏳
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تم إشعار الأدمن (صاحب الصندوق) بطلبك، وبمجرد إدخاله كلمة المرور للموافقة، سيفتح حسابك بالكامل تلقائياً!
                </p>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الاسم:</span>
                    <strong className="text-slate-800 dark:text-white">{name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <strong className="text-slate-800 dark:text-white" dir="ltr">{phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">بطاقة ماستر كي:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400" dir="ltr">{bankAccountNumber}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold pt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>جاري فحص حالة الموافقة تلقائياً...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
            
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-300">
              أدخل بياناتك وسيتم إشعار الأدمن فوراً للموافقة عليك بكلمة المرور:
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                1. الاسم الكامل (الاسم الثلاثي) <span className="text-rose-500 font-bold">*</span>:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب الاسم الكامل..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            {/* 2. Phone */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                2. رقم هاتفك للتواصل والدخول <span className="text-rose-500 font-bold">*</span>:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 07701234567"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 3. Bank Account / Qi Card */}
            <div>
              <label className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                3. رقم بطاقة ماستر كي / Qi Card (لاستلام الحوالات) <span className="text-rose-500 font-bold">*</span>:
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="أدخل رقم بطاقة الكي كارد (مثال: 9256869125)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-400 dark:border-emerald-600 rounded-2xl pr-10 pl-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                4. تعيين كلمة المرور لحسابك <span className="text-rose-500 font-bold">*</span>:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور خاصة بك"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-3 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'جاري الإرسال...' : 'إرسال طلب الانضمام للأدمن 🚀'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
