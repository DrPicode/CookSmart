import { IngredientsType, RecipeType } from '../types';

export const DAYS_WARNING = 3;

export type ExpiryStatus = 'out' | 'none' | 'expired' | 'soon' | 'ok';

export function computeExpiryStatus(ing: { expiryDate?: string; inStock: boolean }) {
    if (!ing.inStock) return { status: 'out' as ExpiryStatus, daysLeft: Infinity };
    if (!ing.expiryDate) return { status: 'none' as ExpiryStatus, daysLeft: Infinity };
    // Parsing YYYY-MM-DD en local sans décalage fuseau (évite J-0 si demain)
    const parts = ing.expiryDate.split('-').map(p => parseInt(p, 10));
    const baseDate = (parts.length === 3) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(ing.expiryDate);
    if (isNaN(baseDate.getTime())) return { status: 'none' as ExpiryStatus, daysLeft: Infinity };
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    let diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / 86400000);
    // Si futur mais diff arrondi à 0 (décalage horaires), forcer à 1 pour affichage J-1
    if (diffDays === 0 && targetMidnight.getTime() > todayMidnight.getTime()) diffDays = 1;
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
