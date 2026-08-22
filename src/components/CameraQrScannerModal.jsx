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
  RefreshCw
} from 'lucide-react';

export const CameraQrScannerModal = ({ isOpen, onClose, onScanSuccess, onManualEntry }) => {
  const [scannerError, setScannerError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [fileScanning, setFileScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const uniqueIdRef = useRef(`qr-reader-${Date.now()}`);

  const stopScannerSafe = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }
    } catch (e) {
      console.log('Scanner cleanup notice:', e);
    }
  };

  useEffect(() => {
    let active = true;

    if (isOpen) {
      setScannerError('');
      setIsScanning(true);
      const containerId = uniqueIdRef.current;

      const initTimer = setTimeout(async () => {
        if (!active) return;

        try {
          const containerElem = document.getElementById(containerId);
          if (!containerElem) return;

          const html5QrCode = new Html5Qrcode(containerId);
          scannerRef.current = html5QrCode;

          const config = {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.75);
              return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            async (decodedText) => {
              if (window.navigator?.vibrate) window.navigator.vibrate(80);
              await stopScannerSafe();
              if (onScanSuccess) onScanSuccess(decodedText);
              onClose();
            },
            () => {} // Silent frame
          );

          if (active) setIsScanning(true);
        } catch (err) {
          console.warn('Camera stream error:', err);
          if (active) {
            setScannerError(
              'تعذر فتح كاميرا الهاتف تلقائياً (قد تحتاج للسماح بإذن الكاميرا في المتصفح). يمكنك رفع صورة الباركود من المعرض أو إدخال البيانات يدوياً.'
            );
            setIsScanning(false);
          }
        }
      }, 350);

      return () => {
        active = false;
        clearTimeout(initTimer);
        stopScannerSafe();
      };
    }
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileScanning(true);
      setScannerError('');
      
      const html5QrCode = scannerRef.current || new Html5Qrcode(uniqueIdRef.current);
      const result = await html5QrCode.scanFile(file, true);
      setFileScanning(false);

      if (window.navigator?.vibrate) window.navigator.vibrate(80);
      await stopScannerSafe();
      if (onScanSuccess) onScanSuccess(result);
      onClose();
    } catch (err) {
      setFileScanning(false);
      setScannerError('لم يتم العثور على باركود صالح في الصورة المحددة. يرجى اختيار صورة واضحة أو إدخال البيانات يدوياً.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-sm sm:text-base">مسح باركود الأدمن 📷</h3>
              <p className="text-[10px] text-emerald-200">للانضمام إلى صندوق العائلة المشترك</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await stopScannerSafe();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-300 hover:text-white bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 sm:p-5 space-y-3.5">
          
          <div className="relative rounded-2xl overflow-hidden bg-black min-h-[260px] max-h-[320px] flex items-center justify-center border-2 border-emerald-500/50 shadow-inner">
            <div id={uniqueIdRef.current} className="w-full h-full" />

            {/* Reticle Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400 rounded-2xl animate-pulse shadow-lg shadow-emerald-400/20 relative">
                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-lg" />
                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-lg" />
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>وجّه الكاميرا نحو باركود الإضافة المعروض لدى الأدمن</span>
          </p>

          {scannerError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Action Fallbacks: Gallery Image or Manual Entry */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            
            {/* 1. Upload QR screenshot/image from photos */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileScanning}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{fileScanning ? 'جاري فحص الصورة...' : 'رفع صورة الباركود 🖼️'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* 2. Manual Entry Fallback */}
            <button
              type="button"
              onClick={async () => {
                await stopScannerSafe();
                onClose();
                if (onManualEntry) onManualEntry();
                else if (onScanSuccess) onScanSuccess('manual');
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>إدخال البيانات يدوياً 📝</span>
            </button>

          </div>

          <button
            onClick={async () => {
              await stopScannerSafe();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
          >
            إلغاء والعودة
          </button>
        </div>

      </div>
    </div>
  );
};
