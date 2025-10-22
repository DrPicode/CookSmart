import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save } from 'lucide-react';
import { IngredientsType, CategoriesType, FreshCategoriesType } from '../types';
import { UseManagementReturn } from '../hooks/useManagement';

interface AddIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (k: string) => string;
    lang: 'fr' | 'en';
    categories: CategoriesType;
    ingredients: IngredientsType;
    freshCategories: FreshCategoriesType;
    management: UseManagementReturn;
}

export function AddIngredientModal({
    isOpen,
    onClose,
    t,
    lang,
    categories,
    ingredients,
    freshCategories,
    management
}: AddIngredientModalProps) {
    const {
        newIngredient,
        setNewIngredient,
        addIngredient
    } = management;

    const handleAdd = () => {
        addIngredient();
        onClose();
    };

    const handleCancel = () => {
        management.setNewIngredientCategoryInput('');
        management.handleIngredientCategoryChange('');
        onClose();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={handleCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white flex items-center justify-between">
                                    <Dialog.Title className="font-semibold text-sm">
                                        {t('addIngredient')}
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
                                        placeholder={t('ingredientFormName')}
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm"
                                        autoFocus
                                    />
                                    
                                    <select
                                        value={management.showNewIngredientCategoryField ? '__NEW_CATEGORY__' : newIngredient.category}
                                        onChange={(e) => management.handleIngredientCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm"
                                    >
                                        <option value="">{t('chooseCategory')}</option>
                                        {Object.keys(categories).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__NEW_CATEGORY__">
                                            {lang === 'fr' ? '➕ Nouvelle catégorie...' : '➕ New category...'}
                                        </option>
                                    </select>

                                    {management.showNewIngredientCategoryField && (
                                        <input
                                            type="text"
                                            placeholder={lang === 'fr' ? 'Nom de la nouvelle catégorie' : 'New category name'}
                                            value={management.newIngredientCategoryInput}
                                            onChange={(e) => management.setNewIngredientCategoryInput(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    )}

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={t('price')}
                                                value={newIngredient.price}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })}
                                                className="w-full px-3 py-2.5 border rounded-lg pr-8 text-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder={t('parts')}
                                                value={newIngredient.parts}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, parts: e.target.value })}
                                                className="w-full px-3 py-2.5 border rounded-lg pr-12 text-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">parts</span>
                                        </div>
                                    </div>

                                    {freshCategories.includes(newIngredient.category) && (
                                        <div className="w-full">
                                            <label className="block text-[11px] text-gray-600 mb-1">
                                                {t('expiryOptional')}
                                            </label>
                                            <input
                                                type="date"
                                                value={newIngredient.expiryDate}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm max-w-full"
                                            />
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p>{t('priceMust')}</p>
                                        {newIngredient.name && ingredients[newIngredient.name.trim()] && (
                                            <p className="text-red-600">{t('ingredientExists')}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleAdd}
                                            disabled={
                                                !newIngredient.name.trim() ||
                                                (!newIngredient.category && !management.newIngredientCategoryInput.trim()) ||
                                                newIngredient.price === '' ||
                                                newIngredient.parts === '' ||
                                                Number.isNaN(Number.parseFloat(newIngredient.price)) ||
                                                Number.isNaN(Number.parseInt(newIngredient.parts, 10)) ||
                                                Number.parseFloat(newIngredient.price) < 0 ||
                                                Number.parseInt(newIngredient.parts, 10) < 1 ||
                                                !!ingredients[newIngredient.name.trim()]
                                            }
                                            className="flex-1 bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 text-sm"
                                        >
                                            <Save className="w-4 h-4" />
                                            {t('save')}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 text-sm"
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
