// Custom Web Push handlers imported by Workbox generateSW via importScripts.
self.addEventListener('push', event => {
  let data = {};
  try { if (event.data) data = event.data.json(); } catch { data = { title: 'CookSmart', body: 'Notification' }; }
  const title = data.title || 'CookSmart';
  const options = {
    body: data.body || "Un aliment approche de sa date d'expiration.",
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'cooksmart-expiry',
    data: { url: data.url || '/', ...data }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const match = allClients.find(c => c.url.includes(targetUrl));
    if (match) return match.focus();
    return self.clients.openWindow(targetUrl);
  })());
});
