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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title = 'CookSmart', body = 'Test notification', url = '/' } = req.body || {};
  const payload = JSON.stringify({ title, body, url });
  // Use a generous TTL (12h) so notifications survive device being offline/turned off for a while.
  const options = {
    TTL: 60 * 60 * 12, // 12 hours
    urgency: 'normal' // could be 'high' for very time-sensitive alerts
  };
  const results = [];
  for (const sub of subscriptions) {
    try {
  await webPush.sendNotification(sub, payload, options);
      results.push({ endpoint: sub.endpoint, ok: true });
    } catch (e) {
      console.error('Push send error', e?.statusCode, e?.body);
      results.push({ endpoint: sub.endpoint, ok: false, error: e?.message });
      if (e?.statusCode === 410 || e?.statusCode === 404) {
        removeSubscriptionByEndpoint(sub.endpoint);
      }
    }
  }
  return res.status(200).json({ sent: results.length, results });
}
