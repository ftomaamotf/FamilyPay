import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, getMonthName } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  X,
  Check
} from 'lucide-react';

export const Budgets = () => {
  const {
    settings,
    expenseCategories,
    budgetProgressList,
    setCategoryBudget,
    deleteBudget,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const currency = settings.currencySymbol;
  const monthName = getMonthName(settings.selectedMonth - 1);

  // Categories that don't have a budget yet
  const unbudgetedCats = expenseCategories.filter(
    (c) => !budgetProgressList.some((b) => b.categoryId === c.id)
  );

  const handleOpenAdd = () => {
    if (unbudgetedCats.length > 0) {
      setSelectedCatId(unbudgetedCats[0].id);
    } else if (expenseCategories.length > 0) {
      setSelectedCatId(expenseCategories[0].id);
    }
    setBudgetLimit('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setSelectedCatId(budget.categoryId);
    setBudgetLimit(String(budget.limit));
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCatId || !budgetLimit || Number(budgetLimit) <= 0) {
      alert('يرجى تحديد التصنيف وإدخال حد ميزانية صحيح');
      return;
    }
    setCategoryBudget(selectedCatId, Number(budgetLimit));
    setIsModalOpen(false);
  };

  // Totals
  const totalLimit = budgetProgressList.reduce((acc, b) => acc + (b.limit || 0), 0);
  const totalSpent = budgetProgressList.reduce((acc, b) => acc + (b.spent || 0), 0);
  const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            الميزانيات والسقوف الشهرية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            حدد سقفاً مالياً لكل بند لتجنب المصاريف الزائدة ومتابعة التوفير
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تحديد ميزانية تصنيف</span>
        </button>
      </div>

      {/* Overall Budget Status Card */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              متابعة ميزانية شهر {monthName}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
              {formatMoney(totalSpent, currency)}{' '}
              <span className="text-sm font-normal text-slate-400">
                من إجمالي الميزانية المحددة ({formatMoney(totalLimit, currency)})
              </span>
            </h3>
          </div>

          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              %{overallPercent}
            </span>
            <p className="text-xs text-slate-400">نسبة الاستهلاك الإجمالي</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-700/80 rounded-full mt-4 overflow-hidden relative z-10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercent > 100 ? 'bg-rose-500' : overallPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetProgressList.map((b) => {
          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition shadow-sm ${
                b.isOver
                  ? 'border-rose-300 dark:border-rose-800/60 ring-1 ring-rose-400/30'
                  : b.isWarning
                  ? 'border-amber-300 dark:border-amber-800/60'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: b.category.color || '#10b981' }}
                  >
                    <CategoryIcon name={b.category.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                      {b.category.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      السقف المحدد: {formatMoney(b.limit, currency)}
                    </span>
                  </div>
                </div>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="تعديل الحد"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من إلغاء ميزانية "${b.category.name}"؟`)) {
                        deleteBudget(b.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-600 dark:text-slate-300">
                    المنصرف: {formatMoney(b.spent, currency)}
                  </span>
                  <span
                    className={
                      b.isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : b.isWarning
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    %{b.percent}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.isOver
                        ? 'bg-rose-500'
                        : b.isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percent)}%` }}
                  />
                </div>
              </div>

              {/* Footer Status Badge */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                {b.isOver ? (
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    تجاوزت الميزانية بـ {formatMoney(Math.abs(b.remaining), currency)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    متبقي من السقف: <strong className="text-emerald-600 dark:text-emerald-400">{formatMoney(b.remaining, currency)}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <span>تحديد سقف ميزانية شهري</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اختر التصنيف
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-slate-800">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  سقف الميزانية الشهري ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="مثال: 3000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>حفظ الميزانية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
