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
    subscribePushNotifications,
    sendTestPush
  } = useFinance();

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSend = canCurrentUserSend ? canCurrentUserSend() : isCurrentAdmin;
  const pendingRequestsCount = (fundRequests || []).filter((r) => r.status === 'pending').length;
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs pt-[max(6px,env(safe-area-inset-top,0px))]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[3.75rem] h-14 sm:h-16 gap-1 sm:gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-lg text-slate-800 dark:text-white tracking-tight">
                  <span className="inline sm:hidden">الصندوق</span>
                  <span className="hidden sm:inline">الصندوق والحسابات المشتركة</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden md:inline-block">
                  مباشر
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">
                مزامنة حية وبطاقات مصرفية
              </p>
            </div>
          </div>

          {/* Month & Year Selector - Always prominently visible in center */}
          <div className="flex items-center gap-1 bg-emerald-50/80 dark:bg-slate-800 px-2 py-1 rounded-xl border border-emerald-200/60 dark:border-slate-700 shrink-0 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={settings.selectedMonth}
              onChange={(e) => updateSettings({ selectedMonth: Number(e.target.value) })}
              className="bg-transparent text-[11px] sm:text-xs font-black text-emerald-900 dark:text-emerald-200 outline-none cursor-pointer py-0.5"
            >
              {months.map((m) => (
                <option key={m} value={m} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                  {getMonthName(m - 1)}
                </option>
              ))}
            </select>
            <span className="text-emerald-400 dark:text-slate-500 text-xs">|</span>
            <select
              value={settings.selectedYear}
              onChange={(e) => updateSettings({ selectedYear: Number(e.target.value) })}
              className="bg-transparent text-[11px] sm:text-xs font-black text-emerald-900 dark:text-emerald-200 outline-none cursor-pointer py-0.5"
            >
              {years.map((y) => (
                <option key={y} value={y} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Background Notifications Activator & Tester */}
            <button
              onClick={async () => {
                if (!isPushSubscribed) {
                  const res = await subscribePushNotifications(currentUser?.id);
                  if (res && res.message) {
                    alert(res.message);
                  }
                } else {
                  const res = await sendTestPush();
                  alert(res?.message || 'تم إرسال إشعار تجريبي فوري لهاتفك مع هزاز 📳');
                }
              }}
              title={
                isPushSubscribed
                  ? 'إشعارات الهاتف عند إغلاق التطبيق مفعلة بنجاح 🔔 (اضغط لتجربة إرسال إشعار فوري لهاتفك)'
                  : 'اضغط هنا لتفعيل إشعارات الهاتف عند إغلاق التطبيق في الأندرويد والآيفون'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition active:scale-95 border cursor-pointer ${
                isPushSubscribed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isPushSubscribed ? 'الإشعارات مفعلة 🔔' : 'تفعيل الإشعارات 📳'}
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

            {isCurrentAdmin && pendingRequestsCount > 0 && onOpenPendingRequests && (
              <button
                onClick={onOpenPendingRequests}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow transition active:scale-95 animate-pulse"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>طلبات معلقة ({pendingRequestsCount})</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
