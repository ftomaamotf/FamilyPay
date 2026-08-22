import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
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
  Inbox,
  Trash2
} from 'lucide-react';

export const BrothersCards = ({
  onOpenTransferModal,
  onOpenFieldsModal,
  onOpenAddBrother,
  onOpenEditBrother,
  onOpenWhatsAppInvite,
  onOpenRequestMoney
}) => {
  const {
    brothers,
    transfers,
    activeAdminId,
    currentUser,
    settings,
    canCurrentUserSend,
    updateBrotherFields
  } = useFinance();
  const [copiedId, setCopiedId] = useState(null);
  const [copiedToast, setCopiedToast] = useState(null);
  const [sortBy, setSortBy] = useState('admin_first'); // 'admin_first', 'alphabetical', 'highest_spent', 'lowest_spent'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrotherId, setSelectedBrotherId] = useState(null);
  const pressTimerRef = React.useRef(null);
  const currency = settings.currencySymbol;

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSend = canCurrentUserSend ? canCurrentUserSend() : isCurrentAdmin;

  // Set default selected brother to active Admin or first brother
  React.useEffect(() => {
    if (!selectedBrotherId && brothers.length > 0) {
      setSelectedBrotherId(activeAdminId || brothers[0].id);
    }
  }, [brothers, activeAdminId]);

  const copyAccountNumber = (brother) => {
    const acc = brother.bankAccountNumber || brother.accountNumber;
    navigator.clipboard.writeText(acc);
    setCopiedId(brother.id);
    setCopiedToast(`تم نسخ رقم حساب ${brother.name}: ${acc}`);
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
          .filter((t) => t.recipientId === a.id)
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const bSpent = transfers
          .filter((t) => t.recipientId === b.id)
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        return bSpent - aSpent;
      }
      if (sortBy === 'lowest_spent') {
        const aSpent = transfers
          .filter((t) => t.recipientId === a.id)
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const bSpent = transfers
          .filter((t) => t.recipientId === b.id)
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

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>دوائر الإخوة والأدمن والمصروفات</span>
          </h3>
          <p className="text-xs text-slate-400">
            اضغط على الدائرة لعرض السلع • اضغط مطولاً لنسخ رقم الحساب المصرفي
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Admin Invite via WhatsApp Button */}
          {isCurrentAdmin && onOpenWhatsAppInvite && (
            <button
              onClick={onOpenWhatsAppInvite}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>دعوة أخ عبر واتساب 📲</span>
            </button>
          )}

          {/* Admin Add New Brother Button */}
          {isCurrentAdmin && (
            <button
              onClick={onOpenAddBrother}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة حساب / أخ جديد</span>
            </button>
          )}

          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
            إجمالي الحسابات: {brothers.length}
          </span>
        </div>
      </div>

      {/* Sorting & Search Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        
        {/* Sorting Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-extrabold text-slate-400 ml-1 hidden sm:inline-block">
            ترتيب الدوائر:
          </span>

          <button
            onClick={() => setSortBy('admin_first')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'admin_first'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>الأدمن أولاً 👑</span>
          </button>

          <button
            onClick={() => setSortBy('alphabetical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'alphabetical'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>أبجدياً (أ - ي) 🔤</span>
          </button>

          <button
            onClick={() => setSortBy('highest_spent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'highest_spent'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>الأكثر استلاماً 💰</span>
          </button>

          <button
            onClick={() => setSortBy('lowest_spent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'lowest_spent'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>الأقل استلاماً 📉</span>
          </button>
        </div>

        {/* Live Search Box */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو رقم الحساب..."
            className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 transition text-right"
          />
        </div>

      </div>

      {/* 🔴 2-COLUMN LAYOUT: Vertical Circles Hub on the Right + Details on the Left 🔴 */}
      <div className="flex flex-col lg:flex-row gap-6 items-start" dir="rtl">

        {/* 1. RIGHT SIDEBAR: Vertical Circles Hub (شريط الدوائر العمودي على جهة اليمين) */}
        <div className="w-full lg:w-56 xl:w-64 shrink-0 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="text-center pb-2 border-b border-slate-800/80">
            <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دوائر الإخوة والأدمن</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              ضغطة مطولة = نسخ الحساب 📋
            </span>
          </div>

          {/* Vertical Stack of Interactive Circles */}
          <div className="flex flex-row lg:flex-col items-center justify-start gap-4 sm:gap-5 overflow-x-auto lg:overflow-y-auto max-h-[620px] p-2 scrollbar-thin scrollbar-thumb-slate-700">
            {sortedBrothers.map((b) => {
              const isSenderAdmin = b.id === activeAdminId;
              const isMe = b.id === currentUser?.id;
              const isSelected = b.id === selectedBrotherId;
              const isCopied = copiedId === b.id;

              // Total spent for this brother
              const brotherTransfers = transfers.filter((t) => t.recipientId === b.id);
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
                    {/* Outer Circular Ring */}
                    <div
                      className={`relative p-1 rounded-full transition-all duration-300 ${
                        isCopied
                          ? 'ring-4 ring-emerald-400 scale-110 shadow-xl shadow-emerald-400/50'
                          : isSelected
                          ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-950 shadow-lg shadow-emerald-500/30'
                          : 'ring-2 ring-slate-700 group-hover:ring-slate-500'
                      }`}
                    >
                      {/* The Inner Avatar Circle */}
                      <div
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-inner relative overflow-hidden"
                        style={{ backgroundColor: b.avatarColor || '#10b981' }}
                      >
                        {isCopied ? (
                          <Check className="w-8 h-8 text-white animate-pulse" />
                        ) : (
                          <span>{b.name[0]}</span>
                        )}

                        {/* Gradient Overlay for luxury effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />
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
                        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black shadow border border-slate-950">
                          أنت
                        </div>
                      )}
                    </div>

                    {/* Brother Name */}
                    <span
                      className={`mt-2 text-xs sm:text-sm font-black truncate max-w-[120px] text-center ${
                        isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {b.name}
                    </span>

                    {/* Total Spent Pill Badge */}
                    <div
                      className={`mt-1 px-3 py-1 rounded-full text-[11px] font-black font-mono shadow-sm flex items-center gap-1 transition-all ${
                        isCopied
                          ? 'bg-emerald-400 text-slate-950 font-bold scale-105'
                          : isSelected
                          ? 'bg-emerald-500 text-slate-950 scale-105'
                          : 'bg-slate-800 text-emerald-400 border border-slate-700 group-hover:bg-slate-700'
                      }`}
                    >
                      <span>{isCopied ? 'تم نسخ الحساب!' : formatMoney(totalReceived, currency)}</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. LEFT AREA: The Expanded Details Card for Selected Brother */}
        <div className="flex-1 w-full min-w-0">
          {selectedBrother && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-2xl space-y-6 animate-fadeIn">
              
              {/* Selected Brother Clean Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shrink-0 ring-4 ring-emerald-500/20"
                    style={{ backgroundColor: selectedBrother.avatarColor || '#10b981' }}
                  >
                    {selectedBrother.name[0]}
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
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          حسابك الحالي
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-bold">
                      {selectedBrother.phone && (
                        <span>هاتف: {selectedBrother.phone}</span>
                      )}
                      <span>• {selectedBrother.bankName || 'ماستر كي / Qi Card'}</span>
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
                    <button
                      onClick={() => onOpenFieldsModal(selectedBrother)}
                      title="تعديل السلع والحقول المعتمدة"
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>تعديل السلع</span>
                    </button>
                  </div>
                )}
              </div>

          {/* Approved Commodities & Fields with Spent Progress Bars & 1-Click Delete */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>السلع والحقول المعتمدة لهذا الأخ ({selectedBrother.approvedFields?.length || 0}):</span>
              </span>
              {isCurrentAdmin && (
                <button
                  onClick={() => onOpenFieldsModal(selectedBrother)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>إدارة وسقوف السلع</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedBrother.approvedFields?.map((f) => {
                const limit = f.limit || 0;
                const spent = f.spent || 0;
                const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

                return (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 relative group/field"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-white">
                          {f.name}
                        </span>
                        {isCurrentAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف سلعة [${f.name}] بالكامل للأخ ${selectedBrother.name}؟`)) {
                                const updated = (selectedBrother.approvedFields || []).filter((item) => item.id !== f.id);
                                updateBrotherFields(selectedBrother.id, updated);
                              }
                            }}
                            title="حذف هذه السلعة"
                            className="opacity-0 group-hover/field:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                          المرسل: {formatMoney(spent, currency)}
                        </span>
                        <span className="text-slate-400 font-normal"> / {formatMoney(limit, currency)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 100
                            ? 'bg-rose-500'
                            : percent >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {(!selectedBrother.approvedFields || selectedBrother.approvedFields.length === 0) && (
                <div className="col-span-2 text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  لا توجد سلع مخصصة لهذا الأخ حالياً. اضغط على «إدارة وسقوف السلع» لإضافة سلع جديدة.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Send Transfer (Admin Only) or Request Money (Regular Users) */}
          <div className="pt-2 flex items-center gap-3">
            {isCurrentAdmin ? (
              <button
                onClick={() => onOpenTransferModal(selectedBrother)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Send className="w-4 h-4 -rotate-45" />
                <span>إرسال تحويل مالي لهذا الأخ 💸</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenRequestMoney && onOpenRequestMoney()}
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Inbox className="w-4 h-4" />
                <span>طلب أموال من الصندوق 📥</span>
              </button>
            )}

            {isCurrentAdmin && (
              <button
                onClick={() => onOpenFieldsModal(selectedBrother)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-extrabold text-sm rounded-2xl transition flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>تعديل السلع وسجل الطلبات ⚙️</span>
              </button>
            )}
          </div>

        </div>
      )}

      </div>

    </div>

  </div>
);
};
