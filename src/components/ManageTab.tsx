import React from 'react';
import { Plus, X, Edit2, Trash2, Save, Snowflake } from 'lucide-react';
import { IngredientsType, CategoriesType, FreshCategoriesType } from '../types';
import { UseManagementReturn } from '../hooks/useManagement';
import { formatDate, formatDaysLeft, computeExpiryStatus } from '../utils/expiry';

interface ManageTabProps {
    t: (k: string) => string;
    lang: 'fr' | 'en';
    categories: CategoriesType;
    ingredients: IngredientsType;
    freshCategories: FreshCategoriesType;
    management: UseManagementReturn;
}

export const ManageTab: React.FC<ManageTabProps> = ({ t, lang, categories, ingredients, freshCategories, management }) => {
    const {
        showAddIngredient, setShowAddIngredient,
        showAddRecipe, setShowAddRecipe,
        editingRecipe, setEditingRecipe,
        editingIngredient, setEditingIngredient,
        newIngredient, setNewIngredient,
        newRecipe, setNewRecipe,
        editingCategory, setEditingCategory,
        newIngredientCategoryName, setNewIngredientCategoryName,
        editingRecipeCategory, setEditingRecipeCategory,
        newRecipeCategoryName, setNewRecipeCategoryName,
        importError,
        allIngredients,
        recettesParCategorie,
        addIngredient,
        deleteIngredient,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        saveRecipeCategoryRename,
        toggleIngredientInRecipe,
        handleExport,
        onImportInputChange,
        setCategories,
        setFreshCategories,
        setIngredients,
        setRecettes,
        setRecipeCategories,
        recipeCategories
    } = management;
    return (
        <div className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2.5 font-medium text-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sticky top-0">
                    <span className="text-sm flex-shrink-0">{t('manageIngredients')}</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1 w-full sm:w-auto" onMouseDown={(e) => e.stopPropagation()}>
                            {newIngredientCategoryName !== '' && (
                                <button
                                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                    title={lang === 'fr' ? 'Annuler' : 'Cancel'}
                                    onClick={() => setNewIngredientCategoryName('')}
                                >
                                    <X className="w-3 h-3 text-gray-600" />
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder={lang === 'fr' ? 'Nouvelle catégorie' : 'New category'}
                                value={newIngredientCategoryName}
                                onChange={(e) => setNewIngredientCategoryName(e.target.value)}
                                className="px-2 py-1 text-xs border rounded flex-1 sm:w-[140px]"
                            />
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={!newIngredientCategoryName.trim() || !!categories[newIngredientCategoryName.trim()]}
                                onClick={() => {
                                    const raw = newIngredientCategoryName.trim();
                                    if (!raw) return;
                                    if (categories[raw]) { alert(t('categoryExists')); return; }
                                    setCategories(prev => ({ ...prev, [raw]: [] }));
                                    setNewIngredientCategoryName('');
                                }}
                                className="p-1 rounded bg-green-500 disabled:opacity-40 text-white flex items-center justify-center"
                                title={lang === 'fr' ? 'Ajouter catégorie' : 'Add category'}
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddIngredient(!showAddIngredient)} className="bg-blue-500 text-white px-3 py-2 sm:py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-600 w-full sm:w-auto sm:min-w-[170px] justify-center">
                            <Plus className="w-4 h-4" />{t('addIngredient')}
                        </button>
                    </div>
                </div>

                {showAddIngredient && (
                    <div className="p-3 bg-blue-50 border-b space-y-3">
                        <input type="text" placeholder={t('ingredientFormName')} value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                        <select value={newIngredient.category} onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm">
                            <option value="">{t('chooseCategory')}</option>
                            {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
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
                            <div>
                                <label className="block text-[11px] text-gray-600 mb-1">{t('expiryOptional')}</label>
                                <input
                                    type="date"
                                    value={newIngredient.expiryDate}
                                    onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={addIngredient}
                                disabled={
                                    !newIngredient.name.trim() ||
                                    !newIngredient.category ||
                                    newIngredient.price === '' ||
                                    newIngredient.parts === '' ||
                                    isNaN(parseFloat(newIngredient.price)) ||
                                    isNaN(parseInt(newIngredient.parts, 10)) ||
                                    parseFloat(newIngredient.price) < 0 ||
                                    parseInt(newIngredient.parts, 10) < 1 ||
                                    !!ingredients[newIngredient.name.trim()]
                                }
                                className="flex-1 bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 text-sm"
                            >
                                <Save className="w-4 h-4" />{t('save')}
                            </button>
                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddIngredient(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 text-sm">{t('cancel')}</button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>{t('priceMust')}</p>
                            {newIngredient.name && ingredients[newIngredient.name.trim()] && (
                                <p className="text-red-600">{t('nameUsed')}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4">
                    {Object.entries(categories).map(([categorie, items]) => (
                        <div key={categorie} className="mb-4">
                            {editingCategory?.original === categorie ? (
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="flex-1 px-3 py-1.5 border rounded text-sm"
                                        autoFocus
                                    />
                                    <button
                                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                        onClick={() => {
                                            const newName = editingCategory.name.trim();
                                            const original = editingCategory.original;
                                            if (!newName) { alert(t('invalidCategoryName')); return; }
                                            if (categories[newName] && newName !== original) { alert(t('categoryExists')); return; }
                                            setCategories(prev => {
                                                const copy = { ...prev };
                                                const items = copy[original];
                                                delete copy[original];
                                                copy[newName] = items;
                                                return copy;
                                            });
                                            setFreshCategories(prev => prev.map(c => c === original ? newName : c));
                                            setEditingCategory(null);
                                        }}
                                    >{t('saveAction')}</button>
                                    <button
                                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                        onClick={() => setEditingCategory(null)}
                                    >{t('cancel')}</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                        {categorie}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className={`p-1 rounded hover:bg-blue-100 ${freshCategories.includes(categorie) ? 'bg-blue-50' : ''}`}
                                            title={freshCategories.includes(categorie) ? (lang === 'fr' ? 'Retirer statut frais' : 'Unset fresh') : (lang === 'fr' ? 'Marquer frais' : 'Mark fresh')}
                                            onClick={() => setFreshCategories(prev => prev.includes(categorie) ? prev.filter(c => c !== categorie) : [...prev, categorie])}
                                        >
                                            <Snowflake className={`w-3.5 h-3.5 ${freshCategories.includes(categorie) ? 'text-blue-600' : 'text-gray-400'}`} />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-blue-100"
                                            title={t('rename')}
                                            onClick={() => setEditingCategory({ original: categorie, name: categorie })}
                                        >
                                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-red-100"
                                            title={lang === 'fr' ? 'Supprimer catégorie' : 'Delete category'}
                                            onClick={() => {
                                                if (!confirm(lang === 'fr' ? `Supprimer la catégorie et tous ses ingrédients ?` : 'Delete category and all its ingredients?')) return;
                                                const toDelete = [...(categories[categorie] || [])];
                                                setCategories(prev => {
                                                    const copy = { ...prev };
                                                    delete copy[categorie];
                                                    return copy;
                                                });

                                                setFreshCategories(prev => prev.filter(c => c !== categorie));
                                                setIngredients(prev => {
                                                    const copy = { ...prev };
                                                    toDelete.forEach(n => { delete copy[n]; });
                                                    return copy;
                                                });
                                                setRecettes(prev => prev.map(r => ({ ...r, ingredients: r.ingredients.filter(i => !toDelete.includes(i)) })).filter(r => r.ingredients.length > 0));
                                                setEditingCategory(null);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                {items.map(ing => (
                                    <div key={ing} className="bg-gray-50 rounded-lg overflow-hidden">
                                        {editingIngredient && editingIngredient.originalName === ing ? (
                                            <div
                                                className="p-3 space-y-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            >
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingIngredient.name}
                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                        placeholder="Nom"
                                                        autoFocus
                                                    />
                                                    <select
                                                        value={editingIngredient.category}
                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, category: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    >
                                                        {Object.keys(categories).map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    <div>
                                                        <label className="block text-[11px] text-gray-600 mb-1">{t('dateExpiry')}</label>
                                                        <input
                                                            type="date"
                                                            value={ingredients[editingIngredient.originalName].expiryDate ? ingredients[editingIngredient.originalName].expiryDate!.slice(0, 10) : ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setIngredients(prev => ({
                                                                    ...prev,
                                                                    [editingIngredient.originalName]: { ...prev[editingIngredient.originalName], expiryDate: val || undefined }
                                                                }));
                                                            }}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editingIngredient.price}
                                                            onChange={(e) => setEditingIngredient({ ...editingIngredient, price: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg pr-8 text-sm"
                                                            placeholder={t('price')}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">€</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={editingIngredient.parts}
                                                            onChange={(e) => setEditingIngredient({ ...editingIngredient, parts: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                                            placeholder={t('parts')}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => {
                                                            if (!editingIngredient) return;
                                                            const newName = editingIngredient.name.trim();
                                                            const priceNum = parseFloat(editingIngredient.price);
                                                            const partsNum = parseInt(editingIngredient.parts, 10);
                                                            if (!newName || isNaN(priceNum) || isNaN(partsNum) || partsNum < 1) {
                                                                alert(lang === 'fr' ? 'Veuillez entrer un nom, un prix et un nombre de parts valides.' : 'Please enter valid name, price and parts.');
                                                                return;
                                                            }
                                                            const original = editingIngredient.originalName;
                                                            const newCategory = editingIngredient.category;
                                                            const oldCategory = categorie;
                                                            setIngredients((prev) => {
                                                                const next = { ...prev };
                                                                if (newName !== original) delete next[original];
                                                                const prevIng = prev[original];
                                                                next[newName] = {
                                                                    inStock: prevIng.inStock,
                                                                    price: priceNum,
                                                                    parts: partsNum,
                                                                    remainingParts: prevIng.remainingParts ?? partsNum,
                                                                    ...(prevIng.expiryDate ? { expiryDate: prevIng.expiryDate } : {})
                                                                };
                                                                return next;
                                                            });
                                                            setCategories((prev) => {
                                                                const next = { ...prev };
                                                                next[oldCategory] = next[oldCategory].filter(item => item !== original);
                                                                next[newCategory] = [
                                                                    ...(next[newCategory] || []),
                                                                    newName,
                                                                ];
                                                                return next;
                                                            });
                                                            setEditingIngredient(null);
                                                        }}
                                                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm"
                                                    >
                                                        {t('save')}
                                                    </button>
                                                    <button
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => setEditingIngredient(null)}
                                                        className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm"
                                                    >
                                                        {t('cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center p-2">
                                                <div className="flex items-start gap-4">
                                                    <div className="text-sm font-medium text-gray-800 leading-tight">
                                                        <div>{ing}</div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {ingredients[ing].price.toFixed(2)} € · {ingredients[ing].parts} parts
                                                        </div>
                                                        <div className="text-[10px] text-blue-600">{(ingredients[ing].price / ingredients[ing].parts).toFixed(2)} €/part</div>
                                                        {ingredients[ing].expiryDate && (() => {
                                                            const { daysLeft } = computeExpiryStatus({ expiryDate: ingredients[ing].expiryDate!, inStock: true });
                                                            const formattedDate = formatDate(ingredients[ing].expiryDate!.slice(0, 10), lang);
                                                            const daysMsg = formatDaysLeft(daysLeft, lang);
                                                            return (
                                                                <div className="mt-1 text-[10px] text-red-600">
                                                                    {t('dateExpiry')}: {formattedDate}
                                                                    {daysMsg && <span className="ml-2 font-semibold">({daysMsg})</span>}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => setEditingIngredient({
                                                            originalName: ing,
                                                            name: ing,
                                                            category: categorie,
                                                            price: ingredients[ing].price.toString(),
                                                            parts: ingredients[ing].parts.toString(),
                                                        })} className="text-blue-500 hover:text-blue-700 p-1"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => deleteIngredient(ing, categorie)} className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RECIPES MANAGEMENT */}
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-2.5 font-medium text-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sticky top-0">
                    <span className="text-sm flex-shrink-0">{t('manageRecipes')}</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1 w-full sm:w-auto" onMouseDown={(e) => e.stopPropagation()}>
                            {newRecipeCategoryName !== '' && (
                                <button
                                    className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                                    title={lang === 'fr' ? 'Annuler' : 'Cancel'}
                                    onClick={() => setNewRecipeCategoryName('')}
                                >
                                    <X className="w-3 h-3 text-gray-600" />
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder={lang === 'fr' ? 'Nouvelle catégorie' : 'New category'}
                                value={newRecipeCategoryName}
                                onChange={(e) => setNewRecipeCategoryName(e.target.value)}
                                className="px-2 py-1 text-xs border rounded flex-1 sm:w-[140px]"
                            />
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={!newRecipeCategoryName.trim() || recipeCategories.includes(newRecipeCategoryName.trim())}
                                onClick={() => {
                                    const raw = newRecipeCategoryName.trim();
                                    if (!raw) return;
                                    if (recipeCategories.includes(raw)) { alert(t('categoryExists')); return; }
                                    setRecipeCategories(prev => [...prev, raw]);
                                    setNewRecipe(r => ({ ...r, categorie: r.categorie || raw }));
                                    setNewRecipeCategoryName('');
                                }}
                                className="p-1 rounded bg-green-500 disabled:opacity-40 text-white flex items-center justify-center"
                                title={lang === 'fr' ? 'Ajouter catégorie' : 'Add category'}
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddRecipe(!showAddRecipe)} className="bg-purple-500 text-white px-3 py-2 sm:py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-600 w-full sm:w-auto sm:min-w-[170px] justify-center">
                            <Plus className="w-4 h-4" />{t('addRecipe')}
                        </button>
                    </div>
                </div>

                {showAddRecipe && (
                    <div className="p-4 bg-purple-50 border-b space-y-3">
                        <input type="text" placeholder={lang === 'fr' ? 'Nom de la recette' : 'Recipe name'} value={newRecipe.nom} onChange={(e) => setNewRecipe({ ...newRecipe, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                        <select value={newRecipe.categorie} onChange={(e) => setNewRecipe({ ...newRecipe, categorie: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                            <option value="">{t('chooseCategory')}</option>
                            {recipeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="border rounded-lg p-3 bg-white max-h-60 overflow-y-auto">
                            <p className="text-sm font-semibold mb-2">{lang === 'fr' ? 'Sélectionner les ingrédients :' : 'Select ingredients:'}</p>
                            <div className="space-y-1">
                                {allIngredients.map(ing => (
                                    <label key={ing} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input type="checkbox" checked={newRecipe.ingredients.includes(ing)} onChange={() => toggleIngredientInRecipe(ing)} className="w-4 h-4" />
                                        <span className="text-sm">{ing}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onMouseDown={(e) => e.preventDefault()} onClick={addRecipe} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                                <Save className="w-4 h-4" />{t('save')}
                            </button>
                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddRecipe(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">{t('cancel')}</button>
                        </div>
                    </div>
                )}

                <div className="p-4 space-y-6">
                    {Object.entries(recettesParCategorie).map(([cat, items]) => (
                        <div key={cat} className="space-y-3">
                            {editingRecipeCategory?.original === cat ? (
                                <div className="flex items-center gap-2 px-2 mb-1">
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
                                <div className="flex items-center justify-between px-2 mb-1">
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
                                                setRecettes(prev => prev.filter(r => r.categorie !== cat));
                                                setRecipeCategories(prev => prev.filter(c => c !== cat));
                                                setEditingRecipeCategory(ec => ec && ec.original === cat ? null : ec);
                                                setNewRecipe(r => ({ ...r, categorie: r.categorie === cat ? '' : r.categorie }));
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {items.map(({ recette, index: idx }) => (
                                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                                    {editingRecipe?.index === idx ? (
                                        <div className="space-y-3">
                                            <input type="text" value={editingRecipe.data.nom} onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, nom: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" />
                                            <select value={editingRecipe.data.categorie} onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, categorie: e.target.value } })} className="w-full px-3 py-2 border rounded-lg">
                                                {recipeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                                                <p className="text-sm font-semibold mb-2">{lang === 'fr' ? 'Ingrédients :' : 'Ingredients:'}</p>
                                                {allIngredients.map(ing => (
                                                    <label key={ing} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                                        <input type="checkbox" checked={editingRecipe.data.ingredients.includes(ing)} onChange={() => toggleIngredientInRecipe(ing, true)} className="w-4 h-4" />
                                                        <span className="text-sm">{ing}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={updateRecipe} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600">
                                                    <Save className="w-4 h-4" />{t('saveVerb')}
                                                </button>
                                                <button onMouseDown={(e) => e.preventDefault()} onClick={() => setEditingRecipe(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-400">{t('cancel')}</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{recette.nom}</h4>
                                                    <p className="text-xs text-gray-500">{recette.categorie}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setEditingRecipe({ index: idx, data: { ...recette } })} className="text-blue-500 hover:text-blue-700">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => deleteRecipe(idx)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {recette.ingredients.map(ing => (
                                                    <span key={ing} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{ing}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* IMPORT / EXPORT */}
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-100 to-green-200 px-4 py-3 font-semibold text-gray-800 flex justify-between items-center">
                    <span>{t('importExport')}</span>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-600">{t('importExportInfo')}</p>
                    <div className="flex flex-wrap gap-2">
                        <button onMouseDown={(e) => e.preventDefault()} onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 flex items-center gap-2">
                            <Save className="w-4 h-4" />{t('export')}
                        </button>
                        <label className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 cursor-pointer flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />{t('import')}
                            <input type="file" accept="application/json" className="hidden" onChange={onImportInputChange} />
                        </label>
                        {importError && (
                            <span className="text-xs text-red-600">{importError}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
