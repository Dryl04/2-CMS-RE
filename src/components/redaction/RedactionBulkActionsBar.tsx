import { useState } from 'react';
import { X, FolderInput, Archive, Trash2, Tag, Users } from 'lucide-react';
import type { SEODocumentFolder, DocumentStatus, PermissionLevel } from '@/lib/redactionTypes';
import { STATUS_LABELS } from '@/lib/redactionTypes';
import { bulkMoveDocuments, bulkArchiveDocuments, bulkDeleteDocuments, bulkChangeStatus } from '@/lib/redactionDocuments';
import { logDocumentActivity } from '@/lib/redactionActivity';
import { grantPermission } from '@/lib/redactionPermissions';
import { supabase } from '@/lib/supabase';

interface RedactionBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  selectedIds: string[];
  folders: SEODocumentFolder[];
  userId: string;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDone: () => void;
}

export default function RedactionBulkActionsBar({
  selectedCount,
  totalCount,
  selectedIds,
  folders,
  userId,
  onSelectAll,
  onClearSelection,
  onDone,
}: RedactionBulkActionsBarProps) {
  const [working, setWorking] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLevel, setShareLevel] = useState<PermissionLevel>('editor');

  const handleBulkArchive = async () => {
    if (!confirm(`Archiver ${selectedCount} document(s) ?`)) return;
    setWorking(true);
    try {
      await bulkArchiveDocuments(selectedIds);
      for (const id of selectedIds) {
        await logDocumentActivity(id, userId, 'document_archived', 'Archivé (action de masse)');
      }
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
      const folderName = folderId ? folders.find((f) => f.id === folderId)?.name ?? 'dossier' : 'racine';
      for (const id of selectedIds) {
        await logDocumentActivity(id, userId, 'document_moved', `Déplacé vers « ${folderName} » (action de masse)`);
      }
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
      for (const id of selectedIds) {
        await logDocumentActivity(id, userId, 'status_changed', `Statut changé en « ${STATUS_LABELS[status]} » (action de masse)`);
      }
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur changement statut masse:', err);
    } finally {
      setWorking(false);
      setShowStatusMenu(false);
    }
  };

  const handleBulkShare = async () => {
    if (!shareEmail.trim()) return;
    setWorking(true);
    try {
      const { data: targetUser } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .eq('email', shareEmail.trim())
        .maybeSingle();
      if (!targetUser) {
        alert('Utilisateur introuvable avec cet email.');
        setWorking(false);
        return;
      }
      for (const docId of selectedIds) {
        await grantPermission(docId, targetUser.id, shareLevel, userId);
        await logDocumentActivity(docId, userId, 'permission_granted', `Droit « ${shareLevel} » accordé à ${targetUser.full_name || targetUser.email} (action de masse)`);
      }
      setShareEmail('');
      setShowShareMenu(false);
      onDone();
    } catch (err) {
      console.error('[Redaction] Erreur partage masse:', err);
    } finally {
      setWorking(false);
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

        {/* Partager */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            disabled={working}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <Users className="w-3.5 h-3.5" />
            Partager
          </button>
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
              <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20">
                <p className="text-xs font-medium text-gray-700 mb-2">Partager avec :</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Email de l'utilisateur…"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-emerald-500 outline-none"
                  />
                  <select
                    value={shareLevel}
                    onChange={(e) => setShareLevel(e.target.value as PermissionLevel)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white"
                  >
                    <option value="reader">Lecteur</option>
                    <option value="editor">Éditeur</option>
                  </select>
                </div>
                <button
                  onClick={handleBulkShare}
                  disabled={working || !shareEmail.trim()}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  Accorder l'accès à {selectedCount} document(s)
                </button>
              </div>
            </>
          )}
        </div>

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
