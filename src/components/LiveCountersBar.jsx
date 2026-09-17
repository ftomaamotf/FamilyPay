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
  ArrowDownLeft,
  Send,
  UserCheck,
  Edit2,
  Check
} from 'lucide-react';

export const LiveCountersBar = ({ onOpenPendingRequests, onOpenGuestApprovals }) => {
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
    activeAdminId,
    updateSendingCardBalance
  } = useFinance();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const currency = settings.currencySymbol;
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const canSeeBalance = isCurrentAdmin || !isBalanceHiddenByAdmin;

  const handleToggleNotifs = () => {
    setIsNotifsOpen(!isNotifsOpen);
    if (!isNotifsOpen) {
      markAllNotifsAsRead();
    }
  };

  const handleOpenEditBalance = () => {
    setNewBalanceInput(String(sendingCard?.balance || ''));
    setIsEditBalanceOpen(true);
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    if (newBalanceInput === '' || isNaN(Number(newBalanceInput))) {
      alert('يرجى إدخال مبلغ رصيد صحيح');
      return;
    }
    setIsUpdatingBalance(true);
    const res = await updateSendingCardBalance(Number(newBalanceInput), sendingCard?.id);
    setIsUpdatingBalance(false);
    if (res && res.message) {
      alert(res.message);
    }
    setIsEditBalanceOpen(false);
  };

  return (
    <div className="relative">
      
      {/* 🔴 المستطيل الأنيق المدمج الشبيه لمربع الدوائر لتصفح المربعات بسلاسة 🔴 */}
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-2 sm:p-2.5 rounded-2xl border border-slate-800/90 shadow-lg space-y-1.5" dir="rtl">
        
        {/* شريط عنوان مدمج وأنيق */}
        <div className="flex items-center justify-between px-1.5 pb-1 border-b border-slate-800/60">
          <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>مؤشرات وإحصائيات الصندوق والحسابات 📊</span>
          </span>
          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/40">
            <span>تصفح سلس</span>
            <span className="text-emerald-400 font-mono">⟷</span>
          </span>
        </div>

        {/* شريط الأزرار والمربعات المدمجة بحجم متناسق وانسيابي */}
        <div className="flex flex-row items-stretch gap-2 sm:gap-2.5 overflow-x-auto p-0.5 pb-1 scrollbar-thin scrollbar-thumb-slate-700 scroll-smooth snap-x">
          
          {/* Card 1: Sending Card Balance */}
          <div
            onClick={() => isCurrentAdmin && handleOpenEditBalance()}
            className={`w-[185px] sm:w-[210px] lg:flex-1 shrink-0 snap-start bg-slate-800/80 hover:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-emerald-500/30 hover:border-emerald-400 shadow-sm relative overflow-hidden transition-all duration-200 flex flex-col justify-between ${
              isCurrentAdmin ? 'cursor-pointer hover:shadow-md active:scale-98 group' : ''
            }`}
            title={isCurrentAdmin ? 'اضغط هنا لتعديل رصيد بطاقة الإرسال مباشرة ✏️' : ''}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                <span>رصيد بطاقة الإرسال</span>
                {isCurrentAdmin && (
                  <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-300 opacity-90 group-hover:opacity-100 flex items-center gap-0.5 text-[8.5px] font-extrabold px-1 border border-emerald-500/30">
                    <Edit2 className="w-2 h-2" />
                    <span>تعديل</span>
                  </span>
                )}
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                {canSeeBalance ? formatMoney(sendingCard.balance, currency) : '••••••'}
              </div>
              <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate">{canSeeBalance ? (isCurrentAdmin ? 'اضغط لتعديل الرصيد ✏️' : 'محدث لحظياً') : 'مخفي بقرار الأدمن 🔒'}</span>
              </span>
            </div>
          </div>

          {/* Card 2: Total Spent This Month */}
          <div className="w-[185px] sm:w-[210px] lg:flex-1 shrink-0 snap-start bg-slate-800/80 hover:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700/80 hover:border-rose-500/40 shadow-sm relative overflow-hidden transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-300">ما تم صرفه هذا الشهر</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <div className="text-sm sm:text-base font-black text-rose-400 font-mono">
                {formatMoney(totalSpentThisMonth, currency)}
              </div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5 truncate">إجمالي تحويلات المستخدمين</span>
            </div>
          </div>

          {/* Card 3: Remaining Monthly Budget */}
          <div className="w-[185px] sm:w-[210px] lg:flex-1 shrink-0 snap-start bg-slate-800/80 hover:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700/80 hover:border-blue-500/40 shadow-sm relative overflow-hidden transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-300">المتبقي من الميزانية</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <div className="text-sm sm:text-base font-black text-blue-400 font-mono">
                {formatMoney(remainingMonthlyFund, currency)}
              </div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5 truncate">من سقف {formatMoney(monthlyFundTotal, currency)}</span>
            </div>
          </div>

          {/* Card 4: Notification Alerts Counter */}
          <button
            onClick={handleToggleNotifs}
            className="w-[185px] sm:w-[210px] lg:flex-1 shrink-0 snap-start bg-slate-800/80 hover:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700/80 hover:border-purple-500/40 shadow-sm relative text-right transition-all duration-200 hover:border-emerald-400 active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-300">إشعارات وتنبيهات</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 relative shrink-0">
                <Bell className="w-3.5 h-3.5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8.5px] font-extrabold flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <div className="text-sm sm:text-base font-black text-purple-400 flex items-center gap-1.5">
                <span>{notifications.length} إشعار</span>
                {unreadNotifsCount > 0 && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                    {unreadNotifsCount} جديد
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5 truncate">اضغط لعرض السجل</span>
            </div>
          </button>

        </div>
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
              {notifications.map((n) => {
                const isMoneyReq = n.title?.includes('طلب أموال') || n.message?.includes('طلب الأخ');
                const isGuestReq = n.title?.includes('ضيف') || n.message?.includes('الضيف');

                return (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 text-xs space-y-2"
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
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Interactive Action Buttons for Admin inside Notification Drawer */}
                    {isCurrentAdmin && isMoneyReq && (
                      <button
                        onClick={() => {
                          setIsNotifsOpen(false);
                          if (onOpenPendingRequests) onOpenPendingRequests();
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Send className="w-3.5 h-3.5 -rotate-45" />
                        <span>قبول وصرف هذا الطلب الآن 💸</span>
                      </button>
                    )}

                    {isCurrentAdmin && isGuestReq && (
                      <button
                        onClick={() => {
                          setIsNotifsOpen(false);
                          if (onOpenGuestApprovals) onOpenGuestApprovals();
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>مراجعة وقبول الضيف بكلمة المرور 🔑</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-6">لا توجد إشعارات مسجلة</p>
          )}
        </div>
      )}

      {/* Edit Sending Card Balance Modal (تعديل رصيد بطاقة الإرسال مباشرة للأدمن) */}
      {isEditBalanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/40 space-y-5 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    تعديل رصيد بطاقة الإرسال
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">
                    {sendingCard?.name || 'بطاقة الصندوق المشترك'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBalanceOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBalance} className="space-y-4">
              
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  الرصيد المالي الجديد للبطاقة ({currency}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                    placeholder="أدخل مبلغ الرصيد الجديد..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                    required
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    {currency}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  سيتم تحديث رصيد الصندوق لحظياً وتعميم المبلغ المحدث على جميع الأجهزة.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingBalance}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isUpdatingBalance ? 'جاري الحفظ والتحديث...' : 'حفظ الرصيد الجديد 💾'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditBalanceOpen(false)}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
