import { useState, useMemo, useCallback } from 'react';
import { useConfirm } from './useConfirm';
import { buildExportData, validateExportData, sanitizeImport, ShoppingSession } from '../lib/exportImport';
import { IngredientsType, CategoriesType, RecipeType, EditingRecipeType, FreshCategoriesType } from '../types';

interface UseManagementParams {
    ingredients: IngredientsType;
    setIngredients: React.Dispatch<React.SetStateAction<IngredientsType>>;
    categories: CategoriesType;
    setCategories: React.Dispatch<React.SetStateAction<CategoriesType>>;
    recettes: RecipeType[];
    setRecettes: React.Dispatch<React.SetStateAction<RecipeType[]>>;
    recipeCategories: string[];
    setRecipeCategories: React.Dispatch<React.SetStateAction<string[]>>;
    freshCategories: FreshCategoriesType;
    setFreshCategories: React.Dispatch<React.SetStateAction<FreshCategoriesType>>;
    shoppingHistory: ShoppingSession[];
    setShoppingHistory: React.Dispatch<React.SetStateAction<ShoppingSession[]>>;
    lang: 'fr' | 'en';
    t: (k: string) => string;
    notifySuccess?: (message: string, duration?: number) => void;
    onAfterImport?: () => void;
}

export function useManagement({
    ingredients,
    setIngredients,
    categories,
    setCategories,
    recettes,
    setRecettes,
    recipeCategories,
    setRecipeCategories,
    freshCategories,
    setFreshCategories,
    shoppingHistory,
    setShoppingHistory,
    lang,
    t,
    notifySuccess,
    onAfterImport
}: UseManagementParams) {
    // Custom confirm dialog hook
    const confirmDialog = useConfirm();
    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<EditingRecipeType>(null);
    const [editingIngredient, setEditingIngredient] = useState<{
        originalName: string; name: string; category: string; price: string; parts: string;
    } | null>(null);
    const [newIngredient, setNewIngredient] = useState<{ name: string; category: string; price: string; parts: string; expiryDate: string }>({ name: '', category: '', price: '', parts: '', expiryDate: '' });
    const [newRecipe, setNewRecipe] = useState<RecipeType>({ nom: '', categorie: '', ingredients: [] });
    const [editingCategory, setEditingCategory] = useState<{ original: string; name: string } | null>(null);
    const [editingRecipeCategory, setEditingRecipeCategory] = useState<{ original: string; name: string } | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [showNewIngredientCategoryField, setShowNewIngredientCategoryField] = useState(false);
    const [newIngredientCategoryInput, setNewIngredientCategoryInput] = useState('');
    const [showNewRecipeCategoryField, setShowNewRecipeCategoryField] = useState(false);
    const [newRecipeCategoryInput, setNewRecipeCategoryInput] = useState('');

    const allIngredients = useMemo(() => Object.keys(ingredients), [ingredients]);
    const recettesParCategorie = useMemo(() => {
        const map: { [key: string]: { recette: RecipeType; index: number }[] } = {};
        for (let idx = 0; idx < recettes.length; idx++) {
            const r = recettes[idx];
            if (!map[r.categorie]) map[r.categorie] = [];
            map[r.categorie].push({ recette: r, index: idx });
        }
        return map;
    }, [recettes]);

    const addIngredient = useCallback(() => {
        const name = newIngredient.name.trim();
        let category = newIngredient.category;
        if (showNewIngredientCategoryField && newIngredientCategoryInput.trim()) {
            category = newIngredientCategoryInput.trim();
            if (categories[category]) {
                alert(t('categoryExists'));
                return;
            }
        }
        
        const priceNum = Number.parseFloat(newIngredient.price);
        const partsNum = Number.parseInt(newIngredient.parts, 10);
        if (!name || !category || Number.isNaN(priceNum) || Number.isNaN(partsNum) || partsNum < 1 || priceNum < 0) {
            alert(lang === 'fr' ? 'Veuillez entrer un nom, une catégorie, un prix ≥ 0 et des parts ≥ 1.' : 'Enter name, category, price ≥ 0 and parts ≥ 1.');
            return;
        }
        if (ingredients[name]) {
            alert(lang === 'fr' ? 'Un ingrédient avec ce nom existe déjà.' : 'Ingredient already exists.');
            return;
        }
        setIngredients(prev => {
            const base: any = { inStock: false, price: priceNum, parts: partsNum, remainingParts: partsNum };
            if (newIngredient.expiryDate) base.expiryDate = newIngredient.expiryDate;
            return { ...prev, [name]: base };
        });
        setCategories(prev => ({ ...prev, [category]: [...(prev[category] || []), name] }));
        setNewIngredient({ name: '', category: '', price: '', parts: '', expiryDate: '' });
        setShowNewIngredientCategoryField(false);
        setNewIngredientCategoryInput('');
        setShowAddIngredient(false);
    }, [newIngredient, ingredients, lang, setIngredients, setCategories, showNewIngredientCategoryField, newIngredientCategoryInput, categories, t]);

    const deleteIngredient = useCallback(async (ingredient: string, category: string) => {
        const ok = await confirmDialog({
            title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
            message: t('deleteIngredientConfirm').replace('{name}', ingredient),
            confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
            variant: 'danger'
        });
        if (!ok) return;
        setIngredients(prev => { const copy = { ...prev }; delete copy[ingredient]; return copy; });
        setCategories(prev => ({ ...prev, [category]: prev[category].filter(i => i !== ingredient) }));
        setRecettes(prev => {
            const next: RecipeType[] = [];
            for (const r of prev) {
                const filteredIngredients = [] as string[];
                for (const ing of r.ingredients) {
                    if ( ing !== ingredient ) filteredIngredients.push(ing);
                }
                if (filteredIngredients.length > 0) {
                    next.push({ ...r, ingredients: filteredIngredients });
                }
            }
            return next;
        });
    }, [t, setIngredients, setCategories, setRecettes]);

    const addRecipe = useCallback(() => {
        // Si on est en train de créer une nouvelle catégorie, utiliser le nom de la nouvelle catégorie
        let categorie = newRecipe.categorie;
        if (showNewRecipeCategoryField && newRecipeCategoryInput.trim()) {
            categorie = newRecipeCategoryInput.trim();
            // Vérifier si la catégorie existe déjà
            if (recipeCategories.includes(categorie)) {
                alert(t('categoryExists'));
                return;
            }
        }
        if (!newRecipe.nom.trim() || !categorie || newRecipe.ingredients.length === 0) return;
        
        const recipeToAdd = { ...newRecipe, categorie };
        setRecettes(prev => [...prev, recipeToAdd]);
        if (!recipeCategories.includes(categorie)) {
            setRecipeCategories(prev => [...prev, categorie]);
        }
        setNewRecipe({ nom: '', categorie: '', ingredients: [] });
        setShowNewRecipeCategoryField(false);
        setNewRecipeCategoryInput('');
        setShowAddRecipe(false);
    }, [newRecipe, recipeCategories, setRecettes, setRecipeCategories, showNewRecipeCategoryField, newRecipeCategoryInput, t]);

    const updateRecipe = useCallback(() => {
        if (!editingRecipe) return;
        setRecettes(prev => prev.map((r, i) => i === editingRecipe.index ? editingRecipe.data : r));
        if (editingRecipe.data.categorie && !recipeCategories.includes(editingRecipe.data.categorie)) {
            setRecipeCategories(prev => [...prev, editingRecipe.data.categorie]);
        }
        setEditingRecipe(null);
    }, [editingRecipe, recipeCategories, setRecettes, setRecipeCategories]);

    const deleteRecipe = useCallback(async (index: number) => {
        const ok = await confirmDialog({
            title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
            message: t('deleteRecipeConfirm'),
            confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
            variant: 'danger'
        });
        if (!ok) return;
        const catDeleted = recettes[index].categorie;
        setRecettes(prev => prev.filter((_, i) => i !== index));
        if (recettes.filter((r, i) => i !== index && r.categorie === catDeleted).length === 0) {
            setRecipeCategories(prev => prev.filter(c => c !== catDeleted));
        }
    }, [t, recettes, setRecettes, setRecipeCategories]);

    const saveRecipeCategoryRename = useCallback(() => {
        if (!editingRecipeCategory) return;
        const newName = editingRecipeCategory.name.trim();
        if (!newName) { alert(t('invalidCategoryName')); return; }
        if (recipeCategories.includes(newName) && newName !== editingRecipeCategory.original) {
            alert(t('categoryExists'));
            return;
        }
        setRecettes(prev => prev.map(r => r.categorie === editingRecipeCategory.original ? { ...r, categorie: newName } : r));
        setRecipeCategories(prev => {
            const withoutOld = prev.filter(c => c !== editingRecipeCategory.original);
            return withoutOld.includes(newName) ? withoutOld : [...withoutOld, newName];
        });
        setNewRecipe(r => ({ ...r, categorie: r.categorie === editingRecipeCategory.original ? newName : r.categorie }));
        setEditingRecipe(er => er ? { ...er, data: { ...er.data, categorie: er.data.categorie === editingRecipeCategory.original ? newName : er.data.categorie } } : er);
        setEditingRecipeCategory(null);
    }, [editingRecipeCategory, recipeCategories, setRecettes, setRecipeCategories, setNewRecipe, setEditingRecipe, t]);

    const toggleIngredientInRecipe = useCallback((ingredient: string, isEditing = false) => {
        if (isEditing && editingRecipe) {
            const ings = editingRecipe.data.ingredients;
            setEditingRecipe({
                ...editingRecipe,
                data: {
                    ...editingRecipe.data,
                    ingredients: ings.includes(ingredient)
                        ? ings.filter(i => i !== ingredient)
                        : [...ings, ingredient]
                }
            });
        } else {
            setNewRecipe(prev => ({
                ...prev,
                ingredients: prev.ingredients.includes(ingredient)
                    ? prev.ingredients.filter(i => i !== ingredient)
                    : [...prev.ingredients, ingredient]
            }));
        }
    }, [editingRecipe, setEditingRecipe, setNewRecipe]);

    const handleExport = useCallback(() => {
        const data = buildExportData(ingredients, categories, recettes, shoppingHistory, recipeCategories, freshCategories);
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recipe-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert(t('exportError'));
        }
    }, [ingredients, categories, recettes, shoppingHistory, recipeCategories, freshCategories, t]);

    const handleImportFile = useCallback((file: File) => {
        setImportError(null);
        const reader = new FileReader();
    reader.onload = async () => {
            try {
                const text = reader.result as string;
                const parsed = JSON.parse(text);
                const { valid, errors, warnings } = validateExportData(parsed);
                if (!valid) {
                    setImportError(`${t('invalidFilePrefix')} ` + (errors.join(' | ') || (lang === 'fr' ? 'Raison inconnue' : 'Unknown reason')));
                    return;
                }
                const cleaned = sanitizeImport(parsed);
                if (warnings.length) alert(`${t('importAdjustmentsPrefix')}` + warnings.join('\n'));
                const ok = await confirmDialog({
                    title: lang === 'fr' ? 'Importer les données' : 'Import data',
                    message: t('importConfirm'),
                    confirmLabel: lang === 'fr' ? 'Importer' : 'Import',
                    cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel'
                });
                if (!ok) return;
                setIngredients(cleaned.ingredients);
                setCategories(cleaned.categories);
                setRecettes(cleaned.recettes);
                setShoppingHistory(cleaned.shoppingHistory);
                const importedRecipeCats: string[] = (cleaned as any).recipeCategories || Array.from(new Set(cleaned.recettes.map((r: RecipeType) => r.categorie)));
                setRecipeCategories(importedRecipeCats);
                if ((cleaned as any).freshCategories && Array.isArray((cleaned as any).freshCategories)) {
                    setFreshCategories((cleaned as any).freshCategories.filter((c: any) => typeof c === 'string'));
                }
                // Success toast / popup
                notifySuccess?.(t('importSuccess'), 2200);
                onAfterImport?.();
            } catch {
                setImportError(t('readFail'));
            }
        };
        reader.onerror = () => setImportError(t('cannotReadFile'));
        reader.readAsText(file, 'utf-8');
    }, [t, lang, setIngredients, setCategories, setRecettes, setShoppingHistory, setRecipeCategories, setFreshCategories, notifySuccess]);

    const onImportInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImportFile(file);
        e.target.value = '';
    }, [handleImportFile]);

    const handleIngredientCategoryChange = useCallback((value: string) => {
        if (value === '__NEW_CATEGORY__') {
            setShowNewIngredientCategoryField(true);
            setNewIngredient({ ...newIngredient, category: '' });
        } else {
            setShowNewIngredientCategoryField(false);
            setNewIngredientCategoryInput('');
            setNewIngredient({ ...newIngredient, category: value });
        }
    }, [newIngredient]);

    const handleRecipeCategoryChange = useCallback((value: string) => {
        if (value === '__NEW_CATEGORY__') {
            setShowNewRecipeCategoryField(true);
            setNewRecipe({ ...newRecipe, categorie: '' });
        } else {
            setShowNewRecipeCategoryField(false);
            setNewRecipeCategoryInput('');
            setNewRecipe({ ...newRecipe, categorie: value });
        }
    }, [newRecipe]);

    const createIngredientCategory = useCallback(() => {
        const categoryName = newIngredientCategoryInput.trim();
        if (!categoryName) {
            alert(lang === 'fr' ? 'Veuillez entrer un nom de catégorie.' : 'Please enter a category name.');
            return;
        }
        if (categories[categoryName]) {
            alert(t('categoryExists'));
            return;
        }
        setCategories(prev => ({ ...prev, [categoryName]: [] }));
        setNewIngredient({ ...newIngredient, category: categoryName });
        setShowNewIngredientCategoryField(false);
        setNewIngredientCategoryInput('');
    }, [newIngredientCategoryInput, categories, newIngredient, lang, t, setCategories]);

    const createRecipeCategory = useCallback(() => {
        const categoryName = newRecipeCategoryInput.trim();
        if (!categoryName) {
            alert(lang === 'fr' ? 'Veuillez entrer un nom de catégorie.' : 'Please enter a category name.');
            return;
        }
        if (recipeCategories.includes(categoryName)) {
            alert(t('categoryExists'));
            return;
        }
        setRecipeCategories(prev => [...prev, categoryName]);
        setNewRecipe({ ...newRecipe, categorie: categoryName });
        setShowNewRecipeCategoryField(false);
        setNewRecipeCategoryInput('');
    }, [newRecipeCategoryInput, recipeCategories, newRecipe, t, setRecipeCategories]);

    const deleteRecipeCategory = useCallback(async (category: string) => {
        const count = recettes.filter(r => r.categorie === category).length;
        const pluralFr = count > 1 ? 'toutes ses recettes' : 'sa recette';
        const pluralEn = count > 1 ? 'all its recipes' : 'its recipe';
        const message = lang === 'fr'
            ? `Supprimer la catégorie et ${pluralFr} ?`
            : `Delete category and ${pluralEn}?`;
        const ok = await confirmDialog({
            title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
            message,
            confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
            variant: 'danger'
        });
        if (!ok) return;
        setRecettes(prev => prev.filter(r => r.categorie !== category));
        setRecipeCategories(prev => prev.filter(c => c !== category));
        setEditingRecipe(er => er && er.data.categorie === category ? null : er);
        setEditingRecipeCategory(ec => ec && ec.original === category ? null : ec);
        setNewRecipe(r => ({ ...r, categorie: r.categorie === category ? '' : r.categorie }));
    }, [recettes, lang, confirmDialog, setRecettes, setRecipeCategories, setEditingRecipe, setEditingRecipeCategory, setNewRecipe]);

    return {
        showAddIngredient, setShowAddIngredient,
        showAddRecipe, setShowAddRecipe,
        editingRecipe, setEditingRecipe,
        editingIngredient, setEditingIngredient,
        newIngredient, setNewIngredient,
        newRecipe, setNewRecipe,
        editingCategory, setEditingCategory,
        editingRecipeCategory, setEditingRecipeCategory,
        importError,
        categories, setCategories,
        ingredients, setIngredients,
        recettes, setRecettes,
        recipeCategories, setRecipeCategories,
        freshCategories, setFreshCategories,
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
        showNewIngredientCategoryField,
        newIngredientCategoryInput,
        setNewIngredientCategoryInput,
        showNewRecipeCategoryField,
        newRecipeCategoryInput,
        setNewRecipeCategoryInput,
        handleIngredientCategoryChange,
        handleRecipeCategoryChange,
        createIngredientCategory,
        createRecipeCategory,
        deleteRecipeCategory
    };
}

export type UseManagementReturn = ReturnType<typeof useManagement>;
