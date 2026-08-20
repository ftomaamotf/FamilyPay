import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatNumber, formatArabicDate, getMonthName } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Calendar,
  Sparkles,
  HandCoins
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export const Dashboard = ({ onOpenTransactionModal, onOpenAddDebt, onOpenAddSavings, setActiveTab, onEditTransaction }) => {
  const {
    settings,
    monthlyStats,
    filteredMonthTransactions,
    expenseCategories,
    incomeCategories,
    categorySpendingMap,
    budgets,
    debts,
    savings,
    deleteTransaction
  } = useFinance();

  const currency = settings.currencySymbol;
  const monthName = getMonthName(settings.selectedMonth - 1);

  // Total budgeted amount for the month
  const totalBudgeted = budgets.reduce((acc, b) => acc + (b.limit || 0), 0);
  const budgetSpentPercent = totalBudgeted > 0 ? Math.round((monthlyStats.expense / totalBudgeted) * 100) : 0;

  // Prepare Doughnut Chart Data (Expenses by Category)
  const expenseCategoriesWithSpending = expenseCategories
    .map((cat) => ({
      ...cat,
      spent: categorySpendingMap[cat.id] || 0
    }))
    .filter((cat) => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const doughnutData = {
    labels: expenseCategoriesWithSpending.map((c) => c.name),
    datasets: [
      {
        data: expenseCategoriesWithSpending.map((c) => c.spent),
        backgroundColor: expenseCategoriesWithSpending.map((c) => c.color || '#10b981'),
        borderWidth: 2,
        borderColor: settings.darkMode ? '#1e293b' : '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { family: 'Cairo', size: 11 },
          color: settings.darkMode ? '#cbd5e1' : '#475569',
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${formatMoney(item.raw, currency)}`,
        },
      },
    },
    cutout: '68%',
  };

  // Bar Chart Data (Comparison: Income vs Expense vs Net)
  const barData = {
    labels: ['الدخل', 'المصروفات', 'المتبقي'],
    datasets: [
      {
        label: 'المبلغ',
        data: [monthlyStats.income, monthlyStats.expense, Math.max(0, monthlyStats.net)],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)', // Emerald
          'rgba(244, 63, 94, 0.85)',   // Rose
          'rgba(59, 130, 246, 0.85)',  // Blue
        ],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${formatMoney(item.raw, currency)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { family: 'Cairo' }, color: settings.darkMode ? '#cbd5e1' : '#64748b' },
        grid: { display: false },
      },
      y: {
        ticks: { font: { family: 'Cairo' }, color: settings.darkMode ? '#cbd5e1' : '#64748b' },
        grid: { color: settings.darkMode ? '#334155' : '#f1f5f9' },
      },
    },
  };

  // Recent 6 transactions
  const recentTransactions = filteredMonthTransactions.slice(0, 6);

  // Active debts with upcoming due dates
  const activeDebts = debts.filter((d) => d.status !== 'completed').slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Month Title & Subtitle Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ملخص ميزانية الشهر</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold">
            حسابات شهر {monthName} {settings.selectedYear}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
            {monthlyStats.net >= 0
              ? `أحسنت! لديك فائض مالي قدره ${formatMoney(monthlyStats.net, currency)} متاح للادخار أو الاستثمار.`
              : `تنبيه: المصروفات تجاوزت الدخل بمقدار ${formatMoney(Math.abs(monthlyStats.net), currency)}.`}
          </p>
        </div>

        {/* Action Buttons in Banner */}
        <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenTransactionModal('expense')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow transition active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>تسجيل مصروف</span>
          </button>
          <button
            onClick={() => onOpenTransactionModal('income')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل دخل</span>
          </button>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-10 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الدخل</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(monthlyStats.income, currency)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">خلال الشهر المحدد</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المصروفات</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatMoney(monthlyStats.expense, currency)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {monthlyStats.income > 0
                ? `${Math.round((monthlyStats.expense / monthlyStats.income) * 100)}% من إجمالي الدخل`
                : 'إجمالي المنصرف'}
            </span>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الرصيد المتبقي</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                monthlyStats.net >= 0
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-lg sm:text-2xl font-black ${
                monthlyStats.net >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {formatMoney(monthlyStats.net, currency)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {monthlyStats.net >= 0 ? 'فائض مالي متاح' : 'عجز مالي'}
            </span>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نسبة الادخار</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              %{monthlyStats.rate}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">من إجمالي الدخل الشهري</span>
          </div>
        </div>

      </div>

      {/* Monthly Budget Consumption Progress Bar */}
      {totalBudgeted > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                استهلاك سقف الميزانية التقديرية للشهر
              </span>
              {budgetSpentPercent > 100 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3 h-3" />
                  تم تجاوز الميزانية
                </span>
              ) : budgetSpentPercent >= 80 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  اقتربت من الحد الأقصى
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  في النطاق الآمن
                </span>
              )}
            </div>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {formatMoney(monthlyStats.expense, currency)} / {formatMoney(totalBudgeted, currency)}
            </span>
          </div>

          {/* Bar track */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSpentPercent > 100
                  ? 'bg-rose-500'
                  : budgetSpentPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetSpentPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
            <span>تم استهلاك {budgetSpentPercent}%</span>
            <span>
              المتبقي من سقف الميزانية:{' '}
              <strong className={totalBudgeted - monthlyStats.expense < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>
                {formatMoney(totalBudgeted - monthlyStats.expense, currency)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Doughnut Chart: Expenses by Category */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white flex items-center gap-2">
              <span>توزيع المصروفات حسب التصنيف</span>
            </h3>
            <span className="text-xs text-slate-400">
              {expenseCategoriesWithSpending.length} تصنيفات نشطة
            </span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            {expenseCategoriesWithSpending.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-400 py-8">
                <PiggyBank className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                <p className="text-xs">لا توجد مصروفات مسجلة لهذا الشهر بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Comparison */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
              مقارنة الدخل والمصروف والمتبقي
            </h3>
            <span className="text-xs text-slate-400">مؤشرات الأداء</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            {monthlyStats.income > 0 || monthlyStats.expense > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Wallet className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                <p className="text-xs">سجل أول معاملة لتظهر المقارنة البيانية</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Transactions & Active Debts/Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                آخر المعاملات المسجلة
              </h3>
              <p className="text-xs text-slate-400">أحدث الحركات المالية لشهر {monthName}</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {recentTransactions.map((t) => {
                const category =
                  (t.type === 'income' ? incomeCategories : expenseCategories).find(
                    (c) => c.id === t.categoryId
                  ) || { name: 'غير محدد', icon: 'HelpCircle', color: '#94a3b8' };

                return (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: category.color || '#10b981' }}
                      >
                        <CategoryIcon name={category.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{category.name}</span>
                          <span>•</span>
                          <span>{formatArabicDate(t.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          t.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p className="text-xs">لم يتم تسجيل أي معاملات في هذا الشهر حتى الآن.</p>
              <button
                onClick={() => onOpenTransactionModal('expense')}
                className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
              >
                + أضف أول معاملة الآن
              </button>
            </div>
          )}
        </div>

        {/* Debts & Savings Quick Widget (1 col on large screen) */}
        <div className="space-y-6">
          
          {/* Active Debts Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <HandCoins className="w-4 h-4 text-orange-500" />
                <span>أقرب الأقساط والديون</span>
              </h3>
              <button
                onClick={() => setActiveTab('debts')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                الكل
              </button>
            </div>

            {activeDebts.length > 0 ? (
              <div className="space-y-3">
                {activeDebts.map((d) => {
                  const remaining = d.amount - (d.paidAmount || 0);
                  const percent = d.amount > 0 ? Math.round(((d.paidAmount || 0) / d.amount) * 100) : 0;
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
                          {d.title}
                        </span>
                        <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
                          {formatMoney(remaining, currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>سددت {percent}%</span>
                        {d.dueDate && <span>الاستحقاق: {formatArabicDate(d.dueDate)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد أقساط أو ديون مسجلة</p>
            )}
          </div>

          {/* Savings Goals Widget */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-purple-500" />
                <span>حصالة وأهداف الادخار</span>
              </h3>
              <button
                onClick={() => setActiveTab('savings')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                الكل
              </button>
            </div>

            {savings.length > 0 ? (
              <div className="space-y-3">
                {savings.slice(0, 2).map((s) => {
                  const percent = s.targetAmount > 0 ? Math.min(100, Math.round(((s.currentAmount || 0) / s.targetAmount) * 100)) : 0;
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
                          {s.title}
                        </span>
                        <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                          {formatMoney(s.currentAmount, currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/50 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>إنجاز: {percent}%</span>
                        <span>الهدف: {formatMoney(s.targetAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد أهداف ادخار مسجلة</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
