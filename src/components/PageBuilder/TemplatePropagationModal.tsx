import React, { useEffect, useRef, useState } from 'react';
import { X, Layers, RefreshCw, Ban } from 'lucide-react';

export interface PageInfo {
  id: string;
  title: string;
  page_key: string;
  status: string;
}

export type PropagationChoice = 'all' | 'some' | 'none';

interface TemplatePropagationModalProps {
  open: boolean;
  templateName: string;
  pages: PageInfo[];
  onConfirm: (choice: PropagationChoice, selectedPageIds: string[]) => void;
  onCancel: () => void;
}

export default function TemplatePropagationModal({
  open,
  templateName,
  pages,
  onConfirm,
  onCancel,
}: TemplatePropagationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<PropagationChoice>('none');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setChoice('none');
      setSelectedIds(new Set());
      requestAnimationFrame(() => setVisible(true));
      const el = dialogRef.current;
      if (el && !el.open) el.showModal();
    } else {
      setVisible(false);
      const el = dialogRef.current;
      if (el?.open) el.close();
    }
  }, [open]);

  const togglePage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleConfirm = () => {
    if (choice === 'all') {
      onConfirm('all', pages.map((p) => p.id));
    } else if (choice === 'some') {
      onConfirm('some', Array.from(selectedIds));
    } else {
      onConfirm('none', []);
    }
  };

  const isConfirmDisabled = choice === 'some' && selectedIds.size === 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-labelledby="propagation-title"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] m-auto w-full max-w-lg rounded-2xl bg-base-100 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      style={{ border: 'none', outline: 'none' }}
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
          <div>
            <h2 id="propagation-title" className="text-base font-semibold text-base-content leading-snug">
              Propager les modifications
            </h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              Le modèle <span className="font-medium text-base-content/70">"{templateName}"</span> est utilisé par {pages.length} page{pages.length > 1 ? 's' : ''}.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="shrink-0 btn btn-ghost btn-xs btn-square mt-0.5 text-base-content/50 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-base-content/70 mb-4">
            Souhaitez-vous appliquer les mises à jour du modèle sur les pages associées ?
          </p>

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${choice === 'all'
                ? 'border-primary bg-primary/5'
                : 'border-base-200 hover:border-base-300 hover:bg-base-50'
              }`}
            onClick={() => setChoice('all')}
          >
            <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${choice === 'all' ? 'border-primary bg-primary' : 'border-base-300'}`}>
              {choice === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-primary-content" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-base-content">Toutes les pages</span>
              </div>
              <p className="text-xs text-base-content/50 mt-0.5">
                Les modifications seront appliquées sur les {pages.length} page{pages.length > 1 ? 's' : ''} associées.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${choice === 'some'
                ? 'border-primary bg-primary/5'
                : 'border-base-200 hover:border-base-300 hover:bg-base-50'
              }`}
            onClick={() => setChoice('some')}
          >
            <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${choice === 'some' ? 'border-primary bg-primary' : 'border-base-300'}`}>
              {choice === 'some' && <div className="w-1.5 h-1.5 rounded-full bg-primary-content" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-base-content">Certaines pages</span>
              </div>
              <p className="text-xs text-base-content/50 mt-0.5">
                Choisissez les pages à mettre à jour.
              </p>
            </div>
          </label>

          {choice === 'some' && (
            <div className="ml-7 mt-1 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-primary hover:underline mb-1"
              >
                {selectedIds.size === pages.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              {pages.map((page) => (
                <label
                  key={page.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all ${selectedIds.has(page.id)
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-base-200 hover:border-base-300'
                    }`}
                  onClick={() => togglePage(page.id)}
                >
                  <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.has(page.id) ? 'bg-primary border-primary' : 'border-base-300'}`}>
                    {selectedIds.has(page.id) && (
                      <svg className="w-2.5 h-2.5 text-primary-content" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{page.title}</p>
                    <p className="text-xs text-base-content/40 truncate">{page.page_key}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${page.status === 'published'
                      ? 'bg-success/10 text-success'
                      : page.status === 'draft'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-base-200 text-base-content/50'
                    }`}>
                    {page.status === 'published' ? 'Publié' : page.status === 'draft' ? 'Brouillon' : page.status}
                  </span>
                </label>
              ))}
            </div>
          )}

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${choice === 'none'
                ? 'border-base-300 bg-base-200/50'
                : 'border-base-200 hover:border-base-300 hover:bg-base-50'
              }`}
            onClick={() => setChoice('none')}
          >
            <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${choice === 'none' ? 'border-base-content/40 bg-base-content/10' : 'border-base-300'}`}>
              {choice === 'none' && <div className="w-1.5 h-1.5 rounded-full bg-base-content/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-base-content/40" />
                <span className="text-sm font-medium text-base-content">Aucune page</span>
              </div>
              <p className="text-xs text-base-content/50 mt-0.5">
                Les pages existantes conservent leur contenu actuel.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 pb-6 border-t border-base-200 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="btn btn-primary btn-sm"
          >
            Confirmer
          </button>
        </div>
      </div>
    </dialog>
  );
}
