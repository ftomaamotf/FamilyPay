import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { GuestRegisterModal } from './GuestRegisterModal';
import {
  Camera,
  Sparkles,
  User,
  ShieldAlert,
  LogOut,
  Image as ImageIcon,
  Edit3,
  CheckCircle2,
  Wallet,
  Globe,
  ArrowRight
} from 'lucide-react';

export const GuestPortalView = () => {
  const { currentUser, setCurrentUser } = useFinance();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleScanSuccess = (decodedText) => {
    setScannerOpen(false);
    setRegisterModalOpen(true);
  };

  const handleManualEntry = () => {
    setScannerOpen(false);
    setRegisterModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden font-sans" dir="rtl">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-sm text-white">الصندوق والحسابات المشتركة</h2>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              👤 وضع الضيف (غير منضم بعد)
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition text-xs font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </header>

      {/* Main Center Card */}
      <main className="w-full max-w-lg my-auto py-6 relative z-10 animate-fadeIn">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-center space-y-6">
          
          {/* Welcome Badge & Icon */}
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-pulse">
              <Camera className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                أهلاً بك في صندوق العائلة 🌟
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                أنت الآن داخل التطبيق كـ <strong className="text-amber-400 font-extrabold">(ضيف)</strong>.
                للانضمام إلى الصندوق واعتماد اسمك واستلام الحوالات من صاحب الصندوق (الأدمن):
              </p>
            </div>
          </div>

          {/* Action Step 1: Scan Admin QR Code */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>خطوة واحدة للانضمام:</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed font-medium">
              اضغط على زر الكاميرا أدناه لتصوير باركود الأدمن (المعروض على شاشة صاحب الصندوق)، ثم أدخل اسمك ورقم بطاقتك لتصل الموافقة إلى الأدمن فوراً!
            </p>
          </div>

          {/* Big Prominent Action Button: Open Camera */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition active:scale-95 border border-emerald-400/40 group"
            >
              <Camera className="w-6 h-6 animate-pulse" />
              <span>فتح الكاميرا ومسح باركود الأدمن 📷</span>
            </button>

            {/* Manual Entry Fallback Button */}
            <button
              onClick={handleManualEntry}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-teal-400" />
              <span>إدخال البيانات يدوياً بدون كاميرا 📝</span>
            </button>
          </div>

          {/* Footer Safety Notice */}
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>بياناتك ومخصصاتك المالية مشروطة بموافقة الأدمن بكلمة المرور 🔑</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg text-center text-[11px] text-slate-500 py-2 relative z-10">
        نظام الصندوق المالي السحابي المشترك
      </footer>

      {/* Camera QR Scanner Modal */}
      <CameraQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onManualEntry={handleManualEntry}
      />

      {/* Guest Registration Form Popup */}
      <GuestRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />

    </div>
  );
};
