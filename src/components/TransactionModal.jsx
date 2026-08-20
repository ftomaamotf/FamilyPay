import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_PAYMENT_METHODS } from '../utils/defaultData';
import {
  X,
  Plus,
  Check,
  Calendar,
  CreditCard,
  User,
  FileText,
  DollarSign,
  Tag
} from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose, initialType = 'expense', editData = null }) => {
  const {
    settings,
    expenseCategories,
    incomeCategories,
    members,
    addTransaction,
    editTransaction,
  } = useFinance();

  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [memberId, setMemberId] = useState('mem-family');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Update form when opening for edit or new
  useEffect(() => {
    if (editData) {
      setType(editData.type || 'expense');
      setAmount(editData.amount ? String(editData.amount) : '');
      setTitle(editData.title || '');
      setCategoryId(editData.categoryId || '');
      setPaymentMethod(editData.paymentMethod || 'cash');
      setMemberId(editData.memberId || 'mem-family');
      setDate(editData.date || new Date().toISOString().split('T')[0]);
      setNotes(editData.notes || '');
    } else {
      setType(initialType);
      setAmount('');
      setTitle('');
      setPaymentMethod('cash');
      setMemberId('mem-family');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      // set default category
      const currentCats = initialType === 'income' ? incomeCategories : expenseCategories;
      if (currentCats.length > 0) {
        setCategoryId(currentCats[0].id);
      }
    }
  }, [isOpen, editData, initialType, expenseCategories, incomeCategories]);

  // When type changes, ensure valid category is chosen
  const handleTypeChange = (newType) => {
    setType(newType);
    const available = newType === 'income' ? incomeCategories : expenseCategories;
    if (available.length > 0 && (!categoryId || !available.some((c) => c.id === categoryId))) {
      setCategoryId(available[0].id);
    }
  };

  const handleQuickAmount = (val) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!title.trim()) {
      alert('يرجى كتابة بيان / وصف المعاملة');
      return;
    }

    const payload = {
      type,
      amount: Number(amount),
      title: title.trim(),
      categoryId: categoryId || (type === 'income' ? incomeCategories[0]?.id : expenseCategories[0]?.id),
      paymentMethod,
      memberId,
      date,
      notes: notes.trim(),
    };

    if (editData && editData.id) {
      editTransaction(editData.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const quickSuggestions =
    type === 'expense'
      ? ['سوبرماركت وبقالة', 'خضار وفواكه', 'فاتورة كهرباء', 'بنزين سيارة', 'صيدلية وعلاج', 'مصاريف مدرسة', 'مطعم وخروج']
      : ['راتب الشهر', 'مكافأة إضافية', 'أرباح مشروع', 'قبض جمعية', 'إيجار عقار'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {type === 'income' ? <Plus className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-white">
                {editData ? 'تعديل المعاملة' : 'تسجيل معاملة جديدة'}
              </h2>
              <p className="text-xs text-slate-400">سجل حركاتك المالية بدقة وسرعة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Type Selector (Expense vs Income) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              مصروف (منصرف)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              دخل (إيراد)
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              المبلغ ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl sm:text-3xl font-black bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition text-center"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {settings.currencySymbol}
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {[50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-600 transition"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              البيان / الوصف *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مشتريات سوبرماركت، فاتورة كهرباء..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTitle(s)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              التصنيف *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-700 rounded-xl">
              {currentCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-right transition border text-xs font-bold ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Columns: Payment Method & Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {DEFAULT_PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id} className="dark:bg-slate-800">
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Family Member */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                الشخص القائم بالصرف
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="dark:bg-slate-800">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Date & Notes Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تفاصيل أو ملاحظات..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-600/30'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{editData ? 'حفظ التعديلات' : 'حفظ المعاملة'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
