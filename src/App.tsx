import { useState, useEffect, useCallback } from 'react';
import { ConfirmProvider, useConfirm } from './hooks/useConfirm';
import { ShoppingSession, loadDemoData } from './lib/exportImport';
import { ChefHat, Plus, Settings, Edit2, Check } from 'lucide-react';
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
import { useNotificationOnboarding } from './hooks/useNotificationOnboarding';

function AppInner() {
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
        try {
            const saved = localStorage.getItem('shoppingHistory');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    useEffect(() => {
        try { localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory)); } catch { /* ignore */ }
    }, [shoppingHistory]);

    const { toasts, removeToast, success } = useToast();

    const { permission, sendNotification, requestPermission, unsubscribe, subscribe, isSubscribed } = usePushNotifications();
    const [notificationsEnabled, setNotificationsEnabled] = usePersistentState('notificationsEnabled', false);
    // If permission granted and local flag enabled but not actually subscribed, attempt silent subscribe
    useEffect(() => {
        if (permission === 'granted' && notificationsEnabled && !isSubscribed) {
            (async () => {
                try { await subscribe(); } catch { /* ignore */ }
            })();
        }
    }, [permission, notificationsEnabled, isSubscribed, subscribe]);
    const [notificationPrompted, setNotificationPrompted] = usePersistentState<boolean>('notificationPrompted', false);
    const onboarding = useNotificationOnboarding({
        permission,
        notificationsEnabled,
        notificationPrompted,
        setNotificationPrompted: (v) => setNotificationPrompted(v),
        requestPermission,
        onGranted: () => setNotificationsEnabled(true)
    });

    useExpiryNotifications({
        ingredients,
        isEnabled: notificationsEnabled && permission === 'granted',
        sendNotification,
        lang
    });

    const confirmDialog = useConfirm();
    const RESET_KEYS = ['ingredients','categories','recettes','shoppingHistory','recipeCategories','tutorialSeen','notificationsEnabled','notificationPrompted','categoryOrder'];
    const resetAllData = useCallback(async () => {
        const ok = await confirmDialog({
            title: lang === 'fr' ? 'Réinitialiser les données' : 'Reset data',
            message: t('confirmReset'),
            confirmLabel: lang === 'fr' ? 'Réinitialiser' : 'Reset',
            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
            variant: 'danger'
        });
        if (!ok) return;
        try { for (const k of RESET_KEYS) localStorage.removeItem(k); } catch { /* ignore */ }
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setShoppingHistory([]);
        setRecipeCategories([]);
        setCategoryOrder([]);
        setHasSeenTutorial(false);
        setNotificationsEnabled(false);
        setNotificationPrompted(false);
        setShowHelp(true);
        try { unsubscribe(); } catch { }
        success(lang === 'fr' ? 'Données réinitialisées' : 'Data reset', 2000);
    }, [t, unsubscribe, success, lang]);
    const toggleLang = useCallback(() => setLang(prev => prev === 'fr' ? 'en' : 'fr'), []);

    
    const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

    // removed empty effect
    const [historySelectMode, setHistorySelectMode] = useState(false);
    const [historySelected, setHistorySelected] = useState<Set<string>>(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const [showInteractiveTutorial, setShowInteractiveTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    // Centralized edit modes for courses (ingredients) and recipes tabs
    const [coursesEditMode, setCoursesEditMode] = useState(false);
    const [recipesEditMode, setRecipesEditMode] = useState(false);
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
    const startWithDemoData = useCallback(() => {
        const demoData = loadDemoData();
        setIngredients(demoData.ingredients);
        setCategories(demoData.categories);
        setRecettes(demoData.recettes);
        setRecipeCategories(demoData.recipeCategories);
        setFreshCategories(demoData.freshCategories);
        setShoppingHistory(demoData.shoppingHistory);
        onboarding.triggerPostStartPrompt();
    }, [onboarding]);
    const startWithEmptyData = useCallback(() => {
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setRecipeCategories([]);
        setFreshCategories([]);
        onboarding.triggerPostStartPrompt();
    }, [onboarding]);
    const startInteractiveTutorial = useCallback(() => {
        setIngredients({});
        setCategories({});
        setRecettes([]);
        setRecipeCategories([]);
        setFreshCategories([]);
        setShowInteractiveTutorial(true);
    }, []);
    const toggleHistorySelect = useCallback((id: string) => {
        setHistorySelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);
    const deleteHistoryIds = useCallback(async (ids: string[]) => {
        if (ids.length === 0) return;
        const isSingle = ids.length === 1;
        const message = (() => {
            if (lang === 'fr') return isSingle ? 'Supprimer cette session ?' : `Supprimer ${ids.length} sessions ?`;
            return isSingle ? 'Delete this session?' : `Delete ${ids.length} sessions?`;
        })();
        const ok = await confirmDialog({
            title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
            message,
            confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
            cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
            variant: 'danger'
        });
        if (!ok) return;
        setShoppingHistory(prev => prev.filter(s => !ids.includes(s.id)));
        setHistorySelected(new Set());
        setHistorySelectMode(false);
    }, [lang, confirmDialog]);
    const selectAllHistory = useCallback(() => {
        if (historySelected.size === shoppingHistory.length) {
            setHistorySelected(new Set());
        } else {
            setHistorySelected(new Set(shoppingHistory.map(s => s.id)));
        }
    }, [historySelected, shoppingHistory]);

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
        t,
        notifySuccess: (message, duration) => success(message, duration || 2000),
        onAfterImport: () => setShowSettings(false)
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
                    {onboarding.showBanner && (
                        <div className="mt-3 bg-white/15 backdrop-blur-sm rounded-lg p-2 border border-white/30 animate-fade-in flex items-center justify-between gap-2 text-[11px]">
                            <span className="leading-snug">
                                {lang === 'fr'
                                    ? 'Activer les notifications pour recevoir des alertes de péremption.'
                                    : 'Enable notifications to get expiry alerts.'}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={async () => {
                                        await onboarding.handleBannerEnable();
                                        if (permission === 'granted') success(lang === 'fr' ? 'Notifications activées' : 'Notifications enabled', 2500);
                                    }}
                                    className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium"
                                >
                                    {lang === 'fr' ? 'Activer' : 'Enable'}
                                </button>
                                <button
                                    onClick={onboarding.dismissBanner}
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
                            editMode={coursesEditMode}
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
                            editMode={recipesEditMode}
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
                            lang={lang}
                            editMode={historySelectMode}
                        />
                    )}
                </div>
            </div>
            {/* Floating action buttons (stacked pencil above plus) */}
            {!showHelp && activeTab === 'courses' && (
                <div className="fixed bottom-[calc(4.0rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] flex flex-col items-center gap-2.5">
                    {(() => {
                        let editAriaLabel: string;
                        let editTitle: string;
                        if (coursesEditMode) {
                            editAriaLabel = lang === 'fr' ? 'Terminer modifications' : 'Finish editing';
                            editTitle = lang === 'fr' ? 'Terminer' : 'Done';
                        } else {
                            editAriaLabel = lang === 'fr' ? 'Modifier ingrédients' : 'Edit ingredients';
                            editTitle = lang === 'fr' ? 'Modifier' : 'Edit';
                        }
                        return (
                            <button
                                onClick={() => setCoursesEditMode(m => !m)}
                                className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center bg-white text-blue-600 border border-blue-200 hover:shadow-lg active:scale-[.97] transition-transform ${coursesEditMode ? 'ring-2 ring-blue-500' : ''}`}
                                aria-label={editAriaLabel}
                                title={editTitle}
                            >
                                {coursesEditMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </button>
                        );
                    })()}
                    <button
                        onClick={() => setShowAddIngredientModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
                        aria-label={t('addIngredient')}
                        title={t('addIngredient')}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            )}
            {!showHelp && activeTab === 'historique' && shoppingHistory.length > 0 && (
                <div className="fixed bottom-[calc(4.0rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] flex flex-col items-center gap-2.5">
                    {(() => {
                        let editAriaLabel: string;
                        let editTitle: string;
                        const mode = historySelectMode;
                        if (mode) {
                            editAriaLabel = lang === 'fr' ? 'Terminer sélection' : 'Finish selection';
                            editTitle = lang === 'fr' ? 'Terminer' : 'Done';
                        } else {
                            editAriaLabel = lang === 'fr' ? 'Gérer historique' : 'Manage history';
                            editTitle = lang === 'fr' ? 'Gérer' : 'Manage';
                        }
                        return (
                            <button
                                onClick={() => setHistorySelectMode(m => !m)}
                                className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center bg-white text-orange-600 border border-orange-200 hover:shadow-lg active:scale-[.97] transition-transform ${historySelectMode ? 'ring-2 ring-orange-500' : ''}`}
                                aria-label={editAriaLabel}
                                title={editTitle}
                            >
                                {historySelectMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </button>
                        );
                    })()}
                </div>
            )}
            {!showHelp && activeTab === 'recettes' && (
                <div className="fixed bottom-[calc(4.0rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-[60] flex flex-col items-center gap-2.5">
                    {(() => {
                        let editAriaLabel: string;
                        let editTitle: string;
                        if (recipesEditMode) {
                            editAriaLabel = lang === 'fr' ? 'Terminer modifications' : 'Finish editing';
                            editTitle = lang === 'fr' ? 'Terminer' : 'Done';
                        } else {
                            editAriaLabel = lang === 'fr' ? 'Modifier recettes' : 'Edit recipes';
                            editTitle = lang === 'fr' ? 'Modifier' : 'Edit';
                        }
                        return (
                            <button
                                onClick={() => setRecipesEditMode(m => !m)}
                                className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center bg-white text-purple-600 border border-purple-200 hover:shadow-lg active:scale-[.97] transition-transform ${recipesEditMode ? 'ring-2 ring-purple-500' : ''}`}
                                aria-label={editAriaLabel}
                                title={editTitle}
                            >
                                {recipesEditMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </button>
                        );
                    })()}
                    <button
                        onClick={() => setShowAddRecipeModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:shadow-xl active:scale-[.97] transition-transform"
                        aria-label={t('addRecipe')}
                        title={t('addRecipe')}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
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
                onCompleted={() => {
                    onboarding.triggerPostStartPrompt();
                }}
                onExitEarly={() => {
                    // When user skips tutorial, still prompt for notifications if eligible
                    onboarding.triggerPostStartPrompt();
                }}
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
                notificationsEnabled={notificationsEnabled}
                onToggleNotifications={() => setNotificationsEnabled(prev => !prev)}
                isInstallable={isInstallable}
                isInstalled={isInstalled}
                onInstallPWA={promptInstall}
                onNotifyInfo={(m) => success(m, 2000)}
                onNotifySuccess={(m) => success(m, 2000)}
                onNotifyError={(m) => success(m, 2500)}
                onExportData={management.handleExport}
                onImportData={management.onImportInputChange}
                importError={management.importError}
                pushPermission={permission}
                isSubscribed={isSubscribed}
                onRequestPushPermission={requestPermission}
                onUnsubscribePush={async () => {
                    setPushBusy(true);
                    try { return await unsubscribe(); } finally { setPushBusy(false); }
                }}
                onSubscribePush={async () => {
                    setPushBusy(true);
                    try { return await subscribe(); } finally { setPushBusy(false); }
                }}
                pushBusy={pushBusy}
            />

            {/* Post start notification prompt modal */}
            {onboarding.showPostStartPrompt && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onboarding.closePostStartPrompt}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onboarding.closePostStartPrompt(); }}
                        aria-label={lang === 'fr' ? 'Fermer la fenêtre' : 'Close dialog backdrop'}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] max-w-md p-6 ring-1 ring-black/10 animate-scale-fade-in">
                        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <span>🔔</span> {lang === 'fr' ? 'Recevoir des alertes' : 'Get alerts'}
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {lang === 'fr'
                                ? 'Activez les notifications pour être prévenu quand un ingrédient approche de sa date de péremption.'
                                : 'Enable notifications to get alerted when an ingredient is nearing expiry.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                            <button
                                onClick={async () => {
                                    await onboarding.handlePostStartEnable();
                                    if (permission === 'granted') {
                                        setNotificationsEnabled(true);
                                        setPushBusy(true);
                                        try {
                                            const sub = await subscribe();
                                            if (sub) success(lang === 'fr' ? 'Notifications activées' : 'Notifications enabled', 2500);
                                            else success(lang === 'fr' ? 'Permission accordée (push indisponible)' : 'Permission granted (push unavailable)', 2500);
                                        } catch {
                                            success(lang === 'fr' ? 'Permission accordée (erreur abonnement)' : 'Permission granted (subscription error)', 2500);
                                        } finally {
                                            setPushBusy(false);
                                        }
                                    }
                                    onboarding.closePostStartPrompt();
                                }}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg active:scale-[0.98]"
                            >
                                {lang === 'fr' ? 'Activer' : 'Enable'}
                            </button>
                            <button
                                onClick={onboarding.closePostStartPrompt}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl shadow"
                            >
                                {lang === 'fr' ? 'Plus tard' : 'Later'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {pushBusy && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white/90 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium text-gray-700">
                        <svg className="animate-spin h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        {lang === 'fr' ? 'Abonnement aux notifications…' : 'Subscribing to notifications…'}
                    </div>
                </div>
            )}
        </div>
    );
}

export function App() {
    return (
        <ConfirmProvider>
            <AppInner />
        </ConfirmProvider>
    );
}

export default App;
