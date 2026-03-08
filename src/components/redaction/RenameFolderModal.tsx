import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import type { SEODocumentFolder } from '@/lib/redactionTypes';
import { renameFolder } from '@/lib/redactionFolders';

interface RenameFolderModalProps {
  folder: SEODocumentFolder;
  onClose: () => void;
  onRenamed: () => void;
}

export default function RenameFolderModal({
  folder,
  onClose,
  onRenamed,
}: RenameFolderModalProps) {
  const [name, setName] = useState(folder.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom du dossier est requis.');
      return;
    }
    if (trimmedName === folder.name) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await renameFolder(folder.id, trimmedName);
      onRenamed();
      onClose();
    } catch (err: any) {
      console.error('[Redaction] Erreur renommage dossier:', err);
      if (err?.message?.includes('uq_folder_name_per_parent') || err?.code === '23505') {
        setError('Un dossier avec ce nom existe déjà dans ce répertoire.');
      } else {
        setError(err?.message || 'Erreur lors du renommage du dossier.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Pencil className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Renommer le dossier</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="rename-folder" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nouveau nom
            </label>
            <input
              id="rename-folder"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
              autoFocus
            />
          </div>

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
              {saving ? 'Renommage...' : 'Renommer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
