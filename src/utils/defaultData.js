export const CURRENCIES = [
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
  { code: 'EUR', name: 'يورو', symbol: '€' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع' },
  { code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع' },
  { code: 'DZD', name: 'دينار جزائري', symbol: 'د.ج' },
  { code: 'MAD', name: 'درهم مغربي', symbol: 'د.م' },
  { code: 'TND', name: 'دينار تونسي', symbol: 'د.ت' },
  { code: 'TRY', name: 'ليرة تركية', symbol: '₺' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat-groceries', name: 'طعام وبقالة وسوبرماركت', icon: 'ShoppingCart', color: '#10b981', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'cat-bills', name: 'فواتير وخدمات (كهرباء، ماء، نت، غاز)', icon: 'Zap', color: '#f59e0b', bg: 'bg-amber-100 text-amber-700' },
  { id: 'cat-housing', name: 'إيجار وسكن وصيانة منزلية', icon: 'Home', color: '#3b82f6', bg: 'bg-blue-100 text-blue-700' },
  { id: 'cat-education', name: 'أولاد وتعليم ومدارس ودروس', icon: 'GraduationCap', color: '#8b5cf6', bg: 'bg-purple-100 text-purple-700' },
  { id: 'cat-transport', name: 'مواصلات وبنزين وصيانة سيارة', icon: 'Car', color: '#6366f1', bg: 'bg-indigo-100 text-indigo-700' },
  { id: 'cat-health', name: 'صحة وأدوية وكشوفات طبية', icon: 'HeartPulse', color: '#ef4444', bg: 'bg-rose-100 text-rose-700' },
  { id: 'cat-shopping', name: 'ملابس وتسوق ومشتريات شخصية', icon: 'Shirt', color: '#ec4899', bg: 'bg-pink-100 text-pink-700' },
  { id: 'cat-entertainment', name: 'خروجات ومطاعم وترفيه وسياحة', icon: 'Coffee', color: '#14b8a6', bg: 'bg-teal-100 text-teal-700' },
  { id: 'cat-installments', name: 'أقساط والتزامات وجمعيات', icon: 'CreditCard', color: '#f97316', bg: 'bg-orange-100 text-orange-700' },
  { id: 'cat-other', name: 'مصاريف أخرى ونثريات', icon: 'MoreHorizontal', color: '#64748b', bg: 'bg-slate-100 text-slate-700' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'inc-salary', name: 'الراتب الأساسي', icon: 'Briefcase', color: '#059669', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'inc-bonus', name: 'مكافآت وعمل إضافي / أوفرتايم', icon: 'Award', color: '#0284c7', bg: 'bg-sky-100 text-sky-700' },
  { id: 'inc-freelance', name: 'عمل حر وتجارة ومشروع خاص', icon: 'TrendingUp', color: '#7c3aed', bg: 'bg-violet-100 text-violet-700' },
  { id: 'inc-investments', name: 'عوائد استثمار أو إيجار عقار', icon: 'Building', color: '#d97706', bg: 'bg-amber-100 text-amber-700' },
  { id: 'inc-gamya', name: 'قبض جمعية شهرية', icon: 'Users', color: '#0d9488', bg: 'bg-teal-100 text-teal-700' },
  { id: 'inc-gift', name: 'هدايا ومساعدات ومصادر أخرى', icon: 'Gift', color: '#db2777', bg: 'bg-pink-100 text-pink-700' },
];

export const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash', name: 'نقدي (كاش)', icon: 'Banknote' },
  { id: 'card', name: 'بطاقة بنكية / فيزا', icon: 'CreditCard' },
  { id: 'wallet', name: 'محفظة إلكترونية (فودافون كاش / STC / انستاباي)', icon: 'Smartphone' },
  { id: 'transfer', name: 'تحويل بنكي', icon: 'ArrowLeftRight' },
];

export const DEFAULT_MEMBERS = [
  { id: 'mem-father', name: 'الأب / رب الأسرة' },
  { id: 'mem-mother', name: 'الأم / ربة المنزل' },
  { id: 'mem-family', name: 'المنزل ككل' },
  { id: 'mem-kids', name: 'الأولاد' },
];

// Realistic starter data for a household
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const dateStr = (day) => `${currentYear}-${currentMonth}-${String(day).padStart(2, '0')}`;

export const INITIAL_TRANSACTIONS = [
  {
    id: 't-1',
    type: 'income',
    title: 'راتب الشهر الأساسي',
    amount: 15000,
    categoryId: 'inc-salary',
    paymentMethod: 'transfer',
    memberId: 'mem-father',
    date: dateStr(1),
    notes: 'تحويل الراتب البنكي للشهر الحالي'
  },
  {
    id: 't-2',
    type: 'expense',
    title: 'مشتريات السوبرماركت وتموين البيت',
    amount: 2200,
    categoryId: 'cat-groceries',
    paymentMethod: 'card',
    memberId: 'mem-mother',
    date: dateStr(3),
    notes: 'أرز، سكر، زيت، معلبات، منظفات'
  },
  {
    id: 't-3',
    type: 'expense',
    title: 'فاتورة الكهرباء والمياه',
    amount: 450,
    categoryId: 'cat-bills',
    paymentMethod: 'wallet',
    memberId: 'mem-father',
    date: dateStr(5),
    notes: 'سداد إلكتروني'
  },
  {
    id: 't-4',
    type: 'expense',
    title: 'اشتراك الإنترنت المنزلي وباقات الهاتف',
    amount: 320,
    categoryId: 'cat-bills',
    paymentMethod: 'card',
    memberId: 'mem-father',
    date: dateStr(6),
    notes: 'سرعة فايبر غير محدودة'
  },
  {
    id: 't-5',
    type: 'expense',
    title: 'خضار ولحوم طازجة للأسبوع',
    amount: 1150,
    categoryId: 'cat-groceries',
    paymentMethod: 'cash',
    memberId: 'mem-mother',
    date: dateStr(8),
    notes: 'خضار، فواكه، لحوم ودواجن'
  },
  {
    id: 't-6',
    type: 'income',
    title: 'عمل إضافي / استشارة حرة',
    amount: 2500,
    categoryId: 'inc-bonus',
    paymentMethod: 'wallet',
    memberId: 'mem-father',
    date: dateStr(10),
    notes: 'مكافأة إنجاز مشروع'
  },
  {
    id: 't-7',
    type: 'expense',
    title: 'بنزين ومصاريف صيانة دورية للسيارة',
    amount: 750,
    categoryId: 'cat-transport',
    paymentMethod: 'card',
    memberId: 'mem-father',
    date: dateStr(12),
    notes: 'تغيير زيت وتفويل'
  },
  {
    id: 't-8',
    type: 'expense',
    title: 'أدوية وفيتامينات وكشف طبي',
    amount: 380,
    categoryId: 'cat-health',
    paymentMethod: 'cash',
    memberId: 'mem-family',
    date: dateStr(14),
    notes: 'صيدلية'
  },
  {
    id: 't-9',
    type: 'expense',
    title: 'كتب ومستلزمات دراسية للأولاد',
    amount: 600,
    categoryId: 'cat-education',
    paymentMethod: 'cash',
    memberId: 'mem-kids',
    date: dateStr(15),
    notes: 'كشاكيل وأدوات مدرسية'
  },
  {
    id: 't-10',
    type: 'expense',
    title: 'خروجة عائلية وعشاء في عطلة نهاية الأسبوع',
    amount: 650,
    categoryId: 'cat-entertainment',
    paymentMethod: 'card',
    memberId: 'mem-family',
    date: dateStr(17),
    notes: 'مطعم وحديقة'
  }
];

export const INITIAL_BUDGETS = [
  { id: 'b-1', categoryId: 'cat-groceries', limit: 4500 },
  { id: 'b-2', categoryId: 'cat-bills', limit: 1200 },
  { id: 'b-3', categoryId: 'cat-transport', limit: 1500 },
  { id: 'b-4', categoryId: 'cat-education', limit: 2000 },
  { id: 'b-5', categoryId: 'cat-health', limit: 1000 },
  { id: 'b-6', categoryId: 'cat-entertainment', limit: 1200 },
  { id: 'b-7', categoryId: 'cat-shopping', limit: 1500 },
];

export const INITIAL_DEBTS = [
  {
    id: 'd-1',
    title: 'قسط جهاز منزلي (غسالة جديدة)',
    type: 'debt_on_us', // علينا
    amount: 6000,
    paidAmount: 2000,
    monthlyInstallment: 1000,
    dueDate: '2026-09-05',
    person: 'شركة الأجهزة / المعرض',
    notes: 'متبقي 4 أقساط شهرية',
    status: 'active'
  },
  {
    id: 'd-2',
    title: 'جمعية الأسرة الشهرية',
    type: 'gamya', // جمعية
    amount: 12000,
    paidAmount: 4000,
    monthlyInstallment: 2000,
    dueDate: '2026-10-01',
    person: 'الأم / منسق الجمعية',
    notes: 'ميعاد قبض الجمعية في شهر أكتوبر القادم',
    status: 'active'
  },
  {
    id: 'd-3',
    title: 'سلفة مؤقتة لأحد الأقارب',
    type: 'debt_to_us', // لنا
    amount: 3000,
    paidAmount: 1000,
    monthlyInstallment: 1000,
    dueDate: '2026-09-15',
    person: 'أحمد (ابن العم)',
    notes: 'وعد بالسداد على دفعتين',
    status: 'active'
  }
];

export const INITIAL_SAVINGS = [
  {
    id: 's-1',
    title: 'صندوق الطوارئ المنزلي',
    targetAmount: 20000,
    currentAmount: 12500,
    deadline: '2026-12-31',
    color: '#059669',
    icon: 'ShieldCheck',
    notes: 'مخصص للطوارئ الطبية أو الصيانة المفاجئة'
  },
  {
    id: 's-2',
    title: 'مصاريف العام الدراسي الجديد',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2026-09-20',
    color: '#8b5cf6',
    icon: 'GraduationCap',
    notes: 'أقساط ومستلزمات بداية العام'
  },
  {
    id: 's-3',
    title: 'تجديد وصيانة المنزل وجهاز تكييف',
    targetAmount: 8000,
    currentAmount: 3200,
    deadline: '2027-04-01',
    color: '#3b82f6',
    icon: 'Sparkles',
    notes: 'دهانات وصيانة دورية'
  }
];
