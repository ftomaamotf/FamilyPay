import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Check,
  Edit2,
  Save,
  DollarSign,
  Tag,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

export const EditBrotherFieldsModal = ({ isOpen, onClose, brother }) => {
  const {
    updateBrotherFields,
    transfers,
    editTransfer,
    deleteTransfer,
    settings
  } = useFinance();

  const [fields, setFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLimit, setNewFieldLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedFieldId, setExpandedFieldId] = useState(null);

  // Transfer Edit State
  const [editingTransferId, setEditingTransferId] = useState(null);
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxReason, setEditTxReason] = useState('');
  const [txActionMsg, setTxActionMsg] = useState('');

  const currency = settings.currencySymbol;

  useEffect(() => {
    if (brother) {
      setFields(brother.approvedFields ? JSON.parse(JSON.stringify(brother.approvedFields)) : []);
      setSaveSuccess(false);
      setEditingTransferId(null);
      setTxActionMsg('');
    }
  }, [brother, isOpen]);

  if (!isOpen || !brother) return null;

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newFieldLimit) return;
    const newField = {
      id: 'f-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: newFieldName.trim(),
      limit: Number(newFieldLimit) || 0,
      spent: 0
    };
    setFields([...fields, newField]);
    setNewFieldName('');
    setNewFieldLimit('');
  };

  const handleFieldChange = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            [key]: key === 'limit' || key === 'spent' ? Number(value) || 0 : value
          };
        }
        return f;
      })
    );
  };

  const handleDeleteField = (id) => {
    const fieldToDelete = fields.find((f) => f.id === id);
    const spentAmount = fieldToDelete?.spent || 0;
    if (spentAmount > 0) {
      if (!window.confirm(`⚠️ هذه السلعة [${fieldToDelete.name}] مسجل عليها مبالغ مصروفة بقيمة (${spentAmount} ${currency}).\nعند مسحها، سيتم تنزيل هذا المبلغ بالكامل من الحساب الإجمالي لدائرة (${brother.name}) واسترجاع الرصيد للصندوق.\n\nهل أنت متأكد من مسح هذه السلعة؟`)) {
        return;
      }
    }
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateBrotherFields(brother.id, fields);
    setSaving(false);
    setSaveSuccess(true);
    setTxActionMsg(res.message || 'تم حفظ التعديلات وتحديث الحساب الإجمالي بنجاح');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Save specific edited transfer
  const handleSaveEditedTransfer = async (transferId) => {
    if (!editTxAmount || Number(editTxAmount) <= 0) return;
    const res = await editTransfer(transferId, {
      amount: Number(editTxAmount),
      reason: editTxReason.trim()
    });
    setEditingTransferId(null);
    setTxActionMsg(res.message || 'تم تحديث الطلب بنجاح');
    setTimeout(() => setTxActionMsg(''), 2500);
  };

  // Delete specific transfer
  const handleDeleteTransfer = async (transferId, amount, reason) => {
    if (window.confirm(`هل أنت متأكد من حذف هذا الطلب بمبلغ (${amount} ${currency}) لحاجة [${reason}] واسترجاع المبلغ للصندوق؟`)) {
      const res = await deleteTransfer(transferId);
      setTxActionMsg(res.message || 'تم حذف الطلب واسترجاع المبلغ للصندوق بنجاح');
      setTimeout(() => setTxActionMsg(''), 2500);
    }
  };

  const presetFieldIdeas = [
    { name: 'بنزين ومواصلات ⛽', limit: 150000 },
    { name: 'حليب ومواد غذائية 🥛', limit: 200000 },
    { name: 'صيدلية وأطباء 🩺', limit: 150000 },
    { name: 'فواتير وانترنت ⚡', limit: 100000 },
    { name: 'صيانة منزلية 🔧', limit: 100000 },
    { name: 'أولاد وتعليم 📚', limit: 150000 },
    { name: 'ملابس واحتياجات 👕', limit: 100000 },
    { name: 'طوارئ ونثريات 🛡️', limit: 100000 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-l from-slate-900 via-teal-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                إدارة وتعديل سلع الأخ: {brother.name}
              </h3>
              <p className="text-xs text-teal-300/80">
                سجل الطلبات لكل سلعة، الحذف والتعديل على كل طلب والأسقف
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action notification message */}
        {txActionMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-center animate-fadeIn">
            {txActionMsg}
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Add New Field / Commodity Form */}
          <form onSubmit={handleAddField} className="p-4 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
            <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs">
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>إضافة سلعة / بند مالي جديد للأخ:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="اسم السلعة (مثل: بنزين ومواصلات ⛽)"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="number"
                  step="any"
                  required
                  min="0"
                  value={newFieldLimit}
                  onChange={(e) => setNewFieldLimit(e.target.value)}
                  placeholder={`السقف (${currency})`}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-center font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {/* Quick preset chips */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">
                اقتراحات سريعة للسلع:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetFieldIdeas.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewFieldName(preset.name);
                      setNewFieldLimit(String(preset.limit));
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold border border-slate-200/80 dark:border-slate-600 transition"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Current Fields / Commodities List with Itemized Requests Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                قائمة السلع وسجل طلبات كل سلعة ({fields.length}):
              </span>
              <span className="text-[10px] text-slate-400">
                (اضغط على السلعة لعرض وتعديل وحذف طلباتها الفردية)
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {fields.map((f, index) => {
                // Find all itemized requests / transfers for this brother & this commodity
                const commodityTransfers = transfers.filter((t) => {
                  if (t.recipientId !== brother.id) return false;
                  if (t.fieldId === f.id) return true;
                  const fKey = f.name.replace(/[^\u0600-\u06FFa-zA-Z]/g, '').trim();
                  const tKey = (t.fieldName || '').replace(/[^\u0600-\u06FFa-zA-Z]/g, '').trim();
                  return fKey && tKey && (fKey.includes(tKey) || tKey.includes(fKey));
                });

                const isExpanded = expandedFieldId === f.id;

                return (
                  <div
                    key={f.id || index}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-2.5 hover:border-slate-300 transition"
                  >
                    {/* Row 1: Commodity Header, Name input, and Delete button */}
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                        {index + 1}
                      </span>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => handleFieldChange(f.id, 'name', e.target.value)}
                          placeholder="اسم السلعة"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="button"
                        title="حذف هذه السلعة بالكامل"
                        onClick={() => handleDeleteField(f.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition border border-transparent hover:border-rose-200 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Row 2: Limit & Spent */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="font-bold text-slate-500 dark:text-slate-400">السقف المالي:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={f.limit}
                            onChange={(e) => handleFieldChange(f.id, 'limit', e.target.value)}
                            className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-black text-slate-900 dark:text-white font-mono outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                          />
                          <span className="text-[10px] text-slate-400">{currency}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="font-bold text-slate-500 dark:text-slate-400">المصروف الإجمالي:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={f.spent || 0}
                            onChange={(e) => handleFieldChange(f.id, 'spent', e.target.value)}
                            className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                          />
                          <span className="text-[10px] text-slate-400">{currency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Itemized Requests Toggle Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedFieldId(isExpanded ? null : f.id)}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px] font-bold transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>سجل طلبات وتحويلات هذه السلعة ({commodityTransfers.length} طلبات)</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expandable Itemized Requests List */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-2 mt-2 animate-fadeIn">
                        <span className="font-extrabold text-[11px] text-slate-600 dark:text-slate-300 block mb-1">
                          قائمة طلبات ({f.name}) مرتبة بالتسلسل:
                        </span>

                        {commodityTransfers.map((tx, txIdx) => {
                          const isEditingThis = editingTransferId === tx.id;

                          return (
                            <div
                              key={tx.id}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2"
                            >
                              {isEditingThis ? (
                                /* Edit Transfer Form */
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">المبلغ المعدل:</label>
                                      <input
                                        type="number"
                                        value={editTxAmount}
                                        onChange={(e) => setEditTxAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono font-bold text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">سبب الحاجة:</label>
                                      <input
                                        type="text"
                                        value={editTxReason}
                                        onChange={(e) => setEditTxReason(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-medium"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedTransfer(tx.id)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>حفظ التعديل</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTransferId(null)}
                                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px]"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View Transfer with Action Buttons */
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                                        طلب #{txIdx + 1}: {Number(tx.amount).toLocaleString()} {currency}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(tx.timestamp || tx.date).toLocaleDateString('ar-IQ')}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                                      السبب: <strong>{tx.reason}</strong>
                                    </p>
                                  </div>

                                  {/* Action Buttons: Edit & Delete per Request */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      title="تعديل هذا الطلب"
                                      onClick={() => {
                                        setEditingTransferId(tx.id);
                                        setEditTxAmount(String(tx.amount));
                                        setEditTxReason(tx.reason);
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      title="حذف هذا الطلب واسترجاع مبلغه"
                                      onClick={() => handleDeleteTransfer(tx.id, tx.amount, tx.reason)}
                                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {commodityTransfers.length === 0 && (
                          <p className="text-center text-[11px] text-slate-400 py-3 italic">
                            لا توجد طلبات مسجلة لهذه السلعة حتى الآن
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 space-y-1">
                  <p className="font-bold">لا توجد سلع أو حقول مخصصة لهذا الأخ حالياً</p>
                  <p className="text-[10px]">استخدم النموذج أعلاه لإضافة سلعة جديدة</p>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center font-black text-xs animate-fadeIn flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>✅ تم حفظ وتحديث جدول السلع بنجاح!</span>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'جاري حفظ التعديلات...' : 'حفظ وتثبيت تعديلات السلع فوراً 🚀'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
