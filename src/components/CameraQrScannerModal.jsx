import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Edit3,
  RefreshCw,
  Flashlight
} from 'lucide-react';

export const CameraQrScannerModal = ({ isOpen, onClose, onScanSuccess, onManualEntry }) => {
  const [scannerError, setScannerError] = useState('');
  const [isLiveRunning, setIsLiveRunning] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const scannerRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const containerId = useRef(`camera-viewport-${Date.now()}`).current;

  const stopScannerCleanly = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }
    } catch (e) {
      console.log('Camera stop notice:', e);
    } finally {
      scannerRef.current = null;
      setIsLiveRunning(false);
    }
  };

  const startCamera = async () => {
    setScannerError('');
    setIsDecoding(false);

    try {
      await stopScannerCleanly();

      // Ensure element exists in DOM
      const elem = document.getElementById(containerId);
      if (!elem) return;

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: (viewWidth, viewHeight) => {
          const size = Math.min(viewWidth, viewHeight) * 0.72;
          return { width: Math.floor(size), height: Math.floor(size) };
        },
        aspectRatio: 1.0
      };

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => handleSuccess(decodedText),
          () => {} // silent scan frame
        );
        setIsLiveRunning(true);
      } catch (err1) {
        console.warn('Environment facingMode failed, fallback to any camera:', err1);
        await html5QrCode.start(
          { facingMode: 'user' },
          config,
          (decodedText) => handleSuccess(decodedText),
          () => {}
        );
        setIsLiveRunning(true);
      }
    } catch (err) {
      console.error('All live camera methods failed:', err);
      setIsLiveRunning(false);
      setScannerError(
        'لم يتم تشغيل بث الفيديو المباشر. اضغط على الزر الأخضر "تصوير بكاميرا الهاتف 📸" لفتح كاميرا جهازك فوراً والتقاط الباركود.'
      );
    }
  };

  const handleSuccess = async (decodedText) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(120);
    await stopScannerCleanly();
    if (onScanSuccess) onScanSuccess(decodedText);
    onClose();
  };

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    setScannerError('');

    try {
      await stopScannerCleanly();
      const html5QrCode = new Html5Qrcode(containerId);
      const result = await html5QrCode.scanFile(file, true);
      setIsDecoding(false);
      handleSuccess(result);
    } catch (err) {
      setIsDecoding(false);
      setScannerError('لم يتم العثور على باركود واضح في الصورة الملتقطة. يرجى إعادة التقاط الصورة بوضوح أو إدخال البيانات يدوياً.');
    }
  };

  useEffect(() => {
    let timer = null;
    if (isOpen) {
      setScannerError('');
      timer = setTimeout(() => {
        startCamera();
      }, 150);
    } else {
      stopScannerCleanly();
    }

    return () => {
      if (timer) clearTimeout(timer);
      stopScannerCleanly();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 animate-fadeIn" dir="rtl">
      
      {/* Top Bar */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between py-2 px-3 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 text-white z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-xs sm:text-sm">ماسح باركود الأدمن 📷</h3>
            <span className="text-[10px] text-emerald-300">وجّه الكاميرا نحو باركود إضافة الأخوة</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await stopScannerCleanly();
            onClose();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Viewport Area (Clean & Completely Unobstructed) */}
      <div className="w-full max-w-lg mx-auto flex-1 my-3 flex flex-col items-center justify-center relative">
        
        <div className="w-full h-full max-h-[460px] min-h-[280px] bg-black rounded-3xl overflow-hidden relative border-2 border-emerald-500/60 shadow-2xl flex items-center justify-center">
          
          {/* html5-qrcode attaches here */}
          <div id={containerId} className="w-full h-full object-cover" />

          {/* Clean Reticle Box */}
          {isLiveRunning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-3xl relative shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                {/* Corner Accents */}
                <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-300 rounded-tr-xl" />
                <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-300 rounded-tl-xl" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-300 rounded-br-xl" />
                <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-300 rounded-bl-xl" />
                
                {/* Animated Scan Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {isDecoding && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-white font-bold text-xs">
              <span className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span>جاري قراءة وتحليل الباركود...</span>
            </div>
          )}
        </div>

        {scannerError && (
          <div className="mt-2.5 w-full p-3 bg-rose-950/90 text-rose-200 text-xs font-bold rounded-2xl border border-rose-800 flex items-center gap-2 text-right">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-relaxed">{scannerError}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-lg mx-auto space-y-2.5 z-20">
        
        {/* 1. Direct Native Camera Button (100% Guaranteed Native Camera App on iPhone/Android) */}
        <button
          type="button"
          onClick={() => nativeCameraInputRef.current?.click()}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-300"
        >
          <Camera className="w-5 h-5" />
          <span>تصوير الباركود بكاميرا الهاتف 📸</span>
        </button>

        {/* Hidden Native Input */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* 2. Secondary Row: Gallery Image & Manual Form */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>من ألبوم الصور 🖼️</span>
          </button>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />

          <button
            type="button"
            onClick={async () => {
              await stopScannerCleanly();
              onClose();
              if (onManualEntry) onManualEntry();
              else if (onScanSuccess) onScanSuccess('manual');
            }}
            className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-teal-400" />
            <span>إدخال البيانات يدوياً 📝</span>
          </button>
        </div>

      </div>

    </div>
  );
};
