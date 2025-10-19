import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChefHat, ShoppingCart, CheckCircle2, Circle, Plus, Trash2, Edit2, Save } from 'lucide-react';

// Types extraits hors du composant pour éviter leur recréation à chaque rendu
export type IngredientsType = { [key: string]: { inStock: boolean; price: number; parts: number } };
export type CategoriesType = { [key: string]: string[] };
export type RecipeType = { nom: string; categorie: string; ingredients: string[] };
export type EditingRecipeType = { index: number; data: RecipeType } | null;

export function App() {

    const defaultIngredients: IngredientsType = {
        'Tomates cerises': { inStock: false, price: 2.50, parts: 4 },
        'Pommes de terre au four micro-ondes': { inStock: false, price: 3.00, parts: 4 },
        'Maïs': { inStock: true, price: 1.20, parts: 4 },
        'Pâtes': { inStock: false, price: 1.50, parts: 5 },
        'Riz': { inStock: true, price: 2.00, parts: 5 },
        'Thon': { inStock: false, price: 2.80, parts: 2 },
        'Sauce tomate': { inStock: true, price: 1.50, parts: 3 },
        'Sauce bolognaise': { inStock: false, price: 2.30, parts: 3 },
        'Ketchup': { inStock: true, price: 2.00, parts: 10 },
        'Biscottes': { inStock: true, price: 1.80, parts: 8 },
        'Boîte Albóndigas': { inStock: true, price: 4.50, parts: 2 },
        'Boite lentilles chorizo': { inStock: true, price: 3.80, parts: 2 },
        'Champignons en boîte': { inStock: false, price: 1.90, parts: 3 },
        'Petits pois en boîte': { inStock: true, price: 1.60, parts: 3 },
        'Céréales': { inStock: false, price: 3.50, parts: 8 },
        'Jus de fruit': { inStock: false, price: 2.20, parts: 4 },
        'Eau': { inStock: false, price: 0.80, parts: 6 },
        'Yaourt à boire': { inStock: false, price: 2.10, parts: 1 },
        'Beurre': { inStock: false, price: 2.90, parts: 10 },
        'Fromage râpé': { inStock: true, price: 2.50, parts: 4 },
        'Crème fraîche en brique': { inStock: true, price: 1.70, parts: 3 },
        'Lardons': { inStock: true, price: 2.30, parts: 2 },
        'Steaks hachés': { inStock: false, price: 4.50, parts: 2 },
        'Dés de chorizo': { inStock: true, price: 2.80, parts: 3 },
        'Dés de jambon blanc': { inStock: false, price: 2.60, parts: 3 },
        'Tortilla': { inStock: false, price: 3.50, parts: 2 },
        'Knockis poulet surgelés': { inStock: true, price: 4.20, parts: 2 },
        'Légumes poulet surgelés': { inStock: true, price: 3.90, parts: 2 },
        'Lasagnes': { inStock: true, price: 5.50, parts: 2 },
    };
    const [ingredients, setIngredients] = useState<IngredientsType>(() => {
        const saved = localStorage.getItem('ingredients');
        return saved ? JSON.parse(saved) : defaultIngredients;
    });

    useEffect(() => {
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
    }, [ingredients]);

    const defaultCategories: CategoriesType = {
        '🥦 Fruits & Légumes frais': ['Tomates cerises', 'Pommes de terre au four micro-ondes'],
        '🥫 Épicerie salée': [
            'Maïs', 'Pâtes', 'Riz', 'Thon', 'Sauce tomate',
            'Sauce bolognaise', 'Ketchup', 'Biscottes', 'Boîte Albóndigas',
            'Boite lentilles chorizo', 'Champignons en boîte', 'Petits pois en boîte'
        ],
        '🥣 Épicerie sucrée / Petit déjeuner': ['Céréales', 'Jus de fruit'],
        '💧 Boissons': ['Eau'],
        '🧀 Produits frais / Crèmerie': [
            'Yaourt à boire', 'Beurre', 'Fromage râpé', 'Crème fraîche en brique',
            'Lardons', 'Steaks hachés', 'Dés de chorizo', 'Dés de jambon blanc', 'Tortilla'
        ],
        '🥶 Surgelés': ['Knockis poulet surgelés', 'Légumes poulet surgelés', 'Lasagnes']
    };
    const [categories, setCategories] = useState<CategoriesType>(() => {
        const saved = localStorage.getItem('categories');
        return saved ? JSON.parse(saved) : defaultCategories;
    });

    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    const defaultRecettes: RecipeType[] = [
        { nom: 'Salade maïs thon', categorie: '🥗 Salade', ingredients: ['Maïs', 'Thon'] },
        { nom: 'Salade tomates cerises thon', categorie: '🥗 Salade', ingredients: ['Tomates cerises', 'Thon'] },
        { nom: 'Salade pomme de terre et thon', categorie: '🥗 Salade', ingredients: ['Pommes de terre au four micro-ondes', 'Thon'] },
        { nom: 'Riz champignons crème fraîche', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Champignons en boîte', 'Crème fraîche en brique'] },
        { nom: 'Riz cantonais', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Dés de jambon blanc', 'Petits pois en boîte'] },
        { nom: 'Riz façon carbonara', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Lardons', 'Crème fraîche en brique'] },
        { nom: 'Riz chorizo crème fraîche', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Dés de chorizo', 'Crème fraîche en brique'] },
        { nom: 'Riz Albóndigas sauce tomate', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Boîte Albóndigas', 'Sauce tomate'] },
        { nom: 'Riz au thon', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Thon', 'Ketchup'] },
        { nom: 'Riz au thon sauce tomate', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Riz', 'Thon', 'Sauce tomate'] },
        { nom: 'Pâtes au thon', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Pâtes', 'Thon'] },
        { nom: 'Pâtes au thon sauce tomate', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Pâtes', 'Thon', 'Sauce tomate'] },
        { nom: 'Coquillettes jambon fromage crème fraîche', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Pâtes', 'Dés de jambon blanc', 'Fromage râpé', 'Crème fraîche en brique'] },
        { nom: 'Pâtes bolognaise', categorie: '🍝 Pâtes / Riz / Crème', ingredients: ['Pâtes', 'Steaks hachés', 'Sauce tomate'] },
        { nom: 'Lentilles chorizo', categorie: '🥫 Conserves', ingredients: ['Boite lentilles chorizo'] },
        { nom: 'Knockis poulet', categorie: '🧊 Surgelés', ingredients: ['Knockis poulet surgelés'] },
        { nom: 'Légumes poulet', categorie: '🧊 Surgelés', ingredients: ['Légumes poulet surgelés'] },
        { nom: 'Lasagnes', categorie: '🧊 Surgelés', ingredients: ['Lasagnes'] },
        { nom: 'Tortilla', categorie: '🥔 Pomme de terre', ingredients: ['Tortilla'] }
    ];
    const [recettes, setRecettes] = useState<RecipeType[]>(() => {
        const saved = localStorage.getItem('recettes');
        return saved ? JSON.parse(saved) : defaultRecettes;
    });

    useEffect(() => {
        localStorage.setItem('recettes', JSON.stringify(recettes));
    }, [recettes]);

    const [activeTab, setActiveTab] = useState<'courses' | 'recettes' | 'gestion'>('courses');
    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<EditingRecipeType>(null);
    // Track editing ingredient separately: keep originalName for lookup, and use string fields to allow empty input while editing
    const [editingIngredient, setEditingIngredient] = useState<{
        originalName: string;
        name: string;
        category: string;
        price: string;
        parts: string;
    } | null>(null);
    const [newIngredient, setNewIngredient] = useState<{ name: string; category: string; price: string; parts: string }>({ name: '', category: '', price: '', parts: '' });
    const [newRecipe, setNewRecipe] = useState<RecipeType>({ nom: '', categorie: '', ingredients: [] });
    const [editingCategory, setEditingCategory] = useState<{ original: string; name: string } | null>(null);

    // CRUD Ingrédients
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
        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [name]: { inStock: false, price: priceNum, parts: partsNum }
        }));
        setCategories((prev: CategoriesType) => ({
            ...prev,
            [category]: [
                ...(prev[category as keyof CategoriesType] || []),
                name
            ]
        }));
        setNewIngredient({ name: '', category: '', price: '', parts: '' });
        setShowAddIngredient(false);
    };

    const deleteIngredient = (ingredient: string, category: string) => {
        if (!confirm(`Supprimer "${ingredient}" ?`)) return;

        // Supprimer l'ingrédient de la liste des ingrédients
        setIngredients((prev: IngredientsType) => {
            const newIng = { ...prev };
            delete newIng[ingredient];
            return newIng;
        });

        // Supprimer l'ingrédient de sa catégorie
        setCategories((prev: CategoriesType) => ({
            ...prev,
            [category]: prev[category].filter((i: string) => i !== ingredient)
        }));

        // Mettre à jour les recettes qui contiennent cet ingrédient
        setRecettes((prev: RecipeType[]) => prev.map((recipe: RecipeType) => ({
            ...recipe,
            ingredients: recipe.ingredients.filter((ing: string) => ing !== ingredient)
        })).filter((recipe: RecipeType) => recipe.ingredients.length > 0)); // Supprimer les recettes qui n'ont plus d'ingrédients
    };

    // CRUD Recettes
    const addRecipe = () => {
        if (!newRecipe.nom.trim() || !newRecipe.categorie || newRecipe.ingredients.length === 0) return;

        setRecettes((prev: RecipeType[]) => [...prev, { ...newRecipe }]);
        setNewRecipe({ nom: '', categorie: '', ingredients: [] });
        setShowAddRecipe(false);
    };

    const updateRecipe = () => {
        if (!editingRecipe) return;

        setRecettes((prev: RecipeType[]) => prev.map((r: RecipeType, i: number) =>
            i === editingRecipe.index ? editingRecipe.data : r
        ));
        setEditingRecipe(null);
    };

    const deleteRecipe = (index: number) => {
        if (!confirm('Supprimer cette recette ?')) return;
        setRecettes((prev: RecipeType[]) => prev.filter((_: RecipeType, i: number) => i !== index));
    };


    // Données dérivées mémoïsées pour limiter le travail sur mobile (render fréquent, listes potentiellement longues)
    const recettesPossibles = useMemo(() => {
        return recettes.filter(recette =>
            recette.ingredients.every((ing: string) => ingredients[ing].inStock)
        );
    }, [recettes, ingredients]);

    const recettesGroupees = useMemo(() => {
        return recettesPossibles.reduce<{ [key: string]: RecipeType[] }>((acc, recette) => {
            (acc[recette.categorie] ||= []).push(recette);
            return acc;
        }, {});
    }, [recettesPossibles]);

    const ingredientsManquants = useMemo(() => Object.keys(ingredients).filter((ing: string) => !ingredients[ing].inStock), [ingredients]);
    const totalCourses = useMemo(() => ingredientsManquants.reduce((total, ing) => total + ingredients[ing].price, 0), [ingredientsManquants, ingredients]);
    const allIngredients = useMemo(() => Object.keys(ingredients), [ingredients]);
    const categoriesRecettes = useMemo(() => [...new Set(recettes.map(r => r.categorie))], [recettes]);

    // Callbacks stables pour éviter de recréer les fonctions sur chaque rendu et réduire les rerenders dans les listes
    const toggleIngredient = useCallback((ingredient: string) => {
        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [ingredient]: { ...prev[ingredient], inStock: !prev[ingredient].inStock }
        }));
    }, []);

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
        // Layout optimisé pour mobile: containers simplifiés pour réduire la profondeur DOM
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="mx-auto bg-white shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ChefHat className="w-6 h-6" />
                        Gestionnaire de Courses
                    </h1>
                    <p className="mt-1 text-orange-100 text-xs">Gérez vos courses et découvrez les plats que vous pouvez cuisiner</p>
                </div>

                {/* Footer de navigation fixé en bas avec hauteur garantie + espace safe-area (iOS) */}
                <div className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pt-[env(safe-area-inset-bottom)]">
                    <button onClick={() => setActiveTab('courses')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'courses' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <ShoppingCart className="w-6 h-6" />
                        <span>Courses</span>
                    </button>
                    <button onClick={() => setActiveTab('recettes')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'recettes' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <ChefHat className="w-6 h-6" />
                        <span>Recettes ({recettesPossibles.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('gestion')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${activeTab === 'gestion' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                        <Edit2 className="w-6 h-6" />
                        <span>Gestion</span>
                    </button>
                </div>

                {/* p-2 + pb-28 pour laisser l'espace du footer tab fixe, y compris safe-area éventuelle */}
                <div className="p-2 pb-28">
                    {activeTab === 'courses' && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs text-orange-800"><strong>Astuce :</strong> Cochez les ingrédients que vous avez à la maison.</p>
                            </div>

                            {Object.entries(categories).map(([categorie, items]) => (
                                <div key={categorie} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-3 py-2 font-medium text-gray-700 text-sm sticky top-0 z-10">{categorie}</div>
                                    <div className="divide-y divide-gray-100">
                                        {items.map(ingredient => (
                                            <label key={ingredient} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => toggleIngredient(ingredient)} className="flex-shrink-0">
                                                        {ingredients[ingredient].inStock ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                                                    </button>
                                                    <span className={ingredients[ingredient].inStock ? 'text-gray-900' : 'text-gray-500'}>{ingredient}</span>
                                                </div>
                                                <span className="text-gray-500 font-medium">{ingredients[ingredient].price.toFixed(2)} €</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                                <h3 className="font-semibold text-red-800 mb-2">À acheter ({ingredientsManquants.length} articles)</h3>
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
                                                <span>Total estimé :</span>
                                                <span>{totalCourses.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-red-700">Tout est en stock ! 🎉</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'recettes' && (
                        <div className="space-y-4">
                            {recettesPossibles.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Aucune recette possible avec les ingrédients actuels.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-green-800 text-sm"><strong>🎉 Super !</strong> Vous pouvez préparer {recettesPossibles.length} plat{recettesPossibles.length > 1 ? 's' : ''}.</p>
                                    </div>

                                    {Object.entries(recettesGroupees).map(([categorie, recs]) => (
                                        <div key={categorie} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gradient-to-r from-orange-100 to-red-100 px-3 py-2 font-medium text-gray-800 text-sm sticky top-0">{categorie}</div>
                                            <div className="divide-y divide-gray-100">
                                                {recs.map((recette, idx) => (
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
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'gestion' && (
                        <div className="space-y-6">
                            {/* Gestion Ingrédients */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-2.5 font-medium text-gray-800 flex justify-between items-center sticky top-0">
                                    <span className="text-sm">Gestion des Ingrédients</span>
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddIngredient(!showAddIngredient)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:bg-blue-600">
                                        <Plus className="w-4 h-4" />Ajouter
                                    </button>
                                </div>

                                {showAddIngredient && (
                                    <div className="p-3 bg-blue-50 border-b space-y-3">
                                        <input type="text" placeholder="Nom de l'ingrédient" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm" />
                                        <select value={newIngredient.category} onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })} className="w-full px-3 py-2.5 border rounded-lg text-sm">
                                            <option value="">Choisir une catégorie</option>
                                            {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Prix"
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
                                                    placeholder="Parts"
                                                    value={newIngredient.parts}
                                                    onChange={(e) => setNewIngredient({ ...newIngredient, parts: e.target.value })}
                                                    className="w-full px-3 py-2.5 border rounded-lg pr-12 text-sm"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">parts</span>
                                            </div>
                                        </div>
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
                                                <Save className="w-4 h-4" />Enregistrer
                                            </button>
                                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddIngredient(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 text-sm">Annuler</button>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p>Le prix doit être ≥ 0 et les parts ≥ 1.</p>
                                            {newIngredient.name && ingredients[newIngredient.name.trim()] && (
                                                <p className="text-red-600">Nom déjà utilisé.</p>
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
                                                            if (!newName) { alert('Nom de catégorie invalide'); return; }
                                                            setCategories(prev => {
                                                                if (prev[newName] && newName !== editingCategory.original) {
                                                                    alert('Une catégorie avec ce nom existe déjà.');
                                                                    return prev;
                                                                }
                                                                const entries = Object.entries(prev).map(([cat, arr]) => {
                                                                    if (cat === editingCategory.original) return [newName, arr];
                                                                    return [cat, arr];
                                                                });
                                                                return Object.fromEntries(entries);
                                                            });
                                                            // Update any ingredient being added or edited referencing old category
                                                            setNewIngredient(ni => ({ ...ni, category: ni.category === editingCategory.original ? newName : ni.category }));
                                                            if (editingIngredient && editingIngredient.category === editingCategory.original) {
                                                                setEditingIngredient({ ...editingIngredient, category: newName });
                                                            }
                                                            // Update recipes category selection options
                                                            setRecettes(prev => prev.map(r => ({ ...r, categorie: r.categorie === editingCategory.original ? newName : r.categorie })));
                                                            setEditingRecipe(er => er ? { ...er, data: { ...er.data, categorie: er.data.categorie === editingCategory.original ? newName : er.data.categorie } } : er);
                                                            setEditingCategory(null);
                                                        }}
                                                    >Sauver</button>
                                                    <button
                                                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                                                        onClick={() => setEditingCategory(null)}
                                                    >Annuler</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-700">{categorie}</h4>
                                                    <button
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                        onClick={() => setEditingCategory({ original: categorie, name: categorie })}
                                                    >Renommer</button>
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
                                                                            placeholder="Prix"
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
                                                                            placeholder="Parts"
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
                                                                                alert('Veuillez entrer un nom, un prix et un nombre de parts valides.');
                                                                                return;
                                                                            }
                                                                            const original = editingIngredient.originalName;
                                                                            const newCategory = editingIngredient.category;
                                                                            const oldCategory = categorie;
                                                                            setIngredients((prev) => {
                                                                                const next = { ...prev };
                                                                                // If name changed, remove old key
                                                                                if (newName !== original) delete next[original];
                                                                                next[newName] = {
                                                                                    inStock: prev[original].inStock,
                                                                                    price: priceNum,
                                                                                    parts: partsNum,
                                                                                };
                                                                                return next;
                                                                            });
                                                                            setCategories((prev) => {
                                                                                const next = { ...prev };
                                                                                // Update old category list (rename or remove)
                                                                                next[oldCategory] = next[oldCategory].filter(item => item !== original);
                                                                                // Add to new category list
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
                                                                        Sauver
                                                                    </button>
                                                                    <button
                                                                        onMouseDown={(e) => e.preventDefault()}
                                                                        onClick={() => setEditingIngredient(null)}
                                                                        className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm"
                                                                    >
                                                                        Annuler
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

                            {/* Gestion Recettes */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-3 font-semibold text-gray-800 flex justify-between items-center">
                                    <span>Gestion des Recettes</span>
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddRecipe(!showAddRecipe)} className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-600">
                                        <Plus className="w-4 h-4" />Ajouter
                                    </button>
                                </div>

                                {showAddRecipe && (
                                    <div className="p-4 bg-purple-50 border-b space-y-3">
                                        <input type="text" placeholder="Nom de la recette" value={newRecipe.nom} onChange={(e) => setNewRecipe({ ...newRecipe, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                        <select value={newRecipe.categorie} onChange={(e) => setNewRecipe({ ...newRecipe, categorie: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                            <option value="">Choisir une catégorie</option>
                                            {categoriesRecettes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="border rounded-lg p-3 bg-white max-h-60 overflow-y-auto">
                                            <p className="text-sm font-semibold mb-2">Sélectionner les ingrédients :</p>
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
                                                <Save className="w-4 h-4" />Enregistrer
                                            </button>
                                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setShowAddRecipe(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Annuler</button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 space-y-3">
                                    {recettes.map((recette, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                                            {editingRecipe?.index === idx ? (
                                                <div className="space-y-3">
                                                    <input type="text" value={editingRecipe.data.nom} onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, nom: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" />
                                                    <select value={editingRecipe.data.categorie} onChange={(e) => setEditingRecipe({ ...editingRecipe, data: { ...editingRecipe.data, categorie: e.target.value } })} className="w-full px-3 py-2 border rounded-lg">
                                                        {categoriesRecettes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                    <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                                                        <p className="text-sm font-semibold mb-2">Ingrédients :</p>
                                                        {allIngredients.map(ing => (
                                                            <label key={ing} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                                                <input type="checkbox" checked={editingRecipe.data.ingredients.includes(ing)} onChange={() => toggleIngredientInRecipe(ing, true)} className="w-4 h-4" />
                                                                <span className="text-sm">{ing}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onMouseDown={(e) => e.preventDefault()} onClick={updateRecipe} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600">
                                                            <Save className="w-4 h-4" />Sauvegarder
                                                        </button>
                                                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setEditingRecipe(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-400">Annuler</button>
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
