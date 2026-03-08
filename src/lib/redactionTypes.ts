// ============================================================
// Types du module Rédaction
// ============================================================

// --- Modes d'édition ---
export type EditorMode = 'plain' | 'rich' | 'structured';

// --- Statuts éditoriaux ---
export type DocumentStatus = 'draft' | 'ready_for_ai' | 'json_generated' | 'published' | 'archived';

// --- Niveaux de permission ---
export type PermissionLevel = 'reader' | 'editor' | 'owner';

// --- Types d'événements d'activité ---
export type ActivityEventType =
  | 'document_created'
  | 'document_updated'
  | 'document_renamed'
  | 'document_moved'
  | 'document_duplicated'
  | 'document_archived'
  | 'document_restored'
  | 'document_deleted'
  | 'status_changed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'ai_conversation_started'
  | 'ai_json_generated'
  | 'json_copied'
  | 'page_published'
  | 'folder_created'
  | 'folder_renamed'
  | 'folder_moved'
  | 'folder_deleted';

// --- Dossier ---
export interface SEODocumentFolder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  depth: number;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Document rédactionnel ---
export interface SEODocument {
  id: string;
  name: string;
  editor_mode: EditorMode;
  plain_content: string | null;
  rich_content: Record<string, unknown> | null;
  structured_content: Record<string, unknown> | null;
  status: DocumentStatus;
  folder_id: string | null;
  author_user_id: string;
  owner_user_id: string;
  linked_template_id: string | null;
  linked_template_snapshot: Record<string, unknown> | null;
  last_generated_json: Record<string, unknown> | null;
  last_generated_at: string | null;
  last_generated_by: string | null;
  published_page_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

// --- Document avec info auteur (pour l'affichage en liste) ---
export interface SEODocumentWithAuthor extends SEODocument {
  author_profile?: {
    id: string;
    email: string;
    full_name?: string;
  };
  owner_profile?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// --- Permission documentaire ---
export interface SEODocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  granted_by: string | null;
  created_at: string;
}

// --- Log d'activité ---
export interface SEODocumentActivityLog {
  id: string;
  document_id: string;
  actor_user_id: string | null;
  event_type: ActivityEventType;
  event_summary: string;
  event_payload: Record<string, unknown> | null;
  created_at: string;
}

// --- Contenu structuré (mode structuré) ---
export interface StructuredContent {
  seo_title?: string;
  h1?: string;
  h2?: string;
  body?: string;
  cta?: string;
  meta_description?: string;
  [key: string]: string | undefined;
}

// --- Filtres de la liste des documents ---
export interface DocumentFilters {
  search: string;
  folderId: string | null;
  status: DocumentStatus | 'all';
  authorId: string | null;
  sortBy: 'name' | 'created_at' | 'updated_at' | 'author';
  sortOrder: 'asc' | 'desc';
}

// --- Arbre de dossiers (pour le composant tree) ---
export interface FolderTreeNode extends SEODocumentFolder {
  children: FolderTreeNode[];
}

// --- Actions de masse ---
export type BulkAction = 'move' | 'archive' | 'delete' | 'change_status';

// --- Filtres par défaut ---
export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  search: '',
  folderId: null,
  status: 'all',
  authorId: null,
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

// --- Labels des statuts ---
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Brouillon',
  ready_for_ai: 'Prêt pour IA',
  json_generated: 'JSON généré',
  published: 'Publié',
  archived: 'Archivé',
};

// --- Couleurs des statuts (classes CSS) ---
export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'badge-ghost',
  ready_for_ai: 'badge-info',
  json_generated: 'badge-warning',
  published: 'badge-success',
  archived: 'badge-neutral',
};
