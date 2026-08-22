import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { GuestRegisterModal } from './GuestRegisterModal';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  CreditCard,
  Phone,
  UserPlus,
  LogIn,
  X,
  Check,
  User,
  Sparkles,
  ArrowRight,
  Globe,
  Share2,
  CheckCircle2,
  KeyRound,
  Smartphone,
  Camera,
  Crown
} from 'lucide-react';

export const AuthScreen = ({ onLoginSuccess }) => {
  const {
    brothers,
    loginBrother,
    loginAsGuest,
    resetPasswordWithPhone,
    acceptWhatsAppInvite,
    registerBrotherViaQr
  } = useFinance();
  
  // View modes: 'welcome' | 'register_owner' | 'login' | 'invite'
  const [viewMode, setViewMode] = useState('welcome');
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showGuestRegisterModal, setShowGuestRegisterModal] = useState(false);

  // Auto-detect ?action=register from URL when scanned via phone camera
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'register' || urlParams.get('action') === 'join') {
        setViewMode('register_owner');
        setRegMsg('👋 أهلاً بك! تم فتح استمارة التسجيل. يرجى إدخال اسمك ورقم هاتفك وبطاقتك لإكمال التسجيل.');
      }
    }
  }, []);

  // Login form state
  const [identifier, setIdentifier] = useState(''); // Email or Phone Number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // WhatsApp Invite Acceptance state
  const [invitePin, setInvitePin] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteBankAccount, setInviteBankAccount] = useState('');
  const [inviteNewPassword, setInviteNewPassword] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // New Owner / User Registration state (Mandatory 4 fields)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBankAccount, setRegBankAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Password recovery modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanIden = identifier.trim();
    if (!cleanIden || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await loginBrother(cleanIden, password);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!invitePin.trim() || !invitePhone.trim() || !inviteName.trim() || !inviteNewPassword.trim()) {
      setInviteMsg('يرجى ملء جميع البيانات ورمز الدعوة السري');
      return;
    }

    setInviteLoading(true);
    setInviteMsg('');
    const res = await acceptWhatsAppInvite({
      secretPin: invitePin.trim(),
      phone: invitePhone.trim(),
      name: inviteName.trim(),
      bankAccountNumber: inviteBankAccount.trim(),
      password: inviteNewPassword.trim()
    });
    setInviteLoading(false);

    if (res.success) {
      setInviteSuccess(true);
      setInviteMsg(res.message);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 1200);
    } else {
      setInviteSuccess(false);
      setInviteMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegMsg('⚠️ الاسم الكامل (الاسم الثلاثي) إجباري لإتمام التسجيل');
      return;
    }
    if (!regPhone.trim()) {
      setRegMsg('⚠️ رقم الهاتف إجباري لتسجيل الدخول والتواصل');
      return;
    }
    if (!regBankAccount.trim()) {
      setRegMsg('⚠️ رقم بطاقة ماستر كي / Qi Card إجباري لاستلام وإرسال الحوالات');
      return;
    }
    if (!regPassword.trim()) {
      setRegMsg('⚠️ كلمة المرور إجبارية لحماية حسابك');
      return;
    }

    setRegLoading(true);
    setRegMsg('');

    const res = await registerBrotherViaQr({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      bankAccountNumber: regBankAccount.trim(),
      password: regPassword.trim(),
      isOwner: true
    });
    setRegLoading(false);

    if (res.success) {
      setRegSuccess(true);
      setRegMsg(`🎉 أهلاً بك يا ${regName.trim()}! تم تسجيلك كصاحب الصندوق وفتح البرنامج.`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 1000);
    } else {
      setRegSuccess(false);
      setRegMsg(res.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  };

  const handleScanSuccess = (decodedText) => {
    setShowCameraScanner(false);
    setShowGuestRegisterModal(true);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetIdentifier || !resetPhone || !newPassword) return;

    setResetLoading(true);
    setResetMsg('');
    const res = await resetPasswordWithPhone(resetIdentifier, resetPhone, newPassword);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(true);
      setResetMsg(res.message);
      setIdentifier(resetIdentifier);
      setPassword(newPassword);
    } else {
      setResetSuccess(false);
      setResetMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100" dir="rtl">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/90 backdrop-blur-xl w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white space-y-6 relative z-10 animate-fadeIn">
        
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 text-white">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            الصندوق والحسابات المشتركة
          </h1>
          <p className="text-xs text-slate-400">
            النظام المالي السحابي لإدارة المصروفات والتحويلات
          </p>
        </div>

        {/* ======================================================== */}
        {/* 🌟 VIEW 1: WELCOME SCREEN (تسجيل صاحب الصندوق | ضيف) 🌟 */}
        {/* ======================================================== */}
        {viewMode === 'welcome' && (
          <div className="space-y-4 pt-2">
            
            {/* Option 1: Register as Fund Owner / صاحب الصندوق */}
            <button
              type="button"
              onClick={() => { setViewMode('register_owner'); setRegMsg(''); }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-between transition active:scale-95 group border border-emerald-400/40 text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Crown className="w-6 h-6 fill-amber-300" />
                </div>
                <div>
                  <span className="block text-sm font-black text-white">
                    تسجيل حساب (صاحب الصندوق) 👑
                  </span>
                  <span className="text-[11px] text-emerald-100 font-medium">
                    أنا صاحب الصندوق ومن يرسل الأموال
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition text-emerald-200" />
            </button>

            {/* Option 2: Enter as Guest & Open Camera Scanner Directly (الخيار الثاني المدمج) */}
            <button
              type="button"
              onClick={() => {
                loginAsGuest();
                if (onLoginSuccess) onLoginSuccess();
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 hover:from-emerald-900 hover:to-slate-850 text-white font-black text-sm shadow-xl border-2 border-emerald-500/60 flex items-center justify-between transition active:scale-95 group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="block text-sm font-black text-white flex items-center gap-1.5">
                    <span>الدخول كـ (ضيف) ومسح باركود الأدمن</span>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">📷 كاميرا</span>
                  </span>
                  <span className="text-[11px] text-emerald-200/90 font-medium">
                    يفتح الكاميرا مباشرة لمسح باركود الأدمن والانضمام للصندوق
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition text-emerald-400" />
            </button>

            {/* Option 3: Already have an account -> Login */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => { setViewMode('login'); setErrorMsg(''); }}
                className="text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>تسجيل الدخول لحساب مسجل مسبقاً 🔑</span>
              </button>

              <button
                type="button"
                onClick={() => { setViewMode('invite'); setInviteMsg(''); }}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>دعوة واتساب 💬</span>
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 🌟 VIEW 2: REGISTER OWNER FORM (صاحب الصندوق) 🌟 */}
        {/* ======================================================== */}
        {viewMode === 'register_owner' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <Crown className="w-4 h-4 fill-amber-400" />
                <span>تسجيل حساب (صاحب الصندوق / مدير مالي)</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="text-[11px] text-slate-400 hover:text-white font-bold"
              >
                العودة ⬅️
              </button>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-[11px] text-amber-200">
              أدخل معلوماتك الشخصية لإنشاء الصندوق وتكون أنت المسؤول المالي الرئيسي:
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                1. اسمك الثلاثي الكامل <span className="text-rose-400 font-black">*</span>:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: عبدالله عجمي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            {/* 2. Email (مخصص لصاحب الصندوق) */}
            <div>
              <label className="block font-bold text-amber-300 mb-1">
                2. البريد الإلكتروني (مخصص لصاحب الصندوق):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="مثال: abdullah.ajmi@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 3. Phone */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                3. رقم هاتفك للتواصل والدخول <span className="text-rose-400 font-black">*</span>:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="مثال: 07702206214"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                4. كلمة المرور الخاصة بحسابك <span className="text-rose-400 font-black">*</span>:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور قوية لحماية الصندوق"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* 5. Bank Account Number / Qi Card */}
            <div>
              <label className="block font-bold text-emerald-400 mb-1">
                5. رقم حسابك المصرفي (ماستر كي / Qi Card) <span className="text-rose-400 font-black">*</span>:
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  required
                  value={regBankAccount}
                  onChange={(e) => setRegBankAccount(e.target.value)}
                  placeholder="مثال: 9256869125"
                  className="w-full bg-slate-950 border border-emerald-500/80 rounded-2xl pr-10 pl-4 py-3 text-xs text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            {regMsg && (
              <div className={`p-3 rounded-2xl border text-xs font-bold text-center ${
                regSuccess
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
              }`}>
                {regMsg}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={regLoading}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>{regLoading ? 'جاري إنشاء الصندوق...' : 'تأكيد التسجيل والدخول كصاحب الصندوق 🚀'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

        {/* ======================================================== */}
        {/* 🌟 VIEW 3: LOGIN FORM (تسجيل الدخول للمسجلين مسبقاً) 🌟 */}
        {/* ======================================================== */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs pt-1">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول لحسابك</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="text-[11px] text-slate-400 hover:text-white font-bold"
              >
                الرئيسية ⬅️
              </button>
            </div>

            {/* Email or Phone Input */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                البريد الإلكتروني أو رقم الهاتف:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="مثال: abdullah.ajmi@gmail.com أو 07702206214"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-300 text-xs">
                  كلمة المرور:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setResetIdentifier(identifier);
                    setResetMsg('');
                    setResetSuccess(false);
                  }}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  نسيت كلمة المرور؟ 🔑
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الخاصة بك"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-10 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-900 text-rose-300 text-xs font-bold text-center animate-shake">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول 🚀'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

        {/* ======================================================== */}
        {/* 🌟 VIEW 4: ACCEPT WHATSAPP INVITATION 🌟 */}
        {/* ======================================================== */}
        {viewMode === 'invite' && (
          <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-black text-sm">
                <Share2 className="w-4 h-4" />
                <span>الانضمام عبر دعوة واتساب</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="text-[11px] text-slate-400 hover:text-white font-bold"
              >
                الرئيسية ⬅️
              </button>
            </div>

            {/* Shared Secret PIN from WhatsApp */}
            <div>
              <label className="block font-bold text-emerald-400 mb-1">
                🔐 رمز الدعوة السري المشترك (المرسل لك بالواتساب) *:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  required
                  value={invitePin}
                  onChange={(e) => setInvitePin(e.target.value)}
                  placeholder="مثال: 4580 أو الرمز المذكور في رسالة الواتساب"
                  className="w-full bg-slate-950 border border-emerald-500 rounded-2xl pr-10 pl-4 py-3 text-xs text-emerald-300 font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم هاتفك المسجل بالدعوة *:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="مثال: 07701234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                اسمك الكامل *:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="اكتب اسمك الكريم"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم بطاقتك أو حسابك المصرفي:
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inviteBankAccount}
                  onChange={(e) => setInviteBankAccount(e.target.value)}
                  placeholder="مثال: 9256869125"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                تعيين كلمة المرور الخاصة بحسابك *:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={inviteNewPassword}
                  onChange={(e) => setInviteNewPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور خاصة بك للدخول مستقبلاً"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            {inviteMsg && (
              <div className={`p-3 rounded-2xl border text-xs font-bold text-center ${
                inviteSuccess
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
              }`}>
                {inviteMsg}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={inviteLoading}
                className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteLoading ? 'جاري التحقق...' : 'تأكيد الانضمام والدخول 🚀'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('welcome')}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl"
              >
                إلغاء
              </button>
            </div>

          </form>
        )}

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800/80">
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>يفتح مباشرة من أي هاتف أو كمبيوتر عبر السحابة</span>
        </div>

      </div>

      {/* Forgot Password Modal (استعادة كلمة المرور) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 text-white space-y-4 relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">استعادة وتعيين كلمة المرور</h3>
                  <p className="text-[11px] text-slate-400">التحقق عبر رقم الهاتف المسجل</p>
                </div>
              </div>

              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  البريد الإلكتروني أو اسم المستخدم:
                </label>
                <input
                  type="text"
                  required
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  رقم الهاتف المسجل للحساب:
                </label>
                <input
                  type="tel"
                  required
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  placeholder="مثال: 07702206214"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  كلمة المرور الجديدة المطلوبة:
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="اكتب كلمة المرور الجديدة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {resetMsg && (
                <p className={`p-2.5 rounded-xl border text-xs font-bold ${
                  resetSuccess
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                }`}>
                  {resetMsg}
                </p>
              )}

              <div className="pt-2">
                {resetSuccess ? (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>تم التعيين بنجاح - انتقل لتسجيل الدخول</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{resetLoading ? 'جاري التحقق...' : 'تأكيد وتعيين كلمة المرور الجديدة'}</span>
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Camera QR Code Live Scanner Modal */}
      <CameraQrScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScanSuccess={handleScanSuccess}
        onManualEntry={() => {
          setShowCameraScanner(false);
          setShowGuestRegisterModal(true);
        }}
      />

      {/* Guest Registration Form Popup */}
      <GuestRegisterModal
        isOpen={showGuestRegisterModal}
        onClose={() => setShowGuestRegisterModal(false)}
        onRegisterSuccess={() => {
          if (onLoginSuccess) onLoginSuccess();
        }}
      />

    </div>
  );
};
