import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Share2,
  Globe,
  Wifi,
  Sparkles
} from 'lucide-react';

export const QrShareModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Use current network origin or default to Wi-Fi IP
  const getNetworkUrl = () => {
    if (typeof window === 'undefined') return 'http://192.168.100.20:5000';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://192.168.100.20:${window.location.port || '5000'}`;
    }
    return window.location.origin;
  };

  const currentUrl = getNetworkUrl();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-white">
                فتح البرنامج على الآيفون والأندرويد
              </h2>
              <p className="text-xs text-slate-400">استخدام فوري عبر المتصفح وبدون متجر تطبيقات</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-center sm:text-right">
          
          {/* QR Code Card */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-750 dark:to-slate-800 p-6 rounded-3xl border border-emerald-100 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
              <QRCodeSVG
                value={currentUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>وجّه كاميرا هاتفك (آيفون أو أندرويد) نحو الرمز للفتح الفوري</span>
            </p>
          </div>

          {/* Copy URL Box */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 text-right">
              رابط الوصول المباشر:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none text-left"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-right flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-500" />
              <span>تأكد من اتصال الهاتف والكمبيوتر بنفس شبكة الواي فاي (Wi-Fi).</span>
            </p>
          </div>

          {/* iOS & Android Easy Installation Guide */}
          <div className="space-y-3 pt-2 text-right">
            <h3 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span>كيف تحوله إلى تطبيق كامل على هاتفك؟</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* iPhone iOS Steps */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className="text-base">🍎</span>
                  <span>خطوات الآيفون (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <li>افتح الرابط في متصفح <strong>Safari</strong>.</li>
                  <li>اضغط على زر المشاركة السفلي (مربع بسهم ⬆️).</li>
                  <li>اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                  <li>سيعمل كتطبيق كامل بأيقونة مميزة وبدون شريط متصفح!</li>
                </ol>
              </div>

              {/* Android Steps */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className="text-base">🤖</span>
                  <span>خطوات الأندرويد (Chrome):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <li>افتح الرابط في <strong>Google Chrome</strong>.</li>
                  <li>اضغط على قائمة النقاط الثلاث (⋮) بأعلى الشاشة.</li>
                  <li>اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة للشاشة»</strong>.</li>
                  <li>سيتم تثبيته فوراً كتطبيق كامل على جهازك.</li>
                </ol>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
