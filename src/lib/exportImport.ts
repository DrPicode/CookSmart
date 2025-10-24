import { IngredientsType, CategoriesType, RecipeType } from '../types';
import demoDataJson from '../data/demoData.json';
import demoDataEnJson from '../data/demoData.en.json';

export type ShoppingSession = { id: string; date: string; items: string[]; total: number };

export interface ExportDataV1 {
    version: '1.0.0';
    exportedAt: string;
    ingredients: IngredientsType;
    categories: CategoriesType;
    recettes: RecipeType[];
    shoppingHistory: ShoppingSession[];
}

export interface ExportDataV2 extends Omit<ExportDataV1, 'version'> {
    version: '1.1.0';
}

export interface ExportDataV3 extends Omit<ExportDataV2, 'version'> {
    version: '1.2.0';
    recipeCategories: string[];
}

export interface ExportDataV4 extends Omit<ExportDataV3, 'version'> {
    version: '1.3.0';
    freshCategories: string[];
}

export type AnyExportData = ExportDataV1 | ExportDataV2 | ExportDataV3 | ExportDataV4;

export function buildExportData(
    ingredients: IngredientsType,
    categories: CategoriesType,
    recettes: RecipeType[],
    shoppingHistory: ShoppingSession[],
    recipeCategories: string[],
    freshCategories: string[]
): ExportDataV4 {
    return {
        version: '1.3.0',
        exportedAt: new Date().toISOString(),
        ingredients,
        categories,
        recettes,
        shoppingHistory,
        recipeCategories,
        freshCategories,
    };
}

export function validateExportData(raw: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fail = (msg: string) => { errors.push(msg); };
    const warn = (msg: string) => { warnings.push(msg); };
    if (!raw || typeof raw !== 'object') fail('Structure racine absente ou non-objet.');
    if (raw && !raw.version) {
        raw.version = '1.0.0';
    }
    if (raw && !['1.0.0', '1.1.0', '1.2.0', '1.3.0'].includes(raw.version)) fail(`Version non supportée: ${raw.version}`);
    if (raw && typeof raw.exportedAt !== 'string') fail('Champ exportedAt manquant ou non-string.');
    if (raw && (!raw.ingredients || typeof raw.ingredients !== 'object')) fail('Champ ingredients manquant ou invalide.');
    if (raw && (!raw.categories || typeof raw.categories !== 'object')) fail('Champ categories manquant ou invalide.');
    if (raw && !Array.isArray(raw.recettes)) fail('Champ recettes doit être un tableau.');
    if (raw && !Array.isArray(raw.shoppingHistory)) fail('Champ shoppingHistory doit être un tableau.');
    if (raw && ['1.2.0', '1.3.0'].includes(raw.version) && !Array.isArray(raw.recipeCategories)) fail('Champ recipeCategories doit être un tableau pour version >= 1.2.0.');
    if (raw && raw.version === '1.3.0' && !Array.isArray(raw.freshCategories)) fail('Champ freshCategories doit être un tableau pour version 1.3.0.');

    if (errors.length === 0 && raw) {
        for (const [idx, r] of (raw.recettes as any[]).entries()) {
            if (!r || typeof r !== 'object') { fail(`Recette index ${idx} invalide.`); break; }
            if (typeof r.nom !== 'string') fail(`Recette index ${idx}: nom invalide.`);
            if (typeof r.categorie !== 'string') fail(`Recette index ${idx}: categorie invalide.`);
            if (!Array.isArray(r.ingredients)) fail(`Recette index ${idx}: ingredients doit être tableau.`);
            else if (!r.ingredients.every((i: any) => typeof i === 'string')) fail(`Recette index ${idx}: ingredients contient valeur non-string.`);
        }
        for (const [name, ing] of Object.entries(raw.ingredients)) {
            if (!ing || typeof ing !== 'object') { fail(`Ingrédient '${name}' invalide.`); continue; }
            const inStock = (ing as any).inStock;
            const price = (ing as any).price;
            const parts = (ing as any).parts;
            const expiryDate = (ing as any).expiryDate;
            if (!(typeof inStock === 'boolean' || (typeof inStock === 'string' && ['true', 'false'].includes(String(inStock).toLowerCase())))) {
                warn(`Ingrédient '${name}': inStock valeur inattendue ('${inStock}'), forcé à false.`);
            }
            if (!(typeof price === 'number' || (typeof price === 'string' && !isNaN(parseFloat(price))))) {
                warn(`Ingrédient '${name}': price valeur '${price}' non numérique, ignoré (0).`);
            }
            if (!(typeof parts === 'number' || (typeof parts === 'string' && !isNaN(parseInt(String(parts), 10))))) {
                warn(`Ingrédient '${name}': parts valeur '${parts}' non numérique, remplacé par 1.`);
            }
            if (expiryDate !== undefined && expiryDate !== null) {
                if (typeof expiryDate !== 'string') {
                    warn(`Ingrédient '${name}': expiryDate non-string ignorée.`);
                } else if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
                    warn(`Ingrédient '${name}': expiryDate '${expiryDate}' format inattendu (aaaa-mm-jj), ignorée.`);
                }
            }
        }
        for (const [cat, list] of Object.entries(raw.categories)) {
            if (!Array.isArray(list)) { fail(`Catégorie '${cat}' n'est pas un tableau.`); continue; }
            if (!list.every(i => typeof i === 'string')) fail(`Catégorie '${cat}' contient valeur non-string.`);
        }
        for (const [idx, s] of (raw.shoppingHistory as any[]).entries()) {
            if (!s || typeof s !== 'object') { fail(`Session historique index ${idx} invalide.`); continue; }
            if (typeof s.id !== 'string') fail(`Session historique index ${idx}: id invalide.`);
            if (typeof s.date !== 'string') fail(`Session historique index ${idx}: date invalide.`);
            if (!(typeof s.total === 'number' || (typeof s.total === 'string' && !isNaN(parseFloat(s.total))))) fail(`Session historique index ${idx}: total invalide.`);
            if (!Array.isArray(s.items)) fail(`Session historique index ${idx}: items doit être tableau.`);
            else if (!s.items.every((i: unknown) => typeof i === 'string')) fail(`Session historique index ${idx}: items contient non-string.`);
        }
    }
    return { valid: errors.length === 0 && !!raw && ['1.0.0', '1.1.0', '1.2.0', '1.3.0'].includes(raw.version), errors, warnings };
}

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
        const expiryDate: string | undefined = (typeof rawIng.expiryDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawIng.expiryDate)) ? rawIng.expiryDate : undefined;
        return [name, { inStock, price, parts, ...(expiryDate ? { expiryDate } : {}) }];
    }));
    const shoppingHistory = data.shoppingHistory.map(s => ({
        ...s,
        total: typeof s.total === 'string' ? parseFloat(s.total) : s.total,
    }));
    const recipeCategories = (data as any).recipeCategories && Array.isArray((data as any).recipeCategories)
        ? (data as any).recipeCategories.filter((c: any) => typeof c === 'string')
        : Array.from(new Set(recettes.map(r => r.categorie)));
    const freshCategories = (data as any).freshCategories && Array.isArray((data as any).freshCategories)
        ? (data as any).freshCategories.filter((c: any) => typeof c === 'string')
        : [];
    return { ...data, categories, recettes, ingredients, shoppingHistory, recipeCategories, freshCategories } as AnyExportData;
}

export function loadDemoData(lang: 'fr' | 'en' = 'fr'): ExportDataV4 {
    return (lang === 'en' ? demoDataEnJson : demoDataJson) as ExportDataV4;
}
