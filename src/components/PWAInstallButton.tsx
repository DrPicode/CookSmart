import { Download } from 'lucide-react';

interface PWAInstallButtonProps {
    isInstallable: boolean;
    isInstalled: boolean;
    onInstall: () => void;
    label: string;
}

export function PWAInstallButton({ isInstallable, isInstalled, onInstall, label }: PWAInstallButtonProps) {
    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <button
            onClick={onInstall}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
            aria-label={label}
        >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
