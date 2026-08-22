import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const CameraQrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scannerError, setScannerError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setScannerError('');
      setIsScanning(true);

      const qrCodeId = 'qr-reader-container';

      // Initialize scanner after DOM renders
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(qrCodeId);
          scannerRef.current = html5QrCode;

          const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              // On success
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  if (window.navigator?.vibrate) window.navigator.vibrate(80);
                  onScanSuccess(decodedText);
                  onClose();
                }).catch(() => {
                  onScanSuccess(decodedText);
                  onClose();
                });
              }
            },
            (errorMsg) => {
              // Silent scan progress
            }
          ).catch((err) => {
            console.error('Camera error:', err);
            setScannerError('لم نتمكن من الوصول إلى الكاميرا. يرجى التأكد من إعطاء الإذن للتطبيق باستخدام الكاميرا.');
            setIsScanning(false);
          });
        } catch (e) {
          console.error(e);
          setScannerError('حدث خطأ أثناء تشغيل الماسح الضوئي للكاميرا.');
          setIsScanning(false);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          try {
            if (html5QrCode.isScanning) {
              html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
            } else {
              html5QrCode.clear();
            }
          } catch (e) {}
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-emerald-800 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm sm:text-base">مسح باركود إضافة الأخوة بالكاميرا</h3>
          </div>
          <button
            onClick={() => {
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
              }
              onClose();
            }}
            className="p-1 rounded-full text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black min-h-[280px] flex items-center justify-center border-2 border-emerald-500/40">
            <div id="qr-reader-container" className="w-full h-full" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-emerald-400 rounded-2xl animate-pulse shadow-lg shadow-emerald-400/20 relative">
                <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
                <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>وجّه الكاميرا نحو باركود الإخوة المعروض لدى الأدمن</span>
          </p>

          {scannerError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
              }
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
