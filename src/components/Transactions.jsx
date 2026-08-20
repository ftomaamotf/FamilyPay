import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate, exportToExcel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_PAYMENT_METHODS } from '../utils/defaultData';
import {
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  X
} from 'lucide-react';

export const Transactions = ({ onOpenTransactionModal, onEditTransaction }) => {
  const {
    transactions,
    expenseCategories,
    incomeCategories,
    allCategories,
    members,
    settings,
    deleteTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | expense | income
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [dateFilterMode, setDateFilterMode] = useState('month'); // month | all | custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const currency = settings.currencySymbol;

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(term);
        const matchesNotes = t.notes?.toLowerCase().includes(term);
        const matchesAmount = String(t.amount).includes(term);
        if (!matchesTitle && !matchesNotes && !matchesAmount) return false;
      }

      // 2. Type filter
      if (filterType !== 'all' && t.type !== filterType) return false;

      // 3. Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;

      // 4. Member filter
      if (selectedMember !== 'all' && t.memberId !== selectedMember) return false;

      // 5. Payment method
      if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) return false;

      // 6. Date filtering
      if (dateFilterMode === 'month') {
        if (!t.date) return false;
        const d = new Date(t.date);
        if (
          d.getFullYear() !== Number(settings.selectedYear) ||
          d.getMonth() + 1 !== Number(settings.selectedMonth)
        ) {
          return false;
        }
      } else if (dateFilterMode === 'custom') {
        if (customStartDate && t.date < customStartDate) return false;
        if (customEndDate && t.date > customEndDate) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    filterType,
    selectedCategory,
    selectedMember,
    selectedPaymentMethod,
    dateFilterMode,
    customStartDate,
    customEndDate,
    settings.selectedYear,
    settings.selectedMonth,
  ]);

  // Statistics for the filtered view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredList.forEach((t) => {
      const val = Number(t.amount) || 0;
      if (t.type === 'income') income += val;
      else expense += val;
    });
    return { income, expense, net: income - expense, count: filteredList.length };
  }, [filteredList]);

  // Handle Export to Excel
  const handleExport = () => {
    exportToExcel(
      filteredList,
      allCategories,
      currency,
      `سجل_حسابات_المنزل_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedCategory('all');
    setSelectedMember('all');
    setSelectedPaymentMethod('all');
    setDateFilterMode('month');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            سجل المعاملات المالية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            تصفح، ابحث، وفلتر كافة المصروفات والإيرادات بدقة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          {/* Add New Transaction */}
          <button
            onClick={() => onOpenTransactionModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة معاملة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        
        {/* Search Bar & Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، البيان، الملاحظات، أو المبلغ..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="md:col-span-5 flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-500 dark:text-slate-400'
              }`}
            >
              المصروفات
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-500 dark:text-slate-400'
              }`}
            >
              الدخل
            </button>
          </div>

        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">التصنيف</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع التصنيفات</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Member Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">الشخص</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع أفراد الأسرة</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-slate-800">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">طريقة الدفع</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع وسائل الدفع</option>
              {DEFAULT_PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id} className="dark:bg-slate-800">
                  {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">الفترة الزمنية</label>
            <select
              value={dateFilterMode}
              onChange={(e) => setDateFilterMode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-white font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="month">الشهر المحدد في الأعلى</option>
              <option value="all">كل المعاملات المسجلة</option>
              <option value="custom">تحديد تاريخ مخصص</option>
            </select>
          </div>

        </div>

        {/* Custom Date Range Picker */}
        {dateFilterMode === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <span className="font-bold text-slate-500">من تاريخ:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white"
            />
            <span className="font-bold text-slate-500">إلى تاريخ:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white"
            />
          </div>
        )}

      </div>

      {/* Filtered Results Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span>عدد المعاملات:</span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm">
            {summary.count}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-emerald-600 dark:text-emerald-400">
            <span>إجمالي الدخل: </span>
            <span className="font-extrabold">{formatMoney(summary.income, currency)}</span>
          </div>
          <div className="text-rose-600 dark:text-rose-400">
            <span>إجمالي المصروف: </span>
            <span className="font-extrabold">{formatMoney(summary.expense, currency)}</span>
          </div>
          <div className={summary.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}>
            <span>الصافي: </span>
            <span className="font-extrabold">{formatMoney(summary.net, currency)}</span>
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {filteredList.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredList.map((t) => {
              const category = allCategories.find((c) => c.id === t.categoryId) || {
                name: 'غير محدد',
                icon: 'HelpCircle',
                color: '#94a3b8',
              };
              const member = members.find((m) => m.id === t.memberId) || { name: 'المنزل' };
              const pm = DEFAULT_PAYMENT_METHODS.find((p) => p.id === t.paymentMethod) || {
                name: 'نقدي',
              };

              return (
                <div
                  key={t.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition group"
                >
                  {/* Left info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: category.color || '#10b981' }}
                    >
                      <CategoryIcon name={category.icon} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">
                          {t.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {t.type === 'income' ? 'دخل' : 'مصروف'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {category.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatArabicDate(t.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {pm.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {member.name}
                        </span>
                      </div>

                      {t.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                          ملاحظة: {t.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/40">
                    <div className="text-right">
                      <span
                        className={`text-base sm:text-lg font-black ${
                          t.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount, currency)}
                      </span>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(t)}
                        title="تعديل"
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف معاملة "${t.title}"؟`)) {
                            deleteTransaction(t.id);
                          }
                        }}
                        title="حذف"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 stroke-1" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              لا توجد معاملات مطابقة لخيارات البحث أو الفلترة
            </p>
            <button
              onClick={resetFilters}
              className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
