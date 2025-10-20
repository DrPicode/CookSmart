import React from 'react';
import { RecipeType, IngredientsType } from '../types';
import { CheckCircle2 } from 'lucide-react';
import { earliestExpiryDays, computeExpiryStatus, earliestExpiryInfo } from '../utils/expiry';

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
                {recettes.map((recette, idx) => {
                    const info = earliestExpiryInfo(recette, ingredients);
                    const urgency = info ? info.days : earliestExpiryDays(recette, ingredients);
                    const urgencyLabel = (() => {
                        if (urgency === null) return null;
                        if (urgency < 0) return 'PÉRIMÉ';
                        if (urgency === 0) return 'J0';
                        return `J-${urgency}`;
                    })();
                    const urgencyClass = (() => {
                        if (urgency === null) return 'hidden';
                        if (urgency < 0) return 'bg-red-600 text-white';
                        if (urgency <= 2) return 'bg-red-100 text-red-700';
                        return 'bg-orange-100 text-orange-700';
                    })();
                    return (
                        <div key={idx} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                    {recette.nom}
                                    {urgencyLabel && (
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${urgencyClass}`}>{urgencyLabel}</span>
                                    )}
                                </h4>
                                <span className="text-[10px] text-gray-500">{recette.ingredients.length} ingr.</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {recette.ingredients.map(ing => {
                                    const isDriver = info?.ingredient === ing;
                                    const data = ingredients[ing];
                                    const { status, daysLeft } = computeExpiryStatus(data);
                                    let chipClass = 'bg-green-50 text-green-700';
                                    let suffix = '';
                                    if (status === 'expired') { chipClass = 'bg-red-600 text-white'; suffix = ' · périmé'; }
                                    else if (status === 'soon') { chipClass = 'bg-red-100 text-red-700'; suffix = ` · J-${daysLeft}`; }
                                    if (isDriver && status !== 'expired') chipClass += ' border border-orange-400';
                                    return (
                                        <span key={ing} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${chipClass}`}>
                                            <CheckCircle2 className="w-3 h-3" />{ing}{suffix}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-gray-500">Prix par personne :</span>
                                <span className="text-blue-600 font-medium">{recette.ingredients.reduce((total, ing) =>
                                    total + (ingredients[ing].price / ingredients[ing].parts), 0).toFixed(2)}€</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const RecipeGroup = React.memo(RecipeGroupComponent);
