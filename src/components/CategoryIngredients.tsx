import React from 'react';
import { IngredientsType } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
    categorie: string;
    items: string[];
    ingredients: IngredientsType;
    onToggle: (name: string) => void;
}

function CategoryIngredientsComponent({ categorie, items, ingredients, onToggle }: Props) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 font-medium text-gray-700 text-sm sticky top-0 z-10">{categorie}</div>
            <div className="divide-y divide-gray-100">
                {items.map(ingredient => (
                    <label key={ingredient} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => onToggle(ingredient)} className="flex-shrink-0">
                                {ingredients[ingredient].inStock ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                            </button>
                            <span className={ingredients[ingredient].inStock ? 'text-gray-900' : 'text-gray-500'}>{ingredient}</span>
                        </div>
                        <span className="text-gray-500 font-medium">{ingredients[ingredient].price.toFixed(2)} €</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export const CategoryIngredients = React.memo(CategoryIngredientsComponent);
