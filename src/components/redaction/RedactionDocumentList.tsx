import { useState } from 'react';
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  FolderInput,
  Archive,
  Clock,
  User,
} from 'lucide-react';
import type { SEODocumentWithAuthor, SEODocumentFolder } from '@/lib/redactionTypes';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/redactionTypes';
import { deleteDocument, archiveDocument, duplicateDocument, moveDocument } from '@/lib/redactionDocuments';
import { logDocumentActivity } from '@/lib/redactionActivity';

interface RedactionDocumentListProps {
  documents: SEODocumentWithAuthor[];
  loading: boolean;
  selectedIds: Set<string>;
  activeDocId: string | null;
  userId: string;
  onSelect: (docId: string) => void;
  onToggle: (docId: string) => void;
  onRefresh: () => void;
  folders: SEODocumentFolder[];
}

export default function RedactionDocumentList({
  documents,
  loading,
  selectedIds,
  activeDocId,
  userId,
  onSelect,
  onToggle,
  onRefresh,
  folders,
}: RedactionDocumentListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* En-tête de liste */}
      <div className="grid grid-cols-[auto_1fr_120px_140px_120px_40px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="w-5" />
        <div>Document</div>
        <div>Statut</div>
        <div>Auteur</div>
        <div>Modifié</div>
        <div />
      </div>

      {/* Lignes */}
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          isSelected={selectedIds.has(doc.id)}
          isActive={activeDocId === doc.id}
          userId={userId}
          onSelect={() => onSelect(doc.id)}
          onToggle={() => onToggle(doc.id)}
          onRefresh={onRefresh}
          folders={folders}
        />
      ))}
    </div>
  );
}

// --- Ligne d'un document ---
function DocumentRow({
  doc,
  isSelected,
  isActive,
  userId,
  onSelect,
  onToggle,
  onRefresh,
  folders,
}: {
  doc: SEODocumentWithAuthor;
  isSelected: boolean;
  isActive: boolean;
  userId: string;
  onSelect: () => void;
  onToggle: () => void;
  onRefresh: () => void;
  folders: SEODocumentFolder[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [working, setWorking] = useState(false);

  const authorName =
    doc.author_profile?.full_name || doc.author_profile?.email || 'Inconnu';

  const updatedAt = new Date(doc.updated_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  const handleArchive = async () => {
    setWorking(true);
    try {
      await archiveDocument(doc.id);
      await logDocumentActivity(doc.id, userId, 'document_archived', `Document « ${doc.name} » archivé`);
      onRefresh();
    } catch (err) {
      console.error('[Redaction] Erreur archivage:', err);
    } finally {
      setWorking(false);
      setMenuOpen(false);
    }
  };

  const handleDuplicate = async () => {
    setWorking(true);
    try {
      const newDoc = await duplicateDocument(doc.id, userId);
      await logDocumentActivity(newDoc.id, userId, 'document_duplicated', `Document dupliqué depuis « ${doc.name} »`, { source_id: doc.id });
      onRefresh();
    } catch (err) {
      console.error('[Redaction] Erreur duplication:', err);
    } finally {
      setWorking(false);
      setMenuOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement le document « ${doc.name} » ?`)) return;
    setWorking(true);
    try {
      await deleteDocument(doc.id);
      onRefresh();
    } catch (err) {
      console.error('[Redaction] Erreur suppression:', err);
    } finally {
      setWorking(false);
      setMenuOpen(false);
    }
  };

  return (
    <div
      className={`grid grid-cols-[auto_1fr_120px_140px_120px_40px] gap-4 px-5 py-3.5 items-center transition-colors cursor-pointer ${
        isActive
          ? 'bg-emerald-50 border-l-2 border-l-emerald-500'
          : isSelected
          ? 'bg-blue-50'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Checkbox */}
      <div className="w-5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
      </div>

      {/* Nom */}
      <button
        onClick={onSelect}
        className="flex items-center gap-3 text-left min-w-0"
      >
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-gray-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
          <p className="text-xs text-gray-400 truncate">
            {doc.editor_mode === 'plain' ? 'Texte brut' : doc.editor_mode === 'rich' ? 'Éditeur riche' : 'Structuré'}
          </p>
        </div>
      </button>

      {/* Statut */}
      <div>
        <span className={`badge badge-sm ${STATUS_COLORS[doc.status]}`}>
          {STATUS_LABELS[doc.status]}
        </span>
      </div>

      {/* Auteur */}
      <div className="flex items-center gap-1.5 min-w-0">
        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate">{authorName}</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">{updatedAt}</span>
      </div>

      {/* Menu actions */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={handleDuplicate}
                disabled={working}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                Dupliquer
              </button>
              <button
                onClick={handleArchive}
                disabled={working}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                Archiver
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleDelete}
                disabled={working}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
