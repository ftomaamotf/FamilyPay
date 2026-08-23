import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { QrCode, Moon, Sun, Settings, LogOut, MessageSquare } from 'lucide-react';

export const BottomToolsBar = ({ onOpenQrModal, onOpenSettings, onOpenChat, onLogout }) => {
  const { settings, updateSettings } = useFinance();

  return (
    <footer className="w-full py-4 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* System Title */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>صندوق عائلة عجمي المالي المشترك • نظام سحابي متزامن</span>
        </div>

        {/* 5 Bottom Toolbar Icons */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 p-1.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          {/* Chat & Voice Notes */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat('all')}
              title="المحادثة والرسائل الصوتية بين الدوائر"
              className="p-2 sm:px-3 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">المحادثة 🎙️</span>
            </button>
          )}

          {/* QR Share */}
          <button
            onClick={onOpenQrModal}
            title="فتح على الهاتف / رمز QR"
            className="p-2 sm:px-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">رمز QR</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            title="الوضع الليلي / النهاري"
            className="p-2 sm:px-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span className="hidden sm:inline">{settings.darkMode ? 'نهاري' : 'ليلي'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="الإعدادات والنسخ الاحتياطي"
            className="p-2 sm:px-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">الإعدادات</span>
          </button>

          {/* Switch / Logout */}
          <button
            onClick={onLogout}
            title="تبديل الحساب / تسجيل الخروج"
            className="p-2 sm:px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>

        </div>

      </div>
    </footer>
  );
};
