import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { toEnglishDigits } from '../utils/formatters';
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
  Palette,
  ShieldAlert,
  KeyRound,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

export const AddEditBrotherModal = ({ isOpen, onClose, brotherToEdit = null }) => {
  const { addBrother, updateBrother, deleteBrother, brothers, activeAdminId, currentUser } = useFinance();

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('ماستر كي / Qi Card');
  const [password, setPassword] = useState('123');
  const [avatarColor, setAvatarColor] = useState('#10b981');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Deletion Confirmation States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

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
        accountNumber: toEnglishDigits(accountNumber).trim(),
        phone: toEnglishDigits(phone).trim(),
        bankAccountNumber: toEnglishDigits(bankAccountNumber).trim() || toEnglishDigits(accountNumber).trim(),
        bankName: bankName.trim(),
        password: toEnglishDigits(password).trim(),
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
        accountNumber: toEnglishDigits(accountNumber).trim(),
        phone: toEnglishDigits(phone).trim(),
        bankAccountNumber: toEnglishDigits(bankAccountNumber).trim() || toEnglishDigits(accountNumber).trim(),
        bankName: bankName.trim(),
        password: toEnglishDigits(password).trim(),
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

  const handleOpenDeleteConfirm = () => {
    if (brotherToEdit?.id === activeAdminId) {
      alert('لا يمكن حذف حساب الأدمن الحالي، قم بتحويل صلاحية الأدمن لأخ آخر أولاً');
      return;
    }
    setShowDeleteConfirm(true);
    setDeletionReason('');
    setAdminPassword('');
    setDeleteErrorMsg('');
  };

  const handleConfirmDelete = async () => {
    if (brotherToEdit?.id === activeAdminId) {
      setDeleteErrorMsg('لا يمكن حذف حساب الأدمن الحالي، قم بتحويل صلاحية الأدمن لأخ آخر أولاً');
      return;
    }
    if (!deletionReason.trim()) {
      setDeleteErrorMsg('يرجى كتابة سبب الحذف لتأكيد العملية');
      return;
    }
    if (!adminPassword.trim()) {
      setDeleteErrorMsg('يرجى إدخال كلمة مرور الأدمن للتأكيد الأمني');
      return;
    }

    setLoading(true);
    setDeleteErrorMsg('');
    const res = await deleteBrother(brotherToEdit.id, {
      adminPassword: toEnglishDigits(adminPassword).trim(),
      deletionReason: deletionReason.trim()
    });
    setLoading(false);
    if (res.success) {
      alert('✅ ' + res.message);
      onClose();
    } else {
      setDeleteErrorMsg(res.message);
    }
  };

  const presetColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6366f1', '#0f766e', '#854d0e'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between text-white transition-colors ${
          showDeleteConfirm 
            ? 'border-rose-800 bg-gradient-to-l from-slate-900 via-rose-950 to-slate-900' 
            : 'border-slate-100 dark:border-slate-700 bg-gradient-to-l from-slate-900 via-teal-950 to-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              showDeleteConfirm
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {showDeleteConfirm ? (
                <ShieldAlert className="w-5 h-5" />
              ) : isEditing ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-black text-base">
                {showDeleteConfirm
                  ? 'تأكيد أمني: حذف الحساب نهائياً'
                  : isEditing
                  ? `تعديل بيانات الحساب: ${brotherToEdit?.name}`
                  : 'إضافة أخ / حساب جديد للصندوق'}
              </h3>
              <p className={`text-xs ${showDeleteConfirm ? 'text-rose-300' : 'text-emerald-200'}`}>
                {showDeleteConfirm
                  ? 'يتطلب إدخال سبب الحذف وكلمة مرور الأدمن'
                  : 'مع رقم الهاتف لاستعادة الرمز السري'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {showDeleteConfirm ? (
          /* Deletion Confirmation Screen */
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="font-black text-rose-700 dark:text-rose-300 text-sm">
                تحذير أمني: حذف نهائي لا رجعة فيه
              </h4>
              <p className="text-xs text-rose-700/90 dark:text-rose-300/90 leading-relaxed font-semibold">
                أنت على وشك حذف حساب الأخ (<span className="underline font-black">{brotherToEdit?.name}</span>) ورقم حسابه ({brotherToEdit?.accountNumber}) نهائياً من الصندوق. لن يتمكن من تسجيل الدخول بعد الآن.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* 1. Deletion Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>سبب حذف الحساب <span className="text-rose-500 font-bold">*</span>:</span>
                </label>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="مثال: إنهاء الاشتراك بالصندوق، خروج من العائلة، حساب مكرر..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500 transition resize-none font-medium"
                />
              </div>

              {/* 2. Admin Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                  <span>كلمة مرور الأدمن للتأكيد الأمني <span className="text-rose-500 font-bold">*</span>:</span>
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور حساب الأدمن للتأكيد"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500 transition font-mono pr-3.5 pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  حماية أمنية مشددة: يُشترط إدخال كلمة مرور الأدمن لمنع الحذف بالخطأ.
                </p>
              </div>

              {deleteErrorMsg && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 p-2.5 rounded-xl border border-rose-200">
                  {deleteErrorMsg}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={loading || !deletionReason.trim() || !adminPassword.trim()}
                  onClick={handleConfirmDelete}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{loading ? 'جارٍ التحقق وحذف الحساب نهائياً...' : 'تأكيد الحذف النهائي للحساب'}</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteErrorMsg('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  إلغاء والعودة لبيانات الحساب
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Form Body */
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

            {/* 3. Phone Number */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الهاتف المعتمد *</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">(مطلوب لاستعادة الرمز السري)</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0770xxxxxxx أو 0780xxxxxxx"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white text-left outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 4. Bank Account Number */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم الحساب المصرفي / البطاقة للتحويل:</span>
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="مثال: 9256869125 أو رقم بطاقة ماستر"
                dir="ltr"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white text-left outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 5. Bank Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>اسم المصرف / جهة البطاقة:</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="مثال: ماستر كي / Qi Card"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  onClick={handleOpenDeleteConfirm}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف هذا الحساب نهائياً</span>
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
