// Comprehensive Registry of Financial Programs & Banking Apps (Desktop Web & Mobile Apps)
export const ALL_TRANSFER_PROGRAMS = [
  {
    id: 'home_screen',
    name: 'شاشة الهاتف الرئيسية (Home Screen)',
    shortName: 'شاشة الهاتف الرئيسية 🏠',
    icon: '🏠',
    category: 'أدوات الهاتف',
    description: 'الانتقال لشاشة هاتفك الرئيسية واختيار سوبر كي أو أي تطبيق مثبت',
    isHomeScreen: true
  },
  {
    id: 'qi',
    name: 'سوبر كي (Super Qi) / ماستر كي',
    shortName: 'سوبر كي (Super Qi) 🟡',
    icon: '🟡',
    category: 'رئيسي',
    description: 'تطبيق سوبر كي الجديد وخدمات كي وماستر كارد لتحويل الأموال',
    webUrl: 'https://qi.services',
    androidPackage: 'com.isc.qi',
    androidIntent: 'intent://#Intent;package=com.isc.qi;scheme=qi;end',
    iosUrl: 'qi://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.isc.qi'
  },
  {
    id: 'zaincash',
    name: 'محفظة زين كاش / زين العراق (ZainCash)',
    shortName: 'زين كاش / زين العراق 📱',
    icon: '📱',
    category: 'محافظ إلكترونية',
    description: 'تطبيق وبوابة الدفع الإلكتروني زين كاش',
    webUrl: 'https://zaincash.iq',
    androidPackage: 'com.zaincash.wallet',
    androidIntent: 'intent://#Intent;package=com.zaincash.wallet;scheme=zaincash;end',
    iosUrl: 'zaincash://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.zaincash.wallet'
  },
  {
    id: 'fib',
    name: 'FIB (المصرف العراقي الأول)',
    shortName: 'مصرف FIB 🏦',
    icon: '🏦',
    category: 'مصارف رقمية',
    description: 'First Iraqi Bank - التحويلات والحسابات البنكية الرقمية',
    webUrl: 'https://fib.iq',
    androidPackage: 'com.firstiraqibank.mobile',
    androidIntent: 'intent://#Intent;package=com.firstiraqibank.mobile;scheme=fib;end',
    iosUrl: 'fib://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.firstiraqibank.mobile'
  },
  {
    id: 'rafidain',
    name: 'مصرف الرافدين (ريادة / كي)',
    shortName: 'مصرف الرافدين 🏛️',
    icon: '🏛️',
    category: 'مصارف حكومية',
    description: 'بوابة وتطبيق مصرف الرافدين الإلكتروني',
    webUrl: 'https://rafidain-bank.gov.iq',
    androidPackage: 'com.isc.qi.rafidain',
    androidIntent: 'intent://#Intent;package=com.isc.qi.rafidain;scheme=rafidain;end',
    iosUrl: 'rafidain://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.isc.qi.rafidain'
  },
  {
    id: 'rasheed',
    name: 'مصرف الرشيد',
    shortName: 'مصرف الرشيد 🏛️',
    icon: '🏛️',
    category: 'مصارف حكومية',
    description: 'تطبيق وبوابة مصرف الرشيد الإلكتروني',
    webUrl: 'https://rasheedbank.gov.iq',
    androidPackage: 'iq.rasheedbank',
    androidIntent: 'intent://#Intent;package=iq.rasheedbank;scheme=rasheed;end',
    iosUrl: 'rasheed://',
    storeUrl: 'https://play.google.com/store/apps/details?id=iq.rasheedbank'
  },
  {
    id: 'tbi',
    name: 'المصرف العراقي للتجارة (TBI)',
    shortName: 'مصرف TBI 🏢',
    icon: '🏢',
    category: 'مصارف تجارية',
    description: 'البنك التجاري العراقي والخدمات المصرفية عبر الإنترنت',
    webUrl: 'https://tbi.com.iq',
    androidPackage: 'com.tbi.mobile',
    androidIntent: 'intent://#Intent;package=com.tbi.mobile;scheme=tbi;end',
    iosUrl: 'tbi://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.tbi.mobile'
  },
  {
    id: 'asiahawala',
    name: 'آسيا حوالة (AsiaHawala)',
    shortName: 'آسيا حوالة 📲',
    icon: '📲',
    category: 'محافظ إلكترونية',
    description: 'محفظة الدفع الإلكتروني وتحويل الأموال آسيا حوالة',
    webUrl: 'https://asiahawala.net',
    androidPackage: 'com.asiahawala.wallet',
    androidIntent: 'intent://#Intent;package=com.asiahawala.wallet;scheme=asiahawala;end',
    iosUrl: 'asiahawala://',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.asiahawala.wallet'
  },
  {
    id: 'fastpay',
    name: 'فاست باي (FastPay Iraq)',
    shortName: 'فاست باي ⚡',
    icon: '⚡',
    category: 'محافظ إلكترونية',
    description: 'تطبيق وبوابة فاست باي للدفع الرقمي والتحويل',
    webUrl: 'https://fast-pay.cash',
    androidPackage: 'iq.fastpay.consumer',
    androidIntent: 'intent://#Intent;package=iq.fastpay.consumer;scheme=fastpay;end',
    iosUrl: 'fastpay://',
    storeUrl: 'https://play.google.com/store/apps/details?id=iq.fastpay.consumer'
  },
  {
    id: 'nbi',
    name: 'المصرف الأهلي العراقي (NBI)',
    shortName: 'المصرف الأهلي 🏦',
    icon: '🏦',
    category: 'مصارف تجارية',
    description: 'National Bank of Iraq - الخدمات المصرفية المباشرة',
    webUrl: 'https://nbi.iq',
    androidPackage: 'jo.com.capitalbank.nbi',
    androidIntent: 'intent://#Intent;package=jo.com.capitalbank.nbi;scheme=nbi;end',
    iosUrl: 'nbi://'
  },
  {
    id: 'idb',
    name: 'مصرف التنمية الدولي (IDB)',
    shortName: 'مصرف التنمية 🏛️',
    icon: '🏛️',
    category: 'مصارف تجارية',
    description: 'International Development Bank - بوابات التحويل',
    webUrl: 'https://idb.iq'
  },
  {
    id: 'western_union',
    name: 'ويسترن يونيون (Western Union)',
    shortName: 'Western Union 🌍',
    icon: '🌍',
    category: 'حوالات دولية',
    description: 'تحويل الأموال والحوالات الدولية الفورية',
    webUrl: 'https://www.westernunion.com'
  },
  {
    id: 'native_phone_sheet',
    name: 'قائمة كافة تطبيقات الهاتف (مشاركة نظامية)',
    shortName: 'قائمة تطبيقات الهاتف 📲',
    icon: '📱',
    category: 'أدوات الهاتف',
    description: 'فتح نافذة المشاركة واختيار أي تطبيق مثبت على شاشة الهاتف',
    isNativeSheet: true
  },
  {
    id: 'custom_url',
    name: 'برنامج أو موقع بنكي آخر (تخصيص حر)',
    shortName: 'برنامج / موقع آخر 🌐',
    icon: '🌐',
    category: 'أدوات سطح المكتب',
    description: 'فتح أي برنامج أو موقع بنكي أو رابط مخصص على سطح المكتب',
    isCustom: true
  }
];

