import React, { useState, useMemo } from 'react';
import { CategoryIngredients } from './CategoryIngredients';
import { ShoppingOverlay } from './ShoppingOverlay';
import { SearchBar } from './SearchBar';
import { IngredientsType, CategoriesType, FreshCategoriesType } from '../types';

interface CoursesTabProps {
    t: (k: string) => string;
    categories: CategoriesType;
    ingredients: IngredientsType;
    freshCategories: FreshCategoriesType;
    shoppingMode: boolean;
    startShopping: () => void;
    ingredientsManquants: string[];
    shoppingCategoryOrder: string[];
    missingByCategory: { [key: string]: string[] };
    shoppingSelected: Set<string>;
    shoppingSubtotal: number;
    shoppingProgress: number;
    finishShopping: () => void;
    cancelShopping: () => void;
    toggleShoppingItem: (ing: string) => void;
    toggleIngredient: (ing: string) => void;
    setIngredients: React.Dispatch<React.SetStateAction<IngredientsType>>;
    totalCourses: number;
}

export const CoursesTab: React.FC<CoursesTabProps> = ({
    t,
    categories,
    ingredients,
    freshCategories,
    shoppingMode,
    startShopping,
    ingredientsManquants,
    shoppingCategoryOrder,
    missingByCategory,
    shoppingSelected,
    shoppingSubtotal,
    shoppingProgress,
    finishShopping,
    cancelShopping,
    toggleShoppingItem,
    toggleIngredient,
    setIngredients,
    totalCourses
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return categories;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered: CategoriesType = {};

        for (const [categorie, items] of Object.entries(categories)) {
            const filteredItems = items.filter(item => 
                item.toLowerCase().includes(query)
            );
            
            if (filteredItems.length > 0) {
                filtered[categorie] = filteredItems;
            }
        }

        return filtered;
    }, [categories, searchQuery]);

    return (
        <div className="space-y-4">
            <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('searchIngredients')}
            />

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800"><strong>{t('tip')} :</strong> {t('tipCheckbox').replace(/^.*?:\s*/, '')}</p>
            </div>

            {!shoppingMode && ingredientsManquants.length > 0 && (
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={startShopping}
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-medium shadow hover:bg-green-700 active:scale-[.98] transition-smooth"
                >
                    {t('startShopping')} ({ingredientsManquants.length} {t('articles')})
                </button>
            )}

            {Object.entries(filteredCategories).map(([categorie, items]) => (
                <CategoryIngredients
                    key={categorie}
                    categorie={categorie}
                    items={items}
                    ingredients={ingredients}
                    onToggle={toggleIngredient}
                />
            ))}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-red-800 mb-2">{t('toBuy')} ({ingredientsManquants.length} {t('articles')})</h3>
                <ShoppingOverlay
                    visible={shoppingMode}
                    t={t}
                    categories={categories}
                    freshCategories={freshCategories}
                    ingredients={ingredients}
                    shoppingCategoryOrder={shoppingCategoryOrder}
                    missingByCategory={missingByCategory}
                    shoppingSelected={shoppingSelected}
                    ingredientsManquantsCount={ingredientsManquants.length}
                    shoppingSubtotal={shoppingSubtotal}
                    shoppingProgress={shoppingProgress}
                    finishShopping={finishShopping}
                    cancelShopping={cancelShopping}
                    toggleShoppingItem={toggleShoppingItem}
                    setIngredients={setIngredients}
                />
                {ingredientsManquants.length > 0 ? (
                    <>
                        <ul className="space-y-2 text-sm text-red-700">
                            {ingredientsManquants.map(ing => (
                                <li key={ing} className="flex justify-between items-center">
                                    <span>• {ing}</span>
                                    <span className="font-medium">{ingredients[ing].price.toFixed(2)} €</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="flex justify-between items-center text-red-800 font-semibold">
                                <span>{t('totalEstimate')}</span>
                                <span>{totalCourses.toFixed(2)} €</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-red-700">{t('allInStock')}</p>
                )}
            </div>
        </div>
    );
};
