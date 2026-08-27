import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Sparkles,
  User,
  ShieldAlert,
  LogOut,
  Image as ImageIcon,
  Edit3,
  CheckCircle2,
  Wallet,
  Globe,
  ArrowRight,
  X,
  Lock,
  Phone,
  CreditCard,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

export const GuestPortalView = () => {
  const { currentUser, setCurrentUser, registerBrotherViaQr } = useFinance();
  
  // Steps: 'scanner' (default immediate camera) | 'register' | 'waiting'
  const [step, setStep] = useState('scanner');

  // Scanner state
  const [scannerError, setScannerError] = useState('');
  const [isLiveRunning, setIsLiveRunning] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const scannerRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const containerId = useRef(`guest-camera-box-${Date.now()}`).current;

  // Registration form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  const stopScannerCleanly = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }
    } catch (e) {
      console.log('Scanner stop notice:', e);
    } finally {
      scannerRef.current = null;
      setIsLiveRunning(false);
    }
  };

  const startLiveCamera = async () => {
    setScannerError('');
    setIsDecoding(false);

    try {
      await stopScannerCleanly();

      const elem = document.getElementById(containerId);
      if (!elem) return;

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: (w, h) => {
          const size = Math.min(w, h) * 0.72;
          return { width: Math.floor(size), height: Math.floor(size) };
        },
        aspectRatio: 1.0
      };

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        );
        setIsLiveRunning(true);
      } catch (err1) {
        console.warn('Environment camera failed, fallback to any camera:', err1);
        await html5QrCode.start(
          { facingMode: 'user' },
          config,
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        );
        setIsLiveRunning(true);
      }
    } catch (err) {
      console.error('All live camera methods failed:', err);
      setIsLiveRunning(false);
      setScannerError(
        'لم يتم تشغيل بث الفيديو المباشر في المتصفح. اضغط على الزر الأخضر "تصوير بكاميرا الهاتف 📸" لفتح كاميرا جهازك فوراً والتقاط الباركود.'
      );
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(100);
    await stopScannerCleanly();
    setStep('register');
  };

  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    setScannerError('');

    try {
      await stopScannerCleanly();
      const html5QrCode = new Html5Qrcode(containerId);
      const result = await html5QrCode.scanFile(file, true);
      setIsDecoding(false);
      handleScanSuccess(result);
    } catch (err) {
      setIsDecoding(false);
      setScannerError('لم يتم العثور على باركود واضح في الصورة. يرجى إعادة التصوير بوضوح أو إدخال البيانات يدوياً.');
    }
  };

  // Start camera automatically on mount
  useEffect(() => {
    let timer = null;
    if (step === 'scanner') {
      timer = setTimeout(() => {
        startLiveCamera();
      }, 150);
    } else {
      stopScannerCleanly();
    }

    return () => {
      if (timer) clearTimeout(timer);
      stopScannerCleanly();
    };
  }, [step]);

  // Poll status if pending approval
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
          }
        } catch (e) {
          console.error(e);
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingRequestId, isApproved, setCurrentUser]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('⚠️ الاسم الكامل (الثلاثي) إجباري');
      return;
    }
    if (!phone.trim()) {
      setFormError('⚠️ رقم الهاتف إجباري');
      return;
    }
    if (!bankAccountNumber.trim()) {
      setFormError('⚠️ رقم بطاقة ماستر كي / Qi Card إجباري لاستلام الحوالات');
      return;
    }
    if (!password.trim()) {
      setFormError('⚠️ كلمة المرور إجبارية');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const res = await registerBrotherViaQr({
      name: name.trim(),
      phone: phone.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      password: password.trim(),
      isOwner: false
    });
    setFormLoading(false);

    if (res.success) {
      if (res.status === 'pending' && res.requestId) {
        setPendingRequestId(res.requestId);
        setStep('waiting');
      } else if (res.user) {
        setCurrentUser(res.user);
      }
    } else {
      setFormError(res.message || 'حدث خطأ أثناء إرسال البيانات');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 relative font-sans" dir="rtl">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-sm text-white">الصندوق والحسابات المشتركة</h2>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              👤 وضع الضيف (الانضمام عبر الكاميرا)
            </span>
          </div>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition text-xs font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </header>

      {/* ======================================================== */}
      {/* 🌟 STEP 1: FULLSCREEN DIRECT CAMERA SCANNER VIEW 🌟 */}
      {/* ======================================================== */}
      {step === 'scanner' && (
        <main className="w-full max-w-lg my-auto py-2 flex flex-col justify-between flex-1 relative z-10 animate-fadeIn">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="font-black text-sm sm:text-base">مسح باركود الأدمن للانضمام 📷</h3>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>إلغاء</span>
            </button>
          </div>

          {/* Clean Viewport Box */}
          <div className="relative w-full h-[320px] sm:h-[370px] bg-black rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl flex items-center justify-center my-auto">
            <div id={containerId} className="w-full h-full object-cover" />

            {isLiveRunning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-emerald-400 rounded-3xl relative shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-300 rounded-tr-xl" />
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-300 rounded-tl-xl" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-300 rounded-br-xl" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-300 rounded-bl-xl" />
                  <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
            )}

            {isDecoding && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-2 text-white font-bold text-xs">
                <span className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span>جاري قراءة وتحليل الباركود...</span>
              </div>
            )}
          </div>

          {scannerError && (
            <div className="my-2 p-3 bg-rose-950/90 text-rose-200 text-xs font-bold rounded-2xl border border-rose-800 flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Scanner Bottom Action Controls */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>تصوير الباركود بكاميرا الهاتف 📸</span>
            </button>

            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileScan}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>من المعرض 🖼️</span>
              </button>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileScan}
              />

              <button
                type="button"
                onClick={() => setStep('register')}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-teal-400" />
                <span>إدخال يدوي 📝</span>
              </button>
            </div>
          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* 🌟 STEP 2: GUEST REGISTRATION FORM 🌟 */}
      {/* ======================================================== */}
      {step === 'register' && (
        <main className="w-full max-w-lg my-auto py-4 relative z-10 animate-fadeIn">
          <div className="bg-slate-900/95 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>إكمال بيانات الانضمام لصندوق العائلة</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('scanner')}
                className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>إعادة المسح</span>
              </button>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-[11px] text-emerald-200">
              أدخل بياناتك وسيتم إشعار الأدمن فوراً للموافقة عليك بكلمة المرور:
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              
              {/* 1. Full Name */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  1. الاسم الثلاثي الكامل <span className="text-rose-400 font-bold">*</span>:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب الاسم الكامل..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* 2. Phone */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  2. رقم هاتفك للتواصل والدخول <span className="text-rose-400 font-bold">*</span>:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 07701234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* 3. Qi Card */}
              <div>
                <label className="block font-bold text-emerald-400 mb-1">
                  3. رقم بطاقة ماستر كي / Qi Card <span className="text-rose-400 font-bold">*</span>:
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="مثال: 9256869125"
                    className="w-full bg-slate-950 border border-emerald-500/80 rounded-2xl pr-10 pl-4 py-3 text-xs text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  4. كلمة المرور الخاصة بحسابك <span className="text-rose-400 font-bold">*</span>:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور خاصة بك لحماية حسابك"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-900 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formLoading ? 'جاري الإرسال...' : 'إرسال طلب الانضمام للأدمن 🚀'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('scanner')}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* 🌟 STEP 3: WAITING FOR ADMIN APPROVAL VIEW 🌟 */}
      {/* ======================================================== */}
      {step === 'waiting' && (
        <main className="w-full max-w-lg my-auto py-6 relative z-10 animate-fadeIn">
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-center space-y-4">
            
            {isApproved ? (
              <div className="space-y-3 animate-bounce">
                <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">🎉 تمت موافقة الأدمن بكلمة المرور!</h3>
                <p className="text-xs text-emerald-300 font-bold">جاري فتح لوحة تحكم حسابك فوراً...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">تم إرسال طلب انضمامك إلى الأدمن ⏳</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    تم إشعار صاحب الصندوق بطلبك. بمجرد إدخاله كلمة المرور للموافقة، سيتحول حسابك فوراً إلى مستخدم معتمد!
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono space-y-1.5 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الاسم:</span>
                    <strong className="text-white">{name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <strong className="text-white" dir="ltr">{phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">بطاقة ماستر كي:</span>
                    <strong className="text-emerald-400" dir="ltr">{bankAccountNumber}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold pt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>جاري فحص حالة الموافقة لحظياً...</span>
                </div>
              </div>
            )}

          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="w-full max-w-lg text-center text-[11px] text-slate-500 py-2 relative z-10">
        نظام الصندوق المالي السحابي المشترك
      </footer>

    </div>
  );
};
