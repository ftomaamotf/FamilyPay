// Banking Apps Registry & Smart Launch Utility for Iraq & Universal Transfers
export const BANKING_APPS = [
  {
    id: 'qi',
    name: 'ماستر كي / خدمات كي (Qi Services)',
    shortName: 'ماستر كي / Qi 💳',
    icon: '💳',
    color: 'from-teal-700 to-emerald-700',
    borderColor: 'border-emerald-400/50',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    androidPackage: 'com.isc.qi',
    androidIntent: 'intent://#Intent;package=com.isc.qi;scheme=qi;end',
    iosUrl: 'qi://',
    webUrl: 'https://qi.services',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.isc.qi'
  },
  {
    id: 'zaincash',
    name: 'محفظة زين كاش (ZainCash)',
    shortName: 'زين كاش 📱',
    icon: '📱',
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-400/50',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    textColor: 'text-amber-700 dark:text-amber-300',
    androidPackage: 'com.zaincash.wallet',
    androidIntent: 'intent://#Intent;package=com.zaincash.wallet;scheme=zaincash;end',
    iosUrl: 'zaincash://',
    webUrl: 'https://zaincash.iq',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.zaincash.wallet'
  },
  {
    id: 'fib',
    name: 'FIB (المصرف العراقي الأول)',
    shortName: 'مصرف FIB 🏦',
    icon: '🏦',
    color: 'from-blue-700 to-indigo-800',
    borderColor: 'border-blue-400/50',
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    textColor: 'text-blue-700 dark:text-blue-300',
    androidPackage: 'com.firstiraqibank.mobile',
    androidIntent: 'intent://#Intent;package=com.firstiraqibank.mobile;scheme=fib;end',
    iosUrl: 'fib://',
    webUrl: 'https://fib.iq',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.firstiraqibank.mobile'
  },
  {
    id: 'rafidain',
    name: 'تطبيق مصرف الرافدين (ريادة / كي)',
    shortName: 'مصرف الرافدين 🏛️',
    icon: '🏛️',
    color: 'from-emerald-800 to-teal-900',
    borderColor: 'border-teal-500/50',
    bgColor: 'bg-teal-50 dark:bg-teal-950/60',
    textColor: 'text-teal-700 dark:text-teal-300',
    androidPackage: 'com.isc.qi.rafidain',
    androidIntent: 'intent://#Intent;package=com.isc.qi.rafidain;scheme=rafidain;end',
    iosUrl: 'rafidain://',
    webUrl: 'https://rafidain-bank.gov.iq',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.isc.qi.rafidain'
  },
  {
    id: 'rasheed',
    name: 'تطبيق مصرف الرشيد',
    shortName: 'مصرف الرشيد 🏛️',
    icon: '🏛️',
    color: 'from-slate-700 to-slate-800',
    borderColor: 'border-slate-400/50',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    androidPackage: 'iq.rasheedbank',
    androidIntent: 'intent://#Intent;package=iq.rasheedbank;scheme=rasheed;end',
    iosUrl: 'rasheed://',
    webUrl: 'https://rasheedbank.gov.iq',
    storeUrl: 'https://play.google.com/store/apps/details?id=iq.rasheedbank'
  },
  {
    id: 'tbi',
    name: 'المصرف العراقي للتجارة (TBI)',
    shortName: 'مصرف TBI 🏢',
    icon: '🏢',
    color: 'from-indigo-700 to-purple-800',
    borderColor: 'border-indigo-400/50',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    androidPackage: 'com.tbi.mobile',
    androidIntent: 'intent://#Intent;package=com.tbi.mobile;scheme=tbi;end',
    iosUrl: 'tbi://',
    webUrl: 'https://tbi.com.iq',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.tbi.mobile'
  },
  {
    id: 'share_all',
    name: 'قائمة كل تطبيقات الهاتف (مشاركة ذكية)',
    shortName: 'كل تطبيقات الهاتف 📲',
    icon: '🌐',
    color: 'from-purple-600 via-pink-600 to-rose-600',
    borderColor: 'border-purple-400/50',
    bgColor: 'bg-purple-50 dark:bg-purple-950/60',
    textColor: 'text-purple-700 dark:text-purple-300',
    isShareSheet: true
  }
];

export const launchBankApp = async ({
  appId = 'qi',
  accountNumber = '',
  amount = 0,
  recipientName = '',
  reason = ''
}) => {
  // 1. Copy recipient card/account number to clipboard
  if (accountNumber) {
    try {
      await navigator.clipboard.writeText(String(accountNumber).trim());
    } catch {
      // silent
    }
  }

  // 2. If 'share_all' or if user wants system app chooser
  if (appId === 'share_all') {
    const textData = `تحويل مالي لصندوق العائلة 💸\nالمستلم: ${recipientName}\nرقم البطاقة المصرفية: ${accountNumber}\nالمبلغ: ${amount}\nالسبب: ${reason}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تحويل مالي',
          text: textData
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
  }

  const app = BANKING_APPS.find((a) => a.id === appId) || BANKING_APPS[0];
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isAndroid) {
    if (app.androidIntent) {
      window.location.href = app.androidIntent;
      setTimeout(() => {
        if (app.storeUrl) window.open(app.storeUrl, '_blank');
      }, 1500);
    } else if (app.webUrl) {
      window.open(app.webUrl, '_blank');
    }
  } else if (isIOS) {
    if (app.iosUrl) {
      window.location.href = app.iosUrl;
      setTimeout(() => {
        if (app.webUrl) window.open(app.webUrl, '_blank');
      }, 1500);
    } else if (app.webUrl) {
      window.open(app.webUrl, '_blank');
    }
  } else {
    if (app.webUrl) {
      window.open(app.webUrl, '_blank');
    }
  }
};
