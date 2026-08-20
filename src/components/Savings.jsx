import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate } from '../utils/formatters';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';
import confetti from 'canvas-confetti';
import {
  PiggyBank,
  Plus,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  Trash2,
  Edit2,
  X,
  Check,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const Savings = () => {
  const { settings, savings, addSavingsGoal, updateSavingsAmount, deleteSavingsGoal } = useFinance();
  const currency = settings.currencySymbol;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [actionType, setActionType] = useState('deposit'); // deposit | withdraw
  const [actionAmount, setActionAmount] = useState('');

  // Add goal form state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#059669');
  const [icon, setIcon] = useState('PiggyBank');
  const [notes, setNotes] = useState('');

  // Total summary
  const totalTarget = savings.reduce((acc, s) => acc + (s.targetAmount || 0), 0);
  const totalCurrent = savings.reduce((acc, s) => acc + (s.currentAmount || 0), 0);
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

  const handleOpenAdd = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setColor('#059669');
    setIcon('PiggyBank');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenAction = (goal, type) => {
    setSelectedGoal(goal);
    setActionType(type);
    setActionAmount('');
    setIsActionModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0) {
      alert('يرجى كتابة اسم الهدف والمبلغ المستهدف');
      return;
    }
    addSavingsGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline,
      color,
      icon,
      notes,
    });
    setIsAddModalOpen(false);
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionAmount || Number(actionAmount) <= 0 || !selectedGoal) return;

    const delta = actionType === 'deposit' ? Number(actionAmount) : -Number(actionAmount);
    updateSavingsAmount(selectedGoal.id, delta);

    // If goal reached 100%, trigger confetti!
    if (actionType === 'deposit' && (selectedGoal.currentAmount || 0) + Number(actionAmount) >= selectedGoal.targetAmount) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }
    }

    setIsActionModalOpen(false);
  };

  const colorOptions = ['#059669', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#6366f1'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            أهداف الادخار وحصالة البيت
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            حدد أهدافاً مالية واضحة للأسرة وتابع حصيلتك للوصول إليها بنجاح
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء هدف ادخار جديد</span>
        </button>
      </div>

      {/* Top Banner Card */}
      <div className="bg-gradient-to-l from-purple-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-purple-900/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              إجمالي مدخرات الحصالة
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">
              {formatMoney(totalCurrent, currency)}{' '}
              <span className="text-xs font-normal text-slate-400">
                من إجمالي الأهداف المطلوبة ({formatMoney(totalTarget, currency)})
              </span>
            </h3>
          </div>

          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black text-purple-400">
              %{overallPercent}
            </span>
            <p className="text-xs text-slate-400">متوسط الإنجاز الكلي</p>
          </div>
        </div>

        <div className="w-full h-3 bg-purple-950/80 rounded-full mt-4 overflow-hidden relative z-10">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savings.map((s) => {
          const percent = s.targetAmount > 0 ? Math.min(100, Math.round(((s.currentAmount || 0) / s.targetAmount) * 100)) : 0;
          const remaining = Math.max(0, s.targetAmount - (s.currentAmount || 0));
          const isDone = (s.currentAmount || 0) >= s.targetAmount;

          return (
            <div
              key={s.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition shadow-sm flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: s.color || '#059669' }}
                    >
                      <CategoryIcon name={s.icon || 'PiggyBank'} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-base text-slate-800 dark:text-white truncate">
                        {s.title}
                      </h4>
                      {s.deadline && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          الموعد: {formatArabicDate(s.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف هدف "${s.title}"؟`)) {
                        deleteSavingsGoal(s.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount and Percent */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {formatMoney(s.currentAmount || 0, currency)}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        المستهدف: {formatMoney(s.targetAmount, currency)}
                      </p>
                    </div>
                    <span
                      className={`text-xl font-black ${
                        isDone ? 'text-emerald-500' : 'text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      %{percent}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    {isDone ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        مبروك! تم اكتمال الهدف
                      </span>
                    ) : (
                      <span>
                        المتبقي: <strong className="text-slate-700 dark:text-slate-300">{formatMoney(remaining, currency)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {s.notes && (
                  <p className="text-xs text-slate-400 mt-3 italic bg-slate-50 dark:bg-slate-750 p-2 rounded-xl">
                    {s.notes}
                  </p>
                )}
              </div>

              {/* Action buttons (Deposit / Withdraw) */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => handleOpenAction(s, 'deposit')}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>إيداع بالحفظ</span>
                </button>
                <button
                  onClick={() => handleOpenAction(s, 'withdraw')}
                  disabled={(s.currentAmount || 0) <= 0}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-50 transition"
                  title="سحب مبلغ من الهدف"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>سحب</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Savings Goal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-600" />
                <span>إنشاء هدف ادخار جديد</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اسم الهدف *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: صندوق الطوارئ، مصاريف الصيف، شراء غسالة"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    المبلغ المستهدف ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    المبلغ الحالي المتوفر
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  تاريخ الإنجاز المستهدف (اختياري)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  لون تمييز الهدف
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-800 dark:ring-white ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول الهدف..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>حفظ الهدف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit / Withdraw from Goal */}
      {isActionModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                {actionType === 'deposit' ? 'إيداع في الحصالة' : 'سحب من الحصالة'}
              </h3>
              <button onClick={() => setIsActionModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              الهدف: <strong className="text-purple-600 font-bold">{selectedGoal.title}</strong>
              <div className="mt-1 text-slate-400">
                الرصيد الحالي: {formatMoney(selectedGoal.currentAmount || 0, currency)}
              </div>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  المبلغ ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xl font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 text-center"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 ${
                  actionType === 'deposit'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 shadow-slate-700/30'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{actionType === 'deposit' ? 'تأكيد الإيداع' : 'تأكيد السحب'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
