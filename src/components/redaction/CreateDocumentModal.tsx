import { useEffect, useState } from 'react';
import { X, FileText, AlignLeft, LayoutList } from 'lucide-react';
import type { EditorMode } from '@/lib/redactionTypes';
import { createDocument } from '@/lib/redactionDocuments';
import { logDocumentActivity } from '@/lib/redactionActivity';
import { supabase } from '@/lib/supabase';
import type { PageTemplate } from '@/lib/supabase';

interface CreateDocumentModalProps {
  currentFolderId: string | null;
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const EDITOR_MODES: { value: EditorMode; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: 'plain',
    label: 'Texte brut',
    description: 'Idéal pour du contenu long ou des textes copiés-collés',
    icon: AlignLeft,
  },
  {
    value: 'rich',
    label: 'Éditeur riche',
    description: 'Avec mise en forme basique (gras, italique, listes...)',
    icon: FileText,
  },
  {
    value: 'structured',
    label: 'Mode structuré',
    description: 'Champs séparés : titre SEO, H1, H2, corps, CTA...',
    icon: LayoutList,
  },
];

export default function CreateDocumentModal({
  currentFolderId,
  userId,
  onClose,
  onCreated,
}: CreateDocumentModalProps) {
  const [name, setName] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('plain');
  const [linkedTemplateId, setLinkedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('page_templates')
      .select('id, name, description, daisy_theme_slug, seo_h1, seo_h2, sections_data, is_public, is_system, created_at, updated_at')
      .order('name')
      .then(({ data, error: loadError }) => {
        if (loadError) throw loadError;
        if (mounted) setTemplates((data ?? []) as PageTemplate[]);
      })
      .catch((loadError) => {
        console.error('[Redaction] Erreur chargement templates:', loadError);
      })
      .finally(() => {
        if (mounted) setTemplatesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom du document est requis.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const doc = await createDocument({
        name: trimmedName,
        editorMode,
        folderId: currentFolderId,
        userId,
        linkedTemplateId,
      });
      await logDocumentActivity(
        doc.id,
        userId,
        'document_created',
        `Document « ${trimmedName} » créé`,
        { editor_mode: editorMode, folder_id: currentFolderId, linked_template_id: linkedTemplateId }
      );
      onCreated();
      onClose();
    } catch (err: any) {
      console.error('[Redaction] Erreur création document:', err);
      setError(err?.message || 'Erreur lors de la création du document.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Nouveau document</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Nom */}
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du document
            </label>
            <input
              id="doc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Page plomberie Paris 15e"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Mode d'édition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode d'édition
            </label>
            <div className="space-y-2">
              {EDITOR_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = editorMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setEditorMode(mode.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-emerald-700' : 'text-gray-900'}`}>
                        {mode.label}
                      </p>
                      <p className="text-xs text-gray-500">{mode.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Modèle de page cible
            </label>
            <select
              value={linkedTemplateId ?? ''}
              onChange={(e) => setLinkedTemplateId(e.target.value || null)}
              disabled={templatesLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm bg-white disabled:bg-gray-50"
            >
              <option value="">Choisir plus tard</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              Assignez le modèle dès maintenant pour enchaîner plus vite : texte SEO, génération JSON, puis copie ou publication.
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
              {saving ? 'Création...' : 'Créer le document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
