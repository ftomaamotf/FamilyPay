import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  QrCode,
  UserPlus,
  Copy,
  Check,
  Share2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CreditCard
} from 'lucide-react';

export const JoinBrotherQrModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getJoinUrl = () => {
    if (typeof window === 'undefined') return 'https://familypay-aw26.onrender.com/?action=register';
    return `${window.location.origin}/?action=register`;
  };

  const joinUrl = getJoinUrl();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-center">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-base sm:text-lg">باركود انضمام وتسجيل أخ جديد</h3>
              <p className="text-xs text-emerald-200">مسح سريع بالكاميرا للانضمام المباشر للصندوق</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* QR Code Container */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-750 dark:to-slate-800 p-6 rounded-3xl border border-emerald-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3 shadow-inner">
            <div className="p-3.5 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1 text-center">
              <span className="text-xs font-black text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>وجّه كاميرا الهاتف نحو الرمز للتسجيل الفوري</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                سيُطلب من الأخ إدخال (الاسم + الهاتف + بطاقة الكي كارد) ويفتح حسابه مباشرة!
              </p>
            </div>
          </div>

          {/* Copy Link Row */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px] text-left" dir="ltr">
              {joinUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={() => {
              const msg = encodeURIComponent(`👋 أهلاً بك! يمكنك الانضمام الآن إلى صندوق عائلة عجمي المالي المشترك وتسجيل بياناتك وبطاقتك مباشرة عبر هذا الرابط:\n${joinUrl}`);
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>إرسال الرابط عبر واتساب 📲</span>
          </button>

        </div>

      </div>
    </div>
  );
};
