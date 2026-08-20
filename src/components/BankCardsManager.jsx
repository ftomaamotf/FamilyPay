import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  CreditCard,
  Plus,
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
  ShieldCheck,
  Wallet
} from 'lucide-react';

export const BankCardsManager = ({ isOpen, onClose }) => {
  const { bankCards, addBankCard, setActiveSendingCard, settings } = useFinance();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('صندوق العائلة');
  const [balance, setBalance] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [color, setColor] = useState('#059669');

  const currency = settings.currencySymbol;

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !accountNumber.trim()) {
      alert('يرجى إدخال اسم البطاقة ورقم الحساب المصرفي');
      return;
    }

    const res = await addBankCard({
      name: name.trim(),
      bankName: bankName.trim() || 'مصرف',
      accountNumber: accountNumber.trim(),
      cardHolder: cardHolder.trim(),
      balance: Number(balance) || 0,
      isSendingCard: isSending,
      color
    });

    if (res.success) {
      alert(res.message);
      setIsAddingNew(false);
      setName('');
      setBankName('');
      setAccountNumber('');
      setBalance('');
    }
  };

  const colors = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#0f172a'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-black text-base">إدارة البطاقات والحسابات المصرفية</h3>
              <p className="text-xs text-slate-400">إضافة بطاقات وتحديد بطاقة الإرسال الرئيسية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 dark:text-white">
                البطاقات المصرفية المسجلة في الصندوق:
              </h4>
              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة بطاقة جديدة</span>
                </button>
              )}
            </div>

            {bankCards.map((card) => (
              <div
                key={card.id}
                className={`p-4 rounded-3xl border transition flex flex-col justify-between gap-3 ${
                  card.isSendingCard
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {card.name}
                      </span>
                      {card.isSendingCard && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> بطاقة الإرسال النشطة
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {card.bankName} • رقم الحساب: <strong className="text-slate-800 dark:text-white">{card.accountNumber}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">الرصيد المالي:</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {formatMoney(card.balance, currency)}
                    </span>
                  </div>
                </div>

                {!card.isSendingCard && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                    <button
                      onClick={() => setActiveSendingCard(card.id)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تعيين كبطاقة الإرسال الرئيسية للصندوق</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Card Form */}
          {isAddingNew && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 space-y-3 mt-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-600 pb-2">
                <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>بيانات البطاقة المصرفية الجديدة</span>
                </h4>
                <button onClick={() => setIsAddingNew(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block font-bold mb-1">اسم البطاقة / الحساب *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: بطاقة بنك الراجحي، حساب ماستر كي..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">اسم البنك / المصرف</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="مثال: الرافدين، الراجحي"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">الرصيد الافتتاحي ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">رقم الحساب المصرفي (Account / IBAN) *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="مثال: IQ45QI880012345678901"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <label className="flex items-center gap-2 font-bold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isSending}
                  onChange={(e) => setIsSending(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>تعيين هذه البطاقة كبطاقة الإرسال الرئيسية للصندوق فوراً</span>
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow"
                >
                  حفظ البطاقة
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="py-2.5 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
