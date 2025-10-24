import React, { useState, useMemo, useEffect } from 'react';
import { CategoryIngredients } from './CategoryIngredients';
import { ShoppingOverlay } from './ShoppingOverlay';
import { SearchBar } from './SearchBar';
import { IngredientsType, CategoriesType, FreshCategoriesType } from '../types';
import { UseManagementReturn } from '../hooks/useManagement';
import { Edit2, Trash2, Snowflake, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDate, formatDaysLeft, computeExpiryStatus } from '../utils/expiry';

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
    categoryOrder: string[];
    setCategoryOrder: React.Dispatch<React.SetStateAction<string[]>>;
    management: UseManagementReturn;
    lang: 'fr' | 'en';
    // notifications removed from this tab; keep placeholders out
    shoppingActivePersisted: boolean;
    // external edit mode state & toggle (managed by App via floating pencil)
    editMode: boolean;
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
    categoryOrder,
    setCategoryOrder,
    management,
    lang,
    // notification props removed
    shoppingActivePersisted,
    editMode
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    // editMode provided externally now

    const {
        editingCategory, setEditingCategory,
        editingIngredient, setEditingIngredient,
        newIngredient, setNewIngredient,
        showAddIngredient, setShowAddIngredient,
        showNewIngredientCategoryField,
        newIngredientCategoryInput,
        setNewIngredientCategoryInput,
        handleIngredientCategoryChange,
        addIngredient,
        deleteIngredient,
    /* import/export moved to SettingsModal */
        freshCategories: _freshCategories, setFreshCategories,
        setCategories,
        setIngredients: setIngredientsFromHook
    } = management;

    const moveCategoryUp = (categorie: string) => {
        const index = categoryOrder.indexOf(categorie);
        if (index > 0) {
            const newOrder = [...categoryOrder];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
            setCategoryOrder(newOrder);
        }
    };
    const moveCategoryDown = (categorie: string) => {
        const index = categoryOrder.indexOf(categorie);
        if (index < categoryOrder.length - 1) {
            const newOrder = [...categoryOrder];
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
            setCategoryOrder(newOrder);
        }
    };

    // Keep categoryOrder in sync with categories (handles existing data where order might be empty)
    useEffect(() => {
        const current = Object.keys(categories);
        if (current.length === 0) return; // nothing to sync yet
        const needsUpdate = current.some(c => !categoryOrder.includes(c)) || categoryOrder.some(c => !current.includes(c));
        if (needsUpdate) {
            // Preserve existing order for categories still present; append new ones
            const preserved = categoryOrder.filter(c => current.includes(c));
            const newOnes = current.filter(c => !preserved.includes(c));
            setCategoryOrder([...preserved, ...newOnes]);
        }
    }, [categories, categoryOrder, setCategoryOrder]);

    // Get ordered categories
    const orderedCategories = useMemo(() => {
        return categoryOrder
            .filter(cat => categories[cat])
            .map(cat => [cat, categories[cat]] as [string, string[]]);
    }, [categoryOrder, categories]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return orderedCategories;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered: [string, string[]][] = [];

        for (const [categorie, items] of orderedCategories) {
            // Check if category name matches the search query
            const categoryMatches = categorie.toLowerCase().includes(query);
            
            // Filter items that match the search query
            const filteredItems = items.filter(item => 
                item.toLowerCase().includes(query)
            );
            
            // Include the category if either:
            // 1. The category name matches, or
            // 2. At least one ingredient matches
            if (categoryMatches || filteredItems.length > 0) {
                // If category matches, show all items; otherwise show only filtered items
                filtered.push([categorie, categoryMatches ? items : filteredItems]);
            }
        }

        return filtered;
    }, [orderedCategories, searchQuery]);

    // Gather expiring (soon or expired) in-stock ingredients to display a banner similar to RecipesTab
    const expiringList = useMemo(() => {
        const list: { name: string; status: 'soon' | 'expired'; daysLeft: number }[] = [];
        for (const [name, data] of Object.entries(ingredients)) {
            if (!data.inStock) continue;
            if (!data.expiryDate) continue;
            const { status, daysLeft } = computeExpiryStatus({ expiryDate: data.expiryDate, inStock: true });
            if (status === 'soon' || status === 'expired') {
                list.push({ name, status, daysLeft });
            }
        }
        // Sort: expired first, then soon by ascending days
        return list.sort((a, b) => {
            if (a.status === b.status) return a.daysLeft - b.daysLeft;
            if (a.status === 'expired') return -1;
            if (b.status === 'expired') return 1;
            return 0;
        });
    }, [ingredients]);

    const containerClasses = shoppingMode ? 'space-y-4 bg-white rounded-lg p-2 -mx-2 sm:mx-0 pb-24' : 'space-y-4 pb-24';
    return (
        <div className={containerClasses}>
            {expiringList.length > 0 && !editMode && (
                <div className="border rounded-lg bg-red-50 border-red-200 p-3 space-y-2 animate-fade-in">
                    <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <span>⚠️ {t('consumeSoon')}</span>
                        <span className="text-[10px] font-normal text-red-600">({expiringList.length} {lang === 'fr' ? `ingrédient${expiringList.length>1?'s':''}` : `ingredient${expiringList.length>1?'s':''}`})</span>
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {expiringList.map(e => (
                            <span key={e.name} className={`px-2 py-1 rounded-full text-[10px] font-medium ${e.status === 'expired' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}>{e.name} {e.status === 'expired' ? '(périmé)' : (e.daysLeft === 0 ? (lang === 'fr' ? 'J0' : 'D0') : (lang === 'fr' ? 'J-' : 'D-') + e.daysLeft)}</span>
                        ))}
                    </div>
                </div>
            )}
            {/* Full width search bar (manage button moved to floating pencil) */}
            <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('searchIngredients')}
                className="mb-2"
            />

            {editMode && (
                <div className="space-y-4 animate-fade-in">
                    {/* NotificationSettings removed: central settings modal handles notifications */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100 flex justify-between items-center sticky top-0">
                            <span className="text-sm">{t('manageIngredients')}</span>
                            {!showAddIngredient && (
                                <button onClick={() => setShowAddIngredient(true)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">{lang === 'fr' ? 'Ajouter' : 'Add'}</button>
                            )}
                        </div>
                        {showAddIngredient && (
                            <div className="p-3 bg-blue-50 border-b space-y-3">
                                <input type="text" placeholder={t('ingredientFormName')} value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                                <select 
                                    value={showNewIngredientCategoryField ? '__NEW_CATEGORY__' : newIngredient.category} 
                                    onChange={(e) => handleIngredientCategoryChange(e.target.value)} 
                                    className="w-full px-3 py-2.5 border rounded-lg text-sm"
                                >
                                    <option value="">{t('chooseCategory')}</option>
                                    {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    <option value="__NEW_CATEGORY__">{lang === 'fr' ? '➕ Nouvelle catégorie...' : '➕ New category...'}</option>
                                </select>
                                {showNewIngredientCategoryField && (
                                    <input
                                        type="text"
                                        placeholder={lang === 'fr' ? 'Nom de la nouvelle catégorie' : 'New category name'}
                                        value={newIngredientCategoryInput}
                                        onChange={(e) => setNewIngredientCategoryInput(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                )}
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
                                            (!newIngredient.category && !newIngredientCategoryInput.trim()) ||
                                            newIngredient.price === '' ||
                                            newIngredient.parts === '' ||
                                            Number.isNaN(Number.parseFloat(newIngredient.price)) ||
                                            Number.isNaN(Number.parseInt(newIngredient.parts, 10)) ||
                                            Number.parseFloat(newIngredient.price) < 0 ||
                                            Number.parseInt(newIngredient.parts, 10) < 1 ||
                                            !!ingredients[newIngredient.name.trim()]
                                        }
                                        className="flex-1 bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 text-sm"
                                    >
                                        <Save className="w-4 h-4" />{t('save')}
                                    </button>
                                    <button 
                                        onMouseDown={(e) => e.preventDefault()} 
                                        onClick={() => {
                                            setShowAddIngredient(false);
                                            setNewIngredientCategoryInput('');
                                            handleIngredientCategoryChange('');
                                        }} 
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="p-4">
                            {categoryOrder.filter(cat => categories[cat]).map((categorie, index) => (
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
                                                    className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200"
                                                    title={lang === 'fr' ? 'Monter' : 'Move up'}
                                                    onClick={() => moveCategoryUp(categorie)}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronUp className={`w-4 h-4 ${index === 0 ? 'text-gray-300' : 'text-gray-600'}`} />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded hover:bg-gray-100 active:bg-gray-200"
                                                    title={lang === 'fr' ? 'Descendre' : 'Move down'}
                                                    onClick={() => moveCategoryDown(categorie)}
                                                    disabled={index === categoryOrder.filter(cat => categories[cat]).length - 1}
                                                >
                                                    <ChevronDown className={`w-4 h-4 ${index === categoryOrder.filter(cat => categories[cat]).length - 1 ? 'text-gray-300' : 'text-gray-600'}`} />
                                                </button>
                                                <div className="w-px h-4 bg-gray-300 mx-0.5"></div>
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
                                                    onClick={async () => {
                                                        const ok = await (management as any).confirmDialog?.({
                                                            title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
                                                            message: lang === 'fr' ? 'Supprimer la catégorie et tous ses ingrédients ?' : 'Delete category and all its ingredients?',
                                                            confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
                                                            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
                                                            variant: 'danger'
                                                        }) || true; // fallback if not provided
                                                        if (!ok) return;
                                                        const toDelete = [...(categories[categorie] || [])];
                                                        setCategories(prev => {
                                                            const copy = { ...prev };
                                                            delete copy[categorie];
                                                            return copy;
                                                        });
                                                        setFreshCategories(prev => prev.filter(c => c !== categorie));
                                                        setIngredientsFromHook(prev => {
                                                            const copy = { ...prev };
                                                            toDelete.forEach(n => { delete copy[n]; });
                                                            return copy;
                                                        });
                                                        setEditingCategory(null);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {categories[categorie].map(ing => (
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
                                                                        setIngredientsFromHook(prev => ({
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
                                                                    const priceNum = Number.parseFloat(editingIngredient.price);
                                                                    const partsNum = Number.parseInt(editingIngredient.parts, 10);
                                                                    if (!newName || Number.isNaN(priceNum) || Number.isNaN(partsNum) || partsNum < 1) {
                                                                        alert(lang === 'fr' ? 'Veuillez entrer un nom, un prix et un nombre de parts valides.' : 'Please enter valid name, price and parts.');
                                                                        return;
                                                                    }
                                                                    const original = editingIngredient.originalName;
                                                                    const newCategory = editingIngredient.category;
                                                                    const oldCategory = categorie;
                                                                    setIngredientsFromHook((prev) => {
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
                                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
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
                </div>
            )}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800"><strong>{t('tip')} :</strong> {t('tipCheckbox').replace(/^.*?:\s*/, '')}</p>
            </div>

            {!shoppingMode && ingredientsManquants.length > 0 && (
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={startShopping}
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-medium shadow hover:bg-green-700 active:scale-[.98] transition-smooth"
                >
                    {shoppingActivePersisted ? (lang === 'fr' ? 'Reprendre les courses' : 'Resume shopping') : `${t('startShopping')} (${ingredientsManquants.length} ${t('articles')})`}
                </button>
            )}

            {!editMode && filteredCategories.map(([categorie, items]) => (
                <CategoryIngredients
                    key={categorie}
                    categorie={categorie}
                    items={items}
                    ingredients={ingredients}
                    onToggle={toggleIngredient}
                    lang={lang}
                />
            ))}

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
        </div>
    );
};

// Spacer element added at end inside parent (handled above). Ensure export unchanged.
