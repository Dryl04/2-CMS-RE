import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal, { ModalOptions, ModalType } from '@/components/common/Modal';

interface PendingModal extends ModalOptions {
  id: number;
  resolve: (value: string | boolean | null | undefined) => void;
}

interface ModalContextValue {
  showModal: (options: ModalOptions) => Promise<string | boolean | null | undefined>;
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
  prompt: (message: string, title?: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

let counter = 0;

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<PendingModal[]>([]);
  const resolveRef = useRef<Map<number, (value: string | boolean | null | undefined) => void>>(new Map());

  const showModal = useCallback((options: ModalOptions): Promise<string | boolean | null | undefined> => {
    return new Promise((resolve) => {
      const id = ++counter;
      resolveRef.current.set(id, resolve);
      setQueue((q) => [...q, { ...options, id, resolve }]);
    });
  }, []);

  const handleConfirm = useCallback((id: number, result?: string | boolean) => {
    const resolve = resolveRef.current.get(id);
    if (resolve) {
      resolve(result);
      resolveRef.current.delete(id);
    }
    setQueue((q) => q.filter((m) => m.id !== id));
  }, []);

  const handleCancel = useCallback((id: number, type: ModalType) => {
    const resolve = resolveRef.current.get(id);
    if (resolve) {
      resolve(type === 'confirm' ? false : null);
      resolveRef.current.delete(id);
    }
    setQueue((q) => q.filter((m) => m.id !== id));
  }, []);

  const alert = useCallback(
    async (message: string, title = 'Information') => {
      await showModal({ type: 'info', title, message });
    },
    [showModal]
  );

  const confirm = useCallback(
    async (message: string, title = 'Confirmation') => {
      const result = await showModal({ type: 'confirm', title, message });
      return result === true;
    },
    [showModal]
  );

  const prompt = useCallback(
    async (message: string, title = 'Saisie', defaultValue = '') => {
      const result = await showModal({ type: 'prompt', title, message, defaultValue });
      if (result === null || result === undefined) return null;
      return String(result);
    },
    [showModal]
  );

  const current = queue[0] ?? null;

  return (
    <ModalContext.Provider value={{ showModal, alert, confirm, prompt }}>
      {children}
      {current && (
        <Modal
          key={current.id}
          open={true}
          type={current.type}
          title={current.title}
          message={current.message}
          defaultValue={current.defaultValue}
          confirmLabel={current.confirmLabel}
          cancelLabel={current.cancelLabel}
          closeOnBackdrop={current.closeOnBackdrop}
          onConfirm={(result) => handleConfirm(current.id, result as string | boolean)}
          onCancel={() => handleCancel(current.id, current.type)}
          onClose={() => {}}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}
