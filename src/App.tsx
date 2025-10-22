import { useState, useEffect, useCallback } from 'react';
import { ShoppingSession, loadDemoData } from './lib/exportImport';
import { ChefHat, RefreshCcw, Languages, HelpCircle, Plus } from 'lucide-react';
import { usePersistentState } from './hooks/usePersistentState';
import {
    IngredientsType,
    CategoriesType,
    RecipeType,
    FreshCategoriesType
} from './types';
import { RecipesTab } from './components/RecipesTab';
import { CoursesTab } from './components/CoursesTab';
import { HistoryTab } from './components/HistoryTab';
import { ManageTab } from './components/ManageTab';
import { HelpTutorial } from './components/HelpTutorial';
import { TabsBar } from './components/TabsBar';
import { AddIngredientModal } from './components/AddIngredientModal';
import { AddRecipeModal } from './components/AddRecipeModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useTranslations } from './hooks/useTranslations';
import { useShopping } from './hooks/useShopping';
import { useRecipes } from './hooks/useRecipes';
import { useManagement } from './hooks/useManagement';
import { usePWAInstall } from './hooks/usePWAInstall';

export function App() {
    const [ingredients, setIngredients] = usePersistentState<IngredientsType>('ingredients', {});
    const [categories, setCategories] = usePersistentState<CategoriesType>('categories', {});
    const [recettes, setRecettes] = usePersistentState<RecipeType[]>('recettes', []);
    const [freshCategories, setFreshCategories] = usePersistentState<FreshCategoriesType>('freshCategories', []);
    const [recipeCategories, setRecipeCategories] = usePersistentState<string[]>('recipeCategories', []);
    const [lang, setLang] = usePersistentState<'fr' | 'en'>('lang', 'fr');
    const { t } = useTranslations(lang);
    const [activeTab, setActiveTab] = useState<'courses' | 'recettes' | 'gestion' | 'historique'>('courses');
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingSession[]>(() => {
        const saved = localStorage.getItem('shoppingHistory');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => { try { localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory)); } catch { } }, [shoppingHistory]);

    const resetAllData = () => {
        if (!confirm(t('confirmReset'))) return;
        try { ['ingredients', 'categories', 'recettes', 'shoppingHistory', 'recipeCategories', 'tutorialSeen'].forEach(k => localStorage.removeItem(k)); } catch { }
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setShoppingHistory([]);
        setRecipeCategories([]);
        setHasSeenTutorial(false);
        setShowHelp(true);
    };
    const toggleLang = () => setLang(prev => prev === 'fr' ? 'en' : 'fr');

    // PWA Install
    const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

    useEffect(() => { }, []);
    const [historySelectMode, setHistorySelectMode] = useState(false);
    const [historySelected, setHistorySelected] = useState<Set<string>>(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
        try { return localStorage.getItem('tutorialSeen') === '1'; } catch { return false; }
    });
    useEffect(() => {
        if (!hasSeenTutorial) {
            const timer = setTimeout(() => setShowHelp(true), 800);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial]);
    const openHelp = () => setShowHelp(true);
    const closeHelp = () => {
        setShowHelp(false);
        if (!hasSeenTutorial) {
            setHasSeenTutorial(true);
            try { localStorage.setItem('tutorialSeen', '1'); } catch { }
        }
    };
    const startWithDemoData = () => {
        const demoData = loadDemoData();
        setIngredients(demoData.ingredients);
        setCategories(demoData.categories);
        setRecettes(demoData.recettes);
        setRecipeCategories(demoData.recipeCategories);
        setFreshCategories(demoData.freshCategories);
        setShoppingHistory(demoData.shoppingHistory);
    };
    const startWithEmptyData = () => {
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setRecipeCategories([]);
        setFreshCategories([]);
    };
    const toggleHistorySelect = (id: string) => {
        setHistorySelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const deleteHistoryIds = (ids: string[]) => {
        if (ids.length === 0) return;
        if (!confirm(ids.length === 1 ? (lang === 'fr' ? 'Supprimer cette session ?' : 'Delete this session?') : (lang === 'fr' ? `Supprimer ${ids.length} sessions ?` : `Delete ${ids.length} sessions?`))) return;
        setShoppingHistory(prev => prev.filter(s => !ids.includes(s.id)));
        setHistorySelected(new Set());
        setHistorySelectMode(false);
    };
    const selectAllHistory = () => {
        if (historySelected.size === shoppingHistory.length) {
            setHistorySelected(new Set());
        } else {
            setHistorySelected(new Set(shoppingHistory.map(s => s.id)));
        }
    };

    const { recettesPossibles, recettesGroupees, expiringIngredients, recettesPrioritaires } = useRecipes({ ingredients, recettes });

    const {
        shoppingMode,
        shoppingSelected,
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
    } = useShopping({
        ingredients,
        categories,
        setIngredients,
        setShoppingHistory
    });

    const management = useManagement({
        ingredients,
        setIngredients,
        categories,
        setCategories,
        recettes,
        setRecettes,
        recipeCategories,
        setRecipeCategories,
        freshCategories,
        setFreshCategories,
        shoppingHistory,
        setShoppingHistory,
        lang,
        t
    });

    const toggleIngredient = useCallback((ingredient: string) => {
        setIngredients((prev: IngredientsType) => ({
            ...prev,
            [ingredient]: { ...prev[ingredient], inStock: !prev[ingredient].inStock }
        }));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <div className="mx-auto bg-white shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white relative">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ChefHat className="w-6 h-6" /> {t('appTitle')}
                            </h1>
                            <p className="mt-1 text-orange-100 text-xs">{t('appSubtitle')}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex flex-wrap gap-1.5 justify-end">
                                <button
                                    onClick={openHelp}
                                    aria-label={t('help')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">{t('help')}</span>
                                </button>
                                <button
                                    onClick={toggleLang}
                                    aria-label={t('langToggle')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <Languages className="w-4 h-4" /> <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                                </button>
                                <PWAInstallButton
                                    isInstallable={isInstallable}
                                    isInstalled={isInstalled}
                                    onInstall={promptInstall}
                                    label={isInstalled ? t('installPWAAlreadyInstalled') : t('installPWA')}
                                />
                                <button
                                    onClick={resetAllData}
                                    aria-label={t('resetData')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500/80 active:bg-red-600 hover:bg-red-600 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">{t('resetData')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <TabsBar
                    active={activeTab}
                    onChange={setActiveTab}
                    recipesPossibleCount={recettesPossibles.length}
                    t={t}
                />

                <div className="p-2 pb-[calc(7rem+env(safe-area-inset-bottom))]">
                    {activeTab === 'courses' && (
                        <CoursesTab
                            t={t}
                            categories={categories}
                            ingredients={ingredients}
                            freshCategories={freshCategories}
                            shoppingMode={shoppingMode}
                            startShopping={startShopping}
                            ingredientsManquants={ingredientsManquants}
                            shoppingCategoryOrder={shoppingCategoryOrder}
                            missingByCategory={missingByCategory}
                            shoppingSelected={shoppingSelected}
                            shoppingSubtotal={shoppingSubtotal}
                            shoppingProgress={shoppingProgress}
                            finishShopping={finishShopping}
                            cancelShopping={cancelShopping}
                            toggleShoppingItem={toggleShoppingItem}
                            toggleIngredient={toggleIngredient}
                            setIngredients={setIngredients}
                            totalCourses={totalCourses}
                        />
                    )}

                    {activeTab === 'recettes' && (
                        <RecipesTab
                            t={t}
                            recettesPossibles={recettesPossibles}
                            recettesGroupees={recettesGroupees}
                            expiringIngredients={expiringIngredients}
                            recettesPrioritaires={recettesPrioritaires}
                            ingredients={ingredients}
                        />
                    )}

                    {activeTab === 'gestion' && (
                        <ManageTab
                            t={t}
                            lang={lang}
                            categories={categories}
                            ingredients={ingredients}
                            freshCategories={freshCategories}
                            management={management}
                        />
                    )}

                    {activeTab === 'historique' && (
                        <HistoryTab
                            t={t}
                            shoppingHistory={shoppingHistory}
                            historySelectMode={historySelectMode}
                            setHistorySelectMode={setHistorySelectMode}
                            historySelected={historySelected}
                            toggleHistorySelect={toggleHistorySelect}
                            selectAllHistory={selectAllHistory}
                            deleteHistoryIds={deleteHistoryIds}
                            clearHistory={() => { if (confirm(t('clearHistoryConfirm'))) setShoppingHistory([]); }}
                            lang={lang}
                        />
                    )}
                </div>
            </div>
            {!showHelp && activeTab === 'courses' && (
                <button
                    onClick={() => setShowAddIngredientModal(true)}
                    className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
                    aria-label={t('addIngredient')}
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
            {!showHelp && activeTab === 'recettes' && (
                <button
                    onClick={() => setShowAddRecipeModal(true)}
                    className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
                    aria-label={t('addRecipe')}
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            <AddIngredientModal
                isOpen={showAddIngredientModal}
                onClose={() => setShowAddIngredientModal(false)}
                t={t}
                lang={lang}
                categories={categories}
                ingredients={ingredients}
                freshCategories={freshCategories}
                management={management}
            />

            <AddRecipeModal
                isOpen={showAddRecipeModal}
                onClose={() => setShowAddRecipeModal(false)}
                t={t}
                lang={lang}
                management={management}
            />

            <HelpTutorial
                open={showHelp}
                onClose={closeHelp}
                lang={lang}
                t={t}
                isFirstTime={!hasSeenTutorial}
                onStartWithDemo={startWithDemoData}
                onStartEmpty={startWithEmptyData}
                onToggleLang={toggleLang}
                isInstallable={isInstallable}
                isInstalled={isInstalled}
                onInstallPWA={promptInstall}
            />
        </div>
    );
}

export default App;
