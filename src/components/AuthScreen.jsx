import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
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
  Smartphone
} from 'lucide-react';

export const AuthScreen = ({ onLoginSuccess }) => {
  const {
    brothers,
    loginBrother,
    resetPasswordWithPhone,
    addBrother,
    acceptWhatsAppInvite
  } = useFinance();
  
  // Tab state: 'login' | 'invite' | 'register'
  const [activeTab, setActiveTab] = useState('login');

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

  // New User Registration state
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
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setRegLoading(true);
    setRegMsg('');

    const nextAccNumber = String(1000 + brothers.length + 1);
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];
    const avatarColor = colors[brothers.length % colors.length];

    const newBrotherData = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      accountNumber: nextAccNumber,
      phone: regPhone.trim(),
      bankAccountNumber: regBankAccount.trim() || nextAccNumber,
      bankName: 'ماستر كي / Qi Card',
      password: regPassword.trim(),
      avatarColor,
      isAdmin: brothers.length === 0,
      approvedFields: [
        { id: `f-${Date.now()}-1`, name: 'مصاريف عامة 🛒', limit: 1000, spent: 0 },
        { id: `f-${Date.now()}-2`, name: 'بنزين ونقل ⛽', limit: 500, spent: 0 }
      ]
    };

    const res = await addBrother(newBrotherData);
    setRegLoading(false);

    if (res.success) {
      setRegSuccess(true);
      setRegMsg(`🎉 تم إنشاء حسابك بنجاح! بريدك هو: ${regEmail.trim()}`);
      setTimeout(async () => {
        await loginBrother(regEmail.trim(), regPassword.trim());
        if (onLoginSuccess) onLoginSuccess();
      }, 1200);
    } else {
      setRegSuccess(false);
      setRegMsg(res.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
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
            النظام المالي لإدارة ومصروفات الصندوق المشترك
          </p>
        </div>

        {/* Tab Switcher: 3 Tabs (Login | WhatsApp Invite | Register) */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('invite'); setInviteMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'invite'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>دعوة واتساب 💬</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setRegMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>مستخدم جديد</span>
          </button>
        </div>

        {/* TAB 1: LOGIN (تسجيل الدخول بالبريد الإلكتروني أو رقم الهاتف وكلمة المرور) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs pt-1">
            
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول 🚀'}</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: ACCEPT WHATSAPP INVITATION (انضمام عبر دعوة واتساب) */}
        {activeTab === 'invite' && (
          <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
            
            <div className="p-3.5 bg-teal-950/50 border border-teal-800/80 rounded-2xl text-[11px] text-teal-300 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>وصلتك دعوة من الأدمن عبر الواتساب؟</span>
              </span>
              <p className="text-slate-300">
                أدخل رمز الأمان السري المشترك المرسل لك في رسالة الواتساب لتأكيد هويتك وتعيين كلمة مرورك الخاصة.
              </p>
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
                رقم بطاقتك أو حسابك المصرفي (لاستلام الحوالات):
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteLoading ? 'جاري التحقق والتفعيل...' : 'تأكيد الانضمام والدخول فوراً'}</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 3: REGISTER NEW BROTHER (تسجيل حساب جديد) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                الاسم الكامل *:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: علي عجمي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                البريد الإلكتروني *:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="مثال: ali.ajmi@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم الهاتف (لاستعادة كلمة المرور) *:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="مثال: 07701234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم الحساب المصرفي / الماستر كي (لاستلام الحوالات):
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={regBankAccount}
                  onChange={(e) => setRegBankAccount(e.target.value)}
                  placeholder="مثال: 880011223344503"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                كلمة المرور للدخول *:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="اكتب كلمة مرور قوية لحسابك"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{regLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حسابي والدخول فوراً'}</span>
              </button>
            </div>

          </form>
        )}

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800/80">
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>يفتح مباشرة من أي هاتف أو كمبيوتر عبر الإنترنت</span>
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
                  <h3 className="font-black text-base">استعادة وتعيين كلمة المرور</h3>
                  <p className="text-[11px] text-slate-400">عبر البريد الإلكتروني أو رقم الهاتف المسجل</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-3.5 text-xs">
              
              {/* Email or Phone */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  البريد الإلكتروني أو رقم الهاتف:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="مثال: abdullah.ajmi@gmail.com أو 07702206214"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Registered Phone Confirmation */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  رقم الهاتف المسجل لتأكيد الهوية:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="مثال: 07702206214"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  كلمة المرور الجديدة المطلوبة:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="اكتب كلمة المرور الجديدة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
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

    </div>
  );
};
