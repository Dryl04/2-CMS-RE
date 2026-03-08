import { AlertTriangle, Loader2, Upload } from 'lucide-react';

interface PublishConfirmationDialogProps {
  mode: 'create_page' | 'update_page';
  pageTitle: string;
  targetPageKey?: string;
  publishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PublishConfirmationDialog({
  mode,
  pageTitle,
  targetPageKey,
  publishing,
  onConfirm,
  onCancel,
}: PublishConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Upload className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {mode === 'create_page'
                ? 'Créer une nouvelle page'
                : 'Mettre à jour la page'}
            </h3>
            <p className="text-xs text-gray-500">
              Cette action sera tracée et irréversible.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Titre :</span> {pageTitle || '—'}
          </p>
          {mode === 'update_page' && targetPageKey && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Page cible :</span> {targetPageKey}
            </p>
          )}
          <p className="text-xs text-gray-600">
            <span className="font-medium">Action :</span>{' '}
            {mode === 'create_page'
              ? 'Création d\'une nouvelle entrée seo_metadata'
              : 'Mise à jour des champs éditoriaux'}
          </p>
        </div>

        {mode === 'update_page' && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Les champs éditoriaux de la page existante seront remplacés par les données du JSON généré.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={publishing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl
              hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
              bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
