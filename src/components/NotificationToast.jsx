import React, { useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Bell, X, Sparkles, CreditCard } from 'lucide-react';

export const NotificationToast = () => {
  const { activeAlert, setActiveAlert } = useFinance();

  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, setActiveAlert]);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-50 max-w-md w-full animate-bounce">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 rounded-3xl shadow-2xl border-2 border-emerald-400 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40">
          <Bell className="w-5 h-5 text-emerald-300 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-black text-sm text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeAlert.title}</span>
          </div>
          <p className="text-xs text-slate-100 mt-1 leading-relaxed font-medium">
            {activeAlert.message}
          </p>
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
