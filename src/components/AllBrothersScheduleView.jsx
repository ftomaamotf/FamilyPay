import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  Eye,
  Users,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Search,
  Sliders
} from 'lucide-react';

export const AllBrothersScheduleView = ({ onOpenFieldsModal }) => {
  const { brothers, activeAdminId, currentUser, settings } = useFinance();
  const [copiedId, setCopiedId] = useState(null);
  const [selectedBrotherId, setSelectedBrotherId] = useState(brothers[0]?.id || 'b-1');
  const currency = settings.currencySymbol;

  const isCurrentAdmin = currentUser?.id === activeAdminId || currentUser?.isAdmin;

  const handleCopy = (brotherId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(brotherId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedBrother = brothers.find((b) => b.id === selectedBrotherId) || brothers[0];

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <span>لوحة الشفافية العائلية: استعراض جداول الإخوة</span>
          </h3>
          <p className="text-xs text-slate-400">
            كل أخ يمكنه الاطلاع على حقول ومخصصات وعدادات إخوته الآخرين بكل وضوح
          </p>
        </div>
      </div>

      {/* Horizontal Brother Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {brothers.map((b) => {
          const isSelected = selectedBrotherId === b.id;
          const isMe = currentUser?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBrotherId(b.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] text-white font-black"
                style={{ backgroundColor: b.avatarColor }}
              >
                {b.name[0]}
              </span>
              <span>{b.name}</span>
              {isMe && <span className="text-[9px] px-1 rounded bg-white/20">أنت</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Brother's Schedule Card */}
      {selectedBrother && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm space-y-5">
          
          {/* Top Brother Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shrink-0"
                style={{ backgroundColor: selectedBrother.avatarColor }}
              >
                {selectedBrother.name[0]}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 dark:text-white">
                  جدول ومخصصات: {selectedBrother.name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                  <span>الحساب المصرفي:</span>
                  <strong className="text-slate-700 dark:text-slate-300">{selectedBrother.accountNumber}</strong>
                  <button
                    onClick={() => handleCopy(selectedBrother.id, selectedBrother.accountNumber)}
                    className="p-1 hover:text-emerald-600 transition"
                  >
                    {copiedId === selectedBrother.id ? (
                      <span className="text-[10px] text-emerald-600 font-bold">تم النسخ</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isCurrentAdmin && (
              <button
                onClick={() => onOpenFieldsModal(selectedBrother)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>تعديل حقول هذا الأخ</span>
              </button>
            )}
          </div>

          {/* Table of Approved Fields */}
          <div>
            <h5 className="text-xs font-extrabold text-slate-400 mb-3">
              الحقول المعتمدة بإذن الأدمن ومستوى استهلاكها:
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedBrother.approvedFields?.map((f) => {
                const percent = f.limit > 0 ? Math.min(100, Math.round(((f.spent || 0) / f.limit) * 100)) : 0;
                const remaining = Math.max(0, (f.limit || 0) - (f.spent || 0));

                return (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        {f.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-normal">المرسل:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{formatMoney(f.spent || 0, currency)}</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>المنصرف: {formatMoney(f.spent || 0, currency)}</span>
                      <span>المتبقي: <strong className="text-slate-700 dark:text-slate-300">{formatMoney(remaining, currency)}</strong></span>
                    </div>
                  </div>
                );
              })}

              {(!selectedBrother.approvedFields || selectedBrother.approvedFields.length === 0) && (
                <div className="col-span-3 text-center py-6 text-slate-400 text-xs">
                  لا توجد حقول محددة لهذا الأخ حتى الآن.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
