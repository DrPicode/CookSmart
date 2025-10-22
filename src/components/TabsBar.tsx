import React from 'react';
import { ShoppingCart, ChefHat, Edit2 } from 'lucide-react';

export type AppTab = 'courses' | 'recettes' | 'gestion' | 'historique';

interface TabsBarProps {
    active: AppTab;
    onChange: (tab: AppTab) => void;
    recipesPossibleCount: number;
    t: (k: string) => string;
}

export const TabsBar: React.FC<TabsBarProps> = ({ active, onChange, recipesPossibleCount, t }) => {
    return (
        <div className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-[env(safe-area-inset-bottom)]">
            <button onClick={() => onChange('courses')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${active === 'courses' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                <ShoppingCart className="w-6 h-6" />
                <span>{t('tabCourses')}</span>
            </button>
            <button onClick={() => onChange('recettes')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${active === 'recettes' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                <ChefHat className="w-6 h-6" />
                <span>{t('tabRecettes')} ({recipesPossibleCount})</span>
            </button>
            <button onClick={() => onChange('gestion')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${active === 'gestion' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                <Edit2 className="w-6 h-6" />
                <span>{t('tabGestion')}</span>
            </button>
            <button onClick={() => onChange('historique')} className={`w-full px-2 py-4 font-medium transition-colors flex items-center justify-center gap-1 text-xs ${active === 'historique' ? 'bg-orange-50 text-orange-600 border-t-2 border-orange-500' : 'text-gray-500'}`}>
                <span className="text-sm font-semibold">{t('tabHistorique')}</span>
            </button>
        </div>
    );
};
