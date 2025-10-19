import { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, CheckCircle2, Circle, Plus, Trash2, Edit2, Save } from 'lucide-react';

export function App() {
    type IngredientsType = { [key: string]: { inStock: boolean; price: number; parts: number } };
    type CategoriesType = { [key: string]: string[] };
    type RecipeType = { nom: string; categorie: string; ingredients: string[] };
    type EditingRecipeType = { index: number; data: RecipeType } | null;

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
    const [editingIngredient, setEditingIngredient] = useState<{ name: string; category: string; price: number; parts: number } | null>(null);
    const [newIngredient, setNewIngredient] = useState<{ name: string; category: string; price: string; parts: string }>({ name: '', category: '', price: '', parts: '' });
    const [newRecipe, setNewRecipe] = useState<RecipeType>({ nom: '', categorie: '', ingredients: [] });

    // CRUD Ingrédients
    const addIngredient = () => {
        if (!newIngredient.name.trim() || !newIngredient.category || !newIngredient.price || !newIngredient.parts) return;

        const price = parseFloat(newIngredient.price);
        const parts = parseInt(newIngredient.parts);
        if (isNaN(price) || isNaN(parts)) return;

        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [newIngredient.name]: { inStock: false, price, parts }
        }));
        setCategories((prev: CategoriesType) => ({
            ...prev,
            [newIngredient.category]: [
                ...(prev[newIngredient.category as keyof CategoriesType] || []),
                newIngredient.name
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

    const toggleIngredient = (ingredient: string) => {
        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [ingredient]: { ...prev[ingredient], inStock: !prev[ingredient].inStock }
        }));
    };

    const toggleIngredientInRecipe = (ingredient: string, isEditing = false) => {
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
            const ings = newRecipe.ingredients;
            setNewRecipe({
                ...newRecipe,
                ingredients: ings.includes(ingredient)
                    ? ings.filter((i: string) => i !== ingredient)
                    : [...ings, ingredient]
            });
        }
    };

    const recettesPossibles = recettes.filter(recette =>
        recette.ingredients.every((ing: string) => ingredients[ing].inStock)
    );

    const recettesGroupees = recettesPossibles.reduce<{ [key: string]: RecipeType[] }>((acc, recette) => {
        if (!acc[recette.categorie]) acc[recette.categorie] = [];
        acc[recette.categorie].push(recette);
        return acc;
    }, {});

    const ingredientsManquants = Object.keys(ingredients).filter((ing: string) => !ingredients[ing].inStock);
    const totalCourses = ingredientsManquants.reduce((total, ing) => total + ingredients[ing].price, 0);
    const allIngredients = Object.keys(ingredients);
    const categoriesRecettes = [...new Set(recettes.map(r => r.categorie))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="mx-auto">
                <div className="bg-white shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <ChefHat className="w-6 h-6" />
                            Gestionnaire de Courses
                        </h1>
                        <p className="mt-1 text-orange-100 text-xs">Gérez vos courses et découvrez les plats que vous pouvez cuisiner</p>
                    </div>

                    <div className="flex border-b fixed bottom-0 left-0 right-0 bg-white">
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

                    <div className="p-2 pb-24">
                        {activeTab === 'courses' && (
                            <div className="space-y-4">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-xs text-orange-800"><strong>Astuce :</strong> Cochez les ingrédients que vous avez à la maison.</p>
                                </div>

                                {Object.entries(categories).map(([categorie, items]) => (
                                    <div key={categorie} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 px-3 py-2 font-medium text-gray-700 text-sm sticky top-0">{categorie}</div>
                                        <div className="divide-y divide-gray-100">
                                            {items.map(ingredient => (
                                                <label key={ingredient} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => toggleIngredient(ingredient)} className="flex-shrink-0">
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
                                        <button onClick={() => setShowAddIngredient(!showAddIngredient)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:bg-blue-600">
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
                                                <button onClick={addIngredient} className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 text-sm">
                                                    <Save className="w-4 h-4" />Enregistrer
                                                </button>
                                                <button onClick={() => setShowAddIngredient(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 text-sm">Annuler</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        {Object.entries(categories).map(([categorie, items]) => (
                                            <div key={categorie} className="mb-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">{categorie}</h4>
                                                <div className="space-y-1">
                                                    {items.map(ing => (
                                                        <div key={ing} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                            {editingIngredient && editingIngredient.name === ing ? (
                                                                <div className="flex items-center gap-2 flex-grow">
                                                                    <input
                                                                        type="text"
                                                                        value={editingIngredient.name}
                                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                                                                        className="px-2 py-1 border rounded flex-grow"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={editingIngredient.price}
                                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, price: parseFloat(e.target.value) })}
                                                                        className="px-2 py-1 border rounded w-20"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={editingIngredient.parts}
                                                                        onChange={(e) => setEditingIngredient({ ...editingIngredient, parts: parseInt(e.target.value) })}
                                                                        className="px-2 py-1 border rounded w-20"
                                                                        placeholder="Parts"
                                                                    />
                                                                    <button onClick={() => {
                                                                        setIngredients(prev => {
                                                                            const newIngs = { ...prev };
                                                                            if (editingIngredient.name !== ing) {
                                                                                delete newIngs[ing];
                                                                            }
                                                                            newIngs[editingIngredient.name] = {
                                                                                inStock: prev[ing].inStock,
                                                                                price: editingIngredient.price,
                                                                                parts: editingIngredient.parts
                                                                            };
                                                                            return newIngs;
                                                                        });
                                                                        setCategories(prev => {
                                                                            const newCats = { ...prev };
                                                                            newCats[categorie] = newCats[categorie].map(item =>
                                                                                item === ing ? editingIngredient.name : item
                                                                            );
                                                                            return newCats;
                                                                        });
                                                                        setRecettes(prev => prev.map(recipe => ({
                                                                            ...recipe,
                                                                            ingredients: recipe.ingredients.map(item =>
                                                                                item === ing ? editingIngredient.name : item
                                                                            )
                                                                        })));
                                                                        setEditingIngredient(null);
                                                                    }} className="text-green-500 hover:text-green-700">
                                                                        <Save className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => setEditingIngredient(null)} className="text-gray-500 hover:text-gray-700">
                                                                        <Circle className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-sm">{ing}</span>
                                                                        <div className="text-sm text-gray-500">
                                                                            <div>{ingredients[ing].price.toFixed(2)} € ({ingredients[ing].parts} parts)</div>
                                                                            <div className="text-xs text-blue-500">{(ingredients[ing].price / ingredients[ing].parts).toFixed(2)} €/part</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button onClick={() => setEditingIngredient({
                                                                            name: ing,
                                                                            category: categorie,
                                                                            price: ingredients[ing].price,
                                                                            parts: ingredients[ing].parts
                                                                        })} className="text-blue-500 hover:text-blue-700">\
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button onClick={() => deleteIngredient(ing, categorie)} className="text-red-500 hover:text-red-700">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </>
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
                                        <button onClick={() => setShowAddRecipe(!showAddRecipe)} className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-600">
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
                                                <button onClick={addRecipe} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
                                                    <Save className="w-4 h-4" />Enregistrer
                                                </button>
                                                <button onClick={() => setShowAddRecipe(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Annuler</button>
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
                                                            <button onClick={updateRecipe} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600">
                                                                <Save className="w-4 h-4" />Sauvegarder
                                                            </button>
                                                            <button onClick={() => setEditingRecipe(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-400">Annuler</button>
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
                                                                <button onClick={() => setEditingRecipe({ index: idx, data: { ...recette } })} className="text-blue-500 hover:text-blue-700">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => deleteRecipe(idx)} className="text-red-500 hover:text-red-700">
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
        </div>
    );
}

export default App;