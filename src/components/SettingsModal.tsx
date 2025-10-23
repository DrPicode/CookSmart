import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Languages, Trash2, HelpCircle, BellRing, BellOff, Download, Info } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  t: (k: string) => string;
  lang: 'fr' | 'en';
  onToggleLang: () => void;
  onOpenHelp: () => void;
  onResetData: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPWA: () => void;
  // Removed legacy notification permission callback (push hook handles it)
  onNotifyInfo?: (msg: string) => void;
  onNotifySuccess?: (msg: string) => void;
  onNotifyError?: (msg: string) => void;
  onExportData?: () => void;
  onImportData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importError?: string | null;
  pushPermission: NotificationPermission;
  isSubscribed: boolean;
  onRequestPushPermission: () => Promise<NotificationPermission>;
  onSubscribePush: () => Promise<any>;
  onUnsubscribePush: () => Promise<boolean>;
  pushBusy: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  t,
  lang,
  onToggleLang,
  onOpenHelp,
  onResetData,
  notificationsEnabled,
  onToggleNotifications,
  isInstallable,
  isInstalled,
  onInstallPWA,
  onNotifyInfo,
  onNotifySuccess,
  onNotifyError,
  onExportData,
  onImportData,
  importError,
  pushPermission,
  isSubscribed,
  onRequestPushPermission,
  onSubscribePush,
  onUnsubscribePush,
  pushBusy,
}) => {
  // Push state lifted to parent.
  // (Legacy notification bell logic removed; unified push + local toggle below)
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[250]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" /> {lang === 'fr' ? 'Paramètres' : 'Settings'}
              </h2>
              <button
                onClick={onClose}
                aria-label={t('close')}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">{lang === 'fr' ? 'Langue' : 'Language'}</p>
                    <p className="text-xs text-gray-500">{lang === 'fr' ? 'Basculer FR / EN' : 'Switch FR / EN'}</p>
                  </div>
                </div>
                <button
                  onClick={onToggleLang}
                  className="w-28 justify-center flex px-3 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 active:scale-[.97]"
                >{lang.toUpperCase()}</button>
              </div>

              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{t('help')}</p>
                    <p className="text-xs text-gray-500">{lang === 'fr' ? 'Ouvrir l\'aide & tutoriel' : 'Open help & tutorial'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onOpenHelp(); }}
                  className="w-28 justify-center flex px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 active:scale-[.97]"
                >{lang === 'fr' ? 'Ouvrir' : 'Open'}</button>
              </div>

              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSubscribed && pushPermission === 'granted' ? (
                    <BellRing className="w-5 h-5 text-orange-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{lang === 'fr' ? 'Notifications' : 'Notifications'}</p>
                    <p className="text-xs text-gray-500">
                      {lang === 'fr'
                        ? 'Alertes d\'expiration (local + push).'
                        : 'Expiry alerts (local + push).'}
                    </p>
                    <p className="text-[10px] mt-0.5 font-medium">
                      {pushPermission === 'denied' && (
                        <span className="text-red-600">{lang === 'fr' ? 'Refusées par le navigateur' : 'Denied by browser'}</span>
                      )}
                      {pushPermission !== 'denied' && !isSubscribed && (
                        <span className="text-gray-500">{lang === 'fr' ? 'Non abonné' : 'Not subscribed'}</span>
                      )}
                      {pushPermission === 'granted' && isSubscribed && (
                        <span className="text-green-600">{lang === 'fr' ? 'Abonné' : 'Subscribed'}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    // Refresh permission variable after potential request
                    let current = pushPermission;
                    if (current === 'default') {
                      current = await onRequestPushPermission();
                      if (current !== 'granted') {
                        onNotifyError?.(lang === 'fr' ? 'Permission refusée' : 'Permission denied');
                        return;
                      }
                    }
                    if (current === 'denied') return;

                    if (!isSubscribed) {
                      if (!notificationsEnabled) onToggleNotifications();
                      const sub = await onSubscribePush();
                      if (sub) {
                        onNotifySuccess?.(lang === 'fr' ? 'Notifications activées' : 'Notifications enabled');
                      } else {
                        onNotifyError?.(lang === 'fr' ? 'Échec de l\'activation' : 'Failed to enable');
                      }
                    } else {
                      const ok = await onUnsubscribePush();
                      if (ok) {
                        if (notificationsEnabled) onToggleNotifications();
                        onNotifyInfo?.(lang === 'fr' ? 'Notifications désactivées' : 'Notifications disabled');
                      } else {
                        onNotifyError?.(lang === 'fr' ? 'Échec de la désactivation' : 'Failed to disable');
                      }
                    }
                  }}
                  disabled={pushPermission === 'denied' || pushBusy}
                  className={
                    `w-28 justify-center flex px-3 py-2 rounded-lg text-xs font-medium transition-colors ` +
                    (pushPermission === 'denied'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : pushBusy
                        ? 'bg-orange-300 text-white cursor-wait'
                        : isSubscribed
                          ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-[.97]'
                          : 'bg-green-600 text-white hover:bg-green-700 active:scale-[.97]')
                  }
                >
                  {pushPermission === 'denied'
                    ? (lang === 'fr' ? 'Refusée' : 'Denied')
                    : pushBusy
                      ? (lang === 'fr' ? 'Chargement…' : 'Loading…')
                      : isSubscribed
                        ? (lang === 'fr' ? 'Désactiver' : 'Disable')
                        : (lang === 'fr' ? 'Activer' : 'Enable')}
                </button>
              </div>

              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">{lang === 'fr' ? 'Réinitialiser' : 'Reset data'}</p>
                    <p className="text-xs text-gray-500">{lang === 'fr' ? 'Effacer toutes les données locales' : 'Delete all local data'}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onResetData(); }}
                  className="w-28 justify-center flex px-3 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 active:scale-[.97]"
                >{lang === 'fr' ? 'Effacer' : 'Clear'}</button>
              </div>

              
              {!isInstalled && isInstallable && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{lang === 'fr' ? 'Installer l\'app' : 'Install app'}</p>
                      <p className="text-xs text-gray-500">{lang === 'fr' ? 'Ajoutez CookSmart sur votre appareil' : 'Add CookSmart to your device'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onInstallPWA(); }}
                    className="w-28 justify-center flex px-3 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 active:scale-[.97]"
                  >{lang === 'fr' ? 'Installer' : 'Install'}</button>
                </div>
              )}

              {/* IMPORT / EXPORT */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{t('importExport')}</p>
                    <p className="text-xs text-gray-500">{t('importExportInfo')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 active:scale-[.97] flex items-center gap-2"
                  >
                    {lang === 'fr' ? 'Exporter' : 'Export'}
                  </button>
                  <label className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 active:scale-[.97] flex items-center gap-2 cursor-pointer">
                    {lang === 'fr' ? 'Importer' : 'Import'}
                    <input type="file" accept="application/json" className="hidden" onChange={onImportData} />
                  </label>
                  {importError && (
                    <span className="text-xs text-red-600">{importError}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};