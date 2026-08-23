import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { getMonthName } from '../utils/formatters';
import {
  Wallet,
  Send,
  UserCheck,
  Moon,
  Sun,
  ShieldCheck,
  Settings,
  QrCode,
  Users,
  Calendar,
  LogOut,
  Sparkles,
  Crown,
  Share2,
  Inbox
} from 'lucide-react';

export const Navbar = ({
  onOpenTransferModal,
  onOpenAdminModal,
  onOpenSettings,
  onOpenQrModal,
  onOpenGuestApprovals,
  onOpenRequestMoney,
  onOpenPendingRequests,
  onOpenChat,
  onLogout
}) => {
  const {
    currentUser,
    activeAdminId,
    settings,
    updateSettings,
    unreadNotifsCount,
    canCurrentUserSend,
    fundRequests,
    guestRequests,
    messages = []
  } = useFinance();

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSend = canCurrentUserSend ? canCurrentUserSend() : isCurrentAdmin;
  const pendingRequestsCount = (fundRequests || []).filter((r) => r.status === 'pending').length;
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-slate-800 dark:text-white tracking-tight">
                  الصندوق والحسابات المشتركة
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                  النظام المالي المباشر
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                مزامنة حية وبطاقات مصرفية
              </p>
            </div>
          </div>

          {/* Month & Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            <select
              value={settings.selectedMonth}
              onChange={(e) => updateSettings({ selectedMonth: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer py-1"
            >
              {months.map((m) => (
                <option key={m} value={m} className="dark:bg-slate-800">
                  {getMonthName(m - 1)}
                </option>
              ))}
            </select>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <select
              value={settings.selectedYear}
              onChange={(e) => updateSettings({ selectedYear: Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer py-1"
            >
              {years.map((y) => (
                <option key={y} value={y} className="dark:bg-slate-800">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Realtime Chat Button */}
            {onOpenChat && (
              <button
                onClick={() => onOpenChat('all')}
                title="المحادثة والرسائل الصوتية بين الدوائر"
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">المحادثة والبصمات 🎙️</span>
              </button>
            )}

            {/* Logged in Brother Card Chip */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 pr-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black"
                  style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
                >
                  {currentUser.name[0]}
                </span>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isCurrentAdmin ? '👑 الأدمن' : 'أخ'}
                  </span>
                </div>
              </div>
            )}

            {/* If user is Admin: Show Transfer Button & Pending Requests */}
            {isCurrentAdmin ? (
              <>
                <button
                  onClick={() => onOpenTransferModal()}
                  className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 -rotate-45" />
                  <span>تحويل مالي</span>
                </button>

                {/* Guest Approvals Badge Button for Admin */}
                {onOpenGuestApprovals && (
                  <button
                    onClick={onOpenGuestApprovals}
                    title="طلبات انضمام الضيوف (الموافقة بكلمة المرور)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition active:scale-95 ${
                      guestRequests && guestRequests.length > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300 animate-bounce'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>انضمام الضيوف {guestRequests && guestRequests.length > 0 ? `(${guestRequests.length})` : ''}</span>
                  </button>
                )}

                {/* Pending Money Requests Badge Button for Admin */}
                {pendingRequestsCount > 0 && onOpenPendingRequests && (
                  <button
                    onClick={onOpenPendingRequests}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow transition active:scale-95 animate-pulse"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>طلبات معلقة ({pendingRequestsCount})</span>
                  </button>
                )}
              </>
            ) : (
              /* If Regular Brother: Show Request Money Button ONLY (NO Transfer button) */
              <button
                onClick={() => onOpenRequestMoney && onOpenRequestMoney()}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 transition active:scale-95"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>طلب أموال 📥</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
