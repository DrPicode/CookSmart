import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Languages, Trash2, HelpCircle, BellRing, BellOff, Download, Info } from 'lucide-react';
import { NotificationBellToggle } from './NotificationBellToggle';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  t: (k: string) => string;
  lang: 'fr' | 'en';
  onToggleLang: () => void;
  onOpenHelp: () => void;
  onResetData: () => void;
  permission: NotificationPermission;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPWA: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  t,
  lang,
  onToggleLang,
  onOpenHelp,
  onResetData,
  permission,
  notificationsEnabled,
  onToggleNotifications,
  isInstallable,
  isInstalled,
  onInstallPWA
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[250]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <Dialog.Title className="text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" /> {lang === 'fr' ? 'Paramètres' : 'Settings'}
              </Dialog.Title>
              <button
                onClick={onClose}
                aria-label={t('close')}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Language */}
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

              {/* Help / Tutorial */}
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

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notificationsEnabled && permission === 'granted' ? (
                    <BellRing className="w-5 h-5 text-orange-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{lang === 'fr' ? 'Notifications' : 'Notifications'}</p>
                    <p className="text-xs text-gray-500">{lang === 'fr' ? 'Alertes péremption produits' : 'Expiry alerts for products'}</p>
                  </div>
                </div>
                <NotificationBellToggle
                  permission={permission}
                  isEnabled={notificationsEnabled}
                  onToggle={onToggleNotifications}
                  t={t}
                  lang={lang}
                />
              </div>

              {/* Reset Data */}
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

              {/* PWA Install (keep header button if not installed) */}
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
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};