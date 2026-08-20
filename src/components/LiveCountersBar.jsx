import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate } from '../utils/formatters';
import {
  CreditCard,
  TrendingDown,
  Wallet,
  Bell,
  Sparkles,
  Wifi,
  X,
  CheckCircle2,
  Clock,
  ArrowDownLeft
} from 'lucide-react';

export const LiveCountersBar = () => {
  const {
    sendingCard,
    monthlyFundTotal,
    totalSpentThisMonth,
    remainingMonthlyFund,
    notifications,
    unreadNotifsCount,
    markAllNotifsAsRead,
    settings,
    isBalanceHiddenByAdmin,
    currentUser,
    activeAdminId
  } = useFinance();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const currency = settings.currencySymbol;
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSeeBalance = isCurrentAdmin || !isBalanceHiddenByAdmin;

  const handleToggleNotifs = () => {
    setIsNotifsOpen(!isNotifsOpen);
    if (!isNotifsOpen) {
      markAllNotifsAsRead();
    }
  };

  return (
    <div className="relative">
      
      {/* 4 Realtime Ticker Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Sending Card Balance */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">رصيد بطاقة الإرسال</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {canSeeBalance ? formatMoney(sendingCard.balance, currency) : '••••••'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {canSeeBalance ? 'محدث لحظياً' : 'مخفي بقرار الأدمن 🔒'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Spent This Month */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ما تم صرفه هذا الشهر</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400">
              {formatMoney(totalSpentThisMonth, currency)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">إجمالي تحويلات الإخوة</span>
          </div>
        </div>

        {/* Card 3: Remaining Monthly Budget */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">المتبقي من ميزانية الشهر</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400">
              {formatMoney(remainingMonthlyFund, currency)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">من سقف {formatMoney(monthlyFundTotal, currency)}</span>
          </div>
        </div>

        {/* Card 4: Notification Alerts Counter */}
        <button
          onClick={handleToggleNotifs}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative text-right transition hover:border-emerald-400 active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إشعارات وتنبيهات الإخوة</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center relative">
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span>{notifications.length} إشعار</span>
              {unreadNotifsCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                  {unreadNotifsCount} جديد
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">اضغط لعرض سجل التنبيهات</span>
          </div>
        </button>

      </div>

      {/* Notifications Drawer / Popover */}
      {isNotifsOpen && (
        <div className="absolute top-full left-0 right-0 z-40 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 max-h-96 overflow-y-auto animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              <span>سجل إشعارات وتنبيهات التحويلات</span>
            </h3>
            <button
              onClick={() => setIsNotifsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {formatArabicDate(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-6">لا توجد إشعارات مسجلة</p>
          )}
        </div>
      )}

    </div>
  );
};
