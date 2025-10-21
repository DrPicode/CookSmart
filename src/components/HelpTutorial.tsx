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
}

export function HelpTutorial({ open, onClose, lang, t, isFirstTime = false, onStartWithDemo, onStartEmpty }: HelpTutorialProps) {
    const steps: { id: number; title: string; detail: string }[] = lang === 'fr'
        ? [
            { id: 1, title: 'Catégories d\'ingrédients', detail: 'Dans Gestion, ajoutez vos catégories. Le flocon ❄️ active le suivi de péremption.' },
            { id: 2, title: 'Ajouter les ingrédients', detail: 'Ajoutez chaque ingrédient avec prix et parts. Date de péremption pour les catégories fraîches.' },
            { id: 3, title: 'Catégories de recettes', detail: 'Créez vos catégories de recettes (Salade, Pâtes...).' },
            { id: 4, title: 'Créer les recettes', detail: 'Nommez la recette et sélectionnez les ingrédients. Le coût est calculé automatiquement.' },
            { id: 5, title: 'Faire les courses', detail: 'Dans Courses, démarrez une session et cochez vos achats.' },
            { id: 6, title: 'Voir les recettes possibles', detail: 'L\'onglet Recettes affiche ce que vous pouvez cuisiner et les produits à consommer en priorité.' }
        ]
        : [
            { id: 1, title: 'Ingredient categories', detail: 'In Manage, add categories. Click ❄️ to enable expiry tracking.' },
            { id: 2, title: 'Add ingredients', detail: 'Add ingredients with price and parts. Expiry date for fresh categories.' },
            { id: 3, title: 'Recipe categories', detail: 'Create recipe categories (Salad, Pasta...).' },
            { id: 4, title: 'Create recipes', detail: 'Name the recipe and select ingredients. Cost is computed automatically.' },
            { id: 5, title: 'Go shopping', detail: 'In Groceries, start a session and check your purchases.' },
            { id: 6, title: 'See possible recipes', detail: 'Recipes tab shows what you can cook and items to consume soon.' }
        ];

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={isFirstTime ? () => { } : onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                                    {!isFirstTime && (
                                        <button onClick={onClose} className="p-1 rounded hover:bg-white/20" aria-label={t('close')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
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
                                            <div className="pt-2 flex flex-col sm:flex-row gap-2">
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
            className="fixed bottom-20 right-4 sm:right-6 z-[60] bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold hover:shadow-xl active:scale-[.97]"
        >
            <HelpCircle className="w-4 h-4" /> {label}
        </button>
    );
}
