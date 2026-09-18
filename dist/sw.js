// ======================================================================
// FamilyPay Service Worker: Persistent Background Alerts & Instant App Opening
// ======================================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Handle Background Push Events (Stays on screen with continuous alerting until opened)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '🔔 تنبيه من صندوق العائلة', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '🔔 تنبيه من صندوق العائلة';
  const isCall = data.type === 'INCOMING_CALL' || title.includes('مكالمة');
  const isMoneyRequest = data.type === 'REQUEST' || data.type === 'NEW_MONEY_REQUEST' || title.includes('طلب أموال') || title.includes('طلب مال');
  const isMessage = !isMoneyRequest && !isCall && (data.type === 'MESSAGE' || title.includes('رسالة') || title.includes('بصمة') || Boolean(data.chatRecipientId));
  const isTransfer = !isMoneyRequest && !isMessage && (data.type === 'TRANSFER' || title.includes('تحويل'));
  const isCircleReset = data.type === 'RESET' || title.includes('تصفير');
  const chatRecipientId = isMessage
    ? (data.chatRecipientId || (data.recipientId === 'all' ? 'all' : (data.senderId || 'all')))
    : null;

  const options = {
    body: data.body || (isCall ? 'يرن عليك الآن.. اضغط للرد الفوري والتحدث 📲' : (isMoneyRequest ? 'طلب أموال جديد.. اضغط للمراجعة وقبول الطلب في الرئيسية 💸' : (isMessage ? 'رسالة جديدة.. اضغط لفتح المحادثة والرد 💬' : (isTransfer ? 'إشعار تحويل مالي جديد 💰' : 'اضغط هنا لفتح البرنامج ومتابعة التفاصيل فوراً 📱')))),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Rich repeating alert vibration pattern until opened
    vibrate: isCall
      ? [1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
      : [600, 300, 600, 300, 600],
    tag: data.tag || (isCall ? ('incoming-call-' + (data.callId || 'active')) : (isMoneyRequest ? ('money-req-' + (data.requestId || Date.now())) : (isMessage ? ('chat-msg-' + (data.senderId || 'all') + '-' + Date.now()) : ('familypay-alert-' + (data.type || 'msg') + '-' + Date.now())))),
    renotify: true,
    // 🌟 KEEP PERSISTENT IN NOTIFICATION DRAWER UNTIL USER TAPS/APPROVES OPENING 🌟
    requireInteraction: true,
    silent: false,
    data: {
      url: data.url || (isMoneyRequest ? `/?openPendingRequests=1&tab=dashboard${data.requestId ? `&requestId=${encodeURIComponent(data.requestId)}` : ''}` : '/'),
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      type: data.type || (isMoneyRequest ? 'REQUEST' : (isMessage ? 'MESSAGE' : 'GENERAL')),
      requestId: data.requestId,
      senderId: data.senderId,
      senderName: data.senderName,
      recipientId: data.recipientId,
      chatRecipientId: chatRecipientId,
      timestamp: Date.now()
    },
    actions: isCall ? [
      { action: 'open', title: '🟢 فتح والرد على المكالمة 📞' },
      { action: 'dismiss', title: '🔴 إغلاق' }
    ] : (isMoneyRequest ? [
      { action: 'open_requests', title: '📥 قبول وصرف الطلب في الرئيسية 💸' },
      { action: 'open', title: '📲 فتح البرنامج' }
    ] : (isMessage ? [
      { action: 'open_chat', title: '💬 فتح المحادثة والرد' },
      { action: 'open', title: '📲 فتح البرنامج' }
    ] : [
      { action: 'open', title: '📲 فتح البرنامج الآن' }
    ]))
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Handle User Tapping the Notification -> Instantly Open and Focus the App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};
  const notifTitle = (event.notification && event.notification.title) || '';

  if (action === 'dismiss') {
    return;
  }

  const isMoneyReq = data.type === 'REQUEST' || data.type === 'NEW_MONEY_REQUEST' || action === 'open_requests' || notifTitle.includes('طلب أموال') || notifTitle.includes('طلب مال');
  const isChat = !isMoneyReq && (data.type === 'MESSAGE' || action === 'open_chat' || Boolean(data.chatRecipientId));
  const chatTarget = isChat ? (data.chatRecipientId || (data.recipientId === 'all' ? 'all' : (data.senderId || 'all'))) : null;

  let targetUrl = self.location.origin + (data.url || '/');
  if (data.callId) {
    targetUrl += `?callId=${encodeURIComponent(data.callId)}&action=${encodeURIComponent(action || 'open')}`;
  } else if (isMoneyReq) {
    targetUrl = self.location.origin + `/?openPendingRequests=1&tab=dashboard${data.requestId ? `&requestId=${encodeURIComponent(data.requestId)}` : ''}`;
  } else if (isChat) {
    targetUrl = self.location.origin + `/?openChat=1&recipientId=${encodeURIComponent(chatTarget || 'all')}`;
  } else {
    targetUrl += `?fromNotif=1&notifType=${encodeURIComponent(data.type || 'general')}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If any app window/tab is already open, focus it and broadcast event
      for (let client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_OPENED',
            action: action || 'open',
            data: {
              ...data,
              openChat: isChat,
              chatRecipientId: chatTarget,
              openPendingRequests: isMoneyReq,
              requestId: data.requestId,
              tab: isMoneyReq ? 'dashboard' : undefined
            }
          });
          return client.focus();
        }
      }
      // 2. Otherwise open a new window directly in full screen
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. Network Pass-through
self.addEventListener('fetch', (event) => {
  return;
});
