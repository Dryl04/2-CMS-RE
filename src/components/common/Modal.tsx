import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export type ModalType = 'info' | 'confirm' | 'prompt';

export interface ModalOptions {
  type: ModalType;
  title: string;
  message: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  closeOnBackdrop?: boolean;
}

interface ModalProps extends ModalOptions {
  open: boolean;
  onConfirm: (result?: string | boolean) => void;
  onCancel: () => void;
  onClose: () => void;
}

export default function Modal({
  open,
  type,
  title,
  message,
  defaultValue = '',
  confirmLabel,
  cancelLabel,
  closeOnBackdrop = true,
  onConfirm,
  onCancel,
  onClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (open) {
      setInputValue(defaultValue);
      requestAnimationFrame(() => setVisible(true));
      const el = dialogRef.current;
      if (el && !el.open) el.showModal();
      setTimeout(() => {
        if (type === 'prompt') inputRef.current?.focus();
        else confirmBtnRef.current?.focus();
      }, 50);
    } else {
      setVisible(false);
      const el = dialogRef.current;
      if (el?.open) el.close();
    }
  }, [open, defaultValue, type]);

  const handleConfirm = useCallback(() => {
    if (type === 'prompt') {
      onConfirm(inputValue);
    } else if (type === 'confirm') {
      onConfirm(true);
    } else {
      onConfirm();
    }
    onClose();
  }, [type, inputValue, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    onCancel();
    onClose();
  }, [onCancel, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
      if (e.key === 'Enter' && type !== 'prompt') {
        handleConfirm();
      }
      if (e.key === 'Tab') {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [handleCancel, handleConfirm, type]
  );

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && e.target === dialogRef.current) {
      handleCancel();
    }
  };

  const resolvedConfirmLabel = confirmLabel ?? (type === 'confirm' ? 'Confirmer' : 'OK');
  const resolvedCancelLabel = cancelLabel ?? 'Annuler';

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] m-auto w-full max-w-md rounded-2xl bg-base-100 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      style={{
        border: 'none',
        outline: 'none',
      }}
    >
      <div
        className="flex flex-col"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
          transition: 'opacity 180ms ease, transform 180ms ease',
        }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-base-200">
          <h2
            id="modal-title"
            className="text-base font-semibold text-base-content leading-snug"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Fermer"
            className="shrink-0 btn btn-ghost btn-xs btn-square mt-0.5 text-base-content/50 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p
            id="modal-message"
            className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap"
          >
            {message}
          </p>

          {type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              className="mt-4 input input-bordered w-full text-sm"
              aria-label="Saisie"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          {type !== 'info' && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost btn-sm"
            >
              {resolvedCancelLabel}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            className="btn btn-primary btn-sm"
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
