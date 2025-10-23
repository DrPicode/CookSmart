// In-memory subscription store (replace with a real database in production)
export const subscriptions = [];

export function addSubscription(sub) {
  if (!sub || !sub.endpoint) return;
  if (!subscriptions.find(s => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }
}

export function removeSubscriptionByEndpoint(endpoint) {
  const idx = subscriptions.findIndex(s => s.endpoint === endpoint);
  if (idx !== -1) subscriptions.splice(idx, 1);
}
