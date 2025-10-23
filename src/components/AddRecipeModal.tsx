import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save } from 'lucide-react';
import { UseManagementReturn } from '../hooks/useManagement';

interface AddRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (k: string) => string;
    lang: 'fr' | 'en';
    management: UseManagementReturn;
    notify: (msg: string, duration?: number) => void; // toast function
}

export function AddRecipeModal({
    isOpen,
    onClose,
    t,
    lang,
    management,
    notify
}: AddRecipeModalProps) {
    const {
        newRecipe,
        setNewRecipe,
        addRecipe,
        allIngredients,
        recipeCategories,
        toggleIngredientInRecipe
    } = management;

    const handleAdd = () => {
        const categoryChosen = management.showNewRecipeCategoryField
            ? management.newRecipeCategoryInput.trim() !== ''
            : !!newRecipe.categorie;
        const isCategoryOnly = !newRecipe.nom.trim() && categoryChosen && newRecipe.ingredients.length === 0;

        if (isCategoryOnly) {
            let catName = newRecipe.categorie;
            if (management.showNewRecipeCategoryField) {
                catName = management.newRecipeCategoryInput.trim();
            }
            if (!catName) return;
            if (!management.recipeCategories.includes(catName)) {
                management.setRecipeCategories(prev => [...prev, catName]);
            }
            management.setNewRecipeCategoryInput('');
            management.handleRecipeCategoryChange('');
            notify(t('categorySavedNoRecipe'), 2500);
            onClose();
            return;
        }

        addRecipe();
        onClose();
    };

    const handleCancel = () => {
        management.setNewRecipeCategoryInput('');
        management.handleRecipeCategoryChange('');
        onClose();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={handleCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white flex items-center justify-between">
                                    <Dialog.Title className="font-semibold text-sm">
                                        {t('addRecipe')}
                                    </Dialog.Title>
                                    <button
                                        onClick={handleCancel}
                                        className="p-1 rounded hover:bg-white/20"
                                        aria-label={t('close')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 space-y-3">
                                    <input
                                        type="text"
                                        placeholder={lang === 'fr' ? 'Nom de la recette' : 'Recipe name'}
                                        value={newRecipe.nom}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, nom: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        autoFocus
                                    />

                                    <select
                                        value={management.showNewRecipeCategoryField ? '__NEW_CATEGORY__' : newRecipe.categorie}
                                        onChange={(e) => management.handleRecipeCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="">{t('chooseCategory')}</option>
                                        {recipeCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__NEW_CATEGORY__">
                                            {lang === 'fr' ? '➕ Nouvelle catégorie...' : '➕ New category...'}
                                        </option>
                                    </select>

                                    {management.showNewRecipeCategoryField && (
                                        <input
                                            type="text"
                                            placeholder={lang === 'fr' ? 'Nom de la nouvelle catégorie' : 'New category name'}
                                            value={management.newRecipeCategoryInput}
                                            onChange={(e) => management.setNewRecipeCategoryInput(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    )}

                                    <div className="border rounded-lg p-3 bg-white max-h-60 overflow-y-auto">
                                        <p className="text-sm font-semibold mb-2">
                                            {lang === 'fr' ? 'Sélectionner les ingrédients :' : 'Select ingredients:'}
                                        </p>
                                        {allIngredients.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">
                                                {lang === 'fr' ? 'Aucun ingrédient disponible. Ajoutez des ingrédients d\'abord.' : 'No ingredients available. Add ingredients first.'}
                                            </p>
                                        ) : (
                                            <div className="space-y-1">
                                                {allIngredients.map(ing => (
                                                    <label key={ing} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={newRecipe.ingredients.includes(ing)}
                                                            onChange={() => toggleIngredientInRecipe(ing)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm">{ing}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleAdd}
                                            disabled={(() => {
                                                const categoryChosen = management.showNewRecipeCategoryField
                                                    ? management.newRecipeCategoryInput.trim() !== ''
                                                    : !!newRecipe.categorie;
                                                const isCategoryOnly = !newRecipe.nom.trim() && categoryChosen && newRecipe.ingredients.length === 0;
                                                if (isCategoryOnly) return false; // allow category-only save
                                                return (
                                                    !newRecipe.nom.trim() ||
                                                    !categoryChosen ||
                                                    newRecipe.ingredients.length === 0
                                                );
                                            })()}
                                            className="flex-1 bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600"
                                        >
                                            <Save className="w-4 h-4" />
                                            {t('save')}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
