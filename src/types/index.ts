export type FreshCategoriesType = string[];

export type IngredientsType = { [key: string]: { inStock: boolean; price: number; parts: number; expiryDate?: string; remainingParts?: number } };
export type CategoriesType = { [key: string]: string[] };
export type RecipeType = { nom: string; categorie: string; ingredients: string[] };
export type EditingRecipeType = { index: number; data: RecipeType } | null;
