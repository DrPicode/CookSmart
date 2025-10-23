import { addSubscription } from './_store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { subscription } = req.body || {};
    if (!subscription) return res.status(400).json({ error: 'Missing subscription' });
    addSubscription(subscription);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Subscribe error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
