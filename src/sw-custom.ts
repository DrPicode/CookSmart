// Custom service worker additions for Web Push handling.
// This file is imported by the Workbox-generated service worker via importScripts.
// Only ServiceWorker APIs are used; avoid DOM-specific globals.

// We rely on the global service worker scope via globalThis (no explicit redeclare of self).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PushPayload { title?: string; body?: string; url?: string; tag?: string; icon?: string; [key: string]: any }

self.addEventListener('push', (event: any) => {
  let data: PushPayload = {};
  try {
    if (event.data) data = event.data.json();
  } catch { data = { title: 'CookSmart', body: 'Notification' }; }

  const title = data.title || 'CookSmart';
  const options: NotificationOptions = {
    body: data.body || "Un aliment approche de sa date d'expiration.",
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'cooksmart-expiry',
    data: { url: data.url || '/', ...data }
  };

  const swScope = globalThis as any;
  if (swScope.registration) {
    event.waitUntil(swScope.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
  const swScope = globalThis as any;
  const allClients = await swScope.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const match = allClients.find((client: any) => client.url.includes(targetUrl));
      if (match) {
        return match.focus();
      }
  return swScope.clients.openWindow(targetUrl);
    })()
  );
});
