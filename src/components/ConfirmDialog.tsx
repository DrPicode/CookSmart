import React, { useEffect, useRef } from 'react';

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
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

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

  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close dialog"
        onClick={onCancel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCancel();
          }
        }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in cursor-default"
        tabIndex={0}
        style={{ border: 'none', padding: 0, margin: 0 }}
      />
      <dialog
        open
        ref={dialogRef}
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 animate-scale-in p-0"
      >
        <form method="dialog" className="p-4 m-0">
          <h2 id="confirm-dialog-title" className="text-sm font-semibold text-gray-800 mb-2">
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
              type="button"
              onClick={onConfirm}
              className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-smooth ${confirmClasses}`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default ConfirmDialog;