import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/formatters';
import {
  ListChecks,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const BrotherCustomMatrix = ({ onOpenTransferModal }) => {
  const { currentUser, brothers, activeAdminId, settings } = useFinance();
  const currency = settings.currencySymbol;

  const currentBrother = brothers.find((b) => b.id === currentUser?.id) || brothers[0];
  const fields = currentBrother?.approvedFields || [];
  const activeAdmin = brothers.find((b) => b.id === activeAdminId) || { name: 'الأدمن' };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
            <UserCheck className="w-4 h-4" />
            <span>جدولك المعتمد بإذن الأدمن ({activeAdmin.name})</span>
          </div>
          <h3 className="text-xl font-black text-white">
            حقول ومخصصات الأخ: {currentBrother.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            رقم حسابك المصرفي المعتمد للتحويلات: <strong className="text-indigo-300 font-mono">{currentBrother.accountNumber}</strong>
          </p>
        </div>

        <button
          onClick={() => onOpenTransferModal(currentBrother.id)}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto transition"
        >
          <Send className="w-3.5 h-3.5 -rotate-45" />
          <span>طلب / إرسال تحويل لحسابي</span>
        </button>
      </div>

      {/* Fields List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => {
          const percent = f.limit > 0 ? Math.min(100, Math.round(((f.spent || 0) / f.limit) * 100)) : 0;
          const remaining = Math.max(0, (f.limit || 0) - (f.spent || 0));
          const isFull = (f.spent || 0) >= f.limit;

          return (
            <div
              key={f.id}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{f.name}</span>
                </h4>

                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    isFull
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : percent >= 80
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  %{percent} مستهلك
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">
                  <span>المنصرف: {formatMoney(f.spent || 0, currency)}</span>
                  <span>المخصص: {formatMoney(f.limit, currency)}</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-slate-400">
                  المتبقي في هذا البند: <strong className="text-emerald-600 dark:text-emerald-400">{formatMoney(remaining, currency)}</strong>
                </span>

                <button
                  onClick={() => onOpenTransferModal(currentBrother.id, f.id)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Send className="w-3 h-3 -rotate-45" />
                  <span>إرسال في هذا البند</span>
                </button>
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="col-span-2 text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400">
            <p className="text-xs">لم يتم اعتماد حقول مخصصة لحسابك من قبل الأدمن بعد.</p>
          </div>
        )}
      </div>

    </div>
  );
};
