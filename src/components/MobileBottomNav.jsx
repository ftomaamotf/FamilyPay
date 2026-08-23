import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  LayoutDashboard,
  Users,
  Send,
  Eye,
  Archive,
  Receipt,
  Inbox,
  MessageSquare
} from 'lucide-react';

export const MobileBottomNav = ({
  activeTab,
  setActiveTab,
  onOpenTransferModal,
  onOpenRequestMoney,
  onOpenChat
}) => {
  const { canCurrentUserSend, messages = [] } = useFinance();
  const canSend = canCurrentUserSend ? canCurrentUserSend() : true;

  const tabs = [
    { id: 'dashboard', label: 'الصندوق', icon: LayoutDashboard },
    { id: 'brothers', label: 'الدوائر 👥', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg pb-safe">
      <div className="flex items-center justify-around relative">
        
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Center Action Button: Send for Admin vs Request for Brother */}
        <div className="relative -top-5">
          <button
            onClick={() => (canSend ? onOpenTransferModal() : onOpenRequestMoney && onOpenRequestMoney())}
            className={`w-13 h-13 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-900 ${
              canSend
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/40'
                : 'bg-gradient-to-tr from-teal-600 to-emerald-600 shadow-teal-500/40'
            }`}
            title={canSend ? 'تحويل مالي سريع' : 'طلب أموال من الصندوق'}
          >
            {canSend ? (
              <Send className="w-6 h-6 -rotate-45 stroke-[2.5]" />
            ) : (
              <Inbox className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Chat & Voice Notes Button on Mobile */}
        <button
          type="button"
          onClick={() => onOpenChat && onOpenChat('all')}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition text-emerald-700 dark:text-emerald-300 relative font-bold"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">محادثة 🎙️</span>
        </button>

        {/* Archives Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('archives')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
            activeTab === 'archives'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Archive className={`w-5 h-5 ${activeTab === 'archives' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">الأرشيف</span>
        </button>

      </div>
    </div>
  );
};
