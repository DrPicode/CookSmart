import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

interface PendingConfirm {
  message: React.ReactNode;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: Omit<PendingConfirm, 'resolve'>) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: Omit<PendingConfirm, 'resolve'>) => {
      return new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      });
    },
    []
  );

  const handleCancel = useCallback(() => {
    if (pending) {
      pending.resolve(false);
    }
    setPending(null);
  }, [pending]);

  const handleConfirm = useCallback(() => {
    if (pending) {
      pending.resolve(true);
    }
    setPending(null);
  }, [pending]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={!!pending}
        title={pending?.title}
        message={pending?.message || ''}
        confirmLabel={pending?.confirmLabel}
        cancelLabel={pending?.cancelLabel}
        variant={pending?.variant}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
};

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx.confirm;
}
