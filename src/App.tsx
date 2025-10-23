import { useState, useEffect, useCallback } from 'react';
import { ShoppingSession, loadDemoData } from './lib/exportImport';
import { ChefHat, Plus, Settings } from 'lucide-react';
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
import { HelpTutorial } from './components/HelpTutorial';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { TabsBar } from './components/TabsBar';
import { AddIngredientModal } from './components/AddIngredientModal';
import { AddRecipeModal } from './components/AddRecipeModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ToastContainer } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { useTranslations } from './hooks/useTranslations';
import { useShopping } from './hooks/useShopping';
import { useRecipes } from './hooks/useRecipes';
import { useManagement } from './hooks/useManagement';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useToast } from './hooks/useToast';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useExpiryNotifications } from './hooks/useExpiryNotifications';

export function App() {
    const [ingredients, setIngredients] = usePersistentState<IngredientsType>('ingredients', {});
    const [categories, setCategories] = usePersistentState<CategoriesType>('categories', {});
    const [recettes, setRecettes] = usePersistentState<RecipeType[]>('recettes', []);
    const [freshCategories, setFreshCategories] = usePersistentState<FreshCategoriesType>('freshCategories', []);
    const [recipeCategories, setRecipeCategories] = usePersistentState<string[]>('recipeCategories', []);
    const [categoryOrder, setCategoryOrder] = usePersistentState<string[]>('categoryOrder', []);
    const [lang, setLang] = usePersistentState<'fr' | 'en'>('lang', 'fr');
    const { t } = useTranslations(lang);
    const [activeTab, setActiveTab] = useState<'courses' | 'recettes' | 'historique'>('courses');
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingSession[]>(() => {
        const saved = localStorage.getItem('shoppingHistory');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => { try { localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory)); } catch { } }, [shoppingHistory]);

    const { toasts, removeToast, success } = useToast();

    const { permission, sendNotification, requestPermission } = usePushNotifications();
    const [notificationsEnabled, setNotificationsEnabled] = usePersistentState('notificationsEnabled', false);
    // Track if we've already prompted the user explicitly about enabling notifications
    const [notificationPrompted, setNotificationPrompted] = usePersistentState<boolean>('notificationPrompted', false);
    const [showNotificationBanner, setShowNotificationBanner] = useState(false);

    // Decide when to show the notification onboarding banner (first visit, permission still default)
    useEffect(() => {
        if (permission === 'default' && !notificationsEnabled && !notificationPrompted) {
            const timer = setTimeout(() => setShowNotificationBanner(true), 1200); // slight delay after load
            return () => clearTimeout(timer);
        } else {
            setShowNotificationBanner(false);
        }
    }, [permission, notificationsEnabled, notificationPrompted]);

    const handleEnableNotifications = async () => {
        // Request permission from browser
        const result = await requestPermission();
        setNotificationPrompted(true);
        setShowNotificationBanner(false);
        if (result === 'granted') {
            setNotificationsEnabled(true);
            success(lang === 'fr' ? 'Notifications activées' : 'Notifications enabled', 2500);
        } else if (result === 'denied') {
            success(lang === 'fr' ? 'Notifications refusées' : 'Notifications denied', 2500);
        } else {
            success(lang === 'fr' ? 'Autorisation inchangée' : 'Permission unchanged', 2000);
        }
    };

    const handleDismissNotificationBanner = () => {
        // Mark as prompted so we don't nag continuously; you could choose not to set this to show again later.
        setNotificationPrompted(true);
        setShowNotificationBanner(false);
    };

    useExpiryNotifications({
        ingredients,
        isEnabled: notificationsEnabled && permission === 'granted',
        sendNotification,
        lang
    });

    const resetAllData = () => {
        if (!confirm(t('confirmReset'))) return;
        try { 
            const keys = ['ingredients', 'categories', 'recettes', 'shoppingHistory', 'recipeCategories', 'tutorialSeen', 'notificationsEnabled', 'categoryOrder'];
            for (const k of keys) {
                localStorage.removeItem(k);
            }
        } catch { }
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setShoppingHistory([]);
        setRecipeCategories([]);
        setCategoryOrder([]);
        setHasSeenTutorial(false);
        setNotificationsEnabled(false);
        setShowHelp(true);
        success(lang === 'fr' ? 'Données réinitialisées' : 'Data reset', 2000);
    };
    const toggleLang = () => setLang(prev => prev === 'fr' ? 'en' : 'fr');

    
    const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

    useEffect(() => { }, []);
    const [historySelectMode, setHistorySelectMode] = useState(false);
    const [historySelected, setHistorySelected] = useState<Set<string>>(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const [showInteractiveTutorial, setShowInteractiveTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
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
    const startInteractiveTutorial = () => {
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setRecipeCategories([]);
        setFreshCategories([]);
        setShowInteractiveTutorial(true);
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
        const isSingle = ids.length === 1;
        const message = (() => {
            if (lang === 'fr') return isSingle ? 'Supprimer cette session ?' : `Supprimer ${ids.length} sessions ?`;
            return isSingle ? 'Delete this session?' : `Delete ${ids.length} sessions?`;
        })();
        if (!confirm(message)) return;
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
        shoppingActivePersisted,
        ingredientsManquants,
        shoppingCategoryOrder,
        missingByCategory,
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
                            <div className="flex flex-nowrap gap-1.5 justify-end items-center">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    aria-label={lang === 'fr' ? 'Paramètres' : 'Settings'}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 active:bg-white/30 hover:bg-white/30 backdrop-blur-sm text-[11px] font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[40px]"
                                >
                                    <Settings className="w-4 h-4" /> <span className="hidden sm:inline">{lang === 'fr' ? 'Paramètres' : 'Settings'}</span>
                                </button>
                                <PWAInstallButton
                                    isInstallable={isInstallable}
                                    isInstalled={isInstalled}
                                    onInstall={promptInstall}
                                    label={isInstalled ? t('installPWAAlreadyInstalled') : t('installPWA')}
                                />
                            </div>
                        </div>
                    </div>
                    {showNotificationBanner && (
                        <div className="mt-3 bg-white/15 backdrop-blur-sm rounded-lg p-2 border border-white/30 animate-fade-in flex items-center justify-between gap-2 text-[11px]">
                            <span className="leading-snug">
                                {lang === 'fr'
                                    ? 'Activer les notifications pour recevoir des alertes de péremption.'
                                    : 'Enable notifications to get expiry alerts.'}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={handleEnableNotifications}
                                    className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium"
                                >
                                    {lang === 'fr' ? 'Activer' : 'Enable'}
                                </button>
                                <button
                                    onClick={handleDismissNotificationBanner}
                                    className="px-2 py-1 rounded bg-white/30 hover:bg-white/40 text-white font-medium"
                                >
                                    {lang === 'fr' ? 'Plus tard' : 'Later'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <TabsBar
                    active={activeTab}
                    onChange={setActiveTab}
                    recipesPossibleCount={recettesPossibles.length}
                    hasPriorityRecipes={recettesPrioritaires.length > 0}
                    t={t}
                />

                <div className="p-2 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
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
                            shoppingActivePersisted={shoppingActivePersisted}
                            shoppingSubtotal={shoppingSubtotal}
                            shoppingProgress={shoppingProgress}
                            finishShopping={finishShopping}
                            cancelShopping={cancelShopping}
                            toggleShoppingItem={toggleShoppingItem}
                            toggleIngredient={toggleIngredient}
                            setIngredients={setIngredients}
                            categoryOrder={categoryOrder}
                            setCategoryOrder={setCategoryOrder}
                            management={management}
                            lang={lang}
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
                            lang={lang}
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
                    className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
                    aria-label={t('addIngredient')}
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
            {!showHelp && activeTab === 'recettes' && (
                <button
                    onClick={() => setShowAddRecipeModal(true)}
                    className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
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
                notify={(m,d) => success(m, d || 2000)}
            />

            <AddRecipeModal
                isOpen={showAddRecipeModal}
                onClose={() => setShowAddRecipeModal(false)}
                t={t}
                lang={lang}
                management={management}
                notify={(m,d) => success(m, d || 2000)}
            />

            <HelpTutorial
                open={showHelp}
                onClose={closeHelp}
                lang={lang}
                t={t}
                isFirstTime={!hasSeenTutorial}
                onStartWithDemo={startWithDemoData}
                onStartEmpty={startWithEmptyData}
                onStartInteractiveTutorial={startInteractiveTutorial}
                onToggleLang={toggleLang}
                isInstallable={isInstallable}
                isInstalled={isInstalled}
                onInstallPWA={promptInstall}
            />

            <InteractiveTutorial
                open={showInteractiveTutorial}
                onClose={() => setShowInteractiveTutorial(false)}
                lang={lang}
                t={t}
                ingredients={ingredients}
                recettes={recettes}
                setActiveTab={setActiveTab}
                management={management}
                setShowAddIngredientModal={setShowAddIngredientModal}
                setShowAddRecipeModal={setShowAddRecipeModal}
                shoppingHistory={shoppingHistory}
                setShoppingHistory={setShoppingHistory}
            />

            <ToastContainer toasts={toasts} onClose={removeToast} />
            <SettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
                t={t}
                lang={lang}
                onToggleLang={toggleLang}
                onOpenHelp={openHelp}
                onResetData={resetAllData}
                permission={permission}
                notificationsEnabled={notificationsEnabled}
                onToggleNotifications={() => setNotificationsEnabled(prev => !prev)}
                isInstallable={isInstallable}
                isInstalled={isInstalled}
                onInstallPWA={promptInstall}
                onRequestNotificationPermission={requestPermission}
                onNotifyInfo={(m) => success(m, 2000)}
                onNotifySuccess={(m) => success(m, 2000)}
                onNotifyError={(m) => success(m, 2500)}
                onExportData={management.handleExport}
                onImportData={management.onImportInputChange}
                importError={management.importError}
            />
        </div>
    );
}

export default App;
