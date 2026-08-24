// ======================================================================
// FamilyPay Service Worker: Background Push Notifications for Calls & PWA
// ======================================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Handle Background Push Events (Fires even when app is closed on Android & iOS 16.4+)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '📞 مكالمة صوتية واردة', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '📞 مكالمة صوتية واردة';
  const isCall = data.type === 'INCOMING_CALL' || title.includes('مكالمة');

  const options = {
    body: data.body || (isCall ? 'يرن عليك الآن.. اضغط للرد الفوري والتحدث 📲' : 'إشعار جديد من صندوق العائلة'),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // Repeating ring vibration pattern for calls
    vibrate: isCall ? [800, 400, 800, 400, 800, 400, 800, 400, 800] : [250, 150, 250],
    tag: isCall ? ('incoming-call-' + (data.callId || 'active')) : ('notif-' + Date.now()),
    renotify: true,
    requireInteraction: isCall ? true : false,
    silent: false,
    data: {
      url: data.url || '/',
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      type: data.type || 'INCOMING_CALL',
      timestamp: Date.now()
    },
    actions: isCall ? [
      { action: 'accept', title: '🟢 فتح والرد' },
      { action: 'reject', title: '🔴 إغلاق' }
    ] : [
      { action: 'open', title: '👁️ عرض' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Handle User Tapping the Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};

  const targetUrl = (data.url || '/') + (data.callId ? `?callId=${data.callId}&action=${action || 'open'}` : '');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and broadcast event
      for (let client of windowClients) {
        if ('focus' in client) {
          client.postMessage({
            type: 'CALL_NOTIFICATION_CLICK',
            action: action || 'open',
            data
          });
          return client.focus();
        }
      }
      // Otherwise open a new window directly
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
