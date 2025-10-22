import React from 'react';
import { Bell, BellOff, BellRing, Ban } from 'lucide-react';

interface NotificationBellToggleProps {
  permission: NotificationPermission;
  isEnabled: boolean;
  onToggle: () => void;
  t: (k: string) => string;
  size?: number;
  lang: 'fr' | 'en';
}

/**
 * Compact bell icon toggle for notifications.
 * States:
 * - granted + enabled => active (ringing)
 * - granted + disabled => outline bell
 * - default => muted bell (suggest enabling)
 * - denied => crossed / ban icon (non-interactive)
 */
export const NotificationBellToggle: React.FC<NotificationBellToggleProps> = ({
  permission,
  isEnabled,
  onToggle,
  t,
  size = 18,
  lang
}) => {
  const disabled = permission === 'denied';

  const title = (() => {
    if (permission === 'denied') return lang === 'fr' ? 'Notifications refusées' : 'Notifications denied';
    if (permission === 'granted' && isEnabled) return lang === 'fr' ? 'Notifications activées' : 'Notifications enabled';
    if (permission === 'granted') return lang === 'fr' ? 'Activer les notifications' : 'Enable notifications';
    return lang === 'fr' ? 'Demander l\'autorisation' : 'Request permission';
  })();

  const icon = (() => {
    if (permission === 'denied') return <Ban size={size} className="text-gray-400" />;
    if (permission === 'granted' && isEnabled) return <BellRing size={size} className="text-orange-600" />;
    if (permission === 'granted') return <Bell size={size} className="text-gray-600" />;
    return <BellOff size={size} className="text-gray-500" />;
  })();

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle()}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-2 rounded-lg border transition-colors ${
        disabled
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
          : isEnabled && permission === 'granted'
          ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
          : 'border-gray-300 bg-white hover:bg-gray-100'
      }`}
    >
      {icon}
    </button>
  );
};