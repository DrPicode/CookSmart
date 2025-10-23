import React, { useCallback } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { ShoppingSession } from '../lib/exportImport';

interface HistoryTabProps {
    t: (k: string) => string;
    shoppingHistory: ShoppingSession[];
    historySelectMode: boolean;
    setHistorySelectMode: (v: boolean) => void;
    historySelected: Set<string>;
    toggleHistorySelect: (id: string) => void;
    selectAllHistory: () => void;
    deleteHistoryIds: (ids: string[]) => void;
    lang: 'fr' | 'en';
    editMode?: boolean; // external pencil state
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
    lang,
    editMode
}) => {
    const confirmDialog = useConfirm();

    const MonthDeleteButton: React.FC<{ lang: 'fr' | 'en'; monthName: string; sessions: ShoppingSession[]; deleteHistoryIds: (ids: string[]) => void }> = useCallback(({ lang, monthName, sessions, deleteHistoryIds }) => {
        const handleClick = async () => {
            const msg = lang === 'fr'
                ? `Supprimer toutes les sessions de ${monthName} ?`
                : `Delete all sessions from ${monthName}?`;
            let ok = true;
            if (confirmDialog) {
                ok = await confirmDialog({
                    title: lang === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
                    message: msg,
                    confirmLabel: lang === 'fr' ? 'Supprimer' : 'Delete',
                    cancelLabel: lang === 'fr' ? 'Annuler' : 'Cancel',
                    variant: 'danger'
                });
            } else {
                ok = globalThis.confirm(msg);
            }
            if (!ok) return;
            deleteHistoryIds(sessions.map(s => s.id));
        };
        return (
            <button
                onClick={handleClick}
                className="text-[10px] px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                aria-label={lang === 'fr' ? 'Supprimer le mois' : 'Delete month'}
                title={lang === 'fr' ? 'Supprimer le mois' : 'Delete month'}
            >{lang === 'fr' ? 'Supprimer mois' : 'Delete month'}</button>
        );
    }, [confirmDialog]);
    const groupedByMonth = React.useMemo(() => {
        const groups: { [key: string]: ShoppingSession[] } = {};
        for (const session of shoppingHistory) {
            const date = new Date(session.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(session);
        }
        const monthKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
        return monthKeys.map(monthKey => {
            const sessions = [...groups[monthKey]];
            sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const total = sessions.reduce((sum, s) => sum + s.total, 0);
            return { monthKey, sessions, total };
        });
    }, [shoppingHistory]);

    // Sync external editMode with internal selection mode
    React.useEffect(() => {
        if (editMode) {
            if (!historySelectMode) setHistorySelectMode(true);
        } else if (historySelectMode) {
            setHistorySelectMode(false);
        }
    }, [editMode, historySelectMode, setHistorySelectMode]);

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">{t('historyIntro')}</p>
                {/* Manage button removed; pencil outside controls historySelectMode */}
            </div>
            {shoppingHistory.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-8">{t('emptyHistory')}</p>
            ) : (
                <div className="space-y-4">
                    {historySelectMode && editMode && (
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
                    {groupedByMonth.map(({ monthKey, sessions, total }) => {
                        const [year, month] = monthKey.split('-');
                        const date = new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, 1);
                        const monthName = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

                        return (
                            <div key={monthKey} className="space-y-3">
                                <div className="bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-500 rounded-lg p-3 sticky top-0 z-10">
                                    <div className="flex justify-between items-center gap-2">
                                        <h3 className="text-sm font-bold text-orange-900 capitalize">{monthName}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-green-700">{total.toFixed(2)} €</span>
                                            {editMode && (
                                                <MonthDeleteButton
                                                    lang={lang}
                                                    monthName={monthName}
                                                    sessions={sessions}
                                                    deleteHistoryIds={deleteHistoryIds}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-orange-700 mt-1">
                                        {(() => {
                                            const count = sessions.length;
                                            if (lang === 'fr') return `${count} session${count > 1 ? 's' : ''} de courses`;
                                            return `${count} shopping session${count > 1 ? 's' : ''}`;
                                        })()}
                                    </p>
                                </div>

                                <div className="space-y-3 pl-2">
                                    {sessions.map(session => {
                                        const checked = historySelected.has(session.id);
                                        return (
                                            <div key={session.id} className={`border rounded-lg p-3 bg-white shadow-sm relative ${checked ? 'ring-2 ring-orange-400' : ''}`}>
                                                {historySelectMode && (
                                                    <label className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] cursor-pointer select-none" aria-label={lang === 'fr' ? 'Sélectionner la session' : 'Select session'}>
                                                        <input
                                                            type="checkbox"
                                                            className="w-3 h-3"
                                                            checked={checked}
                                                            onChange={() => toggleHistorySelect(session.id)}
                                                        />
                                                        <span className="sr-only">{lang === 'fr' ? 'Sélection' : 'Select'}</span>
                                                    </label>
                                                )}
                                                <div className="flex justify-between items-center mb-1 pr-6">
                                                    <h4 className="text-sm font-semibold">
                                                        {lang === 'fr' ? 'Courses du' : 'Shopping on'} {new Date(session.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </h4>
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
