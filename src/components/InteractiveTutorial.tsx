import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronRight, ChevronLeft, X, Check, Plus } from 'lucide-react';
import { IngredientsType, RecipeType } from '../types';
import { UseManagementReturn } from '../hooks/useManagement';
import { ShoppingSession } from '../lib/exportImport';

interface InteractiveTutorialProps {
    open: boolean;
    onClose: () => void;
    lang: 'fr' | 'en';
    t: (k: string) => string;
    ingredients: IngredientsType;
    recettes: RecipeType[];
    setActiveTab: (tab: 'courses' | 'recettes' | 'gestion' | 'historique') => void;
    management: UseManagementReturn;
    setShowAddIngredientModal: (show: boolean) => void;
    setShowAddRecipeModal: (show: boolean) => void;
    shoppingHistory: ShoppingSession[];
    setShoppingHistory: React.Dispatch<React.SetStateAction<ShoppingSession[]>>;
}

interface TutorialStep {
    id: number;
    title: { fr: string; en: string };
    description: { fr: string; en: string };
    action: 'ingredient' | 'toggle' | 'recipe' | 'showManagement' | 'shoppingPopup' | 'complete';
    data?: any;
}

const getDatePlusDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export function InteractiveTutorial({
    open,
    onClose,
    lang,
    t,
    ingredients,
    recettes,
    setActiveTab,
    management,
    setShowAddIngredientModal,
    setShowAddRecipeModal,
    shoppingHistory: _shoppingHistory,
    setShoppingHistory
}: InteractiveTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [, setCompletedSteps] = useState<Set<number>>(new Set());
    const [waitingForModalClose, setWaitingForModalClose] = useState(false);
    const [hideOverlay, setHideOverlay] = useState(false);
    const [pendingIngredientData, setPendingIngredientData] = useState<any>(null);
    const [pendingRecipeData, setPendingRecipeData] = useState<any>(null);
    const [showShoppingPopup, setShowShoppingPopup] = useState(false);
    const [shoppingCheckedItems, setShoppingCheckedItems] = useState<Set<string>>(new Set());

    const steps: TutorialStep[] = [
        {
            id: 0,
            title: {
                fr: '1. Ajouter des tomates 🍅',
                en: '1. Add tomatoes 🍅'
            },
            description: {
                fr: 'Créons notre premier ingrédient : des tomates fraîches. Cliquez sur "Ajouter cet ingrédient" ci-dessous.',
                en: 'Let\'s create our first ingredient: fresh tomatoes. Click "Add this ingredient" below.'
            },
            action: 'ingredient',
            data: {
                name: 'Tomatoes',
                nameFr: 'Tomates',
                category: '🥗 Fresh vegetables',
                categoryFr: '🥗 Légumes frais',
                price: 2.50,
                parts: 4,
                expiryDate: getDatePlusDays(10),
                isFresh: true
            }
        },
        {
            id: 1,
            title: {
                fr: '2. Ajouter de la viande 🥩',
                en: '2. Add meat 🥩'
            },
            description: {
                fr: 'Parfait ! Maintenant ajoutons de la viande hachée dans la même catégorie.',
                en: 'Perfect! Now let\'s add ground meat in the same category.'
            },
            action: 'ingredient',
            data: {
                name: 'Ground Meat',
                nameFr: 'Viande Hachée',
                category: '🧊 Fresh products',
                categoryFr: '🧊 Produits frais',
                price: 5.00,
                parts: 4,
                expiryDate: getDatePlusDays(2),
                isFresh: true
            }
        },
        {
            id: 2,
            title: {
                fr: '3. Ajouter des pâtes 🍝',
                en: '3. Add pasta 🍝'
            },
            description: {
                fr: 'Excellent ! Pour finir, ajoutons des pâtes dans une nouvelle catégorie "Pâtes".',
                en: 'Excellent! Finally, let\'s add pasta in a new "Pasta" category.'
            },
            action: 'ingredient',
            data: {
                name: 'Pasta',
                nameFr: 'Pâtes',
                category: '🍝 Pasta',
                categoryFr: '🍝 Pâtes',
                price: 1.50,
                parts: 6,
                expiryDate: getDatePlusDays(50),
                isFresh: false
            }
        },
        {
            id: 3,
            title: {
                fr: '4. Créer une recette 🍝',
                en: '4. Create a recipe 🍝'
            },
            description: {
                fr: 'Maintenant, créons notre recette de Pâtes Bolognaise ! Cliquez sur le bouton ci-dessous pour l\'ajouter avec tous les ingrédients.',
                en: 'Now, let\'s create our Pasta Bolognese recipe! Click the button below to add it with all ingredients.'
            },
            action: 'recipe',
            data: {
                name: 'Pasta Bolognese',
                nameFr: 'Pâtes Bolognaise',
                category: 'Main Courses',
                categoryFr: 'Plats Principaux',
                ingredients: lang === 'fr' ? ['Tomates', 'Viande Hachée', 'Pâtes'] : ['Tomatoes', 'Ground Meat', 'Pasta']
            }
        },
        {
            id: 4,
            title: {
                fr: '5. Faire les courses 🛒',
                en: '5. Go shopping 🛒'
            },
            description: {
                fr: 'Maintenant, faisons les courses ! Cochez tous les ingrédients dans la liste ci-dessous.',
                en: 'Now, let\'s go shopping! Check all the ingredients in the list below.'
            },
            action: 'shoppingPopup',
            data: {}
        },
        {
            id: 5,
            title: {
                fr: '6. Voir la recette disponible ! 🎉',
                en: '6. See the recipe available! 🎉'
            },
            description: {
                fr: 'Félicitations ! Allez dans l\'onglet "Recettes" pour voir que votre recette de Pâtes Bolognaise est maintenant disponible car tous les ingrédients sont en stock !',
                en: 'Congratulations! Go to the "Recipes" tab to see that your Pasta Bolognese recipe is now available because all ingredients are in stock!'
            },
            action: 'complete',
            data: {}
        }
    ];

    const currentStepData = steps[currentStep];

    useEffect(() => {
        if (open) {
            // Reset tutorial to beginning when opened
            setCurrentStep(0);
            setCompletedSteps(new Set());
            setWaitingForModalClose(false);
            setHideOverlay(false);
            setPendingIngredientData(null);
            setPendingRecipeData(null);
            setShowShoppingPopup(false);
            setShoppingCheckedItems(new Set());
            setActiveTab('courses');
        }
    }, [open, setActiveTab]);

    // Watch for ingredient/recipe count changes to detect when items are added
    const prevIngredientsCount = useRef(Object.keys(ingredients).length);
    const prevRecettesCount = useRef(recettes.length);

    // Pre-fill ingredient modal when it should be shown
    useEffect(() => {
        if (pendingIngredientData) {
            const { ingredientName, categoryName, categoryExists, data } = pendingIngredientData;
            
            // Wait longer for modal to be fully rendered before filling
            const fillTimer = setTimeout(() => {
                console.log('Filling ingredient data:', { ingredientName, categoryName, price: data.price, parts: data.parts, expiryDate: data.expiryDate });
                
                // If it's a new category, set that up FIRST
                if (!categoryExists) {
                    management.setNewIngredientCategoryInput(categoryName);
                    management.handleIngredientCategoryChange('__NEW_CATEGORY__');
                }
                
                // Then pre-fill all the modal fields with tutorial data
                management.setNewIngredient({
                    name: ingredientName,
                    category: categoryExists ? categoryName : '',
                    price: data.price.toString(),
                    parts: data.parts.toString(),
                    expiryDate: data.expiryDate || ''
                });
                
                console.log('Ingredient data filled successfully');
                setPendingIngredientData(null);
            }, 500); // Increased delay to 500ms for more reliable filling
            
            return () => clearTimeout(fillTimer);
        }
    }, [pendingIngredientData, management]);

    // Pre-fill recipe modal when it should be shown
    useEffect(() => {
        if (pendingRecipeData) {
            const { recipeName, categoryName, categoryExists, data } = pendingRecipeData;
            
            // Wait for modal to be fully rendered before filling
            const fillTimer = setTimeout(() => {
                console.log('Filling recipe data:', { recipeName, categoryName, ingredients: data.ingredients });
                
                // If it's a new category, set that up FIRST
                if (!categoryExists) {
                    management.setNewRecipeCategoryInput(categoryName);
                    management.handleRecipeCategoryChange('__NEW_CATEGORY__');
                }
                
                // Pre-fill the modal with tutorial data
                management.setNewRecipe({
                    nom: recipeName,
                    categorie: categoryExists ? categoryName : '',
                    ingredients: data.ingredients
                });
                
                console.log('Recipe data filled successfully');
                setPendingRecipeData(null);
            }, 500); // Increased delay to 500ms for more reliable filling
            
            return () => clearTimeout(fillTimer);
        }
    }, [pendingRecipeData, management]);

    useEffect(() => {
        if (!waitingForModalClose) return;

        const currentIngredientsCount = Object.keys(ingredients).length;
        const currentRecettesCount = recettes.length;

        // Check if an ingredient or recipe was added
        if (currentIngredientsCount > prevIngredientsCount.current || 
            currentRecettesCount > prevRecettesCount.current) {
            
            // Mark step as completed
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setWaitingForModalClose(false);
            
            // Show the tutorial overlay again
            setHideOverlay(false);
            
            // Move to next step
            setTimeout(() => {
                if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                    
                    // Switch tab if needed
                    if (steps[currentStep + 1].action === 'recipe') {
                        setActiveTab('recettes');
                    }
                }
            }, 500);
        }

        prevIngredientsCount.current = currentIngredientsCount;
        prevRecettesCount.current = currentRecettesCount;
    }, [ingredients, recettes, waitingForModalClose, currentStep, steps, setActiveTab]);

    const handleAddIngredient = () => {
        const data = currentStepData.data;
        const ingredientName = lang === 'fr' ? data.nameFr : data.name;
        const categoryName = lang === 'fr' ? data.categoryFr : data.category;

        // Check if category exists
        const categoryExists = Object.keys(management.categories).includes(categoryName);

        // IMPORTANT: Add fresh category BEFORE opening modal so expiry field shows
        if (data.isFresh && !management.freshCategories.includes(categoryName)) {
            management.setFreshCategories(prev => [...prev, categoryName]);
        }

        // Mark that we're waiting for the modal to close
        setWaitingForModalClose(true);

        // Hide the tutorial overlay while modal is open
        setHideOverlay(true);

        // Open the modal AFTER a small delay to ensure fresh category is set
        setTimeout(() => {
            setShowAddIngredientModal(true);
            
            // Store the data to be filled after modal opens
            // We do this AFTER opening modal so the effect triggers correctly
            setTimeout(() => {
                setPendingIngredientData({
                    ingredientName,
                    categoryName,
                    categoryExists,
                    data
                });
            }, 50);
        }, 100);
    };



    const handleAddRecipe = () => {
        const data = currentStepData.data;
        const recipeName = lang === 'fr' ? data.nameFr : data.name;
        const categoryName = lang === 'fr' ? data.categoryFr : data.category;

        // Check if category exists
        const categoryExists = management.recipeCategories.includes(categoryName);

        // Store the data to be filled after modal opens
        setPendingRecipeData({
            recipeName,
            categoryName,
            categoryExists,
            data
        });

        // Mark that we're waiting for the modal to close
        setWaitingForModalClose(true);

        // Hide the tutorial overlay while modal is open
        setHideOverlay(true);

        // Switch to recipes tab first
        setActiveTab('recettes');

        // Open the modal
        setShowAddRecipeModal(true);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            
            // Switch tab based on step
            if (steps[currentStep + 1].action === 'recipe') {
                setActiveTab('recettes');
            } else if (steps[currentStep + 1].action === 'ingredient' || steps[currentStep + 1].action === 'toggle') {
                setActiveTab('courses');
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            
            // Switch tab based on step
            if (steps[currentStep - 1].action === 'recipe') {
                setActiveTab('recettes');
            } else {
                setActiveTab('courses');
            }
        }
    };

    const handleSkipTutorial = () => {
        if (confirm(lang === 'fr' 
            ? 'Voulez-vous vraiment quitter le tutoriel ?' 
            : 'Do you really want to skip the tutorial?')) {
            onClose();
        }
    };

    const handleComplete = () => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const ingredientName = currentStepData.action === 'ingredient' 
        ? (lang === 'fr' ? currentStepData.data.nameFr : currentStepData.data.name)
        : '';
    
    const ingredientExists = ingredientName && ingredients[ingredientName];
    
    // For certain steps, make the overlay transparent so users can see the app behind
    const isViewingStep = false; // No longer needed since showManagement step was removed

    return (
        <Transition.Root show={open && !hideOverlay} as={Fragment}>
            <Dialog as="div" className="relative z-[300]" onClose={() => {}}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`fixed inset-0 ${isViewingStep ? 'bg-black/20 backdrop-blur-none' : 'bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-sm'}`} />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className={`flex min-h-full p-4 ${isViewingStep ? 'items-start justify-end pt-20' : 'items-center justify-center'}`}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className={`w-full transform overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 ${isViewingStep ? 'max-w-md' : 'max-w-lg'}`}>
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Dialog.Title className="text-lg font-bold flex items-center gap-2">
                                            🍝 {lang === 'fr' ? 'Tutoriel Interactif' : 'Interactive Tutorial'}
                                        </Dialog.Title>
                                        <button
                                            onClick={handleSkipTutorial}
                                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                            aria-label={t('close')}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        {steps.map((step, idx) => (
                                            <div key={step.id} className="flex-1 flex items-center gap-1">
                                                <div
                                                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                                        idx <= currentStep
                                                            ? 'bg-white'
                                                            : 'bg-white/30'
                                                    }`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/90 mt-2">
                                        {lang === 'fr' ? 'Étape' : 'Step'} {currentStep + 1} / {steps.length}
                                    </p>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                                            {currentStepData.title[lang]}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {currentStepData.description[lang]}
                                        </p>
                                    </div>

                                    {/* Ingredient Preview */}
                                    {currentStepData.action === 'ingredient' && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 mb-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                                                        {lang === 'fr' ? currentStepData.data.nameFr : currentStepData.data.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {lang === 'fr' ? 'Catégorie: ' : 'Category: '}
                                                        <span className="font-medium">
                                                            {lang === 'fr' ? currentStepData.data.categoryFr : currentStepData.data.category}
                                                        </span>
                                                        {currentStepData.data.isFresh && ' ❄️'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {currentStepData.data.price.toFixed(2)}€
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {currentStepData.data.parts} {lang === 'fr' ? 'parts' : 'parts'}
                                                    </p>
                                                </div>
                                            </div>
                                            {currentStepData.data.expiryDate && (
                                                <div className="text-xs text-orange-600 bg-white/60 rounded px-2 py-1 inline-block">
                                                    {lang === 'fr' ? 'Expire le: ' : 'Expires: '}{currentStepData.data.expiryDate}
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    {/* Recipe Preview */}
                                    {currentStepData.action === 'recipe' && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 mb-4">
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                                                    {lang === 'fr' ? currentStepData.data.nameFr : currentStepData.data.name}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                    {lang === 'fr' ? 'Catégorie: ' : 'Category: '}
                                                    <span className="font-medium">
                                                        {lang === 'fr' ? currentStepData.data.categoryFr : currentStepData.data.category}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="bg-white/60 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                                    {lang === 'fr' ? 'Ingrédients:' : 'Ingredients:'}
                                                </p>
                                                <ul className="space-y-1">
                                                    {currentStepData.data.ingredients.map((ing: string) => (
                                                        <li key={ing} className="text-xs text-gray-600 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                            {ing}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shopping Popup Preview */}
                                    {currentStepData.action === 'shoppingPopup' && (
                                        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 border-2 border-teal-200 mb-4">
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                                                    <span className="text-lg">🛒</span>
                                                    {lang === 'fr' ? 'Liste de courses' : 'Shopping list'}
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    {lang === 'fr' ? 'Une popup va s\'ouvrir avec la liste des ingrédients à acheter' : 'A popup will open with the list of ingredients to buy'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Complete Preview */}
                                    {currentStepData.action === 'complete' && (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-4 text-center">
                                            <div className="text-6xl mb-4">🎉</div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {lang === 'fr' 
                                                    ? 'Vous savez maintenant comment utiliser CookSmart ! Explorez les différents onglets pour gérer vos ingrédients, créer des recettes et voir ce que vous pouvez cuisiner.'
                                                    : 'You now know how to use CookSmart! Explore the different tabs to manage ingredients, create recipes and see what you can cook.'
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {currentStepData.action === 'ingredient' && !ingredientExists && (
                                            <button
                                                onClick={handleAddIngredient}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                            >
                                                <Plus className="w-5 h-5" />
                                                {lang === 'fr' ? 'Ajouter cet ingrédient' : 'Add this ingredient'}
                                            </button>
                                        )}

                                        {currentStepData.action === 'ingredient' && ingredientExists && (
                                            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2 text-green-700">
                                                <Check className="w-5 h-5" />
                                                <span className="font-semibold text-sm">
                                                    {lang === 'fr' ? 'Ingrédient ajouté !' : 'Ingredient added!'}
                                                </span>
                                            </div>
                                        )}


                                        {currentStepData.action === 'recipe' && !recettes.some(r => r.nom === (lang === 'fr' ? currentStepData.data.nameFr : currentStepData.data.name)) && (
                                            <button
                                                onClick={handleAddRecipe}
                                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                            >
                                                <Plus className="w-5 h-5" />
                                                {lang === 'fr' ? 'Créer cette recette' : 'Create this recipe'}
                                            </button>
                                        )}

                                        {currentStepData.action === 'recipe' && recettes.some(r => r.nom === (lang === 'fr' ? currentStepData.data.nameFr : currentStepData.data.name)) && (
                                            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2 text-green-700">
                                                <Check className="w-5 h-5" />
                                                <span className="font-semibold text-sm">
                                                    {lang === 'fr' ? 'Recette créée !' : 'Recipe created!'}
                                                </span>
                                            </div>
                                        )}

                                        {currentStepData.action === 'shoppingPopup' && (
                                            <button
                                                onClick={() => setShowShoppingPopup(true)}
                                                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                            >
                                                <Check className="w-5 h-5" />
                                                {lang === 'fr' ? 'Ouvrir la liste de courses' : 'Open shopping list'}
                                            </button>
                                        )}

                                        {currentStepData.action === 'complete' && (
                                            <button
                                                onClick={handleComplete}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                            >
                                                <Check className="w-5 h-5" />
                                                {lang === 'fr' ? 'Terminer le tutoriel' : 'Complete tutorial'}
                                            </button>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={handlePrevious}
                                                disabled={currentStep === 0}
                                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                {lang === 'fr' ? 'Précédent' : 'Previous'}
                                            </button>
                                            <button
                                                onClick={handleNext}
                                                disabled={currentStep === steps.length - 1}
                                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {lang === 'fr' ? 'Suivant' : 'Next'}
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

            {/* Shopping List Popup */}
            <Transition.Root show={showShoppingPopup} as={Fragment}>
                <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl">
                                    <div className="bg-gradient-to-r from-teal-500 to-green-500 px-6 py-4 text-white">
                                        <Dialog.Title className="text-lg font-bold">
                                            🛒 {lang === 'fr' ? 'Liste de Courses' : 'Shopping List'}
                                        </Dialog.Title>
                                        <p className="text-sm text-white/90 mt-1">
                                            {lang === 'fr' ? 'Cochez tous les ingrédients' : 'Check all ingredients'}
                                        </p>
                                    </div>

                                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                                        <div className="space-y-3">
                                            {Object.keys(ingredients).map(ingredientName => (
                                                <label
                                                    key={ingredientName}
                                                    className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                        checked={shoppingCheckedItems.has(ingredientName)}
                                                        onChange={() => {
                                                            setShoppingCheckedItems(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(ingredientName)) {
                                                                    next.delete(ingredientName);
                                                                } else {
                                                                    next.add(ingredientName);
                                                                }
                                                                return next;
                                                            });
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800">{ingredientName}</h4>
                                                        <p className="text-xs text-gray-600">
                                                            {ingredients[ingredientName].price.toFixed(2)}€ • {ingredients[ingredientName].parts} {lang === 'fr' ? 'parts' : 'parts'}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 flex gap-3">
                                        <button
                                            onClick={() => {
                                                // Calculate total price for the shopping session
                                                let totalPrice = 0;
                                                const itemsList: string[] = [];
                                                
                                                // Mark all checked ingredients as in stock
                                                management.setIngredients((prev: IngredientsType) => {
                                                    const updated = { ...prev };
                                                    shoppingCheckedItems.forEach(ingredientName => {
                                                        if (updated[ingredientName]) {
                                                            updated[ingredientName] = {
                                                                ...updated[ingredientName],
                                                                inStock: true,
                                                                expiryDate: updated[ingredientName].expiryDate || getDatePlusDays(2)
                                                            };
                                                            // Add to history list and calculate total
                                                            itemsList.push(ingredientName);
                                                            totalPrice += updated[ingredientName].price;
                                                        }
                                                    });
                                                    return updated;
                                                });
                                                
                                                // Add shopping session to history
                                                const newSession: ShoppingSession = {
                                                    id: `tutorial-${Date.now()}`,
                                                    date: new Date().toISOString(),
                                                    items: itemsList,
                                                    total: totalPrice
                                                };
                                                setShoppingHistory((prev: ShoppingSession[]) => [newSession, ...prev]);
                                                
                                                // Close popup and advance to next step
                                                setShowShoppingPopup(false);
                                                setShoppingCheckedItems(new Set());
                                                setCompletedSteps(prev => new Set([...prev, currentStep]));
                                                setTimeout(() => {
                                                    if (currentStep < steps.length - 1) {
                                                        setCurrentStep(currentStep + 1);
                                                        setActiveTab('recettes');
                                                    }
                                                }, 300);
                                            }}
                                            disabled={shoppingCheckedItems.size === 0}
                                            className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {lang === 'fr' ? 'Valider mes courses' : 'Confirm my purchases'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Transition.Root>
    );
}
