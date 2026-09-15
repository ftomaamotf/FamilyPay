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

  const options = {
    body: data.body || (isCall ? 'يرن عليك الآن.. اضغط للرد الفوري والتحدث 📲' : 'اضغط هنا لفتح البرنامج ومتابعة التفاصيل فوراً 📱'),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // Rich repeating alert vibration pattern until opened
    vibrate: isCall
      ? [1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
      : [600, 300, 600, 300, 600],
    tag: data.tag || (isCall ? ('incoming-call-' + (data.callId || 'active')) : ('familypay-alert-' + (data.type || 'msg') + '-' + Date.now())),
    renotify: true,
    // 🌟 KEEP PERSISTENT IN NOTIFICATION DRAWER UNTIL USER TAPS/APPROVES OPENING 🌟
    requireInteraction: true,
    silent: false,
    data: {
      url: data.url || '/',
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      type: data.type || 'GENERAL',
      timestamp: Date.now()
    },
    actions: isCall ? [
      { action: 'open', title: '🟢 فتح والرد على المكالمة 📞' },
      { action: 'dismiss', title: '🔴 إغلاق' }
    ] : [
      { action: 'open', title: '📲 فتح البرنامج الآن' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Handle User Tapping the Notification -> Instantly Open and Focus the App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  const targetUrl = self.location.origin + (data.url || '/') + (data.callId ? `?callId=${data.callId}&action=${action || 'open'}` : `?fromNotif=1&notifType=${data.type || 'general'}`);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If any app window/tab is already open, focus it and broadcast event
      for (let client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_OPENED',
            action: action || 'open',
            data
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
