import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { createFolder } from '@/lib/redactionFolders';
import { logDocumentActivity } from '@/lib/redactionActivity';

interface CreateFolderModalProps {
  parentId: string | null;
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateFolderModal({
  parentId,
  userId,
  onClose,
  onCreated,
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom du dossier est requis.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createFolder(trimmedName, parentId, userId);
      onCreated();
      onClose();
    } catch (err: any) {
      console.error('[Redaction] Erreur création dossier:', err);
      if (err?.message?.includes('uq_folder_name_per_parent') || err?.code === '23505') {
        setError('Un dossier avec ce nom existe déjà dans ce répertoire.');
      } else {
        setError(err?.message || 'Erreur lors de la création du dossier.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Nouveau dossier</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du dossier
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Client ABC / Services"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
              autoFocus
            />
          </div>

          {parentId && (
            <p className="text-xs text-gray-400">
              Ce dossier sera créé comme sous-dossier du dossier courant.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Création...' : 'Créer le dossier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
