import { useMemo } from 'react';
import { IngredientsType, RecipeType } from '../types';
import { computeExpiryStatus, earliestExpiryDays, scoreRecette } from '../utils/expiry';

interface UseRecipesParams {
    ingredients: IngredientsType;
    recettes: RecipeType[];
}

export function useRecipes({ ingredients, recettes }: UseRecipesParams) {
    const recettesPossibles = useMemo(() => {
        return recettes.filter(recette =>
            recette.ingredients.every((ing: string) => ingredients[ing]?.inStock)
        );
    }, [recettes, ingredients]);

    const recettesPossiblesTriees = useMemo(() => {
        return recettesPossibles.slice().sort((a, b) => {
            const ea = earliestExpiryDays(a, ingredients);
            const eb = earliestExpiryDays(b, ingredients);
            const va = ea === null ? Infinity : ea;
            const vb = eb === null ? Infinity : eb;
            return va - vb;
        });
    }, [recettesPossibles, ingredients]);

    const recettesGroupees = useMemo(() => {
        return recettesPossiblesTriees.reduce<{ [key: string]: RecipeType[] }>((acc, recette) => {
            (acc[recette.categorie] ||= []).push(recette);
            return acc;
        }, {});
    }, [recettesPossiblesTriees]);

    const expiringIngredients = useMemo(() => Object.entries(ingredients)
        .filter(([_, v]) => v.inStock && v.expiryDate)
        .map(([name, data]) => ({ name, ...computeExpiryStatus(data) }))
        .filter(e => ['soon', 'expired'].includes(e.status))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        , [ingredients]);

    const recettesPrioritaires = useMemo(() => {
        return recettesPossibles
            .map(r => ({ r, score: scoreRecette(r, ingredients) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.r);
    }, [recettesPossibles, ingredients]);

    return {
        recettesPossibles,
        recettesPossiblesTriees,
        recettesGroupees,
        expiringIngredients,
        recettesPrioritaires
    };
}

export type UseRecipesReturn = ReturnType<typeof useRecipes>;
