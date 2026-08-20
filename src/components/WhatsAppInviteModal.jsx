import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  Share2,
  KeyRound,
  Phone,
  User,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

export const WhatsAppInviteModal = ({ isOpen, onClose }) => {
  const { createWhatsAppInvite } = useFinance();

  const [brotherName, setBrotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [secretPin, setSecretPin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  if (!isOpen) return null;

  // Determine current public URL or default
  const getAppUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin;
      }
    }
    return 'https://enlargement-inquire-mounted-resolved.trycloudflare.com';
  };

  const currentUrl = getAppUrl();

  const generateInviteMessage = (name, p, pin) => {
    return `السلام عليكم أخي ${name || ''} 🌹\nتمت دعوتك للانضمام إلى برنامج «الصندوق والحسابات المشتركة» لإدارة المصروفات ومتابعة التحويلات.\n\n🌐 رابط الدخول والتسجيل:\n${currentUrl}\n\n🔐 رمز الأمان السري المشترك لتفعيل حسابك:\n[ ${pin} ]\n\n(عند فتح الرابط، اختر «انضمام عبر دعوة واتساب» وأدخل هذا الرمز لتسجيل حسابك واختيار رمزك السري الخاص).`;
  };

  const handleGenerateAndShare = async (e) => {
    e.preventDefault();
    if (!brotherName.trim() || !phone.trim() || !secretPin.trim()) return;

    setLoading(true);
    const res = await createWhatsAppInvite(brotherName.trim(), phone.trim(), secretPin.trim());
    setLoading(false);

    if (res.success) {
      const msg = generateInviteMessage(brotherName.trim(), phone.trim(), secretPin.trim());
      setInviteResult({
        name: brotherName.trim(),
        phone: phone.trim(),
        secretPin: secretPin.trim(),
        message: msg
      });

      // Open WhatsApp Web/App
      const cleanPhone = phone.trim().replace(/^0/, '964'); // Default Iraq if local
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleCopyMessage = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-800 text-white space-y-4 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">دعوة أخ للانضمام عبر واتساب</h3>
              <p className="text-[11px] text-slate-400">إرسال رابط مع رمز أمان سري مشترك</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!inviteResult ? (
          <form onSubmit={handleGenerateAndShare} className="space-y-3.5 text-xs">
            
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-[11px] text-emerald-300 space-y-1">
              <span className="font-bold block">💡 كيف تعمل الدعوة؟</span>
              <p className="text-slate-300">
                سيقوم البرنامج بتجهيز رسالة واتساب تحتوي على رابط البرنامج ورمز أمان سري بينك وبينه. عند فتح الأخ للرابط، يُطلب منه إدخال هذا الرمز لإنشاء حسابه واختيار كلمته السرية بأمان.
              </p>
            </div>

            {/* Brother Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                اسم الأخ المراد دعوته *:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={brotherName}
                  onChange={(e) => setBrotherName(e.target.value)}
                  placeholder="مثال: أحمد، حسام، مصطفى..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم هاتف الأخ (واتساب) *:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 07701234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Shared Secret PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-300">
                  رمز الأمان السري المشترك بينك وبينه *:
                </label>
                <button
                  type="button"
                  onClick={() => setSecretPin(String(Math.floor(1000 + Math.random() * 9000)))}
                  className="text-[10px] text-emerald-400 font-bold hover:underline"
                >
                  توليد رمز عشوائي 🔄
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  required
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  placeholder="مثال: 4580"
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-2xl pr-10 pl-4 py-3 text-xs text-emerald-300 font-mono font-black outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">هذا الرمز سيعرفه الأخ منك عبر الواتساب لتأكيد هويته عند التسجيل.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'جاري تجهيز الدعوة...' : 'إرسال الدعوة عبر واتساب الآن 💬'}</span>
              </button>
            </div>

          </form>
        ) : (
          <div className="space-y-4 text-xs animate-fadeIn">
            
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-center font-bold">
              ✅ تم تجهيز الدعوة وفتح الواتساب!
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-right">
              <span className="text-[11px] text-slate-400 font-bold block">نص رسالة الدعوة:</span>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-900 p-3 rounded-xl border border-slate-800">
                {inviteResult.message}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ النص!' : 'نسخ نص الدعوة'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteResult.message)}`;
                  window.open(waUrl, '_blank');
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                <span>إعادة فتح واتساب</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-bold"
            >
              إغلاق النافذة
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
