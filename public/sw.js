// Service Worker cho PWA và Thông Báo Di Động (CongiVec)
const CACHE_NAME = 'congivec-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/today',
  '/calendar',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Cache addAll warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Nhận lệnh từ trang web (Client) gửi qua postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200, 100, 250],
      requireInteraction: true,
      data: {
        url: options?.url || '/dashboard'
      },
      ...options
    };
    self.registration.showNotification(title, notificationOptions);

    // Hiển thị số 1 (Badge) trên đầu icon App màn hình chính
    if ('setAppBadge' in self.navigator) {
      self.navigator.setAppBadge(1).catch(() => {});
    }
  } else if (event.data && event.data.type === 'CLEAR_BADGE') {
    // Xóa số thông báo trên icon App khi người dùng đã mở xem
    if ('clearAppBadge' in self.navigator) {
      self.navigator.clearAppBadge().catch(() => {});
    }
  }
});

// Lắng nghe Push Notification từ server (nếu có Web Push)
self.addEventListener('push', (event) => {
  let data = { title: 'Sắp đến lịch!', body: 'Bạn có một lịch quan trọng sắp diễn ra' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Thông báo', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 250],
    requireInteraction: true,
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      'setAppBadge' in self.navigator ? self.navigator.setAppBadge(1).catch(() => {}) : Promise.resolve()
    ])
  );
});

// Khi người dùng chạm vào thông báo trên điện thoại
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  // Xóa số 1 trên icon khi đã chạm vào xem thông báo
  if ('clearAppBadge' in self.navigator) {
    self.navigator.clearAppBadge().catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
