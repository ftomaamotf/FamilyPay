// Smart Native Phone Apps Launcher & Chooser
export const openPhoneAppsChooser = async ({
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

  if (window.navigator?.vibrate) {
    try {
      window.navigator.vibrate(60);
    } catch {}
  }

  const shareText = `تحويل مالي 💸\nالمستلم: ${recipientName}\nرقم البطاقة المصرفية: ${accountNumber}\nالمبلغ: ${amount} د.ع\nالسبب: ${reason}`;

  // 2. Try Native Web Share API (Opens the phone's native installed apps sheet)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'تحويل مالي عبر تطبيقات الهاتف',
        text: shareText
      });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return true; // User cancelled
    }
  }

  // 3. Fallback: Android Native System Intent Chooser
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    window.location.href = `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURIComponent(shareText)};end`;
    return true;
  }

  // 4. If on iOS without Web Share
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    window.location.href = 'qi://';
    return true;
  }

  return false;
};

export const launchQiDirect = (accountNumber = '') => {
  if (accountNumber) {
    try {
      navigator.clipboard.writeText(String(accountNumber).trim());
    } catch {}
  }
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isAndroid) {
    window.location.href = 'intent://#Intent;package=com.isc.qi;scheme=qi;end';
    setTimeout(() => {
      window.open('https://play.google.com/store/apps/details?id=com.isc.qi', '_blank');
    }, 1200);
  } else if (isIOS) {
    window.location.href = 'qi://';
    setTimeout(() => {
      window.open('https://apps.apple.com/app/qi-services/id1458925586', '_blank');
    }, 1200);
  } else {
    window.open('https://qi.services', '_blank');
  }
};

