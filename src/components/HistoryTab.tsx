import React from 'react';
import { ShoppingSession } from '../exportImport';

interface HistoryTabProps {
    t: (k: string) => string;
    shoppingHistory: ShoppingSession[];
    historySelectMode: boolean;
    setHistorySelectMode: (v: boolean) => void;
    historySelected: Set<string>;
    toggleHistorySelect: (id: string) => void;
    selectAllHistory: () => void;
    deleteHistoryIds: (ids: string[]) => void;
    clearHistory: () => void;
    lang: 'fr' | 'en';
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
    t,
    shoppingHistory,
    historySelectMode,
    setHistorySelectMode,
    historySelected,
    toggleHistorySelect,
    selectAllHistory,
    deleteHistoryIds,
    clearHistory,
    lang
}) => {
    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-orange-800">{t('historyIntro')}</p>
                    {shoppingHistory.length > 0 && (
                        <button
                            onClick={() => {
                                if (historySelectMode) {
                                    setHistorySelectMode(false);
                                } else {
                                    setHistorySelectMode(true);
                                }
                            }}
                            className="text-[10px] px-2 py-1 rounded bg-orange-200 text-orange-800 hover:bg-orange-300"
                        >{historySelectMode ? t('done') : t('manage')}</button>
                    )}
                </div>
            </div>
            {shoppingHistory.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-8">{t('emptyHistory')}</p>
            ) : (
                <div className="space-y-3">
                    {historySelectMode && (
                        <div className="flex items-center gap-2 text-[10px] bg-white border rounded p-2">
                            <button onClick={selectAllHistory} className="px-2 py-1 rounded bg-gray-200 text-gray-700">{historySelected.size === shoppingHistory.length ? t('deselectAll') : t('selectAll')}</button>
                            <span className="text-gray-500">{historySelected.size} sélectionné(s)</span>
                            <button
                                disabled={historySelected.size === 0}
                                onClick={() => deleteHistoryIds(Array.from(historySelected))}
                                className="ml-auto px-2 py-1 rounded bg-red-500 disabled:opacity-40 text-white"
                            >{t('deleteSelected')}</button>
                        </div>
                    )}
                    {shoppingHistory.map(session => {
                        const checked = historySelected.has(session.id);
                        return (
                            <div key={session.id} className={`border rounded-lg p-3 bg-white shadow-sm relative ${checked ? 'ring-2 ring-orange-400' : ''}`}>
                                {historySelectMode && (
                                    <label className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-3 h-3"
                                            checked={checked}
                                            onChange={() => toggleHistorySelect(session.id)}
                                        />
                                    </label>
                                )}
                                <div className="flex justify-between items-center mb-1 pr-6">
                                    <h4 className="text-sm font-semibold">Courses du {new Date(session.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</h4>
                                    <span className="text-xs font-medium text-green-600">{session.total.toFixed(2)} €</span>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-2">{session.items.length} article{session.items.length > 1 ? 's' : ''}</p>
                                <div className="flex flex-wrap gap-1">
                                    {session.items.slice(0, 12).map(i => (
                                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px]">{i}</span>
                                    ))}
                                    {session.items.length > 12 && (
                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px]">+{session.items.length - 12}</span>
                                    )}
                                </div>
                                {historySelectMode && (
                                    <div className="pt-2 flex justify-end">
                                        <button
                                            onClick={() => deleteHistoryIds([session.id])}
                                            className="text-[10px] px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                                        >{lang === 'fr' ? 'Supprimer' : 'Delete'}</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {shoppingHistory.length > 0 && (
                <div className="pt-2">
                    <button
                        onClick={clearHistory}
                        className="w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded"
                    >{t('clearHistory')}</button>
                </div>
            )}
        </div>
    );
};
