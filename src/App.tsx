import React, { useState, type JSX } from 'react';
import { ChefHat, ShoppingCart, CheckCircle2, Circle } from 'lucide-react';

type IngredientsMap = Record<string, boolean>;

type Recette = {
    nom: string;
    categorie: string;
    ingredients: string[];
};

export function App(): JSX.Element {
    const [ingredients, setIngredients] = useState<IngredientsMap>({
        'Tomates cerises': false,
        'Pommes de terre au four micro-ondes': false,
        'Maïs': true,
        'Pâtes': false,
        'Riz': true,
        'Thon': false,
        'Sauce tomate': true,
        'Sauce bolognaise': false,
        'Ketchup': true,
        'Biscottes': true,
        'Boîte Albóndigas': true,
        'Boite lentilles chorizo': true,
        'Champignons en boîte': false,
        'Petits pois en boîte': true,
        'Céréales': false,
        'Jus de fruit': false,
        'Eau': false,
        'Yaourt à boire': false,
        'Beurre': false,
        'Fromage râpé': true,
        'Crème fraîche en brique': true,
        'Lardons': true,
        'Steaks hachés': false,
        'Dés de chorizo': true,
        'Dés de jambon blanc': false,
        'Tortilla': false,
        'Knockis poulet surgelés': true,
        'Légumes poulet surgelés': true,
        'Lasagnes': true,
    } as IngredientsMap);

    const [activeTab, setActiveTab] = useState<'courses' | 'recettes'>('courses');

    const categories: Record<string, string[]> = {
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

    const recettes: Recette[] = [
        {
            nom: 'Salade maïs thon',
            categorie: '🥗 Salade',
            ingredients: ['Maïs', 'Thon']
        },
        {
            nom: 'Salade tomates cerises thon',
            categorie: '🥗 Salade',
            ingredients: ['Tomates cerises', 'Thon']
        },
        {
            nom: 'Salade pomme de terre et thon',
            categorie: '🥗 Salade',
            ingredients: ['Pommes de terre au four micro-ondes', 'Thon']
        },
        {
            nom: 'Riz champignons crème fraîche',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Champignons en boîte', 'Crème fraîche en brique']
        },
        {
            nom: 'Riz cantonais',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Dés de jambon blanc', 'Petits pois en boîte']
        },
        {
            nom: 'Riz façon carbonara',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Lardons', 'Crème fraîche en brique']
        },
        {
            nom: 'Riz chorizo crème fraîche',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Dés de chorizo', 'Crème fraîche en brique']
        },
        {
            nom: 'Riz Albóndigas sauce tomate',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Boîte Albóndigas', 'Sauce tomate']
        },
        {
            nom: 'Riz au thon',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Thon', 'Ketchup']
        },
        {
            nom: 'Riz au thon sauce tomate',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Riz', 'Thon', 'Sauce tomate']
        },
        {
            nom: 'Pâtes au thon',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Pâtes', 'Thon']
        },
        {
            nom: 'Pâtes au thon sauce tomate',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Pâtes', 'Thon', 'Sauce tomate']
        },
        {
            nom: 'Coquillettes jambon fromage crème fraîche',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Pâtes', 'Dés de jambon blanc', 'Fromage râpé', 'Crème fraîche en brique']
        },
        {
            nom: 'Pâtes bolognaise',
            categorie: '🍝 Pâtes / Riz / Crème',
            ingredients: ['Pâtes', 'Steaks hachés', 'Sauce tomate']
        },
        {
            nom: 'Lentilles chorizo',
            categorie: '🥫 Conserves',
            ingredients: ['Boite lentilles chorizo']
        },
        {
            nom: 'Knockis poulet',
            categorie: '🧊 Surgelés',
            ingredients: ['Knockis poulet surgelés']
        },
        {
            nom: 'Légumes poulet',
            categorie: '🧊 Surgelés',
            ingredients: ['Légumes poulet surgelés']
        },
        {
            nom: 'Lasagnes',
            categorie: '🧊 Surgelés',
            ingredients: ['Lasagnes']
        },
        {
            nom: 'Tortilla',
            categorie: '🥔 Pomme de terre',
            ingredients: ['Tortilla']
        }
    ];

    const toggleIngredient = (ingredient: string) => {
        setIngredients(prev => ({
            ...prev,
            [ingredient]: !prev[ingredient]
        }));
    };

    const recettesPossibles = recettes.filter(recette =>
        recette.ingredients.every(ing => !!ingredients[ing])
    );

    const recettesGroupees = recettesPossibles.reduce<Record<string, Recette[]>>((acc, recette) => {
        if (!acc[recette.categorie]) {
            acc[recette.categorie] = [];
        }
        acc[recette.categorie].push(recette);
        return acc;
    }, {});

    const ingredientsManquants = Object.keys(ingredients).filter(ing => !ingredients[ing]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ChefHat className="w-8 h-8" />
                            Gestionnaire de Courses et Recettes
                        </h1>
                        <p className="mt-2 text-orange-100">
                            Gérez vos courses et découvrez les plats que vous pouvez cuisiner
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            type="button"
                            onClick={() => setActiveTab('courses')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'courses'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Liste de Courses
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('recettes')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'recettes'
                                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <ChefHat className="w-5 h-5" />
                            Recettes Possibles ({recettesPossibles.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'courses' ? (
                            <div className="space-y-6">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm text-orange-800">
                                        <strong>Astuce :</strong> Cochez les ingrédients que vous avez à la maison.
                                        Les cases décochées représentent ce qu'il faut acheter.
                                    </p>
                                </div>

                                {Object.entries(categories).map(([categorie, items]) => (
                                    <div key={categorie} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-700">
                                            {categorie}
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {items.map(ingredient => (
                                                <label
                                                    key={ingredient}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleIngredient(ingredient)}
                                                        className="flex-shrink-0"
                                                    >
                                                        {ingredients[ingredient] ? (
                                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-gray-300" />
                                                        )}
                                                    </button>
                                                    <span className={ingredients[ingredient] ? 'text-gray-900' : 'text-gray-500'}>
                                                        {ingredient}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                                    <h3 className="font-semibold text-red-800 mb-2">
                                        À acheter ({ingredientsManquants.length} articles)
                                    </h3>
                                    {ingredientsManquants.length > 0 ? (
                                        <ul className="space-y-1 text-sm text-red-700">
                                            {ingredientsManquants.map(ing => (
                                                <li key={ing}>• {ing}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-red-700">Tout est en stock ! 🎉</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recettesPossibles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">
                                            Aucune recette possible avec les ingrédients actuels.
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Cochez plus d'ingrédients dans l'onglet "Liste de Courses"
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-green-800">
                                                <strong>🎉 Super !</strong> Vous pouvez préparer {recettesPossibles.length} plat{recettesPossibles.length > 1 ? 's' : ''} avec les ingrédients disponibles.
                                            </p>
                                        </div>

                                        {Object.entries(recettesGroupees).map(([categorie, recettes]) => (
                                            <div key={categorie} className="border rounded-lg overflow-hidden">
                                                <div className="bg-gradient-to-r from-orange-100 to-red-100 px-4 py-3 font-semibold text-gray-800">
                                                    {categorie}
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    {recettes.map((recette, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                        >
                                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                                {recette.nom}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {recette.ingredients.map(ing => (
                                                                    <span
                                                                        key={ing}
                                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                                                                    >
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        {ing}
                                                                    </span>
                                                                ))}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;