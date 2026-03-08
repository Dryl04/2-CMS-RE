import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  User,
  Calendar,
  Clock,
  Tag,
  FolderInput,
  Save,
  History,
  Shield,
} from 'lucide-react';
import type {
  SEODocumentWithAuthor,
  SEODocumentFolder,
  DocumentStatus,
  SEODocumentActivityLog,
} from '@/lib/redactionTypes';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/redactionTypes';
import { updateDocument, moveDocument } from '@/lib/redactionDocuments';
import { fetchDocumentLogs, logDocumentActivity } from '@/lib/redactionActivity';
import { canUserEditDocument } from '@/lib/redactionPermissions';
import { fetchDocumentPermissions } from '@/lib/redactionPermissions';

interface DocumentDetailPanelProps {
  document: SEODocumentWithAuthor;
  userId: string;
  userRole: string;
  onClose: () => void;
  onRefresh: () => void;
  folders: SEODocumentFolder[];
}

export default function DocumentDetailPanel({
  document: doc,
  userId,
  userRole,
  onClose,
  onRefresh,
  folders,
}: DocumentDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'logs'>('edit');
  const [name, setName] = useState(doc.name);
  const [content, setContent] = useState(doc.plain_content ?? '');
  const [status, setStatus] = useState(doc.status);
  const [folderId, setFolderId] = useState(doc.folder_id);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<(SEODocumentActivityLog & { actor_profile?: { id: string; email: string; full_name?: string } })[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // Charger permissions et vérifier droits
  useEffect(() => {
    (async () => {
      try {
        const perms = await fetchDocumentPermissions(doc.id);
        setCanEdit(canUserEditDocument(doc, userId, userRole, perms));
      } catch {
        setCanEdit(false);
      }
    })();
  }, [doc.id, userId, userRole]);

  // Sync state quand le document change
  useEffect(() => {
    setName(doc.name);
    setContent(doc.plain_content ?? '');
    setStatus(doc.status);
    setFolderId(doc.folder_id);
  }, [doc.id]);

  // Charger les logs
  useEffect(() => {
    if (activeTab === 'logs') {
      setLogsLoading(true);
      fetchDocumentLogs(doc.id)
        .then(setLogs)
        .catch(console.error)
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab, doc.id]);

  const authorName = doc.author_profile?.full_name || doc.author_profile?.email || 'Inconnu';
  const createdDate = new Date(doc.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const updatedDate = new Date(doc.updated_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasChanges =
    name !== doc.name ||
    content !== (doc.plain_content ?? '') ||
    status !== doc.status ||
    folderId !== doc.folder_id;

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (name !== doc.name) updates.name = name.trim();
      if (content !== (doc.plain_content ?? '')) updates.plain_content = content;
      if (status !== doc.status) updates.status = status;
      if (folderId !== doc.folder_id) updates.folder_id = folderId;

      if (Object.keys(updates).length > 0) {
        await updateDocument(doc.id, updates as any);

        // Logs
        if (updates.name) {
          await logDocumentActivity(doc.id, userId, 'document_renamed', `Renommé en « ${updates.name} »`, { old_name: doc.name });
        }
        if (updates.plain_content !== undefined) {
          await logDocumentActivity(doc.id, userId, 'document_updated', 'Contenu modifié');
        }
        if (updates.status) {
          await logDocumentActivity(doc.id, userId, 'status_changed', `Statut changé en « ${STATUS_LABELS[status]} »`, { old_status: doc.status, new_status: status });
        }
        if (updates.folder_id !== undefined) {
          await logDocumentActivity(doc.id, userId, 'document_moved', 'Document déplacé', { old_folder: doc.folder_id, new_folder: folderId });
        }

        onRefresh();
      }
    } catch (err) {
      console.error('[Redaction] Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const statusChoices: DocumentStatus[] = ['draft', 'ready_for_ai', 'json_generated', 'published', 'archived'];

  return (
    <div className="w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-700 truncate">{doc.name}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'edit'
              ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Édition
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Historique
          </span>
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'edit' ? (
          <div className="p-4 space-y-4">
            {/* Infos méta */}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>Auteur : <strong className="text-gray-700">{authorName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Créé le {createdDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Modifié le {updatedDate}</span>
              </div>
            </div>

            {!canEdit && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Shield className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">Lecture seule — vous n'avez pas les droits d'édition</p>
              </div>
            )}

            {/* Nom */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                disabled={!canEdit}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white disabled:bg-gray-50"
              >
                {statusChoices.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Dossier */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dossier</label>
              <select
                value={folderId ?? ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                disabled={!canEdit}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white disabled:bg-gray-50"
              >
                <option value="">Aucun dossier (racine)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {'  '.repeat(f.depth)}{f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contenu (mode texte brut) */}
            {doc.editor_mode === 'plain' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contenu</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!canEdit}
                  rows={10}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-y disabled:bg-gray-50 disabled:text-gray-500 font-mono leading-relaxed"
                  placeholder="Saisissez ou collez votre texte SEO ici..."
                />
              </div>
            )}

            {doc.editor_mode === 'rich' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  L'éditeur riche sera disponible dans la prochaine phase.
                  Le contenu est accessible en lecture.
                </p>
              </div>
            )}

            {doc.editor_mode === 'structured' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700">
                  Le mode structuré sera disponible dans la prochaine phase.
                  Le contenu est accessible en lecture.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Onglet Historique */
          <div className="p-4">
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune activité enregistrée</p>
            ) : (
              <div className="space-y-0">
                {logs.map((log, i) => (
                  <div key={log.id} className="flex gap-3 relative">
                    {/* Ligne verticale */}
                    {i < logs.length - 1 && (
                      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-gray-200" />
                    )}
                    <div className="w-2.5 h-2.5 bg-emerald-200 rounded-full mt-1.5 flex-shrink-0 border-2 border-white relative z-10" />
                    <div className="pb-4 min-w-0">
                      <p className="text-sm text-gray-700">{log.event_summary}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {log.actor_profile?.full_name || log.actor_profile?.email || 'Système'}
                        {' · '}
                        {new Date(log.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton sauvegarder */}
      {activeTab === 'edit' && canEdit && hasChanges && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      )}
    </div>
  );
}
