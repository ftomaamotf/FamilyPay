import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney, formatArabicDate } from '../utils/formatters';
import {
  Archive,
  Calendar,
  Lock,
  Trash2,
  Download,
  Printer,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const ArchivesView = () => {
  const {
    monthlyArchives,
    yearlyArchives,
    createMonthlyArchive,
    deleteArchiveProtected,
    currentUser,
    activeAdminId,
    settings
  } = useFinance();

  const [activeTab, setActiveTab] = useState('monthly'); // monthly | yearly
  const [selectedArchiveId, setSelectedArchiveId] = useState(monthlyArchives[0]?.id || null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const currency = settings.currencySymbol;
  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  const currentList = activeTab === 'monthly' ? monthlyArchives : yearlyArchives;
  const selectedArchive = currentList.find((a) => a.id === selectedArchiveId) || currentList[0];

  const handleCreateCurrentMonth = async () => {
    const year = settings.selectedYear;
    const month = settings.selectedMonth;
    const res = await createMonthlyArchive(year, month);
    alert(res.message);
  };

  const handleDelete = async (archiveId) => {
    if (!deletePassword) {
      alert('يرجى إدخال كلمة مرور الأدمن لتأكيد الحذف');
      return;
    }
    const res = await deleteArchiveProtected(archiveId, activeTab, deletePassword);
    if (res.success) {
      alert(res.message);
      setDeletingId(null);
      setDeletePassword('');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-600" />
            <span>الأرشيف الشهري والسنوي الثابت (محمي بإذن الأدمن)</span>
          </h3>
          <p className="text-xs text-slate-400">
            سجلات مالية تاريخية دائمة لكل شهر وسنة لجميع الإخوة مع الحماية التامة من التعديل أو الحذف
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCurrentAdmin && activeTab === 'monthly' && (
            <button
              onClick={handleCreateCurrentMonth}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>تثبيت وأرشفة الشهر الحالي</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة A4</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Monthly vs Yearly */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-2xl max-w-xs text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('monthly');
            setSelectedArchiveId(monthlyArchives[0]?.id || null);
          }}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          الأرشيف الشهري ({monthlyArchives.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('yearly');
            setSelectedArchiveId(yearlyArchives[0]?.id || null);
          }}
          className={`flex-1 py-2 rounded-xl transition ${
            activeTab === 'yearly'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          الأرشيف السنوي ({yearlyArchives.length})
        </button>
      </div>

      {/* Main Grid: Archive Selector & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Archive Records List */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold text-slate-400 block">
            السجلات المحفوظة في الأرشيف:
          </span>

          {currentList.map((arch) => {
            const isSelected = selectedArchive?.id === arch.id;
            return (
              <div
                key={arch.id}
                onClick={() => setSelectedArchiveId(arch.id)}
                className={`p-4 rounded-3xl border cursor-pointer transition flex flex-col gap-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{activeTab === 'monthly' ? arch.monthName : `عام ${arch.year}`}</span>
                  </span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                    {formatMoney(arch.totalSpent, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>الصندوق: {formatMoney(arch.totalFund, currency)}</span>
                  <span>المتبقي: <strong className="text-emerald-600">{formatMoney(arch.remaining, currency)}</strong></span>
                </div>
              </div>
            );
          })}

          {currentList.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              لا توجد سجلات في هذا الأرشيف بعد.
            </div>
          )}
        </div>

        {/* Right: Selected Archive Detailed Breakdown */}
        {selectedArchive ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-5">
            
            {/* Top Snapshot Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> سجل مؤرشف ومحمي
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  كشف أرشيف: {activeTab === 'monthly' ? selectedArchive.monthName : `عام ${selectedArchive.year}`}
                </h4>
              </div>

              {isCurrentAdmin && (
                <div>
                  {deletingId === selectedArchive.id ? (
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="password"
                        placeholder="كلمة مرور الأدمن"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        onClick={() => handleDelete(selectedArchive.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl"
                      >
                        تأكيد الحذف
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="p-1.5 text-slate-400"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(selectedArchive.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الأرشيف (بإذن الأدمن)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3 Summary Big Metric Boxes */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي ميزانية الصندوق</span>
                <span className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
                  {formatMoney(selectedArchive.totalFund, currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي ما تم صرفه</span>
                <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                  {formatMoney(selectedArchive.totalSpent, currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">الفائض / المتبقي</span>
                <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatMoney(selectedArchive.remaining, currency)}
                </span>
              </div>
            </div>

            {/* Brother by Brother Breakdown in Archive */}
            <div>
              <h5 className="text-xs font-black text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>نصيب ومصروفات كل أخ في هذا الأرشيف:</span>
              </h5>

              <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                    <tr>
                      <th className="p-3">الأخ</th>
                      <th className="p-3">المبلغ المصروف</th>
                      <th className="p-3 text-center">النسبة من الصندوق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedArchive.brotherBreakdowns?.map((b) => {
                      const percent = selectedArchive.totalSpent > 0 ? Math.round((b.totalSpent / selectedArchive.totalSpent) * 100) : 0;
                      return (
                        <tr key={b.brotherId} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800 dark:text-white">{b.brotherName}</td>
                          <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(b.totalSpent, currency)}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">%{percent}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-16 text-slate-400 text-xs bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            حدد سجلاً من القائمة لاستعراض تفاصيله
          </div>
        )}

      </div>

    </div>
  );
};
