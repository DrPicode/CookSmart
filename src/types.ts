// Initial list of categories considered "fresh" (expiry dates managed).
// Users can modify which categories are fresh dynamically in the UI now.
export const INITIAL_FRESH_CATEGORIES: string[] = ['🧀 Produits frais'];
export type FreshCategoriesType = string[];

export type IngredientsType = { [key: string]: { inStock: boolean; price: number; parts: number; expiryDate?: string; remainingParts?: number } };
export type CategoriesType = { [key: string]: string[] };
export type RecipeType = { nom: string; categorie: string; ingredients: string[] };
export type EditingRecipeType = { index: number; data: RecipeType } | null;

export const defaultIngredients: IngredientsType = {
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

export const defaultCategories: CategoriesType = {
    '🥦 Fruits & Légumes frais': ['Tomates cerises', 'Pommes de terre au four micro-ondes'],
    '🥫 Épicerie salée': [
        'Maïs', 'Pâtes', 'Riz', 'Thon', 'Sauce tomate',
        'Sauce bolognaise', 'Ketchup', 'Biscottes', 'Boîte Albóndigas',
        'Boite lentilles chorizo', 'Champignons en boîte', 'Petits pois en boîte'
    ],
    '🥣 Épicerie sucrée / Petit déjeuner': ['Céréales', 'Jus de fruit'],
    '💧 Boissons': ['Eau'],
    '🧀 Produits frais': [
        'Yaourt à boire', 'Beurre', 'Fromage râpé', 'Crème fraîche en brique',
        'Lardons', 'Steaks hachés', 'Dés de chorizo', 'Dés de jambon blanc', 'Tortilla'
    ],
    '🥶 Surgelés': ['Knockis poulet surgelés', 'Légumes poulet surgelés', 'Lasagnes']
};

export const defaultRecettes: RecipeType[] = [
    { nom: 'Salade maïs thon', categorie: '🥗 Salade', ingredients: ['Maïs', 'Thon'] },
    { nom: 'Salade tomates cerises thon', categorie: '🥗 Salade', ingredients: ['Tomates cerises', 'Thon'] },
    { nom: 'Salade pomme de terre et thon', categorie: '🥗 Salade', ingredients: ['Pommes de terre au four micro-ondes', 'Thon'] },
    { nom: 'Riz champignons crème fraîche', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Champignons en boîte', 'Crème fraîche en brique'] },
    { nom: 'Riz cantonais', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Dés de jambon blanc', 'Petits pois en boîte'] },
    { nom: 'Riz façon carbonara', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Lardons', 'Crème fraîche en brique'] },
    { nom: 'Riz chorizo crème fraîche', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Dés de chorizo', 'Crème fraîche en brique'] },
    { nom: 'Riz Albóndigas sauce tomate', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Boîte Albóndigas', 'Sauce tomate'] },
    { nom: 'Riz au thon', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Thon', 'Ketchup'] },
    { nom: 'Riz au thon sauce tomate', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Riz', 'Thon', 'Sauce tomate'] },
    { nom: 'Pâtes au thon', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Pâtes', 'Thon'] },
    { nom: 'Pâtes au thon sauce tomate', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Pâtes', 'Thon', 'Sauce tomate'] },
    { nom: 'Coquillettes jambon fromage crème fraîche', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Pâtes', 'Dés de jambon blanc', 'Fromage râpé', 'Crème fraîche en brique'] },
    { nom: 'Pâtes bolognaise', categorie: '🍝 Pâtes / Riz / Crème / Crème', ingredients: ['Pâtes', 'Steaks hachés', 'Sauce tomate'] },
    { nom: 'Lentilles chorizo', categorie: '🥫 Conserves', ingredients: ['Boite lentilles chorizo'] },
    { nom: 'Knockis poulet', categorie: '🧊 Surgelés', ingredients: ['Knockis poulet surgelés'] },
    { nom: 'Légumes poulet', categorie: '🧊 Surgelés', ingredients: ['Légumes poulet surgelés'] },
    { nom: 'Lasagnes', categorie: '🧊 Surgelés', ingredients: ['Lasagnes'] },
    { nom: 'Tortilla', categorie: '🥔 Pomme de terre', ingredients: ['Tortilla'] }
];
