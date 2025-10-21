import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, HelpCircle, BookOpen } from 'lucide-react';

export interface HelpTutorialProps {
    open: boolean;
    onClose: () => void;
    lang: 'fr' | 'en';
    t: (k: string) => string;
}

// Simple responsive modal with focus trapping via Headless UI
export function HelpTutorial({ open, onClose, lang, t }: HelpTutorialProps) {
    const steps: { id: number; title: string; detail: string }[] = lang === 'fr'
        ? [
            { id: 1, title: 'Créer des catégories d\'ingrédients', detail: 'Dans l\'onglet Gestion, ajoutez vos catégories (ex: Produits frais, Épicerie...).' },
            { id: 2, title: 'Ajouter les ingrédients', detail: 'Toujours dans Gestion, ajoutez chaque ingrédient avec le prix, les parts (nombre de portions) et la date de péremption si c\'est un produit frais.' },
            { id: 3, title: 'Créer les catégories de recettes', detail: 'Ajoutez vos catégories de recettes (ex: Salade, Pâtes...). Cela aide à regrouper vos idées.' },
            { id: 4, title: 'Créer les recettes', detail: 'Définissez le nom et sélectionnez les ingrédients nécessaires. Le coût par personne est calculé automatiquement.' },
            { id: 5, title: 'Faire les courses', detail: 'Dans l\'onglet Courses, démarrez une session. Cochez ce que vous mettez dans le panier. Pour les produits frais, renseignez la date de péremption juste après achat.' },
            { id: 6, title: 'Voir les recettes possibles', detail: 'L\'onglet Recettes liste ce que vous pouvez cuisiner avec ce qui est en stock et met en avant les ingrédients qui périment bientôt.' },
            { id: 7, title: 'Sauvegarder / Restaurer', detail: 'Utilisez Import / Export dans Gestion pour sauvegarder toutes vos données ou les restaurer sur un autre appareil.' }
        ]
        : [
            { id: 1, title: 'Create ingredient categories', detail: 'In the Manage tab, add your categories (e.g. Fresh products, Pantry...).' },
            { id: 2, title: 'Add ingredients', detail: 'Still in Manage, add each ingredient with price, parts (portions) and expiry date if it\'s fresh.' },
            { id: 3, title: 'Create recipe categories', detail: 'Add recipe categories (e.g. Salad, Pasta...). This groups your ideas.' },
            { id: 4, title: 'Create recipes', detail: 'Set the name and select needed ingredients. Cost per person is computed automatically.' },
            { id: 5, title: 'Go shopping', detail: 'In the Groceries tab, start a session. Check items as you put them in the cart. For fresh products, enter the expiry date right after purchase.' },
            { id: 6, title: 'See possible recipes', detail: 'The Recipes tab lists meals you can cook now and highlights soon-expiring ingredients.' },
            { id: 7, title: 'Save / Restore', detail: 'Use Import / Export (Manage tab) to backup all data or move it to another device.' }
        ];

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                                    <button onClick={onClose} className="p-1 rounded hover:bg-white/20" aria-label={t('close')}>
                                        <X className="w-4 h-4" />
                                    </button>
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
                                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => {
                                                onClose();
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg shadow"
                                        >{t('tutorialGotIt')}</button>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg"
                                        >{t('tutorialBackToTop')}</button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center">{t('tutorialFooterNote')}</p>
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
