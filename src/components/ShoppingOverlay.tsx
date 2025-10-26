import React from 'react';
import { createPortal } from 'react-dom';
import { IngredientsType, FreshCategoriesType, CategoriesType } from '../types';

interface ShoppingOverlayProps {
    visible: boolean;
    t: (k: string) => string;
    categories: CategoriesType;
    freshCategories: FreshCategoriesType;
    ingredients: IngredientsType;
    shoppingCategoryOrder: string[];
    missingByCategory: { [key: string]: string[] };
    shoppingSelected: Set<string>;
    ingredientsManquantsCount: number;
    shoppingSubtotal: number;
    shoppingProgress: number;
    finishShopping: () => void;
    cancelShopping: () => void;
    toggleShoppingItem: (ing: string) => void;
    setIngredients: React.Dispatch<React.SetStateAction<IngredientsType>>;
}

export const ShoppingOverlay: React.FC<ShoppingOverlayProps> = ({
    visible,
    t,
    categories,
    freshCategories,
    ingredients,
    shoppingCategoryOrder,
    missingByCategory,
    shoppingSelected,
    ingredientsManquantsCount,
    shoppingSubtotal,
    shoppingProgress,
    finishShopping,
    cancelShopping,
    toggleShoppingItem,
    setIngredients
}) => {
    if (!visible) return null;
    return createPortal(
    <div className="fixed inset-0 z-[500] bg-black/55 backdrop-blur-sm flex items-start sm:items-center justify-center p-1 sm:p-2">
            <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-2xl flex flex-col animate-fade-in max-h-[96vh] sm:max-h-[96vh] overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                    <button
                        onClick={cancelShopping}
                        className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label={t('close')}
                    >×</button>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('shoppingListTitle')}</h2>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">Cochez au fur et à mesure. Les produits frais et surgelés apparaissent à la fin pour optimiser la chaîne du froid.</p>
                </div>
                <div className="px-5">
                    <div className="border rounded-lg p-3 bg-white flex flex-col gap-2 text-xs mb-4 max-w-md">
                        <div className="flex justify-between"><span>{t('progressSelected')} :</span><span>{shoppingSelected.size} / {ingredientsManquantsCount}</span></div>
                        <div className="flex justify-between"><span>{t('progressSubtotal')} :</span><span>{shoppingSubtotal.toFixed(2)} €</span></div>
                        <div className="h-2 bg-gray-200 rounded overflow-hidden">
                            <div className="h-full bg-green-500 transition-all" style={{ width: `${(shoppingProgress * 100).toFixed(1)}%` }} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">
                    {shoppingCategoryOrder.map(cat => (
                        missingByCategory[cat] && missingByCategory[cat].length > 0 && (
                            <div key={cat} className="border rounded-lg max-w-xl">
                                <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-700 sticky top-0 z-10">{cat}</div>
                                <div className="divide-y">
                                    {missingByCategory[cat].map(ing => {
                                        const updateIngredientExpiry = (val: string) => {
                                            setIngredients(prev => {
                                                const current = prev[ing];
                                                return {
                                                    ...prev,
                                                    [ing]: { ...current, expiryDate: val || undefined }
                                                };
                                            });
                                        };
                                        const checked = shoppingSelected.has(ing);
                                        const isFresh = freshCategories.some(fc => categories[fc]?.includes(ing));
                                        const showExpiry = isFresh && checked;
                                        return (
                                            <button
                                                type="button"
                                                key={ing}
                                                onClick={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    if (target.closest('.expiry-editor') || target.closest('input[type="checkbox"]')) return;
                                                    toggleShoppingItem(ing);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm select-none hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            aria-label={checked ? t('uncheckIngredient') : t('checkIngredient')}
                                                            onChange={(e) => { e.stopPropagation(); toggleShoppingItem(ing); }}
                                                            className="w-4 h-4 accent-green-600"
                                                        />
                                                        <span className={checked ? 'line-through text-gray-400' : 'text-gray-700'}>{ing}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{ingredients[ing].price.toFixed(2)}€</span>
                                                </div>
                                                {showExpiry && (
                                                    <fieldset className="expiry-editor mt-2 flex items-center gap-2" aria-label={t('dateExpiry')}>
                                                        <label className="text-[10px] text-gray-600" htmlFor={`expiry-${ing}`}>{t('dateExpiry')} :</label>
                                                        <input
                                                            id={`expiry-${ing}`}
                                                            type="date"
                                                            className="px-2 py-1 border rounded text-xs"
                                                            value={ingredients[ing].expiryDate ? ingredients[ing].expiryDate.slice(0, 10) : ''}
                                                            min={new Date().toISOString().slice(0, 10)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateIngredientExpiry(e.target.value)}
                                                        />
                                                    </fieldset>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
                <div className="px-5 pb-5 pt-2 flex gap-3 bg-gradient-to-t from-white via-white to-white/70 sticky bottom-0">
                    <button
                        onClick={finishShopping}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >{t('finish')} ({shoppingSubtotal.toFixed(2)} €)</button>
                    <button
                        onClick={cancelShopping}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium"
                    >{t('cancel')}</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
