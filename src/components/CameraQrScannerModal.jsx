import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  Sparkles,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Edit3,
  RefreshCw,
  Video,
  CheckCircle2
} from 'lucide-react';

export const CameraQrScannerModal = ({ isOpen, onClose, onScanSuccess, onManualEntry }) => {
  const [scannerError, setScannerError] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerInstanceRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const containerId = 'interactive-camera-qr-box';

  const stopScanner = async () => {
    try {
      if (scannerInstanceRef.current) {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        await scannerInstanceRef.current.clear();
      }
    } catch (e) {
      console.log('Notice stopping camera:', e);
    } finally {
      setIsLiveActive(false);
    }
  };

  const startLiveCamera = async () => {
    setScannerError('');
    setIsProcessing(true);

    try {
      await stopScanner();

      const html5QrCode = new Html5Qrcode(containerId);
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0
      };

      // Try environment camera first, fallback to any available camera
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => handleScanComplete(decodedText),
          () => {} // silent progress
        );
      } catch (envErr) {
        console.warn('Environment camera failed, trying default camera:', envErr);
        await html5QrCode.start(
          { facingMode: 'user' },
          config,
          (decodedText) => handleScanComplete(decodedText),
          () => {}
        );
      }

      setIsLiveActive(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('Live camera failed:', err);
      setIsLiveActive(false);
      setIsProcessing(false);
      setScannerError(
        '⚠️ تعذر تشغيل الكاميرا المباشرة داخل المتصفح. يمكنك الضغط على زر "التقاط بكاميرا الهاتف 📸" لفتح كاميرا جهازك مباشرة، أو اختيار صورة من المعرض.'
      );
    }
  };

  const handleScanComplete = async (decodedText) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(100);
    await stopScanner();
    if (onScanSuccess) onScanSuccess(decodedText);
    onClose();
  };

  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setScannerError('');

    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(containerId);
      const result = await html5QrCode.scanFile(file, true);
      setIsProcessing(false);
      handleScanComplete(result);
    } catch (err) {
      setIsProcessing(false);
      setScannerError('لم يتم العثور على باركود واضح في الصورة الملتقطة. يرجى إعادة التصوير بوضوح أو إدخال البيانات يدوياً.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannerError('');
      // Attempt auto-start on mount
      const timer = setTimeout(() => {
        startLiveCamera();
      }, 200);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-sm sm:text-base">مسح باركود إضافة الأخوة 📷</h3>
              <p className="text-[11px] text-emerald-200">الانضمام إلى صندوق العائلة المشترك</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-300 hover:text-white bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          
          {/* Live Viewport Area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[240px] flex items-center justify-center border-2 border-emerald-500/50 shadow-inner">
            <div id={containerId} className="w-full h-full min-h-[240px]" />

            {/* Target Reticle Overlay */}
            {isLiveActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400 rounded-2xl animate-pulse shadow-lg shadow-emerald-400/30 relative">
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-300 rounded-tr-lg" />
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-300 rounded-tl-lg" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-300 rounded-br-lg" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-300 rounded-bl-lg" />
                </div>
              </div>
            )}

            {!isLiveActive && !isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 text-white space-y-2">
                <Camera className="w-10 h-10 text-emerald-400 animate-bounce" />
                <p className="text-xs font-bold text-slate-300">
                  اضغط الزر أدناه لتشغيل الكاميرا المباشرة أو التصوير
                </p>
                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition"
                >
                  تشغيل الكاميرا الحية 🔄
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 text-white gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span className="text-xs font-bold">جاري فتح الكاميرا والمسح...</span>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>وجّه الكاميرا نحو باركود الأدمن أو التقط صورة له</span>
          </p>

          {scannerError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Primary Action: Direct Native Device Camera (Guaranteed 100% on all phones) */}
          <button
            type="button"
            onClick={() => nativeCameraInputRef.current?.click()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-400/40"
          >
            <Camera className="w-5 h-5" />
            <span>التقاط صورة الباركود بكاميرا الهاتف 📸</span>
          </button>

          {/* Hidden Native Camera Input with capture="environment" */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileScan}
          />

          {/* Secondary Actions: Gallery Image or Manual Entry */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Gallery Upload */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>من ألبوم الصور 🖼️</span>
            </button>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileScan}
            />

            {/* Manual Entry Fallback */}
            <button
              type="button"
              onClick={async () => {
                await stopScanner();
                onClose();
                if (onManualEntry) onManualEntry();
                else if (onScanSuccess) onScanSuccess('manual');
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-teal-500" />
              <span>إدخال البيانات يدوياً 📝</span>
            </button>

          </div>

          <button
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="w-full py-2.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl transition"
          >
            إلغاء والعودة
          </button>
        </div>

      </div>
    </div>
  );
};
