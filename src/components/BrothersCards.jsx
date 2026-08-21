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
  const [sortBy, setSortBy] = useState('admin_first'); // 'admin_first', 'alphabetical', 'highest_spent', 'lowest_spent'
  const [searchTerm, setSearchTerm] = useState('');
  const currency = settings.currencySymbol;

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSend = canCurrentUserSend ? canCurrentUserSend() : isCurrentAdmin;

  const handleCopy = (brotherId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(brotherId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate monthly total for each brother
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>الصندوق والحسابات المشتركة</span>
          </h3>
          <p className="text-xs text-slate-400">
            أرقام الحسابات المصرفية، الحقول المعتمدة بإذن الأدمن، والمبالغ المستلمة
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
            ترتيب القائمة:
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

      {/* Grid of Brothers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedBrothers.map((b) => {
          const isSenderAdmin = b.id === activeAdminId;
          const isMe = b.id === currentUser?.id;

          // Compute total received this month
          const brotherTransfers = transfers.filter((t) => {
            const d = new Date(t.date || t.timestamp);
            return t.recipientId === b.id && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
          });
          const totalReceivedMonth = brotherTransfers.reduce((acc, t) => acc + (t.amount || 0), 0);

          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition-all duration-200 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                isMe
                  ? 'border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div>
                {/* Brother Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md shrink-0"
                      style={{ backgroundColor: b.avatarColor || '#10b981' }}
                    >
                      {b.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-base text-slate-800 dark:text-white">
                          {b.name}
                        </h4>
                        {isMe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            أنت
                          </span>
                        )}
                        {isSenderAdmin && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                            <Crown className="w-3 h-3 text-amber-500" />
                            الأدمن
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block truncate max-w-[170px]">
                        حساب رقم: #{b.accountNumber}
                      </span>
                    </div>
                  </div>

                  {isCurrentAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditBrother(b)}
                        title="تعديل بيانات الحساب"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenFieldsModal(b)}
                        title="تعديل الحقول المعتمدة لهذا الأخ"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl transition"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bank Account Number Box with 1-Click Copy */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                      <span>رقم الحساب المصرفي (للتحويل المالي):</span>
                      <span className="text-slate-500">{b.bankName}</span>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 font-mono text-xs">
                      <strong className="text-slate-800 dark:text-white truncate">
                        {b.bankAccountNumber || b.accountNumber}
                      </strong>
                      <button
                        onClick={() => handleCopy(b.id, b.bankAccountNumber || b.accountNumber)}
                        title="نسخ رقم الحساب"
                        className="p-1 text-slate-400 hover:text-emerald-600 transition shrink-0 mr-2"
                      >
                        {copiedId === b.id ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <Check className="w-3.5 h-3.5" /> تم
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Registered Phone */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-500">
                    <span>الهاتف لاستعادة الرمز:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono" dir="ltr">
                      {b.phone || 'غير مسجل'}
                    </strong>
                  </div>
                </div>

                {/* Monthly Total Received Counter */}
                <div className="mt-3 flex items-center justify-between text-xs font-bold px-1">
                  <span className="text-slate-500">إجمالي ما استلمه هذا الشهر:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {formatMoney(totalReceivedMonth, currency)}
                  </span>
                </div>

                {/* Approved Fields & Sent Amounts per Commodity */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                      السلع والحقول المعتمدة بإذن الأدمن:
                    </span>
                    {isCurrentAdmin ? (
                      <button
                        type="button"
                        onClick={() => onOpenFieldsModal && onOpenFieldsModal(b)}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 transition active:scale-95 border border-emerald-300/40"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>تعديل / حذف السلع ⚙️</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({b.approvedFields?.length || 0} بنود)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {b.approvedFields?.map((f) => {
                      const spent = f.spent || 0;
                      const limit = f.limit || 0;
                      const remaining = Math.max(0, limit - spent);
                      const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

                      return (
                        <div
                          key={f.id}
                          className="p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-750 border border-slate-200/80 dark:border-slate-700/70 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            {/* Commodity Name */}
                            <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>{f.name}</span>
                            </span>

                            {/* Sent / Transferred Amount & Admin Quick Actions */}
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">المرسل:</span>
                                <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                                  {formatMoney(spent, currency)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  / {formatMoney(limit, currency)}
                                </span>
                              </div>

                              {isCurrentAdmin && (
                                <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-slate-200 dark:border-slate-700">
                                  <button
                                    type="button"
                                    title="تعديل هذه السلعة"
                                    onClick={() => onOpenFieldsModal && onOpenFieldsModal(b)}
                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    title="حذف هذه السلعة"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`هل تريد بالتأكيد حذف سلعة (${f.name}) للأخ ${b.name}؟`)) {
                                        const updated = (b.approvedFields || []).filter((x) => x.id !== f.id);
                                        await updateBrotherFields(b.id, updated);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar & Remaining */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0">
                              المتبقي: <strong className="text-slate-600 dark:text-slate-300 font-mono">{formatMoney(remaining, currency)}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {(!b.approvedFields || b.approvedFields.length === 0) && (
                      <span className="text-[10px] text-slate-400 italic block text-center py-1">لا توجد سلع أو حقول محددة</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action: Transfer (for Admin) OR Request Money (for Brother on his own card) */}
              {canSend ? (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => onOpenTransferModal(b.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 -rotate-45" />
                    <span>تحويل مالي إلى {b.name}</span>
                  </button>
                </div>
              ) : isMe ? (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => onOpenRequestMoney && onOpenRequestMoney()}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white font-extrabold text-xs shadow-sm shadow-teal-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>طلب أموال من الصندوق 📥</span>
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

    </div>
  );
};
