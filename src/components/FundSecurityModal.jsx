import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  Check,
  ShieldAlert,
  Sliders
} from 'lucide-react';

export const FundSecurityModal = ({ isOpen, onClose }) => {
  const {
    isCardFrozen,
    toggleCardFreeze,
    changeFundPin,
    fundPin,
    currentUser,
    activeAdminId
  } = useFinance();

  const [activeTab, setActiveTab] = useState('status'); // status | change_pin
  const [adminPin, setAdminPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  const handleToggleFreeze = async () => {
    if (!adminPin) {
      setMsg('يرجى إدخال رمز حماية الصندوق لتأكيد تغيير حالة القفل');
      return;
    }
    setLoading(true);
    setMsg('');
    const res = await toggleCardFreeze(adminPin);
    setLoading(false);
    if (res.success) {
      alert(res.message);
      setAdminPin('');
    } else {
      setMsg(res.message);
    }
  };

  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setMsg('الرمز السري الجديد غير متطابق');
      return;
    }
    setLoading(true);
    setMsg('');
    const res = await changeFundPin(oldPin, newPin);
    setLoading(false);
    if (res.success) {
      alert('✅ تم تغيير رمز حماية الصندوق بنجاح!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setActiveTab('status');
    } else {
      setMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">نظام حماية الصندوق والبطاقة الرئيسية</h3>
              <p className="text-xs text-indigo-200">الرمز السري وتجميد البطاقة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-slate-100 dark:bg-slate-750 px-5 pt-3 border-b border-slate-200 dark:border-slate-700 text-xs font-bold gap-2">
          <button
            onClick={() => { setActiveTab('status'); setMsg(''); }}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            حالة الحماية والقفل
          </button>
          <button
            onClick={() => { setActiveTab('change_pin'); setMsg(''); }}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'change_pin'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            تغيير رمز حماية الصندوق
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {msg && (
            <p className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-bold border border-rose-200">
              {msg}
            </p>
          )}

          {/* TAB 1: Status & Freeze Lock */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              
              {/* Lock Status Card */}
              <div
                className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${
                  isCardFrozen
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                      isCardFrozen ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  >
                    {isCardFrozen ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm">
                      {isCardFrozen ? 'بطاقة الصندوق مجمدة ومقفلة 🔒' : 'بطاقة الصندوق مفعلة وآمنة 🛡️'}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {isCardFrozen
                        ? 'عمليات التحويل متوقفة مؤقتاً لحماية الأموال'
                        : 'التحويلات متاحة مع اشتراط الرمز السري'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggle Freeze Box (Admin) */}
              {isCurrentAdmin && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <span className="font-extrabold text-slate-800 dark:text-white block">
                    {isCardFrozen ? 'إلغاء تجميد وفتح البطاقة:' : 'تجميد وقفل البطاقة الآن:'}
                  </span>
                  
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      أدخل رمز حماية الصندوق السري (الافتراضي: 9988):
                    </label>
                    <input
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono text-center font-bold"
                    />
                  </div>

                  <button
                    onClick={handleToggleFreeze}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-white shadow transition ${
                      isCardFrozen
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isCardFrozen ? '🔓 تأكيد فتح وتفعيل البطاقة' : '🔒 تأكيد تجميد وقفل البطاقة'}
                  </button>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">💡 إرشادات الأمان:</span>
                <p>• الرمز السري مطلوب لتأكيد أي تحويل مالي يخرج من البطاقة الرئيسية.</p>
                <p>• لا تشارك الرمز السري إلا مع من يملك صلاحية الإرسال فقط.</p>
              </div>

            </div>
          )}

          {/* TAB 2: Change PIN */}
          {activeTab === 'change_pin' && (
            <form onSubmit={handleChangePinSubmit} className="space-y-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  رمز حماية الصندوق الحالي (الافتراضي: 9988):
                </label>
                <input
                  type="password"
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  الرمز السري الجديد (4 أرقام):
                </label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  تأكيد الرمز السري الجديد:
                </label>
                <input
                  type="password"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow"
                >
                  حفظ الرمز السري الجديد
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
