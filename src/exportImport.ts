// Utilitaires d'export / import pour Recipe Manager
// Centralise le schéma afin de pouvoir évoluer (versionnage)

import { IngredientsType, CategoriesType, RecipeType } from './App';

export type ShoppingSession = { id: string; date: string; items: string[]; total: number };

export interface ExportDataV1 {
    version: '1.0.0';
    exportedAt: string; // ISO date
    ingredients: IngredientsType;
    categories: CategoriesType;
    recettes: RecipeType[];
    shoppingHistory: ShoppingSession[];
}

export type AnyExportData = ExportDataV1; // futures versions en union

// Construit la structure d'export à partir des états courants
export function buildExportData(
    ingredients: IngredientsType,
    categories: CategoriesType,
    recettes: RecipeType[],
    shoppingHistory: ShoppingSession[]
): ExportDataV1 {
    return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        ingredients,
        categories,
        recettes,
        shoppingHistory,
    };
}

// Validation simple runtime pour sécuriser l'import
export function validateExportData(raw: any): raw is AnyExportData {
    if (!raw || typeof raw !== 'object') return false;
    if (raw.version !== '1.0.0') return false; // refuser versions inconnues (peut être assoupli plus tard)
    if (typeof raw.exportedAt !== 'string') return false;
    if (!raw.ingredients || typeof raw.ingredients !== 'object') return false;
    if (!raw.categories || typeof raw.categories !== 'object') return false;
    if (!Array.isArray(raw.recettes)) return false;
    if (!Array.isArray(raw.shoppingHistory)) return false;
    // Vérif basique du contenu des recettes
    for (const r of raw.recettes) {
        if (!r || typeof r !== 'object') return false;
        if (typeof r.nom !== 'string' || typeof r.categorie !== 'string' || !Array.isArray(r.ingredients)) return false;
        if (!r.ingredients.every((i: any) => typeof i === 'string')) return false;
    }
    // Vérif basique du contenu des ingrédients
    for (const [name, ing] of Object.entries(raw.ingredients)) {
        if (typeof name !== 'string') return false;
        if (!ing || typeof ing !== 'object') return false;
        if (typeof (ing as any).inStock !== 'boolean') return false;
        if (typeof (ing as any).price !== 'number') return false;
        if (typeof (ing as any).parts !== 'number') return false;
    }
    // Vérif catégories: tableau de strings
    for (const [cat, list] of Object.entries(raw.categories)) {
        if (typeof cat !== 'string') return false;
        if (!Array.isArray(list) || !list.every(i => typeof i === 'string')) return false;
    }
    // Shopping history
    for (const s of raw.shoppingHistory) {
        if (!s || typeof s !== 'object') return false;
        if (typeof s.id !== 'string' || typeof s.date !== 'string' || typeof s.total !== 'number') return false;
        if (!Array.isArray(s.items) || !s.items.every((i: unknown) => typeof i === 'string')) return false;
    }
    return true;
}

// Nettoie les incohérences possibles (ex: catégories listant un ingrédient absent)
export function sanitizeImport(data: AnyExportData): AnyExportData {
    const ingredientNames = new Set(Object.keys(data.ingredients));
    const categories: CategoriesType = {};
    for (const [cat, list] of Object.entries(data.categories)) {
        categories[cat] = list.filter(i => ingredientNames.has(i));
    }
    const recettes = data.recettes.map(r => ({
        ...r,
        ingredients: r.ingredients.filter(i => ingredientNames.has(i)),
    })).filter(r => r.ingredients.length > 0);
    return { ...data, categories, recettes };
}
