import React from 'react';
import { Bell, BellOff, BellRing, Ban } from 'lucide-react';

interface NotificationBellToggleProps {
  permission: NotificationPermission;
  isEnabled: boolean;
  onToggle: () => void;
  onRequestPermission?: () => Promise<NotificationPermission | void>;
  size?: number;
  lang: 'fr' | 'en';
}

export const NotificationBellToggle: React.FC<NotificationBellToggleProps> = ({
  permission,
  isEnabled,
  onToggle,
  onRequestPermission,
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

  const handleClick = async () => {
    if (disabled) return;
    if (permission === 'default') {
      if (onRequestPermission) {
        await onRequestPermission();
      }
      return; // after permission request user can click again if granted
    }
    if (permission === 'granted') {
      onToggle();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={(() => {
        if (disabled) return 'p-2 rounded-lg border transition-colors border-gray-300 bg-gray-100 cursor-not-allowed';
        if (permission === 'granted' && isEnabled) return 'p-2 rounded-lg border transition-colors border-orange-300 bg-orange-50 hover:bg-orange-100';
        return 'p-2 rounded-lg border transition-colors border-gray-300 bg-white hover:bg-gray-100';
      })()}
    >
      {icon}
    </button>
  );
};