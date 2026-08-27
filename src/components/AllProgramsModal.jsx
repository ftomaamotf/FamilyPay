import React, { useState } from 'react';
import {
  X,
  Search,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Globe,
  Monitor,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ShoppingBag,
  Share2
} from 'lucide-react';
import { ALL_TRANSFER_PROGRAMS, launchTransferProgram, copyToClipboard } from '../utils/bankAppLauncher';

export const AllProgramsModal = ({
  isOpen,
  onClose,
  recipientName = '',
  accountNumber = '',
  amount = 0,
  reason = '',
  onSelectProgram = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customUrl, setCustomUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'كافة البرامج والتطبيقات 🌐' },
    { id: 'رئيسي', label: 'كي وماستر كارد 💳' },
    { id: 'محافظ إلكترونية', label: 'المحافظ الإلكترونية 📱' },
    { id: 'مصارف', label: 'المصارف والبنوك 🏛️' },
    { id: 'أدوات الهاتف', label: 'تطبيقات الهاتف 📲' }
  ];

  const filteredPrograms = ALL_TRANSFER_PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'مصارف') {
      return matchesSearch && (p.category.includes('مصارف') || p.category.includes('حكومية') || p.category.includes('تجارية'));
    }
    return matchesSearch && p.category === selectedCategory;
  });

  const handleCopyAccount = () => {
    if (!accountNumber) return;
    copyToClipboard(accountNumber);
    setCopied(true);
    if (window.navigator?.vibrate) window.navigator.vibrate(50);
    setToastMsg(`✅ تم نسخ رقم البطاقة (${accountNumber}) بنجاح!`);
    setTimeout(() => {
      setCopied(false);
      setToastMsg('');
    }, 3000);
  };

  const handleLaunch = (program, launchType = 'auto') => {
    handleCopyAccount();
    const res = launchTransferProgram({
      programId: program.id,
      accountNumber,
      amount,
      recipientName,
      reason,
      customUrl,
      launchType
    });

    if (onSelectProgram) {
      onSelectProgram(program);
    }

    setToastMsg(res.message || `🚀 جاري فتح (${program.name}) وتجهيز رقم البطاقة!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSystemShare = () => {
    handleCopyAccount();
    launchTransferProgram({
      programId: 'native_phone_sheet',
      accountNumber,
      amount,
      recipientName,
      reason,
      launchType: 'sheet'
    });
    setToastMsg('📲 جاري فتح قائمة كافة تطبيقات الهاتف...');
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                <span>مركز تطبيقات وبرامج سطح المكتب والهاتف</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-teal-200/80">
                اختر أي برنامج أو موقع بنكي لإتمام التحويل الفعلي مع النسخ التلقائي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Quick Banner */}
        {accountNumber && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                المستلم: <strong>{recipientName || 'الأخ'}</strong>
              </span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800" dir="ltr">
                {accountNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAccount}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ ✅' : 'نسخ رقم البطاقة 📋'}</span>
              </button>

              <button
                type="button"
                onClick={handleSystemShare}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                title="مشاركة نظامية مع كافة تطبيقات الهاتف"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-300" />
                <span>قائمة الهاتف 📲</span>
              </button>
            </div>
          </div>
        )}

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-emerald-600 text-white font-black text-xs text-center animate-bounce shadow-md">
            {toastMsg}
          </div>
        )}

        {/* Search & Categories */}
        <div className="p-3 sm:p-4 space-y-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم البرنامج أو المصرف (ماستر كي، زين كاش، رافدين، FIB...)..."
              className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[420px] scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition flex flex-col justify-between gap-2 shadow-xs group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-xs">
                    {prog.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                        {prog.name}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {prog.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                      {prog.description}
                    </p>
                  </div>
                </div>

                {prog.isCustom ? (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="اكتب رابط أو اسم الموقع (مثال: https://...)"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleLaunch(prog, 'web')}
                      className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>فتح الرابط المخصص 🚀</span>
                    </button>
                  </div>
                ) : prog.isNativeSheet ? (
                  <button
                    type="button"
                    onClick={() => handleLaunch(prog, 'sheet')}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>فتح قائمة تطبيقات هاتفك 📲</span>
                  </button>
                ) : (
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLaunch(prog, 'auto')}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <span>تشغيل التطبيق / البرنامج فوراً 🚀</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>

                    <div className="flex items-center gap-1 pt-0.5">
                      {prog.webUrl && (
                        <button
                          type="button"
                          onClick={() => handleLaunch(prog, 'web')}
                          className="flex-1 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                          title="فتح بوابة الويب على سطح المكتب"
                        >
                          <Globe className="w-3 h-3 text-teal-600" />
                          <span>بوابة الويب</span>
                        </button>
                      )}

                      {prog.storeUrl && (
                        <button
                          type="button"
                          onClick={() => handleLaunch(prog, 'store')}
                          className="flex-1 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                          title="فتح صفحة التطبيق في متجر التطبيقات"
                        >
                          <ShoppingBag className="w-3 h-3 text-amber-600" />
                          <span>المتجر</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-bold">لم يتم العثور على برنامج بهذا الاسم</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-bold">
            💡 يتم نسخ رقم البطاقة تلقائياً في كل مرة تفتح فيها أي برنامج.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
