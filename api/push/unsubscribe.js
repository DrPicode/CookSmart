import { removeSubscriptionByEndpoint } from './_store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    removeSubscriptionByEndpoint(endpoint);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Unsubscribe error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}