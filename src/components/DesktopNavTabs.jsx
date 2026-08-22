import React from 'react';
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Eye,
  Archive,
  Receipt
} from 'lucide-react';

export const DesktopNavTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'الرئيسية والصندوق', icon: LayoutDashboard },
    { id: 'brothers', label: 'دوائر المستخدمين والأدمن', icon: Users },
    { id: 'my-schedule', label: 'جدولي المعتمد', icon: ListChecks },
    { id: 'all-schedules', label: 'جداول الحسابات والشفافية', icon: Eye },
    { id: 'archives', label: 'الأرشيف الشهري والسنوي', icon: Archive },
    { id: 'transfers', label: 'سجل التحويلات', icon: Receipt },
  ];

  return (
    <div className="hidden md:flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/60 p-1.5 rounded-2xl max-w-fit mx-auto border border-slate-300/40 dark:border-slate-700/40 shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
