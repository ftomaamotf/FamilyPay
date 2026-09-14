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

  const isDisabledCall = data.type === 'INCOMING_CALL';
  const title = isDisabledCall ? '🔔 تنبيه من صندوق العائلة' : (data.title || '🔔 تنبيه من صندوق العائلة');

  const options = {
    body: isDisabledCall ? 'اضغط هنا لفتح البرنامج ومتابعة التفاصيل فوراً 📱' : (data.body || 'اضغط هنا لفتح البرنامج ومتابعة التفاصيل فوراً 📱'),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // Rich repeating alert vibration pattern until opened
    vibrate: [600, 300, 600, 300, 600],
    tag: data.tag || ('familypay-alert-' + (data.type || 'msg') + '-' + Date.now()),
    renotify: true,
    // 🌟 KEEP PERSISTENT IN NOTIFICATION DRAWER UNTIL USER TAPS/APPROVES OPENING 🌟
    requireInteraction: true,
    silent: false,
    data: {
      url: data.url || '/',
      type: data.type || 'GENERAL',
      timestamp: Date.now()
    },
    actions: [
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

  const targetUrl = self.location.origin + (data.url || '/') + `?fromNotif=1&notifType=${data.type || 'general'}`;

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
