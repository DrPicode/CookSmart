import { IngredientsType, RecipeType } from '../types';

export const DAYS_WARNING = 3;

export type ExpiryStatus = 'out' | 'none' | 'expired' | 'soon' | 'ok';

/**
 * Format a date string (YYYY-MM-DD) according to the language
 * @param dateString - Date in YYYY-MM-DD format
 * @param lang - Language ('fr' or 'en')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, lang: 'fr' | 'en'): string {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    if (lang === 'fr') {
        // DD-MM-YYYY for French
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
        // YYYY-MM-DD for English
        return dateString;
    }
}

/**
 * Format days left message
 * @param daysLeft - Number of days left
 * @param lang - Language ('fr' or 'en')
 * @returns Formatted message
 */
export function formatDaysLeft(daysLeft: number, lang: 'fr' | 'en'): string {
    if (daysLeft === Infinity) return '';

    if (daysLeft < 0) {
        const absDays = Math.abs(daysLeft);
        if (lang === 'fr') {
            return `Expiré il y a ${absDays} jour${absDays > 1 ? 's' : ''}`;
        } else {
            return `Expired ${absDays} day${absDays > 1 ? 's' : ''} ago`;
        }
    } else if (daysLeft === 0) {
        return lang === 'fr' ? 'Expire aujourd\'hui' : 'Expires today';
    } else if (daysLeft === 1) {
        return lang === 'fr' ? 'Expire demain' : 'Expires tomorrow';
    } else {
        if (lang === 'fr') {
            return `${daysLeft} jours restants`;
        } else {
            return `${daysLeft} days left`;
        }
    }
}

export function computeExpiryStatus(ing: { expiryDate?: string; inStock: boolean }) {
    if (!ing.inStock) return { status: 'out' as ExpiryStatus, daysLeft: Infinity };
    if (!ing.expiryDate) return { status: 'none' as ExpiryStatus, daysLeft: Infinity };
    const parts = ing.expiryDate.split('-').map(p => parseInt(p, 10));
    const baseDate = (parts.length === 3) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(ing.expiryDate);
    if (isNaN(baseDate.getTime())) return { status: 'none' as ExpiryStatus, daysLeft: Infinity };
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    let diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / 86400000);
    if (diffDays === 0 && targetMidnight.getTime() > todayMidnight.getTime()) diffDays = 1;
    if (diffDays < 0) return { status: 'expired' as ExpiryStatus, daysLeft: diffDays };
    if (diffDays <= DAYS_WARNING) return { status: 'soon' as ExpiryStatus, daysLeft: diffDays };
    return { status: 'ok' as ExpiryStatus, daysLeft: diffDays };
}

export function scoreRecette(r: RecipeType, ingredients: IngredientsType) {
    let score = 0;
    r.ingredients.forEach(ing => {
        const data = ingredients[ing];
        if (!data || !data.inStock) return;
        const { status, daysLeft } = computeExpiryStatus(data);
        if (status === 'expired') score += 100;
        else if (status === 'soon') score += (DAYS_WARNING - daysLeft) * 10;
        if (data.remainingParts && data.parts) {
            const ratio = data.remainingParts / data.parts;
            score += (1 - ratio) * 5;
        }
    });
    return score;
}

export function earliestExpiryDays(recipe: RecipeType, ingredients: IngredientsType): number | null {
    let min: number | null = null;
    for (const ing of recipe.ingredients) {
        const data = ingredients[ing];
        if (!data || !data.inStock || !data.expiryDate) continue;
        const { daysLeft } = computeExpiryStatus(data);
        const value = daysLeft;
        if (min === null || value < min) min = value;
    }
    return min;
}

export function earliestExpiryInfo(recipe: RecipeType, ingredients: IngredientsType): { ingredient: string; days: number } | null {
    let chosen: { ingredient: string; days: number } | null = null;
    for (const ing of recipe.ingredients) {
        const data = ingredients[ing];
        if (!data || !data.inStock || !data.expiryDate) continue;
        const { daysLeft } = computeExpiryStatus(data);
        const value = daysLeft;
        if (!chosen || value < chosen.days) {
            chosen = { ingredient: ing, days: value };
        }
    }
    return chosen;
}
