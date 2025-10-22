import React, { useState, useMemo } from 'react';
import { ChefHat } from 'lucide-react';
import { IngredientsType, RecipeType } from '../types';
import { RecipeGroup } from './RecipeGroup';
import { SearchBar } from './SearchBar';

interface RecipesTabProps {
    t: (k: string) => string;
    recettesPossibles: RecipeType[];
    recettesGroupees: { [cat: string]: RecipeType[] };
    expiringIngredients: { name: string; status: string; daysLeft: number }[];
    recettesPrioritaires: RecipeType[];
    ingredients: IngredientsType;
    lang: 'fr' | 'en';
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
    t,
    recettesPossibles,
    recettesGroupees,
    expiringIngredients,
    recettesPrioritaires,
    ingredients,
    lang
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = useMemo(() => {
        if (!searchQuery.trim()) {
            return recettesGroupees;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered: { [cat: string]: RecipeType[] } = {};

        for (const [categorie, recipes] of Object.entries(recettesGroupees)) {
            const filteredRecs = recipes.filter(recipe => 
                recipe.nom.toLowerCase().includes(query) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
            );
            
            if (filteredRecs.length > 0) {
                filtered[categorie] = filteredRecs;
            }
        }

        return filtered;
    }, [recettesGroupees, searchQuery]);

    if (recettesPossibles.length === 0) {
        return (
            <div className="text-center py-8">
                <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t('recipesNone')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('searchRecipes')}
            />

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                <p className="text-green-800 text-sm"><strong>{t('canCookIntro')}</strong> {t('canCookMiddle')} {recettesPossibles.length} {recettesPossibles.length > 1 ? t('dishes') : t('dish')}.</p>
            </div>

            {expiringIngredients.length > 0 && (
                <div className="border rounded-lg bg-red-50 border-red-200 p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <span>⚠️ {t('consumeSoon')}</span>
                        <span className="text-[10px] font-normal text-red-600">({expiringIngredients.length} ingrédient{expiringIngredients.length > 1 ? 's' : ''})</span>
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {expiringIngredients.map(e => (
                            <span key={e.name} className={`px-2 py-1 rounded-full text-[10px] font-medium ${e.status === 'expired' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>{e.name} {e.status === 'expired' ? '(périmé)' : `J-${e.daysLeft}`}</span>
                        ))}
                    </div>
                    {recettesPrioritaires.length > 0 && (
                        <div className="pt-2">
                            <h4 className="text-[11px] font-semibold text-red-700 mb-1">{t('suggestedRecipes')}</h4>
                            <div className="flex flex-col gap-2">
                                {recettesPrioritaires.slice(0, 5).map((recette, idx) => (
                                    <div key={idx} className="bg-white rounded border border-red-100 p-2 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-800">{recette.nom}</span>
                                            <span className="text-[10px] text-gray-500">{recette.ingredients.filter(i => expiringIngredients.find(e => e.name === i)).length} ⚠️</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {recette.ingredients.map(ing => {
                                                const e = expiringIngredients.find(x => x.name === ing);
                                                return (
                                                    <span key={ing} className={`px-2 py-0.5 rounded-full text-[10px] ${e ? (e.status === 'expired' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700') : 'bg-green-100 text-green-700'}`}>{ing}{e ? ` · ${e.status === 'expired' ? '⛔' : (e.daysLeft === 0 ? 'J0' : `J-${e.daysLeft}`)}` : ''}</span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {Object.keys(filteredRecipes).length === 0 && searchQuery ? (
                <div className="text-center py-8 animate-fade-in">
                    <p className="text-gray-500 text-sm">{lang === 'fr' ? 'Aucune recette trouvée' : 'No recipe found'}</p>
                </div>
            ) : (
                Object.entries(filteredRecipes).map(([categorie, recs]) => (
                    <RecipeGroup
                        key={categorie}
                        categorie={categorie}
                        recettes={recs}
                        ingredients={ingredients}
                    />
                ))
            )}
        </div>
    );
};
