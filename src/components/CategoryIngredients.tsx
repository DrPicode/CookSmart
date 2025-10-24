import React from 'react';
import { IngredientsType } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { computeExpiryStatus, formatDate, formatDaysLeft } from '../utils/expiry';

interface Props {
    readonly categorie: string;
    readonly items: string[];
    readonly ingredients: IngredientsType;
    readonly onToggle: (name: string) => void;
    readonly lang: 'fr' | 'en';
}

function CategoryIngredientsComponent({ categorie, items, ingredients, onToggle, lang }: Props) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 font-medium text-gray-700 text-sm sticky top-0 z-10">{categorie}</div>
            <div className="divide-y divide-gray-100">
                {items.map(ingredient => {
                    const inStock = ingredients[ingredient].inStock;
                    return (
                        <button
                            key={ingredient}
                            type="button"
                            onClick={() => onToggle(ingredient)}
                            className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            aria-pressed={inStock}
                            aria-label={ingredient}
                        >
                            <div className="flex items-center gap-3">
                                {inStock ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                <div className="flex flex-col">
                                    <span className={inStock ? 'text-gray-900 dark:text-gray-100 text-[13px] leading-tight' : 'text-gray-500 dark:text-gray-400 text-[13px] leading-tight'}>{ingredient}</span>
                                    {inStock && ingredients[ingredient].expiryDate && (() => {
                                        const expiryDate = ingredients[ingredient].expiryDate;
                                        const { status, daysLeft } = computeExpiryStatus({ expiryDate, inStock: true });
                                        if (status === 'none' || status === 'out') return null;
                                        const dateStr = formatDate(expiryDate, lang);
                                        const daysStr = formatDaysLeft(daysLeft, lang);
                                        const isWarn = status === 'soon' || status === 'expired';
                                        let cls: string;
                                        if (status === 'expired') cls = 'text-red-600';
                                        else if (status === 'soon') cls = 'text-orange-600';
                                        else cls = 'text-gray-400';
                                        let ariaLabel: string;
                                        if (status === 'expired') ariaLabel = lang === 'fr' ? 'Ingrédient périmé' : 'Expired ingredient';
                                        else ariaLabel = lang === 'fr' ? 'Ingrédient bientôt périmé' : 'Ingredient expiring soon';
                                        return (
                                            <span className={`text-[10px] mt-0.5 font-medium flex items-center gap-1 ${cls}`}>
                                                {isWarn && (
                                                    <span
                                                        className={status === 'expired' ? 'text-red-600' : 'text-orange-500'}
                                                        aria-label={ariaLabel}
                                                    >⚠️</span>
                                                )}
                                                {dateStr}{daysStr ? ` (${daysStr})` : ''}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium text-xs">{ingredients[ingredient].price.toFixed(2)} €</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const CategoryIngredients = React.memo(CategoryIngredientsComponent);
