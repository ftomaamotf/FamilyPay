import React, { useMemo, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate, getMonthName, exportToExcel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_PAYMENT_METHODS } from '../utils/defaultData';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  User,
  CreditCard
} from 'lucide-react';

export const Reports = () => {
  const {
    settings,
    filteredMonthTransactions,
    monthlyStats,
    expenseCategories,
    incomeCategories,
    allCategories,
    members,
    debts,
    savings,
  } = useFinance();

  const currency = settings.currencySymbol;
  const monthName = getMonthName(settings.selectedMonth - 1);

  // Group expenses by category
  const categoryStats = useMemo(() => {
    const map = {};
    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount);
      });

    return expenseCategories
      .map((cat) => ({
        ...cat,
        total: map[cat.id] || 0,
        percent: monthlyStats.expense > 0 ? Math.round(((map[cat.id] || 0) / monthlyStats.expense) * 100) : 0,
      }))
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredMonthTransactions, expenseCategories, monthlyStats.expense]);

  // Group spending by family members
  const memberStats = useMemo(() => {
    const map = {};
    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.memberId] = (map[t.memberId] || 0) + Number(t.amount);
      });

    return members
      .map((m) => ({
        ...m,
        total: map[m.id] || 0,
        percent: monthlyStats.expense > 0 ? Math.round(((map[m.id] || 0) / monthlyStats.expense) * 100) : 0,
      }))
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredMonthTransactions, members, monthlyStats.expense]);

  // Group spending by payment methods
  const paymentStats = useMemo(() => {
    const map = {};
    filteredMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.paymentMethod] = (map[t.paymentMethod] || 0) + Number(t.amount);
      });

    return DEFAULT_PAYMENT_METHODS.map((pm) => ({
      ...pm,
      total: map[pm.id] || 0,
      percent: monthlyStats.expense > 0 ? Math.round(((map[pm.id] || 0) / monthlyStats.expense) * 100) : 0,
    })).filter((pm) => pm.total > 0);
  }, [filteredMonthTransactions, monthlyStats.expense]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportToExcel(
      filteredMonthTransactions,
      allCategories,
      currency,
      `تقرير_شهر_${monthName}_${settings.selectedYear}.xlsx`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            التقارير المالية وكشف الحساب
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            تقرير تفصيلي شامل لشهر {monthName} {settings.selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الحساب A4</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet Layout */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6 print-card">
        
        {/* Printable Header Banner */}
        <div className="border-b-2 border-emerald-600 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              كشف الحساب المالي للمنزل
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              الفترة: شهر <strong>{monthName} {settings.selectedYear}</strong>
            </p>
          </div>
          <div className="text-left text-xs text-slate-400">
            <p>تاريخ إصدار التقرير:</p>
            <p className="font-bold text-slate-700 dark:text-slate-300">
              {formatArabicDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* 4 Big Summary Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-xs text-slate-400 font-bold block">إجمالي الدخل</span>
            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(monthlyStats.income, currency)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">إجمالي المصاريف</span>
            <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
              {formatMoney(monthlyStats.expense, currency)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">الرصيد المتبقي (الصافي)</span>
            <span
              className={`text-lg sm:text-xl font-black ${
                monthlyStats.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600'
              }`}
            >
              {formatMoney(monthlyStats.net, currency)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">نسبة التوفير</span>
            <span className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
              %{monthlyStats.rate}
            </span>
          </div>
        </div>

        {/* Breakdown Tables in 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top Spending Categories Table */}
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>تفصيل المصروفات حسب البنود</span>
            </h3>

            {categoryStats.length > 0 ? (
              <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">البند / التصنيف</th>
                      <th className="p-2.5">المبلغ</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {categoryStats.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span>{c.name}</span>
                        </td>
                        <td className="p-2.5 font-extrabold text-slate-800 dark:text-white">
                          {formatMoney(c.total, currency)}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-500">%{c.percent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد بيانات مصروفات مسجلة</p>
            )}
          </div>

          {/* Members & Payment methods */}
          <div className="space-y-5">
            {/* Members breakdown */}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <span>توزيع الصرف حسب أفراد الأسرة</span>
              </h3>

              <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">الشخص</th>
                      <th className="p-2.5">المبلغ</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {memberStats.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-bold">{m.name}</td>
                        <td className="p-2.5 font-extrabold">{formatMoney(m.total, currency)}</td>
                        <td className="p-2.5 text-center font-bold">%{m.percent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>وسائل الدفع المستخدمة</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {paymentStats.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-600 dark:text-slate-300">{pm.name}</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      {formatMoney(pm.total, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Transactions Table in Statement */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white mb-3">
            سجل كافة الحركات المالية للشهر ({filteredMonthTransactions.length} حركة)
          </h3>

          <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-right">
              <thead className="bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">البيان / الوصف</th>
                  <th className="p-2.5">التصنيف</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredMonthTransactions.map((t) => {
                  const cat = allCategories.find((c) => c.id === t.categoryId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-slate-400">{t.date}</td>
                      <td className="p-2.5 font-bold text-slate-800 dark:text-white">{t.title}</td>
                      <td className="p-2.5 text-slate-500">{cat?.name || t.categoryId}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'income'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {t.type === 'income' ? 'دخل' : 'مصروف'}
                        </span>
                      </td>
                      <td
                        className={`p-2.5 font-extrabold ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer for Print */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div>تم إنشاء هذا التقرير بواسطة تطبيق «مصاريف بيتي» لإدارة ميزانية الأسرة</div>
          <div>التوقيع / الاعتماد: _________________</div>
        </div>

      </div>

    </div>
  );
};
