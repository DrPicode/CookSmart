// Utilitaires d'export / import pour Recipe Manager
// Centralise le schéma afin de pouvoir évoluer (versionnage)

// Importer maintenant depuis types.ts (éviter dépendance circulaire avec App)
import { IngredientsType, CategoriesType, RecipeType } from './types';

export type ShoppingSession = { id: string; date: string; items: string[]; total: number };

export interface ExportDataV1 {
    version: '1.0.0';
    exportedAt: string; // ISO date
    ingredients: IngredientsType;
    categories: CategoriesType;
    recettes: RecipeType[];
    shoppingHistory: ShoppingSession[];
}

// Nouvelle version avec dates de péremption optionnelles (IngredientsType contient maintenant expiryDate?)
export interface ExportDataV2 extends Omit<ExportDataV1, 'version'> {
    version: '1.1.0';
}

export type AnyExportData = ExportDataV1 | ExportDataV2; // futures versions en union

// Construit la structure d'export à partir des états courants
export function buildExportData(
    ingredients: IngredientsType,
    categories: CategoriesType,
    recettes: RecipeType[],
    shoppingHistory: ShoppingSession[]
): ExportDataV2 {
    return {
        version: '1.1.0',
        exportedAt: new Date().toISOString(),
        ingredients,
        categories,
        recettes,
        shoppingHistory,
    };
}

// Validation simple runtime pour sécuriser l'import
export function validateExportData(raw: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fail = (msg: string) => { errors.push(msg); };
    const warn = (msg: string) => { warnings.push(msg); };
    if (!raw || typeof raw !== 'object') fail('Structure racine absente ou non-objet.');
    // Version: accepter absence -> considérer v1
    if (raw && !raw.version) {
        raw.version = '1.0.0';
    }
    // Supporter v1.0.0 et v1.1.0
    if (raw && !['1.0.0', '1.1.0'].includes(raw.version)) fail(`Version non supportée: ${raw.version}`);
    if (raw && typeof raw.exportedAt !== 'string') fail('Champ exportedAt manquant ou non-string.');
    if (raw && (!raw.ingredients || typeof raw.ingredients !== 'object')) fail('Champ ingredients manquant ou invalide.');
    if (raw && (!raw.categories || typeof raw.categories !== 'object')) fail('Champ categories manquant ou invalide.');
    if (raw && !Array.isArray(raw.recettes)) fail('Champ recettes doit être un tableau.');
    if (raw && !Array.isArray(raw.shoppingHistory)) fail('Champ shoppingHistory doit être un tableau.');

    if (errors.length === 0 && raw) {
        // Recettes
        for (const [idx, r] of (raw.recettes as any[]).entries()) {
            if (!r || typeof r !== 'object') { fail(`Recette index ${idx} invalide.`); break; }
            if (typeof r.nom !== 'string') fail(`Recette index ${idx}: nom invalide.`);
            if (typeof r.categorie !== 'string') fail(`Recette index ${idx}: categorie invalide.`);
            if (!Array.isArray(r.ingredients)) fail(`Recette index ${idx}: ingredients doit être tableau.`);
            else if (!r.ingredients.every((i: any) => typeof i === 'string')) fail(`Recette index ${idx}: ingredients contient valeur non-string.`);
        }
        // Ingrédients
        for (const [name, ing] of Object.entries(raw.ingredients)) {
            if (!ing || typeof ing !== 'object') { fail(`Ingrédient '${name}' invalide.`); continue; }
            const inStock = (ing as any).inStock;
            const price = (ing as any).price;
            const parts = (ing as any).parts;
            if (!(typeof inStock === 'boolean' || (typeof inStock === 'string' && ['true', 'false'].includes(String(inStock).toLowerCase())))) {
                warn(`Ingrédient '${name}': inStock valeur inattendue ('${inStock}'), forcé à false.`);
            }
            if (!(typeof price === 'number' || (typeof price === 'string' && !isNaN(parseFloat(price))))) {
                warn(`Ingrédient '${name}': price valeur '${price}' non numérique, ignoré (0).`);
            }
            if (!(typeof parts === 'number' || (typeof parts === 'string' && !isNaN(parseInt(String(parts), 10))))) {
                warn(`Ingrédient '${name}': parts valeur '${parts}' non numérique, remplacé par 1.`);
            }
        }
        // Catégories
        for (const [cat, list] of Object.entries(raw.categories)) {
            if (!Array.isArray(list)) { fail(`Catégorie '${cat}' n'est pas un tableau.`); continue; }
            if (!list.every(i => typeof i === 'string')) fail(`Catégorie '${cat}' contient valeur non-string.`);
        }
        // Shopping history
        for (const [idx, s] of (raw.shoppingHistory as any[]).entries()) {
            if (!s || typeof s !== 'object') { fail(`Session historique index ${idx} invalide.`); continue; }
            if (typeof s.id !== 'string') fail(`Session historique index ${idx}: id invalide.`);
            if (typeof s.date !== 'string') fail(`Session historique index ${idx}: date invalide.`);
            if (!(typeof s.total === 'number' || (typeof s.total === 'string' && !isNaN(parseFloat(s.total))))) fail(`Session historique index ${idx}: total invalide.`);
            if (!Array.isArray(s.items)) fail(`Session historique index ${idx}: items doit être tableau.`);
            else if (!s.items.every((i: unknown) => typeof i === 'string')) fail(`Session historique index ${idx}: items contient non-string.`);
        }
    }
    return { valid: errors.length === 0 && !!raw && ['1.0.0', '1.1.0'].includes(raw.version), errors, warnings };
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

    // Conversion éventuelle price/parts en number (défensive)
    const ingredients: IngredientsType = Object.fromEntries(Object.entries(data.ingredients).map(([name, ing]) => {
        const rawIng: any = ing;
        let inStock: boolean;
        if (typeof rawIng.inStock === 'string') {
            inStock = rawIng.inStock.toLowerCase() === 'true';
        } else if (typeof rawIng.inStock === 'boolean') {
            inStock = rawIng.inStock;
        } else {
            inStock = false;
        }
        const price = typeof rawIng.price === 'string' && !isNaN(parseFloat(rawIng.price)) ? parseFloat(rawIng.price) : (typeof rawIng.price === 'number' ? rawIng.price : 0);
        const parts = typeof rawIng.parts === 'string' && !isNaN(parseInt(rawIng.parts, 10)) ? parseInt(rawIng.parts, 10) : (typeof rawIng.parts === 'number' && rawIng.parts > 0 ? rawIng.parts : 1);
        return [name, { inStock, price, parts }];
    }));
    const shoppingHistory = data.shoppingHistory.map(s => ({
        ...s,
        total: typeof s.total === 'string' ? parseFloat(s.total) : s.total,
    }));
    // Les champs nouveaux (expiryDate, openedAt, remainingParts) sont laissés tels quels s'ils existent
    return { ...data, categories, recettes, ingredients, shoppingHistory };
}
