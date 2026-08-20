import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  Crown,
  Check,
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';

export const AdminTransferModal = ({ isOpen, onClose }) => {
  const { brothers, activeAdminId, transferAdminRole } = useFinance();
  const [selectedBrotherId, setSelectedBrotherId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentAdmin = brothers.find((b) => b.id === activeAdminId) || { name: 'الأدمن' };
  const eligibleBrothers = brothers.filter((b) => b.id !== activeAdminId);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedBrotherId) return;

    setLoading(true);
    const res = await transferAdminRole(selectedBrotherId);
    setLoading(false);

    if (res.success) {
      alert(`👑 ${res.message}\nتم بث إشعار التعيين لجميع الإخوة.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-amber-700 to-amber-900 text-white">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black text-base">تسليم وتدوير دور الأدمن</h3>
              <p className="text-xs text-amber-200">تحويل صلاحية الإرسال لأخ آخر</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-amber-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
            <span>الأدمن الحالي المسؤول عن الإرسال: </span>
            <strong className="font-black">{currentAdmin.name}</strong>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اختر الأخ الذي تريد تسليمه دور الأدمن ومهمة الإرسال:
            </label>
            <div className="space-y-1.5">
              {eligibleBrothers.map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    selectedBrotherId === b.id
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="adminBrother"
                      value={b.id}
                      checked={selectedBrotherId === b.id}
                      onChange={(e) => setSelectedBrotherId(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: b.avatarColor }}
                    >
                      {b.name[0]}
                    </span>
                    <span className="font-bold">{b.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">حساب: #{b.accountNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!selectedBrotherId || loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>{loading ? 'جاري التسليم والإشعار...' : 'تأكيد تسليم دور الأدمن وبث الإشعار'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
