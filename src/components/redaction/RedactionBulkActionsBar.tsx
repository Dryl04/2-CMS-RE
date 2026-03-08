import { useState } from 'react';
import { X, FolderInput, Archive, Trash2, Tag } from 'lucide-react';
import type { SEODocumentFolder, DocumentStatus } from '@/lib/redactionTypes';
import { STATUS_LABELS } from '@/lib/redactionTypes';
import { bulkMoveDocuments, bulkArchiveDocuments, bulkDeleteDocuments, bulkChangeStatus } from '@/lib/redactionDocuments';

interface RedactionBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: string[];
  folders: SEODocumentFolder[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDone: () => void;
}

export default function RedactionBulkActionsBar({
  selectedCount,
  totalCount,
  selectedIds,
  folders,
  onSelectAll,
  onClearSelection,
  onDone,
}: RedactionBulkActionsBarProps) {
  const [working, setWorking] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleBulkArchive = async () => {
    if (!confirm(`Archiver ${selectedCount} document(s) ?`)) return;
    setWorking(true);
    try {
      await bulkArchiveDocuments(selectedIds);
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur archivage masse:', err);
    } finally {
      setWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer définitivement ${selectedCount} document(s) ?`)) return;
    setWorking(true);
    try {
      await bulkDeleteDocuments(selectedIds);
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur suppression masse:', err);
    } finally {
      setWorking(false);
    }
  };

  const handleBulkMove = async (folderId: string | null) => {
    setWorking(true);
    try {
      await bulkMoveDocuments(selectedIds, folderId);
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur déplacement masse:', err);
    } finally {
      setWorking(false);
      setShowMoveMenu(false);
    }
  };

  const handleBulkStatus = async (status: DocumentStatus) => {
    setWorking(true);
    try {
      await bulkChangeStatus(selectedIds, status);
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur changement statut masse:', err);
    } finally {
      setWorking(false);
      setShowStatusMenu(false);
    }
  };

  const statusChoices: DocumentStatus[] = ['draft', 'ready_for_ai', 'archived'];

  return (
    <div className="bg-gray-900 text-white rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
        {selectedCount < totalCount && (
          <button onClick={onSelectAll} className="text-xs text-gray-400 hover:text-white underline">
            Tout sélectionner ({totalCount})
          </button>
        )}
        <button onClick={onClearSelection} className="text-xs text-gray-400 hover:text-white underline">
          Désélectionner
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Déplacer */}
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            disabled={working}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <FolderInput className="w-3.5 h-3.5" />
            Déplacer
          </button>
          {showMoveMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-60 overflow-y-auto">
                <button
                  onClick={() => handleBulkMove(null)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Racine (aucun dossier)
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleBulkMove(f.id)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    style={{ paddingLeft: `${(f.depth + 1) * 12 + 12}px` }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Changer statut */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={working}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <Tag className="w-3.5 h-3.5" />
            Statut
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {statusChoices.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleBulkStatus(s)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Archiver */}
        <button
          onClick={handleBulkArchive}
          disabled={working}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <Archive className="w-3.5 h-3.5" />
          Archiver
        </button>

        {/* Supprimer */}
        <button
          onClick={handleBulkDelete}
          disabled={working}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>

        {/* Fermer */}
        <button
          onClick={onClearSelection}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
