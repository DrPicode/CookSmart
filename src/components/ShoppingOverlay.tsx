import React from 'react';
import { computeExpiryStatus } from '../utils/expiry';
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
    return (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">{t('shoppingListTitle')}</h2>
                    <button onClick={cancelShopping} className="text-sm text-gray-500 hover:text-gray-700">{t('close')}</button>
                </div>
                <p className="text-xs text-gray-500">Cochez au fur et à mesure. Les produits frais et surgelés apparaissent à la fin pour optimiser la chaîne du froid.</p>
                <div className="border rounded-lg p-3 bg-white flex flex-col gap-2 text-xs">
                    <div className="flex justify-between"><span>{t('progressSelected')} :</span><span>{shoppingSelected.size} / {ingredientsManquantsCount}</span></div>
                    <div className="flex justify-between"><span>{t('progressSubtotal')} :</span><span>{shoppingSubtotal.toFixed(2)} €</span></div>
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${(shoppingProgress * 100).toFixed(1)}%` }} />
                    </div>
                </div>
                <div className="space-y-5">
                    {shoppingCategoryOrder.map(cat => (
                        missingByCategory[cat] && missingByCategory[cat].length > 0 && (
                            <div key={cat} className="border rounded-lg">
                                <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-700 sticky top-0 z-10">{cat}</div>
                                <div className="divide-y">
                                    {missingByCategory[cat].map(ing => {
                                        const checked = shoppingSelected.has(ing);
                                        const isFresh = freshCategories.some(fc => categories[fc]?.includes(ing));
                                        const showExpiry = isFresh && checked;
                                        let statusClass = '';
                                        if (isFresh && ingredients[ing].expiryDate) {
                                            const { status } = computeExpiryStatus({ expiryDate: ingredients[ing].expiryDate, inStock: true });
                                            if (status === 'expired') statusClass = 'border border-red-500 bg-red-50';
                                            else if (status === 'soon') statusClass = 'border border-orange-400 bg-orange-50';
                                        }
                                        return (
                                            <div key={ing} className={`px-3 py-2 text-sm select-none active:bg-gray-50 ${statusClass}`}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleShoppingItem(ing)}
                                                            className="w-4 h-4 accent-green-600"
                                                        />
                                                        <span className={checked ? 'line-through text-gray-400' : 'text-gray-700'}>{ing}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{ingredients[ing].price.toFixed(2)}€</span>
                                                </div>
                                                {showExpiry && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <label className="text-[10px] text-gray-600">Date de péremption :</label>
                                                        <input
                                                            type="date"
                                                            className="px-2 py-1 border rounded text-xs"
                                                            value={ingredients[ing].expiryDate ? ingredients[ing].expiryDate.slice(0, 10) : ''}
                                                            min={new Date().toISOString().slice(0, 10)}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setIngredients(prev => ({
                                                                    ...prev,
                                                                    [ing]: { ...prev[ing], expiryDate: val || undefined }
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
                <div className="flex gap-2 pt-2">
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
        </div>
    );
};
