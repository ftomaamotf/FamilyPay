import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, normalizeArabicText, formatArabicDate } from '../utils/formatters';
import {
  Users,
  Copy,
  Check,
  Send,
  Sliders,
  Crown,
  CreditCard,
  Sparkles,
  TrendingUp,
  UserPlus,
  Edit2,
  Share2,
  Trash2,
  QrCode,
  Inbox,
  Edit3,
  MessageSquare,
  Radio,
  Phone,
  MessageCircle,
  X
} from 'lucide-react';
import { EditTransferModal } from './EditTransferModal';

// 🌈 Curated Vibrant Color Themes for Distinct Brother Circles
export const CIRCLE_COLOR_PALETTES = [
  {
    name: 'emerald',
    color: '#059669',
    ring: 'ring-emerald-500',
    border: 'border-emerald-500/50',
    gradient: 'from-emerald-600 via-teal-600 to-emerald-400',
    badge: 'bg-emerald-500 text-slate-950',
    badgeInactive: 'bg-slate-800 text-emerald-400 border-slate-700',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-500/40',
    glow: 'shadow-emerald-500/20',
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  {
    name: 'indigo',
    color: '#4f46e5',
    ring: 'ring-indigo-500',
    border: 'border-indigo-500/50',
    gradient: 'from-indigo-600 via-blue-600 to-indigo-400',
    badge: 'bg-indigo-500 text-white',
    badgeInactive: 'bg-slate-800 text-indigo-400 border-slate-700',
    text: 'text-indigo-400',
    shadow: 'shadow-indigo-500/40',
    glow: 'shadow-indigo-500/20',
    accentBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
  },
  {
    name: 'amber',
    color: '#d97706',
    ring: 'ring-amber-500',
    border: 'border-amber-500/50',
    gradient: 'from-amber-600 via-yellow-500 to-amber-400',
    badge: 'bg-amber-500 text-slate-950',
    badgeInactive: 'bg-slate-800 text-amber-400 border-slate-700',
    text: 'text-amber-400',
    shadow: 'shadow-amber-500/40',
    glow: 'shadow-amber-500/20',
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  {
    name: 'rose',
    color: '#e11d48',
    ring: 'ring-rose-500',
    border: 'border-rose-500/50',
    gradient: 'from-rose-600 via-pink-600 to-rose-400',
    badge: 'bg-rose-500 text-white',
    badgeInactive: 'bg-slate-800 text-rose-400 border-slate-700',
    text: 'text-rose-400',
    shadow: 'shadow-rose-500/40',
    glow: 'shadow-rose-500/20',
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  },
  {
    name: 'purple',
    color: '#9333ea',
    ring: 'ring-purple-500',
    border: 'border-purple-500/50',
    gradient: 'from-purple-600 via-violet-600 to-purple-400',
    badge: 'bg-purple-500 text-white',
    badgeInactive: 'bg-slate-800 text-purple-400 border-slate-700',
    text: 'text-purple-400',
    shadow: 'shadow-purple-500/40',
    glow: 'shadow-purple-500/20',
    accentBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  },
  {
    name: 'cyan',
    color: '#0891b2',
    ring: 'ring-cyan-500',
    border: 'border-cyan-500/50',
    gradient: 'from-cyan-600 via-teal-500 to-cyan-400',
    badge: 'bg-cyan-500 text-slate-950',
    badgeInactive: 'bg-slate-800 text-cyan-400 border-slate-700',
    text: 'text-cyan-400',
    shadow: 'shadow-cyan-500/40',
    glow: 'shadow-cyan-500/20',
    accentBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
  },
  {
    name: 'orange',
    color: '#ea580c',
    ring: 'ring-orange-500',
    border: 'border-orange-500/50',
    gradient: 'from-orange-600 via-amber-500 to-orange-400',
    badge: 'bg-orange-500 text-white',
    badgeInactive: 'bg-slate-800 text-orange-400 border-slate-700',
    text: 'text-orange-400',
    shadow: 'shadow-orange-500/40',
    glow: 'shadow-orange-500/20',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
  },
  {
    name: 'blue',
    color: '#2563eb',
    ring: 'ring-blue-500',
    border: 'border-blue-500/50',
    gradient: 'from-blue-600 via-sky-500 to-blue-400',
    badge: 'bg-blue-500 text-white',
    badgeInactive: 'bg-slate-800 text-blue-400 border-slate-700',
    text: 'text-blue-400',
    shadow: 'shadow-blue-500/40',
    glow: 'shadow-blue-500/20',
    accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  },
  {
    name: 'fuchsia',
    color: '#c026d3',
    ring: 'ring-fuchsia-500',
    border: 'border-fuchsia-500/50',
    gradient: 'from-fuchsia-600 via-pink-500 to-fuchsia-400',
    badge: 'bg-fuchsia-500 text-white',
    badgeInactive: 'bg-slate-800 text-fuchsia-400 border-slate-700',
    text: 'text-fuchsia-400',
    shadow: 'shadow-fuchsia-500/40',
    glow: 'shadow-fuchsia-500/20',
    accentBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20'
  },
  {
    name: 'teal',
    color: '#0d9488',
    ring: 'ring-teal-500',
    border: 'border-teal-500/50',
    gradient: 'from-teal-600 via-emerald-500 to-teal-400',
    badge: 'bg-teal-500 text-slate-950',
    badgeInactive: 'bg-slate-800 text-teal-400 border-slate-700',
    text: 'text-teal-400',
    shadow: 'shadow-teal-500/40',
    glow: 'shadow-teal-500/20',
    accentBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
  }
];

function hashStringCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const getCirclePalette = (brother, index = 0, allBrothers = []) => {
  if (!brother) return CIRCLE_COLOR_PALETTES[0];
  const idx = allBrothers && allBrothers.length > 0 ? allBrothers.findIndex((b) => b.id === brother.id) : index;
  const safeIdx = idx >= 0 ? idx : Math.abs(hashStringCode(brother.id || brother.name || '0'));
  return CIRCLE_COLOR_PALETTES[safeIdx % CIRCLE_COLOR_PALETTES.length];
};

export const BrothersCards = ({
  onOpenTransferModal,
  onOpenFieldsModal,
  onOpenAddBrother,
  onOpenEditBrother,
  onOpenWhatsAppInvite,
  onOpenJoinQr,
  onOpenRequestMoney,
  onOpenChat
}) => {
  const {
    brothers,
    transfers,
    fundRequests,
    activeAdminId,
    currentUser,
    settings,
    canCurrentUserSend,
    updateBrotherFields,
    deleteBrother,
    startVoiceCall
  } = useFinance();
  const [copiedId, setCopiedId] = useState(null);
  const [copiedToast, setCopiedToast] = useState(null);
  const [sortBy, setSortBy] = useState('admin_first'); // 'admin_first', 'alphabetical', 'highest_spent', 'lowest_spent'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrotherId, setSelectedBrotherId] = useState(null);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [inspectedCommodity, setInspectedCommodity] = useState(null);
  const pressTimerRef = React.useRef(null);
  const currency = settings.currencySymbol;

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSend = canCurrentUserSend ? canCurrentUserSend() : isCurrentAdmin;

  // Set default selected brother to current logged in user, or active Admin
  React.useEffect(() => {
    if (!selectedBrotherId && brothers.length > 0) {
      const defaultId = currentUser?.id && brothers.some(b => b.id === currentUser.id)
        ? currentUser.id
        : (activeAdminId || brothers[0].id);
      setSelectedBrotherId(defaultId);
    }
  }, [brothers, currentUser, activeAdminId]);

  // Strict Transfer Matching for Brother (Prevents brother transfers from contaminating other circles)
  const isTransferStrictlyForBrother = (t, b) => {
    if (!t || !b) return false;
    // 1. Direct ID match
    if (t.recipientId && b.id && String(t.recipientId) === String(b.id)) {
      return true;
    }
    // 2. Exact Bank Account Number match
    const tBank = String(t.recipientAccountNumber || t.accountNumber || '').trim();
    const bBank = String(b.bankAccountNumber || b.accountNumber || '').trim();
    if (tBank && bBank && tBank === bBank) {
      return true;
    }
    // 3. Exact Normalized Name match (لا تطابق جزئي بالتقريب)
    const tNorm = normalizeArabicText(t.recipientName);
    const bNorm = normalizeArabicText(b.name);
    if (tNorm && bNorm && tNorm === bNorm) {
      return true;
    }
    return false;
  };

  const dynamicFieldSpent = (fieldId, fieldName) => {
    if (!selectedBrother) return 0;
    const normField = normalizeArabicText(fieldName);
    return transfers
      .filter((t) => {
        if (!isTransferStrictlyForBrother(t, selectedBrother)) return false;
        if (t.fieldId && fieldId && t.fieldId === fieldId) return true;
        if (normField && t.fieldName && normalizeArabicText(t.fieldName) === normField) return true;
        return false;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const copyAccountNumber = (brother) => {
    const acc = brother.bankAccountNumber || brother.accountNumber;
    navigator.clipboard.writeText(acc);
    setCopiedId(brother.id);
    setCopiedToast(`تم نسخ رقم البطاقة المصرفية لـ ${brother.name}: ${acc}`);
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
    setTimeout(() => {
      setCopiedId(null);
      setCopiedToast(null);
    }, 2500);
  };

  const handleTouchStart = (brother) => {
    pressTimerRef.current = setTimeout(() => {
      copyAccountNumber(brother);
    }, 550);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  // Filter & Sort Brothers dynamically
  const sortedBrothers = [...brothers]
    .filter((b) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        b.name?.toLowerCase().includes(q) ||
        b.accountNumber?.includes(q) ||
        b.phone?.includes(q) ||
        b.bankAccountNumber?.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'admin_first') {
        if (a.id === activeAdminId) return -1;
        if (b.id === activeAdminId) return 1;
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'highest_spent') {
        const aSpent = transfers
          .filter((t) => isTransferStrictlyForBrother(t, a))
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const bSpent = transfers
          .filter((t) => isTransferStrictlyForBrother(t, b))
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        return bSpent - aSpent;
      }
      if (sortBy === 'lowest_spent') {
        const aSpent = transfers
          .filter((t) => isTransferStrictlyForBrother(t, a))
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const bSpent = transfers
          .filter((t) => isTransferStrictlyForBrother(t, b))
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        return aSpent - bSpent;
      }
      return 0;
    });

  const selectedBrother = brothers.find((b) => b.id === selectedBrotherId) || brothers[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Toast Banner on Copy */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 animate-bounce border-2 border-white/40">
          <Check className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* 🔴 2-COLUMN LAYOUT: Vertical Circles Hub on the Right + Details on the Left 🔴 */}
      <div className="flex flex-col lg:flex-row gap-6 items-start pt-2" dir="rtl">

        {/* 1. RIGHT SIDEBAR: Vertical Circles Hub (شريط الدوائر العمودي على جهة اليمين) */}
        <div className="w-full lg:w-56 xl:w-64 shrink-0 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="text-center pb-2 border-b border-slate-800/80">
            <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دوائر المستخدمين والأدمن</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              ضغطة مطولة = نسخ الحساب 📋
            </span>
          </div>

          {/* Vertical Stack of Interactive Circles */}
          <div className="flex flex-row lg:flex-col items-center justify-start gap-4 sm:gap-5 overflow-x-auto lg:overflow-y-auto max-h-[620px] p-2 scrollbar-thin scrollbar-thumb-slate-700">
            {sortedBrothers.map((b, idx) => {
              const isSenderAdmin = b.id === activeAdminId;
              const isMe = b.id === currentUser?.id;
              const isSelected = b.id === selectedBrotherId;
              const isCopied = copiedId === b.id;
              const palette = getCirclePalette(b, idx, sortedBrothers);

              // Total spent for this brother (strictly isolated to transfers where this brother is the recipient)
              const brotherTransfers = transfers.filter((t) => isTransferStrictlyForBrother(t, b));
              const totalReceived = brotherTransfers.reduce((acc, t) => acc + (t.amount || 0), 0);

              return (
                <div
                  key={b.id}
                  className="flex flex-col items-center shrink-0 w-auto lg:w-full"
                >
                  <button
                    onClick={() => setSelectedBrotherId(b.id)}
                    onMouseDown={() => handleTouchStart(b)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                    onTouchStart={() => handleTouchStart(b)}
                    onTouchEnd={handleTouchEnd}
                    title={`اضغط لتحديد ${b.name} • اضغط مطولاً لنسخ رقم الحساب`}
                    className={`flex flex-col items-center group transition-all duration-200 outline-none select-none relative w-full ${
                      isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    {/* Outer Circular Ring with unique palette */}
                    <div
                      className={`relative p-1 rounded-full transition-all duration-300 ${
                        isCopied
                          ? 'ring-4 ring-emerald-400 scale-110 shadow-xl shadow-emerald-400/50'
                          : isSelected
                          ? `ring-4 ${palette.ring} ring-offset-4 ring-offset-slate-950 shadow-lg ${palette.shadow}`
                          : `ring-2 ring-slate-700/80 group-hover:${palette.ring}`
                      }`}
                    >
                      {/* The Inner Avatar Circle with Unique Gradient */}
                      <div
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-inner relative overflow-hidden bg-gradient-to-tr ${palette.gradient}`}
                      >
                        {isCopied ? (
                          <Check className="w-8 h-8 text-white animate-pulse" />
                        ) : (
                          <span className="drop-shadow-md">{b.name[0]}</span>
                        )}

                        {/* Gradient Overlay for luxury effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/20 pointer-events-none" />
                      </div>

                      {/* Admin Crown Badge */}
                      {isSenderAdmin && (
                        <div
                          title="الأدمن الرئيسي"
                          className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border-2 border-slate-950 font-black animate-bounce"
                        >
                          <Crown className="w-3.5 h-3.5 fill-slate-950" />
                        </div>
                      )}

                      {/* 'You' Badge */}
                      {isMe && !isSenderAdmin && (
                        <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full ${palette.badge} text-[9px] font-black shadow border border-slate-950`}>
                          أنت
                        </div>
                      )}
                    </div>

                    {/* Brother Name with Theme Color */}
                    <span
                      className={`mt-2 text-xs sm:text-sm font-black truncate max-w-[120px] text-center ${
                        isSelected ? palette.text : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {b.name}
                    </span>

                    {/* Total Spent Pill Badge with Individual Theme */}
                    <div
                      className={`mt-1 px-3 py-1 rounded-full text-[11px] font-black font-mono shadow-sm flex items-center gap-1 transition-all ${
                        isCopied
                          ? 'bg-emerald-400 text-slate-950 font-bold scale-105'
                          : isSelected
                          ? `${palette.badge} scale-105 shadow-md`
                          : `${palette.badgeInactive} group-hover:bg-slate-700`
                      }`}
                    >
                      <span>{isCopied ? 'تم نسخ الحساب!' : formatMoney(totalReceived, currency)}</span>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Join via Barcode / QR Code Circular Button (ظاهر على الكمبيوتر وجميع الهواتف) */}
            {onOpenJoinQr && (
              <div className="flex flex-col items-center shrink-0 w-auto lg:w-full">
                <button
                  type="button"
                  onClick={onOpenJoinQr}
                  title="عرض رمز QR لإضافة وانضمام مستخدم جديد عبر كاميرا الهاتف"
                  className="flex flex-col items-center group transition-all duration-200 outline-none select-none relative w-full opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
                >
                  {/* Outer Circular Ring */}
                  <div className="relative p-1 rounded-full ring-2 ring-amber-500/80 group-hover:ring-amber-400 group-hover:ring-offset-2 group-hover:ring-offset-slate-950 transition-all duration-300 shadow-lg shadow-amber-500/20">
                    {/* The Inner QR Avatar Circle */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-inner relative overflow-hidden">
                      <QrCode className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2] drop-shadow" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
                    </div>

                    {/* Camera Badge on top */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow-md border border-amber-400 text-[10px]">
                      📷
                    </div>
                  </div>

                  {/* Circle Name Label */}
                  <span className="mt-2 text-xs sm:text-sm font-black truncate max-w-[120px] text-center text-amber-300 group-hover:text-amber-200">
                    باركود إضافة
                  </span>

                  {/* Action Pill Badge */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <span>مسح QR ⚡</span>
                  </div>
                </button>
              </div>
            )}

            {/* Send Money Circular Button (دائرة إرسال وتحويل أموال في قائمة الدوائر) */}
            {canCurrentUserSend && canCurrentUserSend() && onOpenTransferModal && (
              <div className="flex flex-col items-center shrink-0 w-auto lg:w-full">
                <button
                  type="button"
                  onClick={() => onOpenTransferModal(selectedBrother)}
                  title="إرسال وتحويل أموال إلى المستخدم المحدد"
                  className="flex flex-col items-center group transition-all duration-200 outline-none select-none relative w-full opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
                >
                  {/* Outer Circular Ring */}
                  <div className="relative p-1 rounded-full ring-2 ring-emerald-500/80 group-hover:ring-emerald-400 group-hover:ring-offset-2 group-hover:ring-offset-slate-950 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                    {/* The Inner Circle */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 text-white shadow-inner relative overflow-hidden">
                      <Send className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2] -rotate-45 drop-shadow" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
                    </div>

                    {/* Money Badge on top */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950 text-emerald-300 flex items-center justify-center shadow-md border border-emerald-400 text-[10px]">
                      💸
                    </div>
                  </div>

                  {/* Circle Name Label */}
                  <span className="mt-2 text-xs sm:text-sm font-black truncate max-w-[120px] text-center text-emerald-300 group-hover:text-emerald-200">
                    إرسال أموال
                  </span>

                  {/* Action Pill Badge */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <span>تحويل مالي 💸</span>
                  </div>
                </button>
              </div>
            )}

            {/* Request Money Circular Button (دائرة طلب أموال من الصندوق - حصراً في قائمة الدوائر) */}
            {onOpenRequestMoney && (
              <div className="flex flex-col items-center shrink-0 w-auto lg:w-full">
                <button
                  type="button"
                  onClick={() => onOpenRequestMoney(selectedBrother || currentUser)}
                  title="تقديم طلب أموال ومصروف من الصندوق"
                  className="flex flex-col items-center group transition-all duration-200 outline-none select-none relative w-full opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
                >
                  {/* Outer Circular Ring */}
                  <div className="relative p-1 rounded-full ring-2 ring-teal-500/80 group-hover:ring-teal-400 group-hover:ring-offset-2 group-hover:ring-offset-slate-950 transition-all duration-300 shadow-lg shadow-teal-500/20">
                    {/* The Inner Circle */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-400 text-white shadow-inner relative overflow-hidden">
                      <Inbox className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2] drop-shadow" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
                    </div>

                    {/* Money Icon Badge on top */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-950 text-teal-300 flex items-center justify-center shadow-md border border-teal-400 text-[10px]">
                      💰
                    </div>
                  </div>

                  {/* Circle Name Label */}
                  <span className="mt-2 text-xs sm:text-sm font-black truncate max-w-[120px] text-center text-teal-300 group-hover:text-teal-200">
                    طلب أموال
                  </span>

                  {/* Action Pill Badge */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/40 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                    <span>طلب سلفة 📥</span>
                  </div>
                </button>
              </div>
            )}

            {/* Manual Add User Button (متاح للجميع: يرسل طلب اعتماد للأدمن إذا كان مستخدماً عادياً) */}
            {onOpenAddBrother && (
              <button
                type="button"
                onClick={onOpenAddBrother}
                className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-2xl text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95 mt-1 shadow-sm shrink-0"
                title={isCurrentAdmin ? "إضافة مستخدم جديد مباشرة إلى الدوائر" : "إرسال طلب إضافة مستخدم جديد إلى الأدمن"}
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isCurrentAdmin ? "إضافة يدوية ✍️" : "طلب إضافة مستخدم ✍️"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. LEFT AREA: The Expanded Details Card for Selected Brother */}
        <div className="flex-1 w-full min-w-0">
          {selectedBrother && (() => {
            const selectedPalette = getCirclePalette(selectedBrother, 0, sortedBrothers);
            return (
              <div className={`p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-800 border-2 ${selectedPalette.border} shadow-2xl space-y-6 animate-fadeIn`}>
                
                {/* Selected Brother Clean Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shrink-0 ring-4 ${selectedPalette.ring}/30 bg-gradient-to-tr ${selectedPalette.gradient}`}
                    >
                      <span className="drop-shadow">{selectedBrother.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xl text-slate-800 dark:text-white">
                          {selectedBrother.name}
                        </h4>
                        {selectedBrother.id === activeAdminId && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            الأدمن الرئيسي
                          </span>
                        )}
                        {selectedBrother.id === currentUser?.id && (
                          <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${selectedPalette.accentBg} border`}>
                            حسابك الحالي
                          </span>
                        )}
                      </div>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-400 font-bold">
                      {selectedBrother.phone && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>هاتف: {selectedBrother.phone}</span>
                          <a
                            href={`https://wa.me/${String(selectedBrother.phone).replace(/[\s\-\+]/g, '').replace(/^0/, '964')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600 hover:text-white transition text-[11px] font-black flex items-center gap-1 active:scale-95"
                            title="محادثة أو اتصال واتساب"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>واتساب 💬</span>
                          </a>
                        </div>
                      )}
                      <span>• {selectedBrother.bankName || 'ماستر كي / Qi Card'}</span>
                      <span>• رقم البطاقة: <strong className="font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">{selectedBrother.bankAccountNumber}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Edit & Sliders Icons */}
                {isCurrentAdmin && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onOpenEditBrother(selectedBrother)}
                      title="تعديل بيانات الأخ"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل البيانات</span>
                    </button>
                  </div>
                )}
              </div>

          {/* Approved Commodities & Exact Prices Display */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>السلع والمصروفات الخاصة بـ ({selectedBrother.name}):</span>
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {selectedBrother.approvedFields?.map((f, index) => {
                const calculatedSpent = dynamicFieldSpent(f.id, f.name);
                const pending = fundRequests?.find((r) =>
                  r.status === 'pending' &&
                  (r.brotherId === selectedBrother.id || r.brotherName === selectedBrother.name) &&
                  (r.fieldId === f.id || (r.fieldName && f.name && (r.fieldName.includes(f.name) || f.name.includes(r.fieldName))))
                );
                const priceAmount = Math.max(f.spent || 0, calculatedSpent, pending?.amount || f.limit || 0);
                const isPending = calculatedSpent === 0 && (f.spent || 0) === 0 && Boolean(pending);

                // Calculate EXACT count: (Completed transfers) + (Active pending requests)
                const normF = normalizeArabicText(f.name);
                const timesTransferred = transfers.filter((t) => {
                  if (!isTransferStrictlyForBrother(t, selectedBrother)) return false;
                  if (t.fieldId && t.fieldId === f.id) return true;
                  const normT = normalizeArabicText(t.fieldName || t.reason);
                  return normT && normF && (normT === normF || normT.includes(normF) || normF.includes(normT));
                }).length;

                const timesPending = (fundRequests || []).filter((r) => {
                  if (r.status !== 'pending') return false;
                  const isForThisBrother = r.brotherId === selectedBrother.id ||
                    (selectedBrother.bankAccountNumber && r.bankAccountNumber === selectedBrother.bankAccountNumber) ||
                    (selectedBrother.accountNumber && r.brotherAccountNumber === selectedBrother.accountNumber);
                  if (!isForThisBrother) return false;
                  if (r.fieldId && r.fieldId === f.id) return true;
                  const normR = normalizeArabicText(r.fieldName || r.commodityName || r.reason);
                  return normR && normF && (normR === normF || normR.includes(normF) || normR.includes(normR));
                }).length;

                const totalEvents = timesTransferred + timesPending;
                const effectiveCount = totalEvents > 0 ? totalEvents : 1;

                return (
                  <div
                    key={f.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between relative group/field hover:border-emerald-400 transition shadow-xs"
                  >
                    {/* Commodity Name & Index (Clickable to view order history) */}
                    <div
                      onClick={() => setInspectedCommodity({
                        field: f,
                        brother: selectedBrother,
                        effectiveCount,
                        priceAmount
                      })}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 select-none"
                      title="اضغط هنا لعرض تفاصيل وسجل مرات طلب هذه السلعة 📋"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20 group-hover/field:scale-110 transition">
                        🛒
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-slate-800 dark:text-white text-xs sm:text-sm truncate block group-hover/field:text-emerald-500 transition underline-offset-4 group-hover/field:underline">
                          {f.name}
                        </span>
                        {isPending ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                            ⏳ بانتظار موافقة الأدمن والتحويل
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold block group-hover/field:text-emerald-500/80 transition">
                            اضغط لعرض سجل الطلبات 📋
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Circular Quantity Counter in front of commodity */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Circular Count Badge (رقم العدد في دائرة أمام السعر) */}
                      <div
                        title={`عدد مرات طلب السلعة: ${effectiveCount}`}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-2 border-teal-400 dark:border-teal-600 flex items-center justify-center font-mono font-black text-xs sm:text-sm shadow-sm shrink-0"
                      >
                        {effectiveCount}
                      </div>

                      <span className={`text-xs sm:text-sm font-black font-mono px-3 py-1.5 rounded-xl shadow-xs border ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {formatMoney(priceAmount, currency)}
                      </span>

                      {/* Admin Delete Commodity */}
                      {isCurrentAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف سلعة [${f.name}]؟`)) {
                              const updated = (selectedBrother.approvedFields || []).filter((item) => item.id !== f.id);
                              updateBrotherFields(selectedBrother.id, updated);
                            }
                          }}
                          title="حذف هذه السلعة"
                          className="opacity-0 group-hover/field:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!selectedBrother.approvedFields || selectedBrother.approvedFields.length === 0) && (
                <div className="text-center py-7 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-lg block">🛍️</span>
                  <span className="font-bold text-slate-300">لا توجد سلع مسجلة لهذا المستخدم حالياً.</span>
                  <span className="text-[11px] text-slate-500 block">عند قيامك بتحويل مبلغ وكتابة اسم السلعة (أو طلب المستخدم لمبلغ وسلعة)، ستظهر السلعة وسعرها هنا فوراً!</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Direct Chat + Edit Commodities */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            {/* Direct Chat Button */}
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(selectedBrother.id)}
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition active:scale-98"
                title="فتح المحادثة والاتصال الصوتي وواتساب لهذا المستخدم"
              >
                <MessageSquare className="w-4 h-4" />
                <span>محادثة وتواصل مع العائلة 💬</span>
              </button>
            )}

            {isCurrentAdmin && (
              <button
                onClick={() => onOpenFieldsModal(selectedBrother)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>تعديل السلع ⚙️</span>
              </button>
            )}
          </div>

        </div>
      ); })()}

      </div>

      {/* Edit Transfer / Spent Amount Modal */}
      <EditTransferModal
        isOpen={Boolean(editingTransfer)}
        onClose={() => setEditingTransfer(null)}
        transfer={editingTransfer}
      />

      {/* Commodity Orders History Modal (سجل مرات طلب السلعة) */}
      {inspectedCommodity && (() => {
        const f = inspectedCommodity.field;
        const b = inspectedCommodity.brother;
        const normF = normalizeArabicText(f.name);

        // 1. Completed Transfers for this commodity
        const itemTransfers = (transfers || []).filter((t) => {
          if (!isTransferStrictlyForBrother(t, b)) return false;
          if (t.fieldId && t.fieldId === f.id) return true;
          const normT = normalizeArabicText(t.fieldName || t.reason);
          return normT && normF && (normT === normF || normT.includes(normF) || normF.includes(normT));
        }).map((t) => ({
          id: t.id,
          type: 'transfer',
          amount: t.amount,
          reason: t.reason,
          timestamp: t.timestamp || t.date,
          date: t.date || t.timestamp,
          senderName: t.senderName || 'الأدمن الرئيسي',
          cardName: t.sendingCardName || 'بطاقة الصندوق'
        }));

        // 2. Pending requests for this commodity
        const itemRequests = (fundRequests || []).filter((r) => {
          if (r.status !== 'pending') return false;
          const isForThisBrother = r.brotherId === b.id ||
            (b.bankAccountNumber && r.bankAccountNumber === b.bankAccountNumber) ||
            (b.accountNumber && r.brotherAccountNumber === b.accountNumber);
          if (!isForThisBrother) return false;
          if (r.fieldId && r.fieldId === f.id) return true;
          const normR = normalizeArabicText(r.fieldName || r.commodityName || r.reason);
          return normR && normF && (normR === normF || normR.includes(normF) || normF.includes(normR));
        }).map((r) => ({
          id: r.id,
          type: 'pending_request',
          amount: r.amount,
          reason: r.reason,
          timestamp: r.createdAt,
          date: r.createdAt
        }));

        const allRecords = [...itemRequests, ...itemTransfers];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/40 space-y-5 max-h-[90vh] flex flex-col animate-scaleUp">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shadow-xs">
                    🛒
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                        {f.name}
                      </h3>
                      <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-mono font-black text-xs flex items-center justify-center border border-teal-500/30">
                        {inspectedCommodity.effectiveCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold">
                      سجل مرات الطلب الخاصة بالأخ: <strong className="text-slate-700 dark:text-slate-200">{b.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedCommodity(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick KPI Summary Box */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي عدد مرات الطلب:</span>
                  <span className="text-base sm:text-lg font-black font-mono text-teal-600 dark:text-teal-400">
                    {inspectedCommodity.effectiveCount} مرات
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي المبلغ المحول:</span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(inspectedCommodity.priceAmount, currency)}
                  </span>
                </div>
              </div>

              {/* Records List (مرات طلب السلعة) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
                {allRecords.length > 0 ? (
                  allRecords.map((rec, rIdx) => {
                    const isTransfer = rec.type === 'transfer';
                    return (
                      <div
                        key={rec.id || rIdx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] font-mono flex items-center justify-center border border-emerald-500/20">
                              {allRecords.length - rIdx}
                            </span>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                              isTransfer
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            }`}>
                              {isTransfer ? 'تم التحويل والصرف ✅' : 'طلب معلق بانتظار الموافقة ⏳'}
                            </span>
                          </div>

                          <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {formatMoney(rec.amount, currency)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 leading-relaxed font-medium">
                          <strong className="text-slate-400 block text-[10px] font-bold mb-0.5">سبب الطلب / الحاجة:</strong>
                          {rec.reason || 'شراء سلعة من الصندوق'}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                          <span>{rec.timestamp ? formatArabicDate(rec.timestamp) : ''}</span>
                          {isTransfer && rec.cardName && (
                            <span>بواسطة: {rec.cardName}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <span className="text-xl block">📦</span>
                    <p className="font-bold text-slate-300">هذه السلعة مسجلة بجدول السلع بمبلغ إجمالي.</p>
                    <p className="text-[11px] text-slate-500">عند إجراء أي طلب أو تحويل جديد لنفس السلعة ستظهر تفاصيل كل مرة هنا فوراً!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectedCommodity(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  إغلاق النافذة
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>

  </div>
);
};
