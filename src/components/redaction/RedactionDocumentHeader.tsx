import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  MoreHorizontal,
  Archive,
  Trash2,
  Copy,
  FolderInput,
  Lock,
  Users,
  History,
} from 'lucide-react';
import type {
  SEODocumentWithAuthor,
  SEODocumentFolder,
  DocumentStatus,
} from '@/lib/redactionTypes';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/redactionTypes';

interface RedactionDocumentHeaderProps {
  document: SEODocumentWithAuthor;
  name: string;
  status: DocumentStatus;
  hasChanges: boolean;
  saving: boolean;
  canEdit: boolean;
  isLocked: boolean;
  lockOwnerName?: string;
  onNameChange: (name: string) => void;
  onStatusChange: (status: DocumentStatus) => void;
  onSave: () => void;
  onBack: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onTrash: () => void;
  onShowPermissions: () => void;
  onShowActivity: () => void;
}

export default function RedactionDocumentHeader({
  document: doc,
  name,
  status,
  hasChanges,
  saving,
  canEdit,
  isLocked,
  lockOwnerName,
  onNameChange,
  onStatusChange,
  onSave,
  onBack,
  onArchive,
  onDuplicate,
  onTrash,
  onShowPermissions,
  onShowActivity,
}: RedactionDocumentHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusChoices: DocumentStatus[] = [
    'draft',
    'ready_for_ai',
    'json_generated',
    'published',
    'archived',
  ];

  const authorName =
    doc.author_profile?.full_name || doc.author_profile?.email || 'Inconnu';
  const updatedDate = new Date(doc.updated_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl">
      {/* Ligne 1 : nav arrière + titre éditable + actions */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Retour</span>
        </button>

        {/* Titre éditable */}
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={!canEdit}
          className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none
            focus:bg-gray-50 focus:px-2 focus:rounded-lg transition-all
            disabled:cursor-default placeholder:text-gray-300"
          placeholder="Nom du document…"
        />

        {/* Boutons d'action */}
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-amber-700">
                {lockOwnerName ?? 'En cours d\'édition'}
              </span>
            </div>
          )}

          <button
            onClick={onShowPermissions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Partage
          </button>

          <button
            onClick={onShowActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Activité
          </button>

          {canEdit && (
            <button
              onClick={onSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg
                hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          )}

          {/* Menu secondaire */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onDuplicate();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      onArchive();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Archive className="w-4 h-4 text-gray-400" />
                    Archiver
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      onTrash();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Mettre en corbeille
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ligne 2 : méta infos + statut */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 px-5 py-2.5 text-xs text-gray-500">
        <span>
          Par <strong className="text-gray-700">{authorName}</strong>
        </span>
        <span className="text-gray-300">·</span>
        <span>Modifié le {updatedDate}</span>
        <span className="text-gray-300">·</span>
        <div className="flex items-center gap-1.5">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as DocumentStatus)}
            disabled={!canEdit}
            className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer
              disabled:cursor-default disabled:opacity-70"
          >
            {statusChoices.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
