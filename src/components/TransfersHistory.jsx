import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate, exportToExcel } from '../utils/formatters';
import {
  Receipt,
  Search,
  Copy,
  Check,
  Download,
  Calendar,
  Send,
  User,
  CreditCard,
  Sparkles,
  FileSpreadsheet,
  Edit3,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { EditTransferModal } from './EditTransferModal';

export const TransfersHistory = ({ onOpenTransferModal }) => {
  const { transfers, settings, brothers, currentUser, activeAdminId } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrotherId, setSelectedBrotherId] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [editingTransfer, setEditingTransfer] = useState(null);

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;
  const currency = settings.currencySymbol;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (selectedBrotherId !== 'all' && t.recipientId !== selectedBrotherId) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesReason = t.reason?.toLowerCase().includes(term);
        const matchesName = t.recipientName?.toLowerCase().includes(term);
        const matchesAccount = t.recipientAccountNumber?.toLowerCase().includes(term);
        const matchesAmount = String(t.amount).includes(term);
        if (!matchesReason && !matchesName && !matchesAccount && !matchesAmount) return false;
      }
      return true;
    });
  }, [transfers, selectedBrotherId, searchTerm]);

  const handleExportExcel = () => {
    const data = filteredTransfers.map((t, idx) => ({
      'م': idx + 1,
      'التاريخ': t.date || formatArabicDate(t.timestamp),
      'المرسل (الأدمن)': t.senderName,
      'المستلم': t.recipientName,
      'رقم الحساب المصرفي': t.recipientAccountNumber,
      'المبلغ': t.amount,
      'العملة': currency,
      'البند / الحقل': t.fieldName,
      'سبب الصرف (الحاجة)': t.reason,
      'البطاقة المرسلة': t.sendingCardName
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل التحويلات المصرفية');
    XLSX.writeFile(wb, `سجل_تحويلات_صندوق_العائلة_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>سجل التحويلات المصرفية المباشرة</span>
          </h3>
          <p className="text-xs text-slate-400">
            كافة المبالغ المحولة لأرقام حسابات المستخدمين مع أسباب الصرف الإجبارية
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => onOpenTransferModal()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5 -rotate-45" />
            <span>تحويل جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالسبب (مثل: حليب، بنزين)، اسم المستخدم، أو رقم الحساب..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedBrotherId}
            onChange={(e) => setSelectedBrotherId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none"
          >
            <option value="all">جميع المستخدمين</option>
            {brothers.map((b) => (
              <option key={b.id} value={b.id} className="dark:bg-slate-800">
                المستخدم: {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transfers Cards / Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {filteredTransfers.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredTransfers.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition text-xs"
              >
                {/* Left Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      إلى الأخ: {t.recipientName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                      بند: {t.fieldName}
                    </span>
                  </div>

                  {/* Mandatory Reason Box */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>سبب الصرف (الحاجة): <strong>{t.reason}</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <span>رقم الحساب:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{t.recipientAccountNumber}</strong>
                      <button
                        onClick={() => handleCopy(t.id, t.recipientAccountNumber)}
                        className="p-0.5 hover:text-emerald-600"
                        title="نسخ رقم الحساب"
                      >
                        {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                    <span>•</span>
                    <span>المرسل: {t.senderName}</span>
                    <span>•</span>
                    <span>{formatArabicDate(t.date || t.timestamp)}</span>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="text-left shrink-0 self-end sm:self-center flex flex-col items-end gap-1.5">
                  <div>
                    <span className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400 block font-mono">
                      - {formatMoney(t.amount, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">من {t.sendingCardName}</span>
                  </div>

                  {/* ✏️ Admin Edit Button for Spent Amount ✏️ */}
                  {isCurrentAdmin && (
                    <button
                      onClick={() => setEditingTransfer(t)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] rounded-xl border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 transition shadow-xs active:scale-95"
                      title="تعديل المبلغ أو السبب أو البند"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>تعديل المبلغ ✏️</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            لا توجد تحويلات مطابقة للبحث
          </div>
        )}
      </div>

      {/* Edit Transfer Modal */}
      <EditTransferModal
        isOpen={Boolean(editingTransfer)}
        onClose={() => setEditingTransfer(null)}
        transfer={editingTransfer}
      />

    </div>
  );
};
