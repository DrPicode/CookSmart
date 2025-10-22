import { useEffect, useCallback } from 'react';
import { IngredientsType } from '../types';
import { computeExpiryStatus } from '../utils/expiry';

interface UseExpiryNotificationsProps {
    ingredients: IngredientsType;
    isEnabled: boolean;
    sendNotification: (title: string, options?: NotificationOptions) => Notification | null;
    lang: 'fr' | 'en';
}

export function useExpiryNotifications({
    ingredients,
    isEnabled,
    sendNotification,
    lang
}: UseExpiryNotificationsProps) {
    
    const checkExpiry = useCallback(() => {
        if (!isEnabled) return;

        const today = new Date().toISOString().split('T')[0];
        const notifiedKey = `notified-${today}`;
        
        try {
            const lastNotified = localStorage.getItem(notifiedKey);
            if (lastNotified === 'true') return;
        } catch (e) {}

        // Trouver les ingrédients qui expirent bientôt
        const expiringItems: { name: string; status: string; daysLeft: number }[] = [];
        const expiredItems: string[] = [];

        Object.entries(ingredients).forEach(([name, data]) => {
            if (data.inStock && data.expiryDate) {
                const { status, daysLeft } = computeExpiryStatus({
                    expiryDate: data.expiryDate,
                    inStock: data.inStock
                });

                if (status === 'expired') {
                    expiredItems.push(name);
                } else if (status === 'soon' && daysLeft <= 2) {
                    expiringItems.push({ name, status, daysLeft });
                }
            }
        });

        if (expiredItems.length > 0) {
            const title = lang === 'fr' 
                ? `⚠️ ${expiredItems.length} produit${expiredItems.length > 1 ? 's' : ''} périmé${expiredItems.length > 1 ? 's' : ''}`
                : `⚠️ ${expiredItems.length} expired product${expiredItems.length > 1 ? 's' : ''}`;
            
            const body = lang === 'fr'
                ? `Produits périmés : ${expiredItems.slice(0, 3).join(', ')}${expiredItems.length > 3 ? '...' : ''}`
                : `Expired products: ${expiredItems.slice(0, 3).join(', ')}${expiredItems.length > 3 ? '...' : ''}`;

            sendNotification(title, {
                body,
                tag: 'expired-items',
                requireInteraction: true
            });
        }

        if (expiringItems.length > 0) {
            const title = lang === 'fr'
                ? `🔔 ${expiringItems.length} produit${expiringItems.length > 1 ? 's' : ''} à consommer rapidement`
                : `🔔 ${expiringItems.length} product${expiringItems.length > 1 ? 's' : ''} expiring soon`;

            const body = lang === 'fr'
                ? expiringItems.slice(0, 3).map(item => `${item.name} (J-${item.daysLeft})`).join(', ') + (expiringItems.length > 3 ? '...' : '')
                : expiringItems.slice(0, 3).map(item => `${item.name} (${item.daysLeft}d left)`).join(', ') + (expiringItems.length > 3 ? '...' : '');

            sendNotification(title, {
                body,
                tag: 'expiring-items'
            });
        }

        // Marquer qu'on a notifié aujourd'hui
        if (expiredItems.length > 0 || expiringItems.length > 0) {
            try {
                localStorage.setItem(notifiedKey, 'true');
            } catch (e) {}
        }
    }, [ingredients, isEnabled, sendNotification, lang]);

    useEffect(() => {
        if (isEnabled) {
            const timer = setTimeout(checkExpiry, 2000);
            return () => clearTimeout(timer);
        }
    }, [checkExpiry, isEnabled]);

    useEffect(() => {
        if (!isEnabled) return;

        const interval = setInterval(checkExpiry, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkExpiry, isEnabled]);

    return { checkExpiry };
}
