import * as XLSX from 'xlsx';

// Eastern Arabic / Arabic-Indic digits map
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toArabicDigits = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[0-9]/g, (d) => ARABIC_DIGITS[+d]);
};

export const toEnglishDigits = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
};

export const cleanNumberInput = (val, allowDecimals = true) => {
  if (val === null || val === undefined) return '';
  const eng = toEnglishDigits(String(val)).replace(/[\u066B,]/g, '.');
  if (allowDecimals) {
    return eng.replace(/[^0-9.]/g, '');
  }
  return eng.replace(/[^0-9]/g, '');
};

export const allowBothDigitsInput = (val, allowDecimals = true) => {
  if (val === null || val === undefined) return '';
  let cleaned = String(val).replace(/[\u066B,]/g, '.');
  if (allowDecimals) {
    cleaned = cleaned.replace(/[^0-9٠-٩۰-۹.]/g, '');
  } else {
    cleaned = cleaned.replace(/[^0-9٠-٩۰-۹]/g, '');
  }
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

export const getActiveNumeralSystem = () => {
  try {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('bait_finance_settings');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.numeralSystem) return parsed.numeralSystem;
      }
    }
  } catch {}
  return 'en';
};

export const formatMoney = (amount, currencySymbol = 'د.ع', numeralSystem = null) => {
  const sys = numeralSystem || getActiveNumeralSystem();
  if (amount === undefined || amount === null || isNaN(amount)) {
    const zero = sys === 'ar' ? '٠' : '0';
    return `${zero} ${currencySymbol}`;
  }
  let formatted = Math.abs(Number(amount)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (sys === 'ar') {
    formatted = toArabicDigits(formatted);
  }
  return `${amount < 0 ? '-' : ''}${formatted} ${currencySymbol}`;
};

export const formatNumber = (num, numeralSystem = null) => {
  const sys = numeralSystem || getActiveNumeralSystem();
  if (num === undefined || num === null || isNaN(num)) {
    return sys === 'ar' ? '٠' : '0';
  }
  let formatted = Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (sys === 'ar') {
    formatted = toArabicDigits(formatted);
  }
  return formatted;
};

export const formatArabicDate = (dateString, numeralSystem = null) => {
  if (!dateString) return '';
  const sys = numeralSystem || getActiveNumeralSystem();
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    let formatted = new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
    if (sys === 'en') {
      formatted = toEnglishDigits(formatted);
    } else {
      formatted = toArabicDigits(formatted);
    }
    return formatted;
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
