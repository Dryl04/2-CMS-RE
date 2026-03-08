import { useState, useMemo } from 'react';
import { Upload, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { SEODocumentWithAuthor, PublicationRun, PublicationTargetMode } from '@/lib/redactionTypes';
import { extractJsonFromText, validateGeneratedJson } from '@/lib/redactionJsonValidation';
import { publishNewPage, publishUpdatePage, fetchPublicationRuns } from '@/lib/redactionPublishClient';
import { logDocumentActivity } from '@/lib/redactionActivity';
import GeneratedJsonPreview from './GeneratedJsonPreview';
import PublishTargetSelector from './PublishTargetSelector';
import PublishConfirmationDialog from './PublishConfirmationDialog';
import { useEffect } from 'react';

interface RedactionPublishPanelProps {
  document: SEODocumentWithAuthor;
  userId: string;
  lastJsonText: string | null;
  onPublished: () => void;
}

export default function RedactionPublishPanel({
  document: doc,
  userId,
  lastJsonText,
  onPublished,
}: RedactionPublishPanelProps) {
  // -- State
  const [mode, setMode] = useState<PublicationTargetMode>('create_page');
  const [templateId, setTemplateId] = useState<string | null>(doc.linked_template_id);
  const [targetPageId, setTargetPageId] = useState<string | null>(doc.published_page_id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [runs, setRuns] = useState<PublicationRun[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Si le doc a déjà une page publiée, pré-sélectionner "update"
  useEffect(() => {
    if (doc.published_page_id) {
      setMode('update_page');
      setTargetPageId(doc.published_page_id);
    }
  }, [doc.published_page_id]);

  // Charger l'historique
  useEffect(() => {
    fetchPublicationRuns(doc.id).then(setRuns).catch(console.error);
  }, [doc.id, success]);

  // Analyser le JSON
  const jsonSource = lastJsonText ?? (doc.last_generated_json ? JSON.stringify(doc.last_generated_json) : null);

  const parsedJson = useMemo(() => {
    if (!jsonSource) return null;
    const extracted = extractJsonFromText(jsonSource);
    return extracted?.json ?? null;
  }, [jsonSource]);

  const validation = useMemo(() => {
    if (!parsedJson) return null;
    return validateGeneratedJson(parsedJson);
  }, [parsedJson]);

  const pageTitle = useMemo(() => {
    if (!parsedJson) return '';
    const pages = (parsedJson as { pages?: { title?: string }[] })?.pages;
    return pages?.[0]?.title ?? '';
  }, [parsedJson]);

  const pageKey = useMemo(() => {
    if (!parsedJson) return '';
    const pages = (parsedJson as { pages?: { page_key?: string }[] })?.pages;
    return pages?.[0]?.page_key ?? '';
  }, [parsedJson]);

  const canPublish = parsedJson != null && validation?.valid && (mode === 'create_page' || targetPageId);

  // Publier
  async function handlePublish() {
    if (!parsedJson || !validation?.valid) return;
    setPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'create_page') {
        await publishNewPage({
          documentId: doc.id,
          actorUserId: userId,
          templateId,
          generatedJson: parsedJson as Record<string, unknown>,
        });
        await logDocumentActivity(doc.id, userId, 'page_published', `Page « ${pageTitle} » créée`, {
          page_key: pageKey,
          mode: 'create_page',
        });
        setSuccess(`Page « ${pageTitle} » créée avec succès.`);
      } else if (targetPageId) {
        await publishUpdatePage({
          documentId: doc.id,
          actorUserId: userId,
          targetPageId,
          templateId,
          generatedJson: parsedJson as Record<string, unknown>,
        });
        await logDocumentActivity(doc.id, userId, 'page_published', `Page mise à jour`, {
          target_page_id: targetPageId,
          mode: 'update_page',
        });
        setSuccess('Page mise à jour avec succès.');
      }
      setShowConfirm(false);
      onPublished();
    } catch (err) {
      console.error('[Publish] Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication.');
      setShowConfirm(false);
    } finally {
      setPublishing(false);
    }
  }

  function handleCopyJson() {
    if (jsonSource) {
      const extracted = extractJsonFromText(jsonSource);
      const text = extracted ? JSON.stringify(extracted.json, null, 2) : jsonSource;
      navigator.clipboard.writeText(text);
      logDocumentActivity(doc.id, userId, 'json_copied', 'JSON copié dans le presse-papiers').catch(console.error);
    }
  }

  const STATUS_ICONS: Record<string, React.ReactNode> = {
    succeeded: <CheckCircle className="w-3 h-3 text-emerald-500" />,
    failed: <XCircle className="w-3 h-3 text-red-500" />,
    pending: <Clock className="w-3 h-3 text-amber-500" />,
  };

  return (
    <div className="space-y-4">
      {/* JSON Preview */}
      {jsonSource ? (
        <GeneratedJsonPreview jsonText={jsonSource} onCopy={handleCopyJson} />
      ) : (
        <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">
            Aucun JSON généré. Utilisez l'assistant IA pour générer le contenu.
          </p>
        </div>
      )}

      {/* Target selector */}
      <PublishTargetSelector
        templateId={templateId}
        targetPageId={targetPageId}
        mode={mode}
        onTemplateChange={setTemplateId}
        onTargetPageChange={setTargetPageId}
        onModeChange={setMode}
      />

      {/* Erreur / Succès */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs text-emerald-700">{success}</p>
        </div>
      )}

      {/* Bouton publier */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={!canPublish}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
          bg-emerald-600 text-white rounded-xl hover:bg-emerald-700
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Upload className="w-4 h-4" />
        {mode === 'create_page' ? 'Créer la page' : 'Mettre à jour la page'}
      </button>

      {/* Historique */}
      {runs.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            <History className="w-3.5 h-3.5" />
            Historique ({runs.length})
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {runs.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-xs text-gray-600 py-1.5 px-2 bg-gray-50 rounded-lg">
                  {STATUS_ICONS[r.status]}
                  <span className="font-medium">
                    {r.target_mode === 'create_page' ? 'Création' : 'Mise à jour'}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span>{new Date(r.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}</span>
                  {r.error_message && (
                    <span className="text-red-500 truncate max-w-[150px]" title={r.error_message}>
                      {r.error_message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <PublishConfirmationDialog
          mode={mode}
          pageTitle={pageTitle}
          targetPageKey={pageKey}
          publishing={publishing}
          onConfirm={handlePublish}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
