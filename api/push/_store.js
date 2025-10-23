// In-memory subscription store (root api). Replace with a DB in production.
export const subscriptions = [];
export function addSubscription(sub) {
  if (!sub || !sub.endpoint) return;
  if (!subscriptions.some(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }
}
export function removeSubscriptionByEndpoint(endpoint) {
  const idx = subscriptions.findIndex(s => s.endpoint === endpoint);
  if (idx !== -1) subscriptions.splice(idx, 1);
}
