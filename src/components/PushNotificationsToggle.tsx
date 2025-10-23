import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, BellOff } from 'lucide-react';

export const PushNotificationsToggle: React.FC = () => {
  const { permission, requestPermission, subscribe } = usePushNotifications();
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if ('serviceWorker' in navigator && permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      }
    })();
  }, [permission]);

  const activate = async () => {
    setLoading(true);
    setError(null);
    try {
      if (permission === 'default') {
        const p = await requestPermission();
        if (p !== 'granted') {
          setError('Permission refusée.');
          setLoading(false);
          return;
        }
      }
      const sub = await subscribe();
      setSubscribed(!!sub);
    } catch (e: any) {
      setError(e.message || 'Erreur pendant la souscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md bg-white shadow-sm">
      <div className="flex items-center gap-2">
        {subscribed ? <Bell className="w-5 h-5 text-green-600" /> : <BellOff className="w-5 h-5 text-gray-500" />}
        <span className="font-medium">Notifications push</span>
      </div>
      <p className="text-sm text-gray-600">
        Recevoir des alertes d'expiration même quand l'application est fermée.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={activate}
        disabled={loading || (permission === 'denied') || subscribed}
        className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Activation...' : subscribed ? 'Activé' : permission === 'denied' ? 'Permission refusée' : 'Activer'}
      </button>
    </div>
  );
};

export default PushNotificationsToggle;
