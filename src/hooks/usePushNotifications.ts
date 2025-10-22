import { useState, useEffect, useCallback } from 'react';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
    const [isSupported, setIsSupported] = useState(false);

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

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification
    };
}