// Helper to copy text to clipboard with fallback
export const copyToClipboard = (text) => {
  if (!text) return false;
  const str = String(text).trim();
  try {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(str);
      return true;
    }
  } catch {}

  try {
    const input = document.createElement('textarea');
    input.value = str;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
};

// Universal Launcher for both Desktop PC and Mobile Devices
export const launchTransferProgram = (options = {}) => {
  const {
    programId = 'qi',
    accountNumber = '',
    amount = 0,
    recipientName = '',
    reason = '',
    customUrl = '',
    launchType = 'auto' // 'auto' | 'app' | 'web' | 'store' | 'sheet'
  } = options;

  // 1. Copy recipient card/account number immediately (synchronous / fire-and-forget)
  if (accountNumber) {
    copyToClipboard(accountNumber);
  }

  if (window.navigator?.vibrate) {
    try {
      window.navigator.vibrate(60);
    } catch {}
  }

  const shareText = `تحويل مالي 💸\nالمستلم: ${recipientName}\nرقم البطاقة المصرفية: ${accountNumber}\nالمبلغ: ${amount} د.ع\nالسبب: ${reason}`;

  // 2. Go to Phone Home Screen (الشاشة الرئيسية للهاتف)
  if (programId === 'home_screen' || launchType === 'home') {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end';
      return { success: true, message: 'تم نسخ رقم البطاقة والانتقال لشاشة هاتفك' };
    }
    if (navigator.share) {
      navigator.share({ title: 'تحويل مالي', text: shareText }).catch(() => {});
    }
    return { success: true, message: 'تم نسخ رقم البطاقة وتجهيز التحويل' };
  }

  // 3. If user chose Native Phone Apps Sheet OR launchType === 'sheet'
  if (programId === 'native_phone_sheet' || launchType === 'sheet') {
    if (navigator.share) {
      navigator.share({
        title: 'تحويل مالي عبر تطبيقات الهاتف',
        text: shareText
      }).catch(() => {});
      return { success: true, message: 'تم فتح قائمة تطبيقات الهاتف' };
    }
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURIComponent(shareText)};end`;
      return { success: true, message: 'تم تشغيل موجه تطبيقات الهاتف' };
    }
  }

  // 3. If Custom URL
  if (programId === 'custom_url' && customUrl) {
    const finalUrl = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
    window.open(finalUrl, '_blank');
    return { success: true, message: 'تم فتح البرنامج / الموقع المخصص' };
  }

  // 4. Find Selected Program in Registry
  const program = ALL_TRANSFER_PROGRAMS.find((p) => p.id === programId) || ALL_TRANSFER_PROGRAMS[0];
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  // If explicitly requested 'web' or on desktop without app intent
  if (launchType === 'web' || (!isAndroid && !isIOS)) {
    if (program.webUrl) {
      window.open(program.webUrl, '_blank');
      return { success: true, message: `تم فتح بوابة (${program.name}) على سطح المكتب` };
    }
  }

  // If explicitly requested 'store'
  if (launchType === 'store') {
    if (program.storeUrl) {
      window.open(program.storeUrl, '_blank');
      return { success: true, message: `تم فتح صفحة التطبيق في متجر البرامج` };
    }
  }

  // Android Mobile Launch
  if (isAndroid) {
    if (program.androidIntent) {
      // Try Android Intent directly
      window.location.href = program.androidIntent;

      // Also set fallback timeout if not installed
      setTimeout(() => {
        if (program.storeUrl) {
          window.open(program.storeUrl, '_blank');
        } else if (program.webUrl) {
          window.open(program.webUrl, '_blank');
        }
      }, 1500);
      return { success: true, message: `جاري تشغيل تطبيق (${program.name}) على الهاتف` };
    } else if (program.webUrl) {
      window.open(program.webUrl, '_blank');
      return { success: true, message: `تم فتح بوابة (${program.name})` };
    }
  }

  // iOS Mobile Launch
  if (isIOS) {
    if (program.iosUrl) {
      window.location.href = program.iosUrl;
      setTimeout(() => {
        if (program.webUrl) window.open(program.webUrl, '_blank');
      }, 1500);
      return { success: true, message: `جاري تشغيل تطبيق (${program.name}) على الآيفون` };
    } else if (program.webUrl) {
      window.open(program.webUrl, '_blank');
      return { success: true, message: `تم فتح بوابة (${program.name})` };
    }
  }

  // Default Web Open
  if (program.webUrl) {
    window.open(program.webUrl, '_blank');
    return { success: true, message: `تم فتح بوابة (${program.name})` };
  }

  return { success: true, message: 'تم نسخ رقم البطاقة وتجهيز التحويل' };
};

export const openPhoneAppsChooser = (params) => {
  return launchTransferProgram({ ...params, programId: 'native_phone_sheet' });
};

export const launchQiDirect = (accountNumber = '') => {
  return launchTransferProgram({ programId: 'qi', accountNumber });
};



