import webPush from 'web-push';
import { subscriptions, removeSubscriptionByEndpoint } from './_store.js';

function init() {
  if (process.env.PUSH_VAPID_PUBLIC_KEY && process.env.PUSH_VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
      'mailto:admin@cooksmart.app',
      process.env.PUSH_VAPID_PUBLIC_KEY,
      process.env.PUSH_VAPID_PRIVATE_KEY
    );
  }
}
init();

async function getItemsExpiringSoon() {
  return [
    { itemName: 'Yaourt', expiryDate: '2025-10-25' }
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();
  const items = await getItemsExpiringSoon();
  if (!items.length) return res.status(200).json({ ok: true, message: 'No items expiring soon.' });

  let notificationsSent = 0;
  for (const item of items) {
    const payload = JSON.stringify({
      title: '📦 Expiration prochaine',
      body: `${item.itemName} expire bientôt (${item.expiryDate}).`,
      url: '/?focus=expiry'
    });
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub, payload);
        notificationsSent++;
      } catch (e) {
        console.error('Push send error', e?.statusCode, e?.body);
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          removeSubscriptionByEndpoint(sub.endpoint);
        }
      }
    }
  }
  return res.status(200).json({ ok: true, items: items.length, notificationsSent });
}
