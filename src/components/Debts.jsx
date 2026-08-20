import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate } from '../utils/formatters';
import {
  HandCoins,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  Trash2,
  Edit2,
  X,
  Check,
  CreditCard
} from 'lucide-react';

export const Debts = () => {
  const { settings, debts, addDebt, updateDebtPayment, deleteDebt, editDebt } = useFinance();
  const currency = settings.currencySymbol;

  const [activeTab, setActiveTab] = useState('all'); // all | debt_on_us | debt_to_us | gamya
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [autoLogTx, setAutoLogTx] = useState(true);

  // Form state for adding debt
  const [title, setTitle] = useState('');
  const [type, setType] = useState('debt_on_us');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [person, setPerson] = useState('');
  const [notes, setNotes] = useState('');

  // Summary Totals
  const totalOwedByUs = debts
    .filter((d) => d.type === 'debt_on_us' && d.status !== 'completed')
    .reduce((acc, d) => acc + (d.amount - (d.paidAmount || 0)), 0);

  const totalOwedToUs = debts
    .filter((d) => d.type === 'debt_to_us' && d.status !== 'completed')
    .reduce((acc, d) => acc + (d.amount - (d.paidAmount || 0)), 0);

  const totalGamya = debts
    .filter((d) => d.type === 'gamya' && d.status !== 'completed')
    .reduce((acc, d) => acc + (d.amount - (d.paidAmount || 0)), 0);

  // Filtered List
  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'all') return true;
    return d.type === activeTab;
  });

  const handleOpenAdd = (defaultType = 'debt_on_us') => {
    setTitle('');
    setType(defaultType);
    setAmount('');
    setPaidAmount('0');
    setMonthlyInstallment('');
    setDueDate('');
    setPerson('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenPay = (debt) => {
    setSelectedDebt(debt);
    setPayAmount(debt.monthlyInstallment ? String(debt.monthlyInstallment) : '');
    setAutoLogTx(true);
    setIsPayModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      alert('يرجى كتابة البيان وتحديد المبلغ');
      return;
    }
    addDebt({
      title,
      type,
      amount: Number(amount),
      paidAmount: Number(paidAmount) || 0,
      monthlyInstallment: Number(monthlyInstallment) || 0,
      dueDate,
      person,
      notes,
    });
    setIsAddModalOpen(false);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0 || !selectedDebt) return;
    updateDebtPayment(selectedDebt.id, Number(payAmount), autoLogTx);
    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            سجل الديون، الأقساط، والجمعيات
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            متابعة دقيقة للأموال المستحقة عليك أو لك والجمعيات العائلية
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd('debt_on_us')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/30 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة التزام / دين جديد</span>
        </button>
      </div>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Debts On Us */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">متبقي ديون علينا (مستحقة)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatMoney(totalOwedByUs, currency)}
            </div>
            <span className="text-[11px] text-slate-400">التزامات وأقساط للدفع</span>
          </div>
        </div>

        {/* Debts To Us */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ديون لنا (أموال عند الغير)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatMoney(totalOwedToUs, currency)}
            </div>
            <span className="text-[11px] text-slate-400">سلفيات مستحقة الاسترداد</span>
          </div>
        </div>

        {/* Gam'eya */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">متبقي أقساط الجمعيات</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">
              {formatMoney(totalGamya, currency)}
            </div>
            <span className="text-[11px] text-slate-400">جمعيات شهرية جارية</span>
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-2xl max-w-md text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          الكل ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab('debt_on_us')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'debt_on_us'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          علينا
        </button>
        <button
          onClick={() => setActiveTab('debt_to_us')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'debt_to_us'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          لنا
        </button>
        <button
          onClick={() => setActiveTab('gamya')}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'gamya'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          الجمعيات
        </button>
      </div>

      {/* Debts Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebts.map((d) => {
          const isCompleted = d.status === 'completed' || d.paidAmount >= d.amount;
          const remaining = Math.max(0, d.amount - (d.paidAmount || 0));
          const percent = d.amount > 0 ? Math.min(100, Math.round(((d.paidAmount || 0) / d.amount) * 100)) : 0;

          return (
            <div
              key={d.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border transition shadow-sm ${
                isCompleted
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        d.type === 'debt_on_us'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : d.type === 'debt_to_us'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300'
                      }`}
                    >
                      {d.type === 'debt_on_us' ? 'دين علينا' : d.type === 'debt_to_us' ? 'دين لنا' : 'جمعية'}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        تم السداد بالكامل
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white mt-1.5 truncate">
                    {d.title}
                  </h3>

                  {d.person && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      الطرف المعني: <strong className="text-slate-600 dark:text-slate-300">{d.person}</strong>
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (window.confirm(`هل أنت متأكد من حذف "${d.title}"؟`)) {
                      deleteDebt(d.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress & Amounts */}
              <div className="mt-4 bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">
                    المدفوع: {formatMoney(d.paidAmount || 0, currency)}
                  </span>
                  <span className="text-slate-800 dark:text-white">
                    المبلغ الإجمالي: {formatMoney(d.amount, currency)}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-extrabold mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">
                    المتبقي: <strong className="text-orange-600 dark:text-orange-400">{formatMoney(remaining, currency)}</strong>
                  </span>
                  {d.dueDate && (
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      تاريخ الاستحقاق: {formatArabicDate(d.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Pay Button / Completed state */}
              <div className="mt-4 flex items-center justify-between gap-2">
                {d.notes && (
                  <p className="text-xs text-slate-400 italic truncate max-w-[200px]">
                    {d.notes}
                  </p>
                )}

                {!isCompleted ? (
                  <button
                    onClick={() => handleOpenPay(d)}
                    className="mr-auto px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/30 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>سداد دفعة / قسط</span>
                  </button>
                ) : (
                  <span className="mr-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    منتهي ومسدد
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Debt/Installment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-600" />
                <span>إضافة التزام / دين / جمعية</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
              {/* Type */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('debt_on_us')}
                  className={`py-2 rounded-lg transition ${
                    type === 'debt_on_us' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  دين علينا
                </button>
                <button
                  type="button"
                  onClick={() => setType('debt_to_us')}
                  className={`py-2 rounded-lg transition ${
                    type === 'debt_to_us' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  دين لنا
                </button>
                <button
                  type="button"
                  onClick={() => setType('gamya')}
                  className={`py-2 rounded-lg transition ${
                    type === 'gamya' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  جمعية شهرية
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  البيان / اسم الالتزام *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: قسط غسالة، سلفة من صديق، جمعية الأسرة"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Amount & Paid Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    المبلغ الإجمالي ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    المدفوع مسبقاً
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                  />
                </div>
              </div>

              {/* Monthly Installment & Person */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    القسط الشهري (اختياري)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={monthlyInstallment}
                    onChange={(e) => setMonthlyInstallment(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    الطرف / الشخص المعني
                  </label>
                  <input
                    type="text"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="مثال: البنك، فلان"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Due Date & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  تاريخ الاستحقاق أو موعد القسط القادم
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تفاصيل أو شروط..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>حفظ الالتزام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Installment / Part of debt */}
      {isPayModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                تسجيل سداد دفعة
              </h3>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              سداد دفعة من: <strong className="text-emerald-600 font-bold">{selectedDebt.title}</strong>
              <div className="mt-1 text-slate-400">
                المتبقي الإجمالي: {formatMoney(selectedDebt.amount - (selectedDebt.paidAmount || 0), currency)}
              </div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  المبلغ المدفوع ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xl font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLogTx}
                  onChange={(e) => setAutoLogTx(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>تسجيل المعاملة تلقائياً في سجل المصروفات/الدخل</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>تأكيد السداد</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
