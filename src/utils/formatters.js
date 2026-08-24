import * as XLSX from 'xlsx';

export const formatMoney = (amount, currencySymbol = 'ج.م') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `0 ${currencySymbol}`;
  const formatted = Math.abs(Number(amount)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${formatted} ${currencySymbol}`;
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

export const formatArabicDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getMonthName = (monthIndex) => {
  const months = [
    'يناير (1)', 'فبراير (2)', 'مارس (3)', 'أبريل (4)',
    'مايو (5)', 'يونيو (6)', 'يوليو (7)', 'أغسطس (8)',
    'سبتمبر (9)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
  ];
  return months[monthIndex] || '';
};

export const normalizeArabicText = (text) => {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[\s\-_.,/\\#+=!@$%^&*()~`"':;?><]/g, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
};

// Export to Excel sheet
export const exportToExcel = (transactions, categories, currencySymbol, fileName = 'تقرير_حسابات_المنزل.xlsx') => {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  
  const data = transactions.map((t, idx) => ({
    'م': idx + 1,
    'التاريخ': t.date,
    'النوع': t.type === 'income' ? 'دخل / إيراد' : 'مصروف',
    'البيان / الوصف': t.title,
    'المبلغ': t.amount,
    'العملة': currencySymbol,
    'التصنيف': catMap.get(t.categoryId) || t.categoryId,
    'طريقة الدفع': t.paymentMethod === 'cash' ? 'نقدي' : t.paymentMethod === 'card' ? 'بطاقة بنكية' : t.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : 'تحويل بنكي',
    'الشخص': t.memberId === 'mem-father' ? 'الأب' : t.memberId === 'mem-mother' ? 'الأم' : t.memberId === 'mem-kids' ? 'الأولاد' : 'المنزل',
    'ملاحظات': t.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل المعاملات');

  // Adjust column widths
  const wscols = [
    { wch: 5 },  // م
    { wch: 12 }, // التاريخ
    { wch: 14 }, // النوع
    { wch: 30 }, // البيان
    { wch: 12 }, // المبلغ
    { wch: 8 },  // العملة
    { wch: 25 }, // التصنيف
    { wch: 16 }, // طريقة الدفع
    { wch: 12 }, // الشخص
    { wch: 35 }, // ملاحظات
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, fileName);
};
