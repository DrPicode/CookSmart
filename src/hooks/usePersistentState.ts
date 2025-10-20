import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, initial: T | (() => T), options?: {
    parse?: (raw: string) => T;
    stringify?: (value: T) => string;
}): [T, React.Dispatch<React.SetStateAction<T>>] {
    const parse = options?.parse ?? ((raw: string) => JSON.parse(raw));
    const stringify = options?.stringify ?? ((value: T) => JSON.stringify(value));

    const [state, setState] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) return parse(raw);
        } catch (e) {
        }
        return typeof initial === 'function' ? (initial as () => T)() : initial;
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, stringify(state));
        } catch (e) {
        }
    }, [key, state, stringify]);

    return [state, setState];
}
