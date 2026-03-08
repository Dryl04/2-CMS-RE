import type { ActivityEventType } from './redactionTypes';

// ============================================================
// Labels lisibles pour les types d'événements d'activité
// ============================================================

export const EVENT_LABELS: Record<ActivityEventType, string> = {
  document_created: 'Document créé',
  document_updated: 'Document modifié',
  document_content_updated: 'Contenu modifié',
  document_renamed: 'Document renommé',
  document_moved: 'Document déplacé',
  document_duplicated: 'Document dupliqué',
  document_archived: 'Document archivé',
  document_trashed: 'Mis en corbeille',
  document_restored: 'Document restauré',
  document_deleted: 'Document supprimé',
  status_changed: 'Statut modifié',
  editor_mode_changed: "Mode d'édition changé",
  permission_granted: 'Permission accordée',
  permission_revoked: 'Permission révoquée',
  ai_conversation_started: 'Conversation IA démarrée',
  ai_json_generated: 'JSON généré par IA',
  json_copied: 'JSON copié',
  page_published: 'Page publiée',
  folder_created: 'Dossier créé',
  folder_renamed: 'Dossier renommé',
  folder_moved: 'Dossier déplacé',
  folder_deleted: 'Dossier supprimé',
};

/** Icône associée à chaque type d'événement (nom lucide-react) */
export const EVENT_ICONS: Record<ActivityEventType, string> = {
  document_created: 'FilePlus',
  document_updated: 'Pencil',
  document_content_updated: 'FileEdit',
  document_renamed: 'Type',
  document_moved: 'FolderInput',
  document_duplicated: 'Copy',
  document_archived: 'Archive',
  document_trashed: 'Trash2',
  document_restored: 'RotateCcw',
  document_deleted: 'Trash2',
  status_changed: 'Tag',
  editor_mode_changed: 'ToggleRight',
  permission_granted: 'UserPlus',
  permission_revoked: 'UserMinus',
  ai_conversation_started: 'MessageSquare',
  ai_json_generated: 'Sparkles',
  json_copied: 'Clipboard',
  page_published: 'Globe',
  folder_created: 'FolderPlus',
  folder_renamed: 'Folder',
  folder_moved: 'FolderInput',
  folder_deleted: 'FolderMinus',
};

/** Couleur associée à chaque type d'événement */
export const EVENT_COLORS: Record<ActivityEventType, string> = {
  document_created: 'text-emerald-600',
  document_updated: 'text-blue-600',
  document_content_updated: 'text-blue-600',
  document_renamed: 'text-blue-600',
  document_moved: 'text-indigo-600',
  document_duplicated: 'text-purple-600',
  document_archived: 'text-amber-600',
  document_trashed: 'text-red-500',
  document_restored: 'text-emerald-600',
  document_deleted: 'text-red-600',
  status_changed: 'text-orange-600',
  editor_mode_changed: 'text-cyan-600',
  permission_granted: 'text-emerald-600',
  permission_revoked: 'text-red-500',
  ai_conversation_started: 'text-violet-600',
  ai_json_generated: 'text-violet-600',
  json_copied: 'text-gray-600',
  page_published: 'text-emerald-600',
  folder_created: 'text-emerald-600',
  folder_renamed: 'text-blue-600',
  folder_moved: 'text-indigo-600',
  folder_deleted: 'text-red-600',
};
