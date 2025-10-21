import { useState, useEffect, useMemo, useCallback } from 'react';
import { buildExportData, validateExportData, sanitizeImport, ShoppingSession } from './exportImport';
import { ChefHat, ShoppingCart, Plus, Trash2, Edit2, Save, RefreshCcw, Languages, X, HelpCircle, Snowflake } from 'lucide-react';
import { usePersistentState } from './hooks/usePersistentState';
import {
    IngredientsType,
    CategoriesType,
    RecipeType,
    EditingRecipeType,
    INITIAL_FRESH_CATEGORIES,
    defaultIngredients,
    defaultCategories,
    defaultRecettes,
    FreshCategoriesType
} from './types';
import { computeExpiryStatus, scoreRecette, earliestExpiryDays } from './utils/expiry';
import { CategoryIngredients } from './components/CategoryIngredients';
import { RecipeGroup } from './components/RecipeGroup';
import { HelpTutorial, FloatingHelpButton } from './components/HelpTutorial';

export function App() {
    const [ingredients, setIngredients] = usePersistentState<IngredientsType>('ingredients', defaultIngredients);
    const [categories, setCategories] = usePersistentState<CategoriesType>('categories', defaultCategories);
    const [recettes, setRecettes] = usePersistentState<RecipeType[]>('recettes', defaultRecettes);
    const [freshCategories, setFreshCategories] = usePersistentState<FreshCategoriesType>('freshCategories', INITIAL_FRESH_CATEGORIES);
    const [recipeCategories, setRecipeCategories] = usePersistentState<string[]>('recipeCategories', () => Array.from(new Set(defaultRecettes.map(r => r.categorie))));
    const [lang, setLang] = usePersistentState<'fr' | 'en'>('lang', 'fr');
    const [activeTab, setActiveTab] = useState<'courses' | 'recettes' | 'gestion' | 'historique'>('courses');
    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<EditingRecipeType>(null);
    const [editingIngredient, setEditingIngredient] = useState<{
        originalName: string;
        name: string;
        category: string;
        price: string;
        parts: string;
    } | null>(null);
    const [newIngredient, setNewIngredient] = useState<{ name: string; category: string; price: string; parts: string; expiryDate: string }>({ name: '', category: '', price: '', parts: '', expiryDate: '' });
    const [newRecipe, setNewRecipe] = useState<RecipeType>({ nom: '', categorie: '', ingredients: [] });
    const [editingCategory, setEditingCategory] = useState<{ original: string; name: string } | null>(null);
    const [newIngredientCategoryName, setNewIngredientCategoryName] = useState<string>('');
    const [editingRecipeCategory, setEditingRecipeCategory] = useState<{ original: string; name: string } | null>(null);
    const [newRecipeCategoryName, setNewRecipeCategoryName] = useState<string>('');
    const [shoppingMode, setShoppingMode] = useState(false);
    const [shoppingSelected, setShoppingSelected] = useState<Set<string>>(new Set());
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingSession[]>(() => {
        const saved = localStorage.getItem('shoppingHistory');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => { try { localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory)); } catch { } }, [shoppingHistory]);

    const translations: Record<'fr' | 'en', Record<string, string>> = {
        fr: {
            appTitle: 'Gestionnaire de Courses',
            appSubtitle: 'Gérez vos courses et découvrez les plats que vous pouvez cuisiner',
            tabCourses: 'Courses', tabRecettes: 'Recettes', tabGestion: 'Gestion', tabHistorique: 'Hist.',
            resetData: 'Réinitialiser', confirmReset: 'Effacer TOUTES les données ? (ingrédients, catégories, recettes, historique)',
            langToggle: 'Langue',
            startShopping: 'Démarrer les courses',
            articles: 'articles',
            tip: 'Astuce', tipCheckbox: 'Astuce : Cochez les ingrédients que vous avez à la maison.',
            toBuy: 'À acheter',
            shoppingListTitle: 'Liste des courses',
            close: 'Fermer',
            progressSelected: 'Sélectionnés',
            progressSubtotal: 'Sous-total',
            finish: 'Terminer',
            cancel: 'Annuler',
            totalEstimate: 'Total estimé :',
            allInStock: 'Tout est en stock ! 🎉',
            recipesNone: 'Aucune recette possible avec les ingrédients actuels.',
            canCookIntro: '🎉 Super !', canCookMiddle: 'Vous pouvez préparer', dish: 'plat', dishes: 'plats',
            consumeSoon: 'À consommer rapidement',
            suggestedRecipes: 'Recettes suggérées en priorité :',
            manageIngredients: 'Gestion des Ingrédients',
            add: 'Ajouter', addIngredient: 'Ajouter ingrédient', addRecipe: 'Ajouter recette', save: 'Enregistrer', saveVerb: 'Sauvegarder',
            invalidCategoryName: 'Nom de catégorie invalide', categoryExists: 'Une catégorie avec ce nom existe déjà.',
            rename: 'Renommer',
            saveAction: 'Sauver',
            importExportInfo: 'Sauvegardez ou restaurez toutes vos données (ingrédients, catégories, recettes, historique). Format JSON versionné.',
            exportError: 'Erreur lors de l\'export des données.',
            invalidFilePrefix: 'Fichier invalide:',
            importAdjustmentsPrefix: 'Import avec ajustements:',
            importConfirm: 'Importer ce fichier et remplacer les données actuelles ?',
            readFail: 'Lecture ou parsing JSON échoué.',
            cannotReadFile: 'Impossible de lire le fichier.',
            ingredientsLabel: 'Ingrédients :',
            manageRecipes: 'Gestion des Recettes',
            importExport: 'Import / Export', export: 'Exporter', import: 'Importer',
            historyIntro: 'Historique de vos sessions de courses.',
            manage: 'Gérer', done: 'Terminer',
            selectAll: 'Tout sélectionner', deselectAll: 'Tout désélectionner', deleteSelected: 'Supprimer sélection',
            emptyHistory: 'Aucune session enregistrée pour l\'instant.',
            clearHistory: 'Vider l\'historique', clearHistoryConfirm: 'Effacer tout l\'historique des courses ?',
            deleteSessionConfirmOne: 'Supprimer cette session ?', deleteSessionConfirmMany: 'Supprimer {n} sessions ?',
            deleteRecipeConfirm: 'Supprimer cette recette ?', deleteIngredientConfirm: 'Supprimer "{name}" ?',
            priceMust: 'Le prix doit être ≥ 0 et les parts ≥ 1. La date de péremption est optionnelle.',
            nameUsed: 'Nom déjà utilisé.',
            ingredientFormName: 'Nom de l\'ingrédient', chooseCategory: 'Choisir une catégorie', price: 'Prix', parts: 'Parts', expiryOptional: 'Date de péremption (optionnelle)',
            dateExpiry: 'Date de péremption', perPart: '€/part', expired: 'PÉRIMÉ', expiresPrefix: 'Expire', suggestedIngredients: 'Ingrédients :',
            help: 'Aide', tutorialTitle: 'Guide rapide', tutorialIntro: 'Voici les étapes pour utiliser l\'application au mieux :', tutorialGotIt: 'J\'ai compris', tutorialBackToTop: 'Retour en haut', tutorialFooterNote: 'Astuce : les données sont sauvegardées automatiquement dans votre navigateur.',
            tutorialStartWithDemo: 'Commencer avec les données démo', tutorialStartEmpty: 'Commencer avec aucune donnée',
            freshToggleLabel: 'Catégorie fraîche (suivi date péremption)', freshSectionTitle: 'Catégories fraîches'
        },
        en: {
            appTitle: 'Shopping & Recipes Manager',
            appSubtitle: 'Manage groceries and discover meals you can cook',
            tabCourses: 'Groceries', tabRecettes: 'Recipes', tabGestion: 'Manage', tabHistorique: 'Hist.',
            resetData: 'Reset', confirmReset: 'Delete ALL data? (ingredients, categories, recipes, history)',
            langToggle: 'Language',
            startShopping: 'Start shopping',
            articles: 'items',
            tip: 'Tip', tipCheckbox: 'Tip: Check ingredients you already have.',
            toBuy: 'To buy',
            shoppingListTitle: 'Shopping list',
            close: 'Close',
            progressSelected: 'Selected',
            progressSubtotal: 'Subtotal',
            finish: 'Finish',
            cancel: 'Cancel',
            totalEstimate: 'Estimated total:',
            allInStock: 'Everything is in stock! 🎉',
            recipesNone: 'No recipe possible with current ingredients.',
            canCookIntro: '🎉 Great!', canCookMiddle: 'You can prepare', dish: 'dish', dishes: 'dishes',
            consumeSoon: 'Consume soon',
            suggestedRecipes: 'Suggested priority recipes:',
            manageIngredients: 'Ingredients Management',
            add: 'Add', addIngredient: 'Add ingredient', addRecipe: 'Add recipe', save: 'Save', saveVerb: 'Save',
            invalidCategoryName: 'Invalid category name', categoryExists: 'A category with that name already exists.',
            rename: 'Rename',
            saveAction: 'Save',
            importExportInfo: 'Save or restore all your data (ingredients, categories, recipes, history). Versioned JSON format.',
            exportError: 'Error while exporting data.',
            invalidFilePrefix: 'Invalid file:',
            importAdjustmentsPrefix: 'Import with adjustments:',
            importConfirm: 'Import this file and replace current data?',
            readFail: 'Reading or JSON parsing failed.',
            cannotReadFile: 'Cannot read file.',
            ingredientsLabel: 'Ingredients:',
            manageRecipes: 'Recipes Management',
            importExport: 'Import / Export', export: 'Export', import: 'Import',
            historyIntro: 'History of your shopping sessions.',
            manage: 'Manage', done: 'Done',
            selectAll: 'Select all', deselectAll: 'Unselect all', deleteSelected: 'Delete selected',
            emptyHistory: 'No session recorded yet.',
            clearHistory: 'Clear history', clearHistoryConfirm: 'Clear all shopping history?',
            deleteSessionConfirmOne: 'Delete this session?', deleteSessionConfirmMany: 'Delete {n} sessions?',
            deleteRecipeConfirm: 'Delete this recipe?', deleteIngredientConfirm: 'Delete "{name}"?',
            priceMust: 'Price must be ≥ 0 and parts ≥ 1. Expiry date is optional.',
            nameUsed: 'Name already used.',
            ingredientFormName: 'Ingredient name', chooseCategory: 'Choose a category', price: 'Price', parts: 'Parts', expiryOptional: 'Expiry date (optional)',
            dateExpiry: 'Expiry date', perPart: '€/part', expired: 'EXPIRED', expiresPrefix: 'Expires', suggestedIngredients: 'Ingredients:',
            help: 'Help', tutorialTitle: 'Quick tutorial', tutorialIntro: 'Follow these steps to get the best out of the app:', tutorialGotIt: 'Got it', tutorialBackToTop: 'Back to top', tutorialFooterNote: 'Tip: data is saved automatically in your browser.',
            tutorialStartWithDemo: 'Start with demo data', tutorialStartEmpty: 'Start with no data',
            freshToggleLabel: 'Fresh category (expiry tracking)', freshSectionTitle: 'Fresh categories'
        }
    };
    const t = (k: string) => translations[lang][k] || k;

    const resetAllData = () => {
        if (!confirm(t('confirmReset'))) return;
        try { ['ingredients', 'categories', 'recettes', 'shoppingHistory', 'recipeCategories'].forEach(k => localStorage.removeItem(k)); } catch { }
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setShoppingHistory([]);
        setRecipeCategories([]);
    };
    const toggleLang = () => setLang(prev => prev === 'fr' ? 'en' : 'fr');
    const [importError, setImportError] = useState<string | null>(null);
    const handleExport = () => {
        const data = buildExportData(ingredients, categories, recettes, shoppingHistory, recipeCategories, freshCategories);
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recipe-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(t('exportError'));
        }
    };
    const handleImportFile = (file: File) => {
        setImportError(null);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = reader.result as string;
                const parsed = JSON.parse(text);
                const { valid, errors, warnings } = validateExportData(parsed);
                if (!valid) {
                    setImportError(`${t('invalidFilePrefix')} ` + (errors.join(' | ') || (lang === 'fr' ? 'Raison inconnue' : 'Unknown reason')));
                    return;
                }
                const cleaned = sanitizeImport(parsed as any);
                if (warnings.length) {
                    alert(`${t('importAdjustmentsPrefix')}\n` + warnings.join('\n'));
                }
                if (!confirm(t('importConfirm'))) return;
                setIngredients(cleaned.ingredients);
                setCategories(cleaned.categories);
                setRecettes(cleaned.recettes);
                setShoppingHistory(cleaned.shoppingHistory);
                const importedRecipeCats: string[] = (cleaned as any).recipeCategories || Array.from(new Set(cleaned.recettes.map((r: RecipeType) => r.categorie)));
                setRecipeCategories(importedRecipeCats);
                if ((cleaned as any).freshCategories && Array.isArray((cleaned as any).freshCategories)) {
                    setFreshCategories((cleaned as any).freshCategories.filter((c: any) => typeof c === 'string'));
                }
            } catch (err) {
                setImportError(t('readFail'));
            }
        };
        reader.onerror = () => setImportError(t('cannotReadFile'));
        reader.readAsText(file, 'utf-8');
    };
    const onImportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImportFile(file);
        e.target.value = '';
    };
    useEffect(() => { /* conservé pour rétro compat éventuelle */ }, []);
    const [historySelectMode, setHistorySelectMode] = useState(false);
    const [historySelected, setHistorySelected] = useState<Set<string>>(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
        try { return localStorage.getItem('tutorialSeen') === '1'; } catch { return false; }
    });
    useEffect(() => {
        if (!hasSeenTutorial) {
            const timer = setTimeout(() => setShowHelp(true), 800);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial]);
    const openHelp = () => setShowHelp(true);
    const closeHelp = () => {
        setShowHelp(false);
        if (!hasSeenTutorial) {
            setHasSeenTutorial(true);
            try { localStorage.setItem('tutorialSeen', '1'); } catch { }
        }
    };
    const startWithDemoData = () => {
        setIngredients(defaultIngredients);
        setCategories(defaultCategories);
        setRecettes(defaultRecettes);
        setRecipeCategories(Array.from(new Set(defaultRecettes.map(r => r.categorie))));
        setFreshCategories(INITIAL_FRESH_CATEGORIES);
    };
    const startWithEmptyData = () => {
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setRecipeCategories([]);
        setFreshCategories([]);
    };
    const toggleHistorySelect = (id: string) => {
        setHistorySelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const deleteHistoryIds = (ids: string[]) => {
        if (ids.length === 0) return;
        if (!confirm(ids.length === 1 ? (lang === 'fr' ? 'Supprimer cette session ?' : 'Delete this session?') : (lang === 'fr' ? `Supprimer ${ids.length} sessions ?` : `Delete ${ids.length} sessions?`))) return;
        setShoppingHistory(prev => prev.filter(s => !ids.includes(s.id)));
        setHistorySelected(new Set());
        setHistorySelectMode(false);
    };
    const selectAllHistory = () => {
        if (historySelected.size === shoppingHistory.length) {
            setHistorySelected(new Set());
        } else {
            setHistorySelected(new Set(shoppingHistory.map(s => s.id)));
        }
    };

    const addIngredient = () => {
        const name = newIngredient.name.trim();
        const category = newIngredient.category;
        const priceNum = parseFloat(newIngredient.price);
        const partsNum = parseInt(newIngredient.parts, 10);
        if (!name || !category || isNaN(priceNum) || isNaN(partsNum) || partsNum < 1 || priceNum < 0) {
            alert('Veuillez entrer un nom, une catégorie, un prix ≥ 0 et des parts ≥ 1.');
            return;
        }
        if (ingredients[name]) {
            alert('Un ingrédient avec ce nom existe déjà.');
            return;
        }
        setIngredients((prev: IngredientsType) => {
            const base = { inStock: false, price: priceNum, parts: partsNum, remainingParts: partsNum } as any;
            if (newIngredient.expiryDate) {
                base.expiryDate = newIngredient.expiryDate; // Accept expiry for any category
            }
            return { ...prev, [name]: base };
        });
        setCategories((prev: CategoriesType) => ({
            ...prev,
            [category]: [
                ...(prev[category as keyof CategoriesType] || []),
                name
            ]
        }));
        setNewIngredient({ name: '', category: '', price: '', parts: '', expiryDate: '' });
        setShowAddIngredient(false);
    };

    const deleteIngredient = (ingredient: string, category: string) => {
        if (!confirm(t('deleteIngredientConfirm').replace('{name}', ingredient))) return;

        setIngredients((prev: IngredientsType) => {
            const newIng = { ...prev };
            delete newIng[ingredient];
            return newIng;
        });

        setCategories((prev: CategoriesType) => ({
            ...prev,
            [category]: prev[category].filter((i: string) => i !== ingredient)
        }));

        setRecettes((prev: RecipeType[]) => prev
            .map((recipe: RecipeType) => ({
                ...recipe,
                ingredients: recipe.ingredients.filter((ing: string) => ing !== ingredient)
            }))
            .filter((recipe: RecipeType) => recipe.ingredients.length > 0)
        );
    };

    const addRecipe = () => {
        if (!newRecipe.nom.trim() || !newRecipe.categorie || newRecipe.ingredients.length === 0) return;
        setRecettes((prev: RecipeType[]) => [...prev, { ...newRecipe }]);
        if (!recipeCategories.includes(newRecipe.categorie)) {
            setRecipeCategories(prev => [...prev, newRecipe.categorie]);
        }
        setNewRecipe({ nom: '', categorie: '', ingredients: [] });
        setShowAddRecipe(false);
    };

    const updateRecipe = () => {
        if (!editingRecipe) return;
        setRecettes((prev: RecipeType[]) => prev.map((r: RecipeType, i: number) =>
            i === editingRecipe.index ? editingRecipe.data : r
        ));
        if (editingRecipe.data.categorie && !recipeCategories.includes(editingRecipe.data.categorie)) {
            setRecipeCategories(prev => [...prev, editingRecipe.data.categorie]);
        }
        setEditingRecipe(null);
    };

    const deleteRecipe = (index: number) => {
        if (!confirm(t('deleteRecipeConfirm'))) return;
        const catDeleted = recettes[index].categorie;
        setRecettes((prev: RecipeType[]) => prev.filter((_: RecipeType, i: number) => i !== index));
        if (recettes.filter((r, i) => i !== index && r.categorie === catDeleted).length === 0) {
            setRecipeCategories(prev => prev.filter(c => c !== catDeleted));
        }
    };


    const recettesPossibles = useMemo(() => {
        return recettes.filter(recette =>
            recette.ingredients.every((ing: string) => ingredients[ing].inStock)
        );
    }, [recettes, ingredients]);

    const recettesPossiblesTriees = useMemo(() => {
        return recettesPossibles.slice().sort((a, b) => {
            const ea = earliestExpiryDays(a, ingredients);
            const eb = earliestExpiryDays(b, ingredients);
            const va = ea === null ? Infinity : ea;
            const vb = eb === null ? Infinity : eb;
            return va - vb;
        });
    }, [recettesPossibles, ingredients]);

    const recettesGroupees = useMemo(() => {
        return recettesPossiblesTriees.reduce<{ [key: string]: RecipeType[] }>((acc, recette) => {
            (acc[recette.categorie] ||= []).push(recette);
            return acc;
        }, {});
    }, [recettesPossiblesTriees]);

    const ingredientsManquants = useMemo(() => Object.keys(ingredients).filter((ing: string) => !ingredients[ing].inStock), [ingredients]);
    const shoppingCategoryOrder = useMemo(() => {
        const orderTail = ['🧀 Produits frais', '🥶 Surgelés', '🧊 Surgelés'];
        const allCats = Object.keys(categories);
        const head = allCats.filter(c => !orderTail.includes(c));
        const tail = orderTail.filter(c => allCats.includes(c));
        return [...head, ...tail];
    }, [categories]);
    const missingByCategory = useMemo(() => {
        const map: { [key: string]: string[] } = {};
        ingredientsManquants.forEach(ing => {
            const cat = Object.entries(categories).find(([_, list]) => list.includes(ing))?.[0];
            if (cat) (map[cat] ||= []).push(ing);
        });
        return map;
    }, [ingredientsManquants, categories]);

    const startShopping = () => {
        setShoppingSelected(new Set());
        setShoppingMode(true);
    };
    const toggleShoppingItem = (ing: string) => {
        setShoppingSelected(prev => {
            const next = new Set(prev);
            if (next.has(ing)) next.delete(ing); else next.add(ing);
            return next;
        });
    };
    const finishShopping = () => {
        if (shoppingSelected.size === 0) {
            setShoppingMode(false);
            return;
        }
        let sessionTotal = 0;
        shoppingSelected.forEach(ing => { if (ingredients[ing]) sessionTotal += ingredients[ing].price; });
        setIngredients(prev => {
            const next = { ...prev };
            shoppingSelected.forEach(ing => {
                if (next[ing]) next[ing].inStock = true;
            });
            return next;
        });
        setShoppingHistory(prev => [
            {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                date: new Date().toISOString(),
                items: Array.from(shoppingSelected),
                total: parseFloat(sessionTotal.toFixed(2))
            },
            ...prev
        ]);
        setShoppingMode(false);
    };
    const cancelShopping = () => {
        setShoppingMode(false);
    };
    const totalCourses = useMemo(() => ingredientsManquants.reduce((total, ing) => total + ingredients[ing].price, 0), [ingredientsManquants, ingredients]);
    const shoppingSubtotal = useMemo(() => {
        let sum = 0; shoppingSelected.forEach(ing => { if (ingredients[ing]) sum += ingredients[ing].price; }); return sum;
    }, [shoppingSelected, ingredients]);
    const shoppingProgress = useMemo(() => ingredientsManquants.length === 0 ? 0 : shoppingSelected.size / ingredientsManquants.length, [shoppingSelected, ingredientsManquants]);
    const allIngredients = useMemo(() => Object.keys(ingredients), [ingredients]);
    const categoriesRecettes = recipeCategories;
    const recettesParCategorie = useMemo(() => {
        const map: { [key: string]: { recette: RecipeType; index: number }[] } = {};
        recettes.forEach((r, idx) => {
            (map[r.categorie] ||= []).push({ recette: r, index: idx });
        });
        return map;
    }, [recettes]);

    const saveRecipeCategoryRename = () => {
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
    };

    const toggleIngredient = useCallback((ingredient: string) => {
        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [ingredient]: { ...prev[ingredient], inStock: !prev[ingredient].inStock }
        }));
    }, []);

    const expiringIngredients = useMemo(() => Object.entries(ingredients)
        .filter(([_, v]) => v.inStock && v.expiryDate)
        .map(([name, data]) => ({ name, ...computeExpiryStatus(data) }))
        .filter(e => ['soon', 'expired'].includes(e.status))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        , [ingredients]);

    const recettesPrioritaires = useMemo(() => {
        return recettesPossibles
            .map(r => ({ r, score: scoreRecette(r, ingredients) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.r);
    }, [recettesPossibles, ingredients]);

    const toggleIngredientInRecipe = useCallback((ingredient: string, isEditing = false) => {
        if (isEditing && editingRecipe) {
            const ings = editingRecipe.data.ingredients;
            setEditingRecipe({
                ...editingRecipe,
                data: {
                    ...editingRecipe.data,
                    ingredients: ings.includes(ingredient)
                        ? ings.filter((i: string) => i !== ingredient)
                        : [...ings, ingredient]
                }
            });
        } else {
            setNewRecipe(prev => ({
                ...prev,
                ingredients: prev.ingredients.includes(ingredient)
                    ? prev.ingredients.filter((i: string) => i !== ingredient)
                    : [...prev.ingredients, ingredient]
            }));
        }
    }, [editingRecipe]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="mx-auto bg-white shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white relative">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ChefHat className="w-6 h-6" /> {t('appTitle')}
                            </h1>
                            <p className="mt-1 text-orange-100 text-xs">{t('appSubtitle')}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-1.5">
                                <button
                                    onClick={toggleLang}
                                    aria-label={t('langToggle')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <Languages className="w-4 h-4" /> <span className="hidden sm:inline">{t('langToggle')}</span> {lang.toUpperCase()}
                                </button>
                                <button
                                    onClick={openHelp}
                                    aria-label={t('help')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">{t('help')}</span>
                                </button>
                            </div>
                            <button
                                onClick={resetAllData}
                                aria-label={t('resetData')}
                                className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                            >
                                <RefreshCcw className="w-4 h-4" /> <span>{t('resetData')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pt-[env(safe-area-inset-bottom)]">
                    <button onClick={() => setActiveTab('courses')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'courses' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <ShoppingCart className="w-6 h-6" />
                        <span>{t('tabCourses')}</span>
                    </button>
                    <button onClick={() => setActiveTab('recettes')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'recettes' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <ChefHat className="w-6 h-6" />
                        <span>{t('tabRecettes')} ({recettesPossibles.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('gestion')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'gestion' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <Edit2 className="w-6 h-6" />
                        <span>{t('tabGestion')}</span>
                    </button>
                    <button onClick={() => setActiveTab('historique')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'historique' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <span className="text-sm font-semibold">{t('tabHistorique')}</span>
                    </button>
                </div>

                <div className="p-2 pb-28">
                    {activeTab === 'courses' && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs text-orange-800"><strong>{t('tip')} :</strong> {t('tipCheckbox').replace(/^.*?:\s*/, '')}</p>
                            </div>

                            {!shoppingMode && ingredientsManquants.length > 0 && (
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={startShopping}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-medium shadow hover:bg-green-700 active:scale-[.98] transition"
                                >
                                    {t('startShopping')} ({ingredientsManquants.length} {t('articles')})
                                </button>
                            )}

                            {Object.entries(categories).map(([categorie, items]) => (
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
                                {shoppingMode && (
                                    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-800">{t('shoppingListTitle')}</h2>
                                                <button onClick={cancelShopping} className="text-sm text-gray-500 hover:text-gray-700">{t('close')}</button>
                                            </div>
                                            <p className="text-xs text-gray-500">Cochez au fur et à mesure. Les produits frais et surgelés apparaissent à la fin pour optimiser la chaîne du froid.</p>
                                            <div className="border rounded-lg p-3 bg-white flex flex-col gap-2 text-xs">
                                                <div className="flex justify-between"><span>{t('progressSelected')} :</span><span>{shoppingSelected.size} / {ingredientsManquants.length}</span></div>
                                                <div className="flex justify-between"><span>{t('progressSubtotal')} :</span><span>{shoppingSubtotal.toFixed(2)} €</span></div>
                                                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${(shoppingProgress * 100).toFixed(1)}%` }} />
                                                </div>
                                            </div>
                                            <div className="space-y-5">
                                                {shoppingCategoryOrder.map(cat => (
                                                    missingByCategory[cat] && missingByCategory[cat].length > 0 && (
                                                        <div key={cat} className="border rounded-lg">
                                                            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-700 sticky top-0 z-10">{cat}</div>
                                                            <div className="divide-y">
                                                                {missingByCategory[cat].map(ing => {
                                                                    const checked = shoppingSelected.has(ing);
                                                                    const isFresh = freshCategories.some(cat => categories[cat]?.includes(ing));
                                                                    const showExpiry = isFresh && checked;
                                                                    let statusClass = '';
                                                                    if (isFresh && ingredients[ing].expiryDate) {
                                                                        const { status } = computeExpiryStatus({ expiryDate: ingredients[ing].expiryDate, inStock: true });
                                                                        if (status === 'expired') statusClass = 'border border-red-500 bg-red-50';
                                                                        else if (status === 'soon') statusClass = 'border border-orange-400 bg-orange-50';
                                                                    }
                                                                    return (
                                                                        <div key={ing} className={`px-3 py-2 text-sm select-none active:bg-gray-50 ${statusClass}`}>
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={checked}
                                                                                        onChange={() => toggleShoppingItem(ing)}
                                                                                        className="w-4 h-4 accent-green-600"
                                                                                    />
                                                                                    <span className={checked ? 'line-through text-gray-400' : 'text-gray-700'}>{ing}</span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-500">{ingredients[ing].price.toFixed(2)}€</span>
                                                                            </div>
                                                                            {showExpiry && (
                                                                                <div className="mt-2 flex items-center gap-2">
                                                                                    <label className="text-[10px] text-gray-600">Date de péremption :</label>
                                                                                    <input
                                                                                        type="date"
                                                                                        className="px-2 py-1 border rounded text-xs"
                                                                                        value={ingredients[ing].expiryDate ? ingredients[ing].expiryDate.slice(0, 10) : ''}
                                                                                        min={new Date().toISOString().slice(0, 10)}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value;
                                                                                            setIngredients(prev => ({
                                                                                                ...prev,
                                                                                                [ing]: { ...prev[ing], expiryDate: val || undefined }
                                                                                            }));
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={finishShopping}
                                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                                                >{t('finish')} ({shoppingSubtotal.toFixed(2)} €)</button>
                                                <button
                                                    onClick={cancelShopping}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium"
                                                >{t('cancel')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                    )}

                    {activeTab === 'recettes' && (
                        <div className="space-y-4">
                            {recettesPossibles.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">{t('recipesNone')}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
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

                                    {Object.entries(recettesGroupees).map(([categorie, recs]) => (
                                        <RecipeGroup
                                            key={categorie}
                                            categorie={categorie}
                                            recettes={recs}
                                            ingredients={ingredients}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'gestion' && (
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
                                                            if (!newName) { alert(t('invalidCategoryName')); return; }
                                                            setCategories(prev => {
                                                                if (prev[newName] && newName !== editingCategory.original) {
                                                                    alert(t('categoryExists'));
                                                                    return prev;
                                                                }
                                                                const entries = Object.entries(prev).map(([cat, arr]) => {
                                                                    if (cat === editingCategory.original) return [newName, arr];
                                                                    return [cat, arr];
                                                                });
                                                                return Object.fromEntries(entries);
                                                            });
                                                            setFreshCategories(prev => prev.includes(editingCategory.original)
                                                                ? (prev.includes(newName)
                                                                    ? prev.filter(c => c !== editingCategory.original)
                                                                    : prev.map(c => c === editingCategory.original ? newName : c))
                                                                : prev);
                                                            setNewIngredient(ni => ({ ...ni, category: ni.category === editingCategory.original ? newName : ni.category }));
                                                            if (editingIngredient && editingIngredient.category === editingCategory.original) {
                                                                setEditingIngredient({ ...editingIngredient, category: newName });
                                                            }
                                                            setRecettes(prev => prev.map(r => ({ ...r, categorie: r.categorie === editingCategory.original ? newName : r.categorie })));
                                                            setEditingRecipe(er => er ? { ...er, data: { ...er.data, categorie: er.data.categorie === editingCategory.original ? newName : er.data.categorie } } : er);
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
                                                                setIngredients(prev => {
                                                                    const next = { ...prev } as IngredientsType;
                                                                    toDelete.forEach(i => { delete next[i]; });
                                                                    return next;
                                                                });
                                                                setRecettes(prev => prev.map(r => ({ ...r, ingredients: r.ingredients.filter(i => !toDelete.includes(i)) }))
                                                                    .filter(r => r.ingredients.length > 0));
                                                                setCategories(prev => {
                                                                    const entries = Object.entries(prev).filter(([cat]) => cat !== categorie);
                                                                    return Object.fromEntries(entries);
                                                                });
                                                                setNewIngredient(ni => ({ ...ni, category: ni.category === categorie ? '' : ni.category }));
                                                                if (editingCategory?.original === categorie) setEditingCategory(null);
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
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                        onKeyDown={(e) => e.stopPropagation()}
                                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                                        placeholder="Nom"
                                                                        autoFocus
                                                                    />
                                                                    <select
                                                                        value={editingIngredient.category}
                                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, category: e.target.value })}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
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
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onMouseDown={(e) => e.stopPropagation()}
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
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onMouseDown={(e) => e.stopPropagation()}
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
                                                                            setRecettes((prev) => prev.map((r) => ({
                                                                                ...r,
                                                                                ingredients: r.ingredients.map((i) => (i === original ? newName : i)),
                                                                            })));
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
                                                                            const s = computeExpiryStatus(ingredients[ing]);
                                                                            if (s.status === 'none' || s.status === 'out') return null;
                                                                            return <div className={`mt-1 text-[10px] ${s.status === 'expired' ? 'text-red-600' : 'text-red-500'}`}>{s.status === 'expired' ? t('expired') : `${t('expiresPrefix')} J-${s.daysLeft}`}</div>;
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
                                                disabled={!newRecipeCategoryName.trim() || categoriesRecettes.includes(newRecipeCategoryName.trim())}
                                                onClick={() => {
                                                    const raw = newRecipeCategoryName.trim();
                                                    if (!raw) return;
                                                    if (categoriesRecettes.includes(raw)) { alert(t('categoryExists')); return; }
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
                                            {categoriesRecettes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                                                                setEditingRecipe(er => er && er.data.categorie === cat ? null : er);
                                                                setNewRecipe(r => ({ ...r, categorie: r.categorie === cat ? '' : r.categorie }));
                                                                if (editingRecipeCategory?.original === cat) setEditingRecipeCategory(null);
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
                                                                {categoriesRecettes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                    )}

                    {activeTab === 'historique' && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-orange-800">{t('historyIntro')}</p>
                                    {shoppingHistory.length > 0 && (
                                        <button
                                            onClick={() => {
                                                if (historySelectMode) {
                                                    setHistorySelected(new Set());
                                                    setHistorySelectMode(false);
                                                } else {
                                                    setHistorySelectMode(true);
                                                }
                                            }}
                                            className="text-[10px] px-2 py-1 rounded bg-orange-200 text-orange-800 hover:bg-orange-300"
                                        >{historySelectMode ? t('done') : t('manage')}</button>
                                    )}
                                </div>
                            </div>
                            {shoppingHistory.length === 0 ? (
                                <p className="text-center text-xs text-gray-500 py-8">{t('emptyHistory')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {historySelectMode && (
                                        <div className="flex items-center gap-2 text-[10px] bg-white border rounded p-2">
                                            <button onClick={selectAllHistory} className="px-2 py-1 rounded bg-gray-200 text-gray-700">{historySelected.size === shoppingHistory.length ? t('deselectAll') : t('selectAll')}</button>
                                            <span className="text-gray-500">{historySelected.size} sélectionné(s)</span>
                                            <button
                                                disabled={historySelected.size === 0}
                                                onClick={() => deleteHistoryIds(Array.from(historySelected))}
                                                className="ml-auto px-2 py-1 rounded bg-red-500 disabled:opacity-40 text-white"
                                            >{t('deleteSelected')}</button>
                                        </div>
                                    )}
                                    {shoppingHistory.map(session => {
                                        const checked = historySelected.has(session.id);
                                        return (
                                            <div key={session.id} className={`border rounded-lg p-3 bg-white shadow-sm relative ${checked ? 'ring-2 ring-orange-400' : ''}`}>
                                                {historySelectMode && (
                                                    <label className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3 h-3"
                                                            checked={checked}
                                                            onChange={() => toggleHistorySelect(session.id)}
                                                        />
                                                    </label>
                                                )}
                                                <div className="flex justify-between items-center mb-1 pr-6">
                                                    <h4 className="text-sm font-semibold">Courses du {new Date(session.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</h4>
                                                    <span className="text-xs font-medium text-green-600">{session.total.toFixed(2)} €</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mb-2">{session.items.length} article{session.items.length > 1 ? 's' : ''}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {session.items.slice(0, 12).map(i => (
                                                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px]">{i}</span>
                                                    ))}
                                                    {session.items.length > 12 && (
                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px]">+{session.items.length - 12}</span>
                                                    )}
                                                </div>
                                                {historySelectMode && (
                                                    <div className="pt-2 flex justify-end">
                                                        <button
                                                            onClick={() => deleteHistoryIds([session.id])}
                                                            className="text-[10px] px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                                                        >{lang === 'fr' ? 'Supprimer' : 'Delete'}</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {shoppingHistory.length > 0 && (
                                <div className="pt-2">
                                    <button
                                        onClick={() => { if (confirm(t('clearHistoryConfirm'))) setShoppingHistory([]); }}
                                        className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded"
                                    >{t('clearHistory')}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {!showHelp && (
                <FloatingHelpButton onClick={openHelp} label={t('help')} />
            )}
            <HelpTutorial
                open={showHelp}
                onClose={closeHelp}
                lang={lang}
                t={t}
                isFirstTime={!hasSeenTutorial}
                onStartWithDemo={startWithDemoData}
                onStartEmpty={startWithEmptyData}
            />
        </div>
    );
}

export default App;
