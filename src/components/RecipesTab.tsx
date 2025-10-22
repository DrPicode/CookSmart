import React, { useState, useMemo } from 'react';
import { ChefHat, Edit2, Trash2, Save } from 'lucide-react';
import { IngredientsType, RecipeType } from '../types';
import { RecipeGroup } from './RecipeGroup';
import { SearchBar } from './SearchBar';
import { UseManagementReturn } from '../hooks/useManagement';

interface RecipesTabProps {
    t: (k: string) => string;
    recettesPossibles: RecipeType[];
    recettesGroupees: { [cat: string]: RecipeType[] };
    expiringIngredients: { name: string; status: string; daysLeft: number }[];
    recettesPrioritaires: RecipeType[];
    ingredients: IngredientsType;
    lang: 'fr' | 'en';
    management: UseManagementReturn;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
    t,
    recettesPossibles,
    recettesGroupees,
    expiringIngredients,
    recettesPrioritaires,
    ingredients,
    lang,
    management
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);

    const {
        editingRecipe, setEditingRecipe,
        editingRecipeCategory, setEditingRecipeCategory,
        recipeCategories,
        recettesParCategorie,
        updateRecipe,
        deleteRecipe,
        saveRecipeCategoryRename,
        allIngredients,
        toggleIngredientInRecipe,
    } = management;

    const filteredRecipes = useMemo(() => {
        if (!searchQuery.trim()) {
            return recettesGroupees;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered: { [cat: string]: RecipeType[] } = {};

        for (const [categorie, recipes] of Object.entries(recettesGroupees)) {
            const categoryMatches = categorie.toLowerCase().includes(query);
            const filteredRecs = recipes.filter(recipe => 
                recipe.nom.toLowerCase().includes(query) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
            );
            if (categoryMatches || filteredRecs.length > 0) {
                filtered[categorie] = categoryMatches ? recipes : filteredRecs;
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
            <div className="flex items-center justify-between gap-2">
                <SearchBar 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={t('searchRecipes')}
                />
                {(() => {
                    const labelFr = editMode ? 'Terminer' : 'Modifier';
                    const labelEn = editMode ? 'Done' : 'Manage';
                    const label = lang === 'fr' ? labelFr : labelEn;
                    return (
                        <button
                            onClick={() => setEditMode(m => !m)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium ${editMode ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-90`}
                        >{label}</button>
                    );
                })()}
            </div>

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
                                    <div key={recette.nom + '-' + idx} className="bg-white rounded border border-red-100 p-2 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-800">{recette.nom}</span>
                                            <span className="text-[10px] text-gray-500">{recette.ingredients.filter(i => expiringIngredients.find(e => e.name === i)).length} ⚠️</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {recette.ingredients.map(ing => {
                                                const e = expiringIngredients.find(x => x.name === ing);
                                                let chipClass = 'bg-green-100 text-green-700';
                                                let suffix = '';
                                                if (e) {
                                                    if (e.status === 'expired') {
                                                        chipClass = 'bg-red-600 text-white';
                                                        suffix = ' · ⛔';
                                                    } else {
                                                        chipClass = 'bg-red-100 text-red-700';
                                                        suffix = ' · ' + (e.daysLeft === 0 ? 'J0' : 'J-' + e.daysLeft);
                                                    }
                                                }
                                                return <span key={ing} className={`px-2 py-0.5 rounded-full text-[10px] ${chipClass}`}>{ing}{suffix}</span>;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!editMode && (
                Object.keys(filteredRecipes).length === 0 && searchQuery ? (
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
                )
            )}

            {editMode && (
                <div className="space-y-6">
                    {Object.entries(recettesParCategorie).map(([cat, items]) => (
                        <div key={cat} className="space-y-3 border rounded-lg p-3 bg-purple-50">
                            {editingRecipeCategory?.original === cat ? (
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={editingRecipeCategory.name}
                                        onChange={(e) => setEditingRecipeCategory({ ...editingRecipeCategory, name: e.target.value })}
                                        className="flex-1 px-3 py-1.5 border rounded text-xs"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveRecipeCategoryRename}
                                        className="px-3 py-1.5 bg-green-500 text-white rounded text-xs"
                                    >{t('saveAction')}</button>
                                    <button
                                        onClick={() => setEditingRecipeCategory(null)}
                                        className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs"
                                    >{t('cancel')}</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-purple-700">{cat}</h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="p-1 rounded hover:bg-purple-100"
                                            title={t('rename')}
                                            onClick={() => setEditingRecipeCategory({ original: cat, name: cat })}
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-red-100"
                                            title={lang === 'fr' ? 'Supprimer catégorie' : 'Delete category'}
                                            onClick={() => {
                                                if (!confirm(lang === 'fr' ? 'Supprimer la catégorie et toutes ses recettes ?' : 'Delete category and all its recipes?')) return;
                                                // delete all recipes of category
                                                for (const { index } of items) {
                                                    deleteRecipe(index);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {items.map(({ recette, index: idx }) => (
                                <div key={recette.nom + '-' + idx} className="border rounded-lg p-3 bg-white shadow-sm">
                                    {editingRecipe?.index === idx ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editingRecipe.data.nom}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, nom: e.target.value } })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                            <select
                                                value={editingRecipe.data.categorie}
                                                onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, categorie: e.target.value } })}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            >
                                                {recipeCategories.map(rc => <option key={rc} value={rc}>{rc}</option>)}
                                            </select>
                                            <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                                                <p className="text-xs font-semibold mb-2">{lang === 'fr' ? 'Ingrédients :' : 'Ingredients:'}</p>
                                                {allIngredients.map(ing => (
                                                    <label key={ing} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingRecipe.data.ingredients.includes(ing)}
                                                            onChange={() => toggleIngredientInRecipe(ing, true)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-xs">{ing}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={updateRecipe}
                                                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-2"
                                                >
                                                    <Save className="w-4 h-4" />{t('saveVerb')}
                                                </button>
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => setEditingRecipe(null)}
                                                    className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs"
                                                >{t('cancel')}</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{recette.nom}</h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {recette.ingredients.map(ing => (
                                                        <span key={ing} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">{ing}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => setEditingRecipe({ index: idx, data: { ...recette } })}
                                                    className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => deleteRecipe(idx)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
