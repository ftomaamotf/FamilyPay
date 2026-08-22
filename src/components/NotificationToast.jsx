import React, { useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Bell, X, Sparkles, Send, UserCheck } from 'lucide-react';

export const NotificationToast = ({ onOpenPendingRequests, onOpenGuestApprovals }) => {
  const { activeAlert, setActiveAlert, currentUser, activeAdminId } = useFinance();
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, setActiveAlert]);

  if (!activeAlert) return null;

  const isMoneyRequest = activeAlert.title?.includes('طلب أموال') || activeAlert.message?.includes('طلب الأخ');
  const isGuestRequest = activeAlert.title?.includes('ضيف') || activeAlert.message?.includes('الضيف');

  return (
    <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-60 max-w-md w-full animate-bounce">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-emerald-400 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-md">
          <Bell className="w-5 h-5 text-emerald-300 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-black text-sm text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeAlert.title}</span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
            {activeAlert.message}
          </p>

          {/* Quick Action Buttons for Admin inside the Notification Toast */}
          {isCurrentAdmin && isMoneyRequest && (
            <button
              onClick={() => {
                setActiveAlert(null);
                if (onOpenPendingRequests) onOpenPendingRequests();
              }}
              className="mt-2.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>قبول وصرف المبلغ الآن 💸</span>
            </button>
          )}

          {isCurrentAdmin && isGuestRequest && (
            <button
              onClick={() => {
                setActiveAlert(null);
                if (onOpenGuestApprovals) onOpenGuestApprovals();
              }}
              className="mt-2.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>مراجعة وقبول الضيف بكلمة المرور 🔑</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 rounded-full text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
