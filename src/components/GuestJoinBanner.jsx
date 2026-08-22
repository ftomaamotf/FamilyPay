import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { GuestRegisterModal } from './GuestRegisterModal';
import { Camera, Sparkles, UserCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

export const GuestJoinBanner = () => {
  const { currentUser } = useFinance();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  if (!currentUser?.isGuest) return null;

  const handleScanSuccess = (decodedText) => {
    setRegisterModalOpen(true);
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 p-4 sm:p-5 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn" dir="rtl">
        
        <div className="flex items-center gap-3 text-right">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Camera className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white">
                أنت تتصفح البرنامج كـ (ضيف) 👤
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                غير منضم بعد
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5 font-medium">
              لإضافة نفسك إلى صندوق عائلتك واعتماد مخصصاتك واستلام الحوالات من الأدمن:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>فتح الكاميرا ومسح باركود الأدمن 📷</span>
          </button>

          <button
            onClick={() => setRegisterModalOpen(true)}
            className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition"
            title="إدخال البيانات يدوياً بدون كاميرا"
          >
            تسجيل يدوي
          </button>
        </div>

      </div>

      {/* Camera QR Scanner */}
      <CameraQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onManualEntry={() => {
          setScannerOpen(false);
          setRegisterModalOpen(true);
        }}
      />

      {/* Guest Registration Form Popup */}
      <GuestRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </>
  );
};
