import React from 'react';
import { Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
    isSupported: boolean;
    permission: 'default' | 'granted' | 'denied';
    isEnabled: boolean;
    onToggle: () => void;
    t: (key: string) => string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    isSupported,
    permission,
    isEnabled,
    onToggle,
    t
}) => {
    if (!isSupported) {
        return null;
    }

    const getButtonText = () => {
        if (permission === 'denied') {
            return t('notificationDenied');
        }
        if (permission === 'granted' && isEnabled) {
            return t('notificationEnabled');
        }
        return t('notificationEnable');
    };

    const getButtonClass = () => {
        if (permission === 'denied') {
            return 'bg-gray-300 text-gray-600 cursor-not-allowed';
        }
        if (permission === 'granted' && isEnabled) {
            return 'bg-green-100 text-green-700 border-green-300';
        }
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 active:scale-[.98]';
    };

    return (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 mb-4 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex-shrink-0">
                        {isEnabled && permission === 'granted' ? (
                            <Bell className="w-4 h-4 text-orange-600" />
                        ) : (
                            <BellOff className="w-4 h-4 text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-semibold text-gray-800">{t('notificationTitle')}</h3>
                        <p className="text-[11px] text-gray-600 leading-tight">{t('notificationDescription')}</p>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    disabled={permission === 'denied'}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-smooth whitespace-nowrap ${getButtonClass()}`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};
