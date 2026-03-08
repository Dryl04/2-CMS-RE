import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type {
  SEODocumentWithAuthor,
  SEODocumentFolder,
  DocumentStatus,
  EditorMode,
  StructuredContent,
  SEODocumentPermission,
} from '@/lib/redactionTypes';
import { STATUS_LABELS } from '@/lib/redactionTypes';
import { fetchDocumentById, updateDocument, archiveDocument, duplicateDocument, trashDocument } from '@/lib/redactionDocuments';
import { fetchDocumentPermissions, canUserEditDocument } from '@/lib/redactionPermissions';
import { logDocumentActivity } from '@/lib/redactionActivity';
import { acquireEditLock, releaseEditLock, renewEditLock, isLockedByOther } from '@/lib/redactionConflictGuard';
import {
  plainToStructured,
  structuredToPlain,
  plainToRich,
  richToPlain,
} from '@/lib/redactionEditorTransforms';
import { buildGenerationPrompt } from '@/lib/redactionPromptPolicy';
import { extractJsonFromText } from '@/lib/redactionJsonValidation';
import {
  getOrCreateConversation,
  addMessage,
  callAIProvider,
  fetchAIConfigs,
  fetchDefaultSystemPrompt,
  updateConversation,
} from '@/lib/redactionAiClient';
import { supabase } from '@/lib/supabase';
import type { PageTemplate } from '@/lib/supabase';

import RedactionDocumentHeader from './RedactionDocumentHeader';
import RedactionEditorModeSwitcher from './RedactionEditorModeSwitcher';
import PlainTextEditor from './editors/PlainTextEditor';
import RichTextEditor from './editors/RichTextEditor';
import StructuredSeoEditor from './editors/StructuredSeoEditor';
import ShareDocumentModal from './ShareDocumentModal';
import RedactionActivityPanel from './RedactionActivityPanel';
import RedactionAIPanel from './ai/RedactionAIPanel';
import RedactionPublishPanel from './publish/RedactionPublishPanel';

interface RedactionDocumentEditorProps {
  documentId: string;
  folders: SEODocumentFolder[];
  onBack: () => void;
  onRefresh: () => void;
}

