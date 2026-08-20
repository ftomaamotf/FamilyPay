import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download, Share, PlusSquare } from 'lucide-react';

export const PwaInstallBanner = () => {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check if on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // If dismissed before
    const dismissed = localStorage.getItem('bait_finance_pwa_dismissed');
    if (dismissed) return;

    // Android/Chrome install prompt listener
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS, show banner if on mobile browser
    if (iosDevice) {
      setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('bait_finance_pwa_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="md:hidden bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-3 px-4 shadow-lg flex items-center justify-between gap-3 text-xs fixed top-16 left-0 right-0 z-20 border-b border-emerald-700/60 animate-fadeIn">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-emerald-300" />
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate">استخدم «مصاريف بيتي» كتطبيق على هاتفك</p>
          <p className="text-[11px] text-emerald-200 truncate">
            {isIos
              ? 'اضغط زر المشاركة (⬆️) ثم «إضافة للشاشة الرئيسية»'
              : 'ثبّت التطبيق للوصول السريع بدون انترنت'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isIos && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-900 px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-1 text-emerald-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
