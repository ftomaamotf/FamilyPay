import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  CreditCard,
  Send,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

export const SendingCardBanner = ({
  onOpenTransferModal,
  onOpenCardsManager,
  onOpenAdminModal,
  onOpenSecurityModal
}) => {
  const {
    sendingCard,
    currentUser,
    activeAdminId,
    brothers,
    settings,
    isCardFrozen,
    isBalanceHiddenByAdmin,
    toggleAdminBalanceVisibility
  } = useFinance();

  const [copied, setCopied] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const currency = settings.currencySymbol;
  const currentAdmin = brothers.find((b) => b.id === activeAdminId) || { name: 'الأدمن' };
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  const handleCopyAccount = () => {
    if (!sendingCard?.accountNumber) return;
    navigator.clipboard.writeText(sendingCard.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVisibility = async () => {
    if (!isCurrentAdmin) return;
    setToggleLoading(true);
    await toggleAdminBalanceVisibility();
    setToggleLoading(false);
  };

  // Determine if balance should be displayed for the current viewer
  const canSeeBalance = isCurrentAdmin || !isBalanceHiddenByAdmin;

  return (
    <div className={`text-white p-5 sm:p-6 rounded-3xl shadow-xl border relative overflow-hidden animate-fadeIn transition-colors duration-300 ${
      isCardFrozen
        ? 'bg-gradient-to-l from-rose-950 via-slate-900 to-rose-950 border-rose-800/60'
        : 'bg-gradient-to-l from-emerald-900 via-teal-950 to-slate-900 border-emerald-800/40'
    }`}>
      
      {/* Background decorations */}
      <div className={`absolute -left-12 -bottom-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
        isCardFrozen ? 'bg-rose-600/15' : 'bg-emerald-500/15'
      }`} />
      <div className="absolute right-10 -top-10 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Card Info & Balance Display */}
        <div className="space-y-3">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Badge */}
            {isCardFrozen ? (
              <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                البطاقة الرئيسية مجمدة ومقفلة أمنياً
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                البطاقة المصرفية الرئيسية للصندوق
              </span>
            )}

            {/* Admin Visibility Badge */}
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isBalanceHiddenByAdmin
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              <span>{isBalanceHiddenByAdmin ? 'الرصيد الكلي مخفي عن الإخوة 🔒' : 'الرصيد معروض للجميع 👁️'}</span>
            </span>

            {/* Current Admin Badge */}
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
              <Crown className="w-3 h-3 text-amber-400" />
              الأدمن: <strong className="text-white mr-1">{currentAdmin.name}</strong>
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              <span>{sendingCard.name}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1 font-mono">
              <span>{sendingCard.bankName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg border border-white/10">
                <span>رقم الحساب:</span>
                <strong className="text-emerald-300">{sendingCard.accountNumber}</strong>
                <button
                  onClick={handleCopyAccount}
                  title="نسخ رقم الحساب"
                  className="p-1 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>
          </div>

          {/* Balance Amount + Admin Toggle Control */}
          <div className="pt-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 font-medium">الرصيد المالي لبطاقة الصندوق:</span>
              
              {/* Admin Exclusive Toggle Button */}
              {isCurrentAdmin && (
                <button
                  onClick={handleToggleVisibility}
                  disabled={toggleLoading}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition flex items-center gap-1 shadow-sm ${
                    isBalanceHiddenByAdmin
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 border-slate-600'
                  }`}
                  title="خيار خاص بالأدمن لإخفاء أو إظهار المبلغ الكلي لجميع الإخوة"
                >
                  {isBalanceHiddenByAdmin ? (
                    <>
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>إظهار الرصيد للجميع</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-400" />
                      <span>إخفاء الرصيد عن الجميع</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Display Balance (or Masked) */}
            <div className="mt-1 flex items-baseline gap-2">
              {canSeeBalance ? (
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight flex items-baseline gap-2 animate-fadeIn font-mono">
                  <span>{formatMoney(sendingCard.balance, currency)}</span>
                  {isCurrentAdmin && isBalanceHiddenByAdmin && (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                      (مرئي لك كأدمن فقط)
                    </span>
                  )}
                  {(!isBalanceHiddenByAdmin || !isCurrentAdmin) && (
                    <span className="text-xs font-bold text-emerald-200/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      محدث لحظياً ⚡
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-3xl sm:text-4xl font-black text-slate-400 font-mono tracking-widest flex items-baseline gap-2">
                  <span>••••••••</span>
                  <span className="text-xs font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                    مخفي بقرار الأدمن للخصوصية 🔒
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Main Transfer Button */}
          <button
            onClick={onOpenTransferModal}
            disabled={isCardFrozen}
            className={`py-3 px-5 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${
              isCardFrozen
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                : isCurrentAdmin
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isCardFrozen ? <Lock className="w-5 h-5" /> : <Send className="w-5 h-5 -rotate-45" />}
            <span>{isCardFrozen ? 'البطاقة مقفلة أمنياً' : isCurrentAdmin ? 'تحويل مالي محمي برمز' : 'طلب / إرسال تحويل'}</span>
          </button>

          {/* Security PIN / Card Freeze Modal Button */}
          <button
            onClick={onOpenSecurityModal}
            title="نظام حماية الصندوق، الرمز السري وقفل البطاقة"
            className="py-3 px-3.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>حماية الصندوق</span>
          </button>

          {/* Delegate Admin Button */}
          {isCurrentAdmin && (
            <button
              onClick={onOpenAdminModal}
              title="تسليم صلاحية الإرسال والأدمن لأخ آخر"
              className="py-3 px-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>تسليم الأدمن</span>
            </button>
          )}

          {/* Manage Bank Cards */}
          <button
            onClick={onOpenCardsManager}
            className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 flex items-center justify-center gap-1.5 transition"
          >
            <CreditCard className="w-4 h-4 text-slate-300" />
            <span>البطاقات</span>
          </button>

        </div>

      </div>

    </div>
  );
};
