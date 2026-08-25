import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  UserPlus,
  UserCheck,
  Trash2,
  Check,
  CreditCard,
  Hash,
  Lock,
  Phone,
  Building2,
  Palette
} from 'lucide-react';

export const AddEditBrotherModal = ({ isOpen, onClose, brotherToEdit = null }) => {
  const { addBrother, updateBrother, deleteBrother, brothers, activeAdminId } = useFinance();

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('ماستر كي / Qi Card');
  const [password, setPassword] = useState('123');
  const [avatarColor, setAvatarColor] = useState('#10b981');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(brotherToEdit);

  useEffect(() => {
    if (brotherToEdit) {
      setName(brotherToEdit.name || '');
      setAccountNumber(brotherToEdit.accountNumber || '');
      setPhone(brotherToEdit.phone || '');
      setBankAccountNumber(brotherToEdit.bankAccountNumber || brotherToEdit.accountNumber || '');
      setBankName(brotherToEdit.bankName || 'ماستر كي / Qi Card');
      setPassword(brotherToEdit.password || '123');
      setAvatarColor(brotherToEdit.avatarColor || '#10b981');
    } else {
      setName('');
      // Suggest next sequential account number e.g. 1007
      const nextAcc = 1000 + brothers.length + 1;
      setAccountNumber(String(nextAcc));
      setPhone('');
      setBankAccountNumber('');
      setBankName('ماستر كي / Qi Card');
      setPassword('123');
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6366f1'];
      setAvatarColor(colors[brothers.length % colors.length]);
    }
    setErrorMsg('');
  }, [brotherToEdit, isOpen, brothers.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !accountNumber.trim()) {
      setErrorMsg('يرجى إدخال الاسم ورقم الحساب للدخول');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف لاستعادة الرمز السري عند نسيانه');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    if (isEditing) {
      const res = await updateBrother(brotherToEdit.id, {
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        phone: phone.trim(),
        bankAccountNumber: bankAccountNumber.trim() || accountNumber.trim(),
        bankName: bankName.trim(),
        password: password.trim(),
        avatarColor
      });
      setLoading(false);
      if (res.success) {
        alert('✅ ' + res.message);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await addBrother({
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        phone: phone.trim(),
        bankAccountNumber: bankAccountNumber.trim() || accountNumber.trim(),
        bankName: bankName.trim(),
        password: password.trim(),
        avatarColor,
        requestingBrotherId: currentUser?.id
      });
      setLoading(false);
      if (res.success) {
        alert('✅ ' + res.message);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleDelete = async () => {
    if (brotherToEdit?.id === activeAdminId) {
      alert('لا يمكن حذف حساب الأدمن الحالي، قم بتحويل الأدمن لأخ آخر أولاً');
      return;
    }
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب الأخ (${brotherToEdit.name}) نهائياً؟`)) {
      setLoading(true);
      const res = await deleteBrother(brotherToEdit.id);
      setLoading(false);
      if (res.success) {
        alert(res.message);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const presetColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6366f1', '#0f766e', '#854d0e'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-l from-slate-900 via-teal-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-base">
                {isEditing ? `تعديل بيانات الحساب: ${brotherToEdit?.name}` : 'إضافة أخ / حساب جديد للصندوق'}
              </h3>
              <p className="text-xs text-emerald-200">مع رقم الهاتف لاستعادة الرمز السري</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          
          {/* 1. Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم الأخ / صاحب الحساب *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عمر، أحمد، محمد..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 2. Login Account Number & Password */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم الحساب للدخول *</span>
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="مثال: 1001"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white text-center outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>الرمز السري للدخول</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="الافتراضي: 123"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white text-center outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 3. Phone Number for Recovery */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              <span>رقم الهاتف الخاص بالأخ * (لاستعادة الرمز عند نسيانه):</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 07701234567 أو 01012345678"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
              dir="ltr"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              يُستخدم لتأكيد هوية الأخ وإعادة تعيين الرمز السري إذا نسيه.
            </span>
          </div>

          {/* 4. Bank Account Number for Transfers */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>رقم الحساب المصرفي (للتحويل المالي المباشر):</span>
            </label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="مثال: 880012345678901 أو رقم بطاقة ماستر كي"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 5. Bank Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>اسم المصرف / جهة الحساب:</span>
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="مثال: ماستر كي / Qi Card، مصرف الرافدين، الراجحي..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 6. Avatar Color */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>لون أيقونة الأخ:</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-xl shrink-0 transition-transform ${
                    avatarColor === color ? 'scale-110 ring-2 ring-emerald-500 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 p-2.5 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة وتثبيت الحساب في الصندوق'}</span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/60 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف هذا الحساب نهائياً</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