export default function RedactionDocumentEditor({
  documentId,
  folders,
  onBack,
  onRefresh,
}: RedactionDocumentEditorProps) {
  const { user, profile } = useAuth();
  const userId = user?.id ?? '';
  const userRole = profile?.role ?? 'content_creator';

  // --- État document ---
  const [doc, setDoc] = useState<SEODocumentWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- État édition ---
  const [name, setName] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('plain');
  const [plainContent, setPlainContent] = useState('');
  const [richContent, setRichContent] = useState<Record<string, unknown> | null>(null);
  const [structuredContent, setStructuredContent] = useState<StructuredContent>({});
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Permissions ---
  const [canEdit, setCanEdit] = useState(false);
  const [permissions, setPermissions] = useState<SEODocumentPermission[]>([]);

  // --- Verrou ---
  const [locked, setLocked] = useState(false);
  const [lockOwnerName, setLockOwnerName] = useState<string | undefined>();
  const lockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Panneau partage ---
  const [showShare, setShowShare] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // --- Panneau IA & Publication ---
  const [showAI, setShowAI] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [generatingJson, setGeneratingJson] = useState(false);
  const [lastJsonText, setLastJsonText] = useState<string | null>(null);
  const [template, setTemplate] = useState<PageTemplate | null>(null);
  const [templateExport, setTemplateExport] = useState<Record<string, unknown> | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<PageTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [assigningTemplate, setAssigningTemplate] = useState(false);

  // --- Chargement ---
  const loadDocument = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [data, perms] = await Promise.all([
        fetchDocumentById(documentId),
        fetchDocumentPermissions(documentId),
      ]);
      if (!data) {
        setError('Document introuvable.');
        return;
      }
      setDoc(data);
      setPermissions(perms);

      // Initialiser les champs éditables
      setName(data.name);
      setEditorMode(data.editor_mode);
      setPlainContent(data.plain_content ?? '');
      setRichContent(data.rich_content);
      setStructuredContent((data.structured_content as StructuredContent) ?? {});
      setStatus(data.status);
      setFolderId(data.folder_id);

      // Vérifier droits
      const editAllowed = canUserEditDocument(data, userId, userRole, perms);
      setCanEdit(editAllowed);

      // Vérifier verrou
      if (isLockedByOther(data, userId)) {
        setLocked(true);
        setCanEdit(false);
        // On pourrait fetch le nom du lock owner
      } else if (editAllowed) {
        // Acquérir le verrou
        const lock = await acquireEditLock(documentId, userId);
        if (!lock.acquired) {
          setLocked(true);
          setCanEdit(false);
        }
      }
    } catch (err) {
      console.error('[DocumentEditor] Erreur chargement:', err);
      setError('Erreur lors du chargement du document.');
    } finally {
      setLoading(false);
    }
  }, [documentId, userId, userRole]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('page_templates')
      .select('*')
      .order('name')
      .then(({ data, error: templatesError }) => {
        if (templatesError) throw templatesError;
        if (mounted) setAvailableTemplates((data ?? []) as PageTemplate[]);
      })
      .catch((templatesError) => {
        console.error('[DocumentEditor] Erreur chargement templates:', templatesError);
      })
      .finally(() => {
        if (mounted) setTemplatesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Heartbeat verrou
  useEffect(() => {
    if (!canEdit || !userId) return;
    lockIntervalRef.current = setInterval(() => {
      renewEditLock(documentId, userId).catch(console.error);
    }, 60_000); // chaque minute

    return () => {
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
      releaseEditLock(documentId, userId).catch(console.error);
    };
  }, [canEdit, documentId, userId]);

  // Charger le template lié
  useEffect(() => {
    if (!doc?.linked_template_id) {
      setTemplate(null);
      setTemplateExport(null);
      return;
    }
    supabase
      .from('page_templates')
      .select('*')
      .eq('id', doc.linked_template_id)
      .maybeSingle()
      .then(({ data }) => {
        setTemplate(data as PageTemplate | null);
        if (data?.sections_data) {
          setTemplateExport({ sections_data: data.sections_data });
        }
      })
      .catch(console.error);
  }, [doc?.linked_template_id]);

  const handleTemplateAssignment = async (nextTemplateId: string | null) => {
    if (!doc || !canEdit) return;

    const selectedTemplate = availableTemplates.find((item) => item.id === nextTemplateId) ?? null;
    const nextSnapshot = selectedTemplate?.sections_data
      ? { sections_data: selectedTemplate.sections_data }
      : null;

    setAssigningTemplate(true);
    try {
      await updateDocument(doc.id, {
        linked_template_id: nextTemplateId,
        linked_template_snapshot: nextSnapshot,
      });

      setDoc((prev) => (prev
        ? {
            ...prev,
            linked_template_id: nextTemplateId,
            linked_template_snapshot: nextSnapshot,
          }
        : prev));
      setTemplate(selectedTemplate);
      setTemplateExport(nextSnapshot);

      await logDocumentActivity(
        doc.id,
        userId,
        'document_updated',
        nextTemplateId
          ? `Modèle cible assigné : ${selectedTemplate?.name ?? 'Template'}`
          : 'Modèle cible retiré',
        { linked_template_id: nextTemplateId }
      );

      onRefresh();
    } catch (assignmentError) {
      console.error('[DocumentEditor] Erreur assignation template:', assignmentError);
      alert('Impossible d\'assigner ce modèle de page.');
    } finally {
      setAssigningTemplate(false);
    }
  };

  // --- Génération JSON via IA ---
  const handleGenerateJson = async () => {
    if (!doc) return;
    if (!doc.linked_template_id || !template) {
      alert('Choisissez d\'abord un modèle de page cible pour générer un JSON directement exploitable.');
      return;
    }

    setGeneratingJson(true);
    try {
      const configs = await fetchAIConfigs();
      if (configs.length === 0) {
        alert('Configurez un fournisseur IA d\'abord (icône ⚙️ dans le panneau IA).');
        return;
      }
      const activeConfig = configs[0];
      let conversation = await getOrCreateConversation(doc.id, activeConfig.id, activeConfig.default_model);
      const defaultPrompt = await fetchDefaultSystemPrompt();

      if (
        defaultPrompt &&
        (conversation.system_prompt_id !== defaultPrompt.id ||
          conversation.system_prompt_snapshot !== defaultPrompt.prompt_text ||
          conversation.provider_config_id !== activeConfig.id ||
          conversation.model_name !== (activeConfig.default_model ?? 'gpt-4o'))
      ) {
        conversation = await updateConversation(conversation.id, {
          provider_config_id: activeConfig.id,
          model_name: activeConfig.default_model ?? 'gpt-4o',
          system_prompt_id: defaultPrompt.id,
          system_prompt_snapshot: defaultPrompt.prompt_text,
        });
      }

      // Construire le prompt de génération
      const prompt = buildGenerationPrompt(doc, template, templateExport);

      // Enregistrer le message utilisateur
      await addMessage(conversation.id, 'user', prompt, userId);

      // Appeler l'IA via Edge Function
      const response = await callAIProvider({
        providerKey: activeConfig.provider_key,
        model: activeConfig.default_model ?? 'gpt-4o',
        systemPrompt: conversation.system_prompt_snapshot,
        messages: [{ role: 'user', content: prompt }],
        conversationId: conversation.id,
        providerConfigId: activeConfig.id,
      });

      // Sauvegarder la réponse
      await addMessage(conversation.id, 'assistant', response);

      // Extraire le JSON
      const extracted = extractJsonFromText(response);
      if (extracted) {
        setLastJsonText(JSON.stringify(extracted.json, null, 2));
        await updateDocument(doc.id, {
          last_generated_json: extracted.json as Record<string, unknown>,
          last_generated_at: new Date().toISOString(),
          last_generated_by: userId,
          status: 'json_generated',
        });
        setStatus('json_generated');
        await logDocumentActivity(doc.id, userId, 'ai_json_generated', 'JSON généré par IA');

        // Recharger le document
        const updated = await fetchDocumentById(doc.id);
        if (updated) setDoc(updated);
      } else {
        setLastJsonText(response);
      }

      // Ouvrir le panneau publication
      setShowPublish(true);
      setShowAI(false);
    } catch (err) {
      console.error('[Editor] Erreur génération JSON:', err);
      alert(`Erreur de génération : ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGeneratingJson(false);
    }
  };

  // --- Détection de changements ---
  const hasChanges = doc
    ? name !== doc.name ||
      editorMode !== doc.editor_mode ||
      plainContent !== (doc.plain_content ?? '') ||
      JSON.stringify(richContent) !== JSON.stringify(doc.rich_content) ||
      JSON.stringify(structuredContent) !== JSON.stringify(doc.structured_content ?? {}) ||
      status !== doc.status ||
      folderId !== doc.folder_id
    : false;

  // --- Changement de mode d'édition ---
  const handleModeChange = (newMode: EditorMode) => {
    if (newMode === editorMode) return;

    // Convertir le contenu vers le nouveau mode
    if (editorMode === 'plain' && newMode === 'structured') {
      setStructuredContent(plainToStructured(plainContent));
    } else if (editorMode === 'plain' && newMode === 'rich') {
      setRichContent(plainToRich(plainContent));
    } else if (editorMode === 'structured' && newMode === 'plain') {
      setPlainContent(structuredToPlain(structuredContent));
    } else if (editorMode === 'rich' && newMode === 'plain') {
      setPlainContent(richToPlain(richContent));
    }

    setEditorMode(newMode);
  };

  // --- Sauvegarde ---
  const handleSave = async () => {
    if (!canEdit || !doc) return;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        last_edited_by: userId,
      };

      if (name !== doc.name) updates.name = name.trim();
      if (editorMode !== doc.editor_mode) updates.editor_mode = editorMode;
      if (status !== doc.status) updates.status = status;
      if (folderId !== doc.folder_id) updates.folder_id = folderId;

      // Sauvegarder le contenu du mode actif
      if (editorMode === 'plain' && plainContent !== (doc.plain_content ?? '')) {
        updates.plain_content = plainContent;
      }
      if (editorMode === 'rich' && JSON.stringify(richContent) !== JSON.stringify(doc.rich_content)) {
        updates.rich_content = richContent;
      }
      if (editorMode === 'structured' && JSON.stringify(structuredContent) !== JSON.stringify(doc.structured_content ?? {})) {
        updates.structured_content = structuredContent;
      }

      if (Object.keys(updates).length > 1) {
        await updateDocument(doc.id, updates as any);

        // Logs contextuels
        if (updates.name) {
          await logDocumentActivity(doc.id, userId, 'document_renamed', `Renommé en « ${updates.name} »`, { old_name: doc.name });
        }
        if (updates.plain_content !== undefined || updates.rich_content !== undefined || updates.structured_content !== undefined) {
          await logDocumentActivity(doc.id, userId, 'document_content_updated', 'Contenu modifié');
        }
        if (updates.status) {
          await logDocumentActivity(doc.id, userId, 'status_changed', `Statut changé en « ${STATUS_LABELS[status]} »`, {
            old_status: doc.status,
            new_status: status,
          });
        }
        if (updates.folder_id !== undefined) {
          await logDocumentActivity(doc.id, userId, 'document_moved', 'Document déplacé', {
            old_folder: doc.folder_id,
            new_folder: folderId,
          });
        }
        if (updates.editor_mode) {
          await logDocumentActivity(doc.id, userId, 'editor_mode_changed', `Mode changé de ${doc.editor_mode} à ${editorMode}`);
        }

        // Recharger le document
        const updated = await fetchDocumentById(doc.id);
        if (updated) {
          setDoc(updated);
        }
        onRefresh();
      }
    } catch (err) {
      console.error('[DocumentEditor] Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  // --- Actions secondaires ---
  const handleArchive = async () => {
    if (!doc) return;
    try {
      await archiveDocument(doc.id);
      await logDocumentActivity(doc.id, userId, 'document_archived', `Document « ${doc.name} » archivé`);
      onRefresh();
      onBack();
    } catch (err) {
      console.error('[DocumentEditor] Erreur archivage:', err);
    }
  };

  const handleDuplicate = async () => {
    if (!doc) return;
    try {
      const newDoc = await duplicateDocument(doc.id, userId);
      await logDocumentActivity(newDoc.id, userId, 'document_duplicated', `Dupliqué depuis « ${doc.name} »`, { source_id: doc.id });
      onRefresh();
    } catch (err) {
      console.error('[DocumentEditor] Erreur duplication:', err);
    }
  };

  const handleTrash = async () => {
    if (!doc) return;
    if (!confirm(`Mettre « ${doc.name} » en corbeille ?`)) return;
    try {
      await trashDocument(doc.id, userId);
      await logDocumentActivity(doc.id, userId, 'document_trashed', `Document « ${doc.name} » mis en corbeille`);
      onRefresh();
      onBack();
    } catch (err) {
      console.error('[DocumentEditor] Erreur corbeille:', err);
    }
  };

  // --- Rendu ---
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error ?? 'Document introuvable'}
        </h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Retour à la bibliothèque
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <RedactionDocumentHeader
        document={doc}
        name={name}
        status={status}
        hasChanges={hasChanges}
        saving={saving}
        canEdit={canEdit}
        isLocked={locked}
        lockOwnerName={lockOwnerName}
        onNameChange={setName}
        onStatusChange={setStatus}
        onSave={handleSave}
        onBack={onBack}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onTrash={handleTrash}
        onShowPermissions={() => setShowShare(true)}
        onShowActivity={() => setShowActivity(true)}
        onToggleAI={() => setShowAI((v) => !v)}
        onTogglePublish={() => setShowPublish((v) => !v)}
        showAI={showAI}
        showPublish={showPublish}
      />

      {/* Sélecteur de mode + dossier */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <RedactionEditorModeSwitcher
          currentMode={editorMode}
          onChange={handleModeChange}
          disabled={!canEdit}
        />

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Dossier :</label>
          <select
            value={folderId ?? ''}
            onChange={(e) => setFolderId(e.target.value || null)}
            disabled={!canEdit}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white
              focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">Racine</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {'  '.repeat(f.depth)}{f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Modèle de page cible
            </label>
            <select
              value={doc.linked_template_id ?? ''}
              onChange={(e) => handleTemplateAssignment(e.target.value || null)}
              disabled={!canEdit || templatesLoading || assigningTemplate}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">— Sélectionner un modèle de page —</option>
              {availableTemplates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-500">
              Le rédacteur choisit ici le modèle cible, puis l'IA génère directement un JSON prêt à copier ou à publier.
            </p>
          </div>

          <div className="min-w-[240px] flex-1">
            <p className="text-xs font-medium text-gray-600 mb-1.5">Prompt IA appliqué</p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <p className="text-xs text-emerald-800">
                Le prompt système global par défaut est appliqué automatiquement à chaque génération.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowAI((value) => !value)}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {showAI ? 'Masquer l\'assistant' : 'Ouvrir l\'assistant'}
            </button>
            <button
              onClick={handleGenerateJson}
              disabled={generatingJson || !doc.linked_template_id}
              className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generatingJson ? 'Génération…' : 'Générer le JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Zone principale : éditeur + panneau IA latéral */}
      <div className="flex gap-4">
        {/* Colonne éditeur */}
        <div className={`flex-1 min-w-0 space-y-4 ${showAI ? 'max-w-[60%]' : ''}`}>
          {/* Zone d'édition */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            {editorMode === 'plain' && (
              <PlainTextEditor
                value={plainContent}
                onChange={setPlainContent}
                disabled={!canEdit}
              />
            )}
            {editorMode === 'rich' && (
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                disabled={!canEdit}
              />
            )}
            {editorMode === 'structured' && (
              <StructuredSeoEditor
                value={structuredContent}
                onChange={setStructuredContent}
                disabled={!canEdit}
              />
            )}
          </div>

          {/* Panneau publication (sous l'éditeur) */}
          {showPublish && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Publication</h3>
              <RedactionPublishPanel
                document={doc}
                userId={userId}
                lastJsonText={lastJsonText}
                templateId={doc.linked_template_id}
                onTemplateChange={handleTemplateAssignment}
                onPublished={() => {
                  loadDocument();
                  onRefresh();
                }}
              />
            </div>
          )}
        </div>

        {/* Panneau IA latéral */}
        {showAI && (
          <div className="w-[400px] flex-shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden h-[calc(100vh-220px)] sticky top-4">
            <RedactionAIPanel
              document={doc}
              userId={userId}
              userRole={userRole}
              template={template}
              templateExport={templateExport}
              onClose={() => setShowAI(false)}
              onJsonDetected={(text) => {
                setLastJsonText(text);
                setShowPublish(true);
              }}
              onGenerateJson={handleGenerateJson}
              generatingJson={generatingJson}
            />
          </div>
        )}
      </div>

      {/* Modale partage */}
      {showShare && (
        <ShareDocumentModal
          document={doc}
          userId={userId}
          userRole={userRole}
          permissions={permissions}
          onClose={() => {
            setShowShare(false);
            loadDocument(); // Recharger les permissions
          }}
        />
      )}

      {/* Panneau activité */}
      {showActivity && (
        <RedactionActivityPanel
          documentId={doc.id}
          onClose={() => setShowActivity(false)}
        />
      )}
    </div>
  );
}
