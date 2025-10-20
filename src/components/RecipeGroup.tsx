import React from 'react';
import { RecipeType, IngredientsType } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
    categorie: string;
    recettes: RecipeType[];
    ingredients: IngredientsType;
}

function RecipeGroupComponent({ categorie, recettes, ingredients }: Props) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 px-3 py-2 font-medium text-gray-800 text-sm sticky top-0">{categorie}</div>
            <div className="divide-y divide-gray-100">
                {recettes.map((recette, idx) => (
                    <div key={idx} className="p-3">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">{recette.nom}</h4>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {recette.ingredients.map(ing => (
                                <span key={ing} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                                    <CheckCircle2 className="w-3 h-3" />{ing}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-gray-500">Prix par personne :</span>
                            <span className="text-blue-600 font-medium">{recette.ingredients.reduce((total, ing) =>
                                total + (ingredients[ing].price / ingredients[ing].parts), 0).toFixed(2)}€</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const RecipeGroup = React.memo(RecipeGroupComponent);
