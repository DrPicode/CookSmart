import { useState, useEffect, useCallback } from 'react';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

function base64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = globalThis.atob(safe);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) output[i] = raw.codePointAt(i) || 0;
    return output;
}

async function fetchPublicKey(): Promise<string> {
    const res = await fetch('/api/push/vapid-public');
    if (!res.ok) throw new Error('Failed to fetch VAPID public key');
    const data = await res.json();
    return data.publicKey;
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

    useEffect(() => {
        if ('Notification' in globalThis) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            return 'denied';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }, [isSupported]);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== 'granted') {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                ...options
            });

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    }, [isSupported, permission]);

    const subscribe = useCallback(async () => {
        if (!isSupported) return null;
        if (permission !== 'granted') return null;
        if (!('serviceWorker' in navigator)) return null;
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
            setIsSubscribed(true);
            return existing;
        }
        const publicKey = await fetchPublicKey();
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(publicKey)
        });
        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: sub })
            });
        } catch (e) {
            console.error('Failed to persist subscription', e);
        }
        setIsSubscribed(true);
        return sub;
    }, [isSupported, permission]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported) return false;
        if (!('serviceWorker' in navigator)) return false;
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
            setIsSubscribed(false);
            return true;
        }
        try {
            const endpoint = existing.endpoint;
            await existing.unsubscribe();
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint })
            });
            setIsSubscribed(false);
            return true;
        } catch (e) {
            console.error('Failed to unsubscribe', e);
            return false;
        }
    }, [isSupported]);

    // Refresh subscription status on mount / permission change
    useEffect(() => {
        (async () => {
            if (!isSupported || !('serviceWorker' in navigator)) return;
            try {
                const registration = await navigator.serviceWorker.ready;
                const existing = await registration.pushManager.getSubscription();
                setIsSubscribed(!!existing);
            } catch { /* ignore */ }
        })();
    }, [isSupported, permission]);

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification,
        subscribe,
        unsubscribe,
        isSubscribed
    };
}
