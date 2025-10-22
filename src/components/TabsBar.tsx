import React from 'react';
import { ShoppingCart, ChefHat, History } from 'lucide-react';

export type AppTab = 'courses' | 'recettes' | 'historique';

interface TabsBarProps {
    active: AppTab;
    onChange: (tab: AppTab) => void;
    recipesPossibleCount: number;
    hasPriorityRecipes: boolean;
    t: (k: string) => string;
}

export const TabsBar: React.FC<TabsBarProps> = ({ active, onChange, recipesPossibleCount, hasPriorityRecipes, t }) => {
    return (
        <div className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-[env(safe-area-inset-bottom)]">
            <button 
                onClick={() => onChange('courses')} 
                className={`w-full px-1 py-2 font-medium transition-colors flex flex-col items-center justify-center gap-0.5 text-[10px] ${active === 'courses' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}
            >
                <ShoppingCart className="w-5 h-5" />
                {active === 'courses' && <span>{t('tabCourses')}</span>}
            </button>

            <button 
                onClick={() => onChange('recettes')} 
                className={`w-full px-1 py-2 font-medium transition-colors flex flex-col items-center justify-center gap-0.5 text-[10px] relative ${active === 'recettes' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}
            >
                <div className="relative">
                    <ChefHat className="w-5 h-5" />
                    {recipesPossibleCount > 0 && (
                        <span className={`absolute -top-1.5 -right-1.5 ${hasPriorityRecipes ? 'bg-red-500' : 'bg-orange-500'} text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md`}>
                            {recipesPossibleCount}
                        </span>
                    )}
                </div>
                {active === 'recettes' && <span>{t('tabRecettes')}</span>}
            </button>


            <button 
                onClick={() => onChange('historique')} 
                className={`w-full px-1 py-2 font-medium transition-colors flex flex-col items-center justify-center gap-0.5 text-[10px] ${active === 'historique' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}
            >
                <History className="w-5 h-5" />
                {active === 'historique' && <span>{t('tabHistorique')}</span>}
            </button>
        </div>
    );
};
