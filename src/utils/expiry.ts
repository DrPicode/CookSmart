import { IngredientsType, RecipeType } from '../types';

export const DAYS_WARNING = 3;

export type ExpiryStatus = 'out' | 'none' | 'expired' | 'soon' | 'ok';

export function computeExpiryStatus(ing: { expiryDate?: string; inStock: boolean }) {
    if (!ing.inStock) return { status: 'out' as ExpiryStatus, daysLeft: Infinity };
    const baseDate = ing.expiryDate ? new Date(ing.expiryDate) : null;
    if (!baseDate) return { status: 'none' as ExpiryStatus, daysLeft: Infinity };
    const today = new Date();
    const diffDays = Math.floor((baseDate.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return { status: 'expired' as ExpiryStatus, daysLeft: diffDays };
    if (diffDays <= DAYS_WARNING) return { status: 'soon' as ExpiryStatus, daysLeft: diffDays };
    return { status: 'ok' as ExpiryStatus, daysLeft: diffDays };
}

// Score recette: somme des pénalités jours restants + bonus utilisation parts restantes
export function scoreRecette(r: RecipeType, ingredients: IngredientsType) {
    let score = 0;
    r.ingredients.forEach(ing => {
        const data = ingredients[ing];
        if (!data || !data.inStock) return;
        const { status, daysLeft } = computeExpiryStatus(data);
        if (status === 'expired') score += 100; // priorité extrême
        else if (status === 'soon') score += (DAYS_WARNING - daysLeft) * 10;
        if (data.remainingParts && data.parts) {
            const ratio = data.remainingParts / data.parts; // 1 intact, 0 consommé
            score += (1 - ratio) * 5;
        }
    });
    return score;
}
