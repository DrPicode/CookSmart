import { useState, useMemo, useCallback, useEffect } from 'react';
import { IngredientsType, CategoriesType, FreshCategoriesType } from '../types';
import { ShoppingSession } from '../lib/exportImport';

interface UseShoppingParams {
    ingredients: IngredientsType;
    categories: CategoriesType;
    freshCategories?: FreshCategoriesType;
    setIngredients: React.Dispatch<React.SetStateAction<IngredientsType>>;
    setShoppingHistory: React.Dispatch<React.SetStateAction<ShoppingSession[]>>;
}

export function useShopping({
    ingredients,
    categories,
    setIngredients,
    setShoppingHistory
}: UseShoppingParams) {
    const [shoppingMode, setShoppingMode] = useState(false);
    const [shoppingSelected, setShoppingSelected] = useState<Set<string>>(() => {
        try {
            const raw = localStorage.getItem('shoppingSelected');
            if (raw) {
                const arr: string[] = JSON.parse(raw);
                return new Set(arr);
            }
        } catch { }
        return new Set();
    });
    const [shoppingActivePersisted, setShoppingActivePersisted] = useState<boolean>(() => {
        try { return localStorage.getItem('shoppingActive') === '1'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('shoppingSelected', JSON.stringify(Array.from(shoppingSelected))); } catch { }
    }, [shoppingSelected]);
    useEffect(() => {
        try { localStorage.setItem('shoppingActive', shoppingActivePersisted ? '1' : '0'); } catch { }
    }, [shoppingActivePersisted]);

    const ingredientsManquants = useMemo(
        () => Object.keys(ingredients).filter((ing: string) => !ingredients[ing].inStock),
        [ingredients]
    );

    const shoppingCategoryOrder = useMemo(() => {
        const orderTail = ['🧀 Produits frais', '🥶 Surgelés', '🧊 Surgelés'];
        const allCats = Object.keys(categories);
        const head = allCats.filter(c => !orderTail.includes(c));
        const tail = orderTail.filter(c => allCats.includes(c));
        return [...head, ...tail];
    }, [categories]);

    const missingByCategory = useMemo(() => {
        const map: { [key: string]: string[] } = {};
        for (const ing of ingredientsManquants) {
            const cat = Object.entries(categories).find(([_, list]) => list.includes(ing))?.[0];
            if (cat) {
                if (!map[cat]) map[cat] = [];
                map[cat].push(ing);
            }
        }
        return map;
    }, [ingredientsManquants, categories]);

    const totalCourses = useMemo(
        () => ingredientsManquants.reduce((total, ing) => total + (ingredients[ing]?.price || 0), 0),
        [ingredientsManquants, ingredients]
    );

    const shoppingSubtotal = useMemo(() => {
        let sum = 0;
        for (const ing of shoppingSelected) {
            if (ingredients[ing]) sum += ingredients[ing].price;
        }
        return sum;
    }, [shoppingSelected, ingredients]);

    const shoppingProgress = useMemo(
        () => (ingredientsManquants.length === 0 ? 0 : shoppingSelected.size / ingredientsManquants.length),
        [shoppingSelected, ingredientsManquants]
    );

    const startShopping = useCallback(() => {
        if (!shoppingActivePersisted) {
            setShoppingSelected(new Set());
        }
        setShoppingMode(true);
        setShoppingActivePersisted(true);
    }, [shoppingActivePersisted]);

    const toggleShoppingItem = useCallback((ing: string) => {
        setShoppingSelected(prev => {
            const next = new Set(prev);
            if (next.has(ing)) next.delete(ing); else next.add(ing);
            return next;
        });
    }, []);

    const cancelShopping = useCallback(() => {
        setShoppingMode(false);
    }, []);

    const finishShopping = useCallback(() => {
        if (shoppingSelected.size === 0) {
            setShoppingMode(false);
            setShoppingActivePersisted(false);
            return;
        }
        let sessionTotal = 0;
        for (const ing of shoppingSelected) {
            if (ingredients[ing]) sessionTotal += ingredients[ing].price;
        }
        setIngredients(prev => {
            const next = { ...prev };
            for (const ing of shoppingSelected) {
                if (next[ing]) next[ing].inStock = true;
            }
            return next;
        });
        setShoppingHistory(prev => [
            {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                date: new Date().toISOString(),
                items: Array.from(shoppingSelected),
                total: Number.parseFloat(sessionTotal.toFixed(2))
            },
            ...prev
        ]);
        setShoppingMode(false);
        setShoppingActivePersisted(false);
        try {
            localStorage.removeItem('shoppingSelected');
            localStorage.setItem('shoppingActive', '0');
        } catch { }
    }, [shoppingSelected, ingredients, setIngredients, setShoppingHistory]);

    return {
        shoppingMode,
        shoppingSelected,
        shoppingActivePersisted,
        ingredientsManquants,
        shoppingCategoryOrder,
        missingByCategory,
        totalCourses,
        shoppingSubtotal,
        shoppingProgress,
        startShopping,
        toggleShoppingItem,
        cancelShopping,
        finishShopping
    };
}

export type UseShoppingReturn = ReturnType<typeof useShopping>;
