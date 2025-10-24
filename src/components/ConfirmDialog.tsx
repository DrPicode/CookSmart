import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  // Focus trap (Tab cycles between buttons)
  // Removed custom focus trap for simplicity (only two buttons). If needed later, implement with native dialog.showModal() pattern.

  // Save/restore previously focused element & lock scroll
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        previousActiveElement.current?.focus?.();
      };
    }
  }, [open]);

  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-[550] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <dialog
        open
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 animate-scale-in p-0"
      >
        <form method="dialog" className="p-4 m-0" onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
          <h2 id="confirm-dialog-title" className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {title}
          </h2>
          <div className="text-xs text-gray-600 mb-4 leading-relaxed">{message}</div>
          <div className="flex gap-2 justify-end">
            <button
              ref={firstButtonRef}
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {cancelLabel}
            </button>
            <button
              ref={lastButtonRef}
              type="button"
              onClick={onConfirm}
              className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-smooth ${confirmClasses}`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </div>,
    document.body
  );
};

export default ConfirmDialog;