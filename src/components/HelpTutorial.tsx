import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, HelpCircle, BookOpen } from 'lucide-react';

export interface HelpTutorialProps {
    open: boolean;
    onClose: () => void;
    lang: 'fr' | 'en';
    t: (k: string) => string;
    isFirstTime?: boolean;
    onStartWithDemo?: () => void;
    onStartEmpty?: () => void;
    onStartInteractiveTutorial?: () => void;
    onToggleLang?: () => void;
    isInstallable?: boolean;
    isInstalled?: boolean;
    onInstallPWA?: () => void;
}

export function HelpTutorial({ open, onClose, lang, t, isFirstTime = false, onStartWithDemo, onStartEmpty, onStartInteractiveTutorial, onToggleLang, isInstallable, isInstalled, onInstallPWA }: HelpTutorialProps) {
    const steps: { id: number; title: string; detail: string }[] = lang === 'fr'
        ? [
            { id: 1, title: 'Ajouter les ingrédients', detail: 'Cliquez sur le bouton + dans l\'onglet Courses. Ajoutez vos catégories et ingrédients (activez le ❄️ sur les catégories produits frais)' },
            { id: 2, title: 'Créer les recettes', detail: 'Cliquez sur le bouton + dans l\'onglet Recettes. Nommez la recette, créez une catégorie si besoin, et sélectionnez les ingrédients.' },
            { id: 3, title: 'Faire les courses', detail: 'Dans Courses, démarrez une session et cochez vos achats au fur et à mesure. Renseignez les dates de péremption pour les produits frais.' },
            { id: 4, title: 'Voir les recettes possibles', detail: 'L\'onglet Recettes affiche ce que vous pouvez cuisiner avec vos ingrédients en stock et les produits à consommer en priorité.' }
        ]
        : [
            { id: 1, title: 'Add ingredients', detail: 'Click the + button in the Groceries tab. Add your categories and ingredients (activate the ❄️ on fresh produce categories)' },
            { id: 2, title: 'Create recipes', detail: 'Click the + button in the Recipes tab. Name the recipe, create a category if needed, and select ingredients.' },
            { id: 3, title: 'Go shopping', detail: 'In Groceries, start a session and check your purchases as you go. Enter expiry dates for fresh products.' },
            { id: 4, title: 'See possible recipes', detail: 'Recipes tab shows what you can cook with your ingredients in stock and items to consume soon.' }
        ];

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[250]" onClose={isFirstTime ? () => { } : onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-white flex items-center justify-between">
                                    <Dialog.Title className="flex items-center gap-2 font-semibold text-sm">
                                        <BookOpen className="w-5 h-5" /> {t('tutorialTitle')}
                                    </Dialog.Title>
                                    <div className="flex items-center gap-2">
                                        {isFirstTime && onToggleLang && (
                                            <button
                                                onClick={onToggleLang}
                                                className="px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30 font-medium"
                                                aria-label={t('langToggle')}
                                            >
                                                {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
                                            </button>
                                        )}
                                        {!isFirstTime && (
                                            <button onClick={onClose} className="p-1 rounded hover:bg-white/20" aria-label={t('close')}>
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {t('tutorialIntro')}
                                    </p>
                                    <ol className="space-y-3">
                                        {steps.map(step => (
                                            <li key={step.id} className="flex items-start gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shadow-inner">{step.id}</span>
                                                    {step.id !== steps.length && <span className="w-px flex-1 bg-gradient-to-b from-orange-200 to-red-200 mt-1" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-semibold text-gray-800 mb-0.5">{step.title}</h3>
                                                    <p className="text-[11px] text-gray-600 leading-snug">{step.detail}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                    {isFirstTime ? (
                                        <>
                                            {isInstallable && !isInstalled && (
                                                <div className="pt-1 pb-1 px-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-lg">📱</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] text-gray-600 mb-1">{t('installPWADescription')}</p>
                                                            <button
                                                                onClick={() => {
                                                                    onInstallPWA?.();
                                                                }}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold py-1 rounded shadow-sm"
                                                            >{t('installPWAButton')}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-2 flex flex-col gap-2">
                                                <button
                                                    onClick={() => {
                                                        onStartInteractiveTutorial?.();
                                                        onClose();
                                                    }}
                                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    🍝 {lang === 'fr' ? 'Tutoriel interactif (Pâtes Bolognaise)' : 'Interactive Tutorial (Pasta Bolognese)'}
                                                </button>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <button
                                                        onClick={() => {
                                                            onStartWithDemo?.();
                                                            onClose();
                                                        }}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg shadow"
                                                    >{t('tutorialStartWithDemo')}</button>
                                                    <button
                                                        onClick={() => {
                                                            onStartEmpty?.();
                                                            onClose();
                                                        }}
                                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg shadow"
                                                    >{t('tutorialStartEmpty')}</button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 text-center">{t('tutorialFooterNote')}</p>
                                        </>
                                    ) : (
                                        <div className="pt-2">
                                            <p className="text-[10px] text-gray-400 text-center">{t('tutorialFooterNote')}</p>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

export function FloatingHelpButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold hover:shadow-xl active:scale-[.97]"
        >
            <HelpCircle className="w-4 h-4" /> {label}
        </button>
    );
}
