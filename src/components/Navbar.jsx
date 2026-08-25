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
  Inbox,
  MessageSquare,
  Bell
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
    messages = [],
    isPushSubscribed,
    subscribePushNotifications
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
            
            {/* Background Call Notifications Activator */}
            <button
              onClick={async () => {
                const res = await subscribePushNotifications();
                if (res && res.message) {
                  alert(res.message);
                }
              }}
              title="تفعيل رنين وإشعارات المكالمات عند غلق التطبيق في الأندرويد والآيفون"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition active:scale-95 border ${
                isPushSubscribed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isPushSubscribed ? 'رنين المكالمات مفعل 🔔' : 'تفعيل رنين المكالمات 📳'}
              </span>
            </button>

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
                  {currentUser.name ? currentUser.name[0] : 'ع'}
                </span>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">
                    {currentUser.name || 'مستخدم'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isCurrentAdmin ? '👑 الأدمن' : 'أخ'}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل تريد تسجيل الخروج والعودة للشاشة الترحيبية؟')) {
                    if (onLogout) onLogout();
                  }
                }}
                title="تسجيل الخروج والعودة لشاشة الترحيب والتسجيل 🚪"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition active:scale-95 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج 🚪</span>
              </button>
            )}

            {isCurrentAdmin && (
              <>
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
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
