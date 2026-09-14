import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { QrCode, Moon, Sun, Settings, LogOut, MessageSquare } from 'lucide-react';

export const BottomToolsBar = ({ onOpenQrModal, onOpenSettings, onOpenChat, onLogout }) => {
  const { settings, updateSettings } = useFinance();
  const tools = [
    onOpenChat && {
      id: 'chat',
      label: 'المحادثة',
      badge: 'رسائل صوتية',
      title: 'المحادثة والرسائل الصوتية بين الدوائر',
      Icon: MessageSquare,
      onClick: () => onOpenChat('all'),
      ring: 'ring-emerald-500/80 group-hover:ring-emerald-400',
      gradient: 'from-emerald-700 via-teal-600 to-emerald-400',
      text: 'text-emerald-300 group-hover:text-emerald-200',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-slate-950'
    },
    {
      id: 'qr',
      label: 'رمز QR',
      badge: 'فتح الهاتف',
      title: 'فتح على الهاتف / رمز QR',
      Icon: QrCode,
      onClick: onOpenQrModal,
      ring: 'ring-cyan-500/80 group-hover:ring-cyan-400',
      gradient: 'from-cyan-800 via-blue-700 to-teal-500',
      text: 'text-cyan-300 group-hover:text-cyan-200',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950'
    },
    {
      id: 'theme',
      label: settings.darkMode ? 'نهاري' : 'ليلي',
      badge: 'تبديل الوضع',
      title: 'الوضع الليلي / النهاري',
      Icon: settings.darkMode ? Sun : Moon,
      onClick: () => updateSettings({ darkMode: !settings.darkMode }),
      ring: settings.darkMode ? 'ring-amber-500/80 group-hover:ring-amber-400' : 'ring-indigo-500/80 group-hover:ring-indigo-400',
      gradient: settings.darkMode ? 'from-amber-600 via-orange-500 to-yellow-400' : 'from-indigo-800 via-violet-700 to-sky-500',
      text: settings.darkMode ? 'text-amber-300 group-hover:text-amber-200' : 'text-indigo-300 group-hover:text-indigo-200',
      badgeClass: settings.darkMode
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 group-hover:bg-amber-500 group-hover:text-slate-950'
        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 group-hover:bg-indigo-500 group-hover:text-white'
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      badge: 'إدارة النظام',
      title: 'الإعدادات والنسخ الاحتياطي',
      Icon: Settings,
      onClick: onOpenSettings,
      ring: 'ring-slate-500/80 group-hover:ring-slate-300',
      gradient: 'from-slate-700 via-slate-600 to-zinc-500',
      text: 'text-slate-200 group-hover:text-white',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700 group-hover:bg-slate-700'
    },
    {
      id: 'logout',
      label: 'الخروج',
      badge: 'تبديل الحساب',
      title: 'تبديل الحساب / تسجيل الخروج',
      Icon: LogOut,
      onClick: onLogout,
      ring: 'ring-rose-500/80 group-hover:ring-rose-400',
      gradient: 'from-rose-700 via-red-600 to-orange-500',
      text: 'text-rose-300 group-hover:text-rose-200',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 group-hover:bg-rose-500 group-hover:text-white'
    }
  ].filter(Boolean);

  return (
    <footer className="w-full py-4 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
        
        {/* System Title */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 text-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>صندوق عائلة عجمي المالي المشترك • نظام سحابي متزامن</span>
        </div>

        {/* Bottom Toolbar Circles */}
        <div className="w-full max-w-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-3 rounded-3xl border border-slate-800 shadow-xl" dir="rtl">
          <div className="flex flex-row items-start justify-start sm:justify-center gap-4 sm:gap-5 overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
            {tools.map(({ id, label, badge, title, Icon, onClick, ring, gradient, text, badgeClass }) => (
              <div key={id} className="flex flex-col items-center shrink-0 w-24">
                <button
                  type="button"
                  onClick={onClick}
                  title={title}
                  className="flex flex-col items-center group transition-all duration-200 outline-none select-none relative w-full cursor-pointer opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
                >
                  <div className={`relative p-1 rounded-full ring-2 ${ring} group-hover:ring-offset-2 group-hover:ring-offset-slate-950 transition-all duration-300 shadow-lg`}>
                    <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-gradient-to-tr ${gradient} text-white shadow-inner relative overflow-hidden`}>
                      <Icon className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2] drop-shadow" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/25 pointer-events-none" />
                    </div>
                  </div>

                  <span className={`mt-2 text-xs sm:text-sm font-black truncate max-w-[92px] text-center ${text}`}>
                    {label}
                  </span>

                  <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all max-w-[92px] truncate ${badgeClass}`}>
                    <span>{badge}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
