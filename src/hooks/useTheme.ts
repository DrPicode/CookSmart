import { useEffect, useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

// Theme can be 'light' | 'dark' | 'system'
export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [mode, setMode] = usePersistentState<ThemeMode>('themeMode', 'system');

  const apply = useCallback((m: ThemeMode) => {
    const root = document.documentElement;
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveDark = m === 'dark' || (m === 'system' && prefersDark);
    // Debug logs to help verify
    // eslint-disable-next-line no-console
    console.log('[theme] mode:', m, 'prefersDark:', prefersDark, 'effectiveDark:', effectiveDark);
    if (effectiveDark) {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
  }, []);

  useEffect(() => {
    apply(mode);
  }, [mode, apply]);

  // React to system changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => apply('system');
    try { mq.addEventListener('change', listener); } catch { mq.addListener(listener); }
    return () => {
      try { mq.removeEventListener('change', listener); } catch { mq.removeListener(listener); }
    };
  }, [mode, apply]);

  return { mode, setMode };
}