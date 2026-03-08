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
  | 'document_content_updated'
  | 'document_renamed'
  | 'document_moved'
  | 'document_duplicated'
  | 'document_archived'
  | 'document_trashed'
  | 'document_restored'
  | 'document_deleted'
  | 'status_changed'
  | 'editor_mode_changed'
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
  last_edited_by: string | null;
  edit_lock_user_id: string | null;
  edit_lock_at: string | null;
  published_page_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  trashed_at: string | null;
  trashed_by: string | null;
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
  meta_description?: string;
  h1?: string;
  h2?: string;
  body?: string;
  cta_label?: string;
  cta_target?: string;
  keywords?: string;
  notes?: string;
  [key: string]: string | undefined;
}

// --- Champs du mode structuré (pour le rendu dynamique) ---
export const STRUCTURED_FIELDS: { key: keyof StructuredContent; label: string; multiline?: boolean }[] = [
  { key: 'seo_title', label: 'Titre SEO' },
  { key: 'meta_description', label: 'Meta description', multiline: true },
  { key: 'h1', label: 'Titre H1' },
  { key: 'h2', label: 'Titre H2' },
  { key: 'body', label: 'Corps de texte', multiline: true },
  { key: 'cta_label', label: 'Libellé CTA' },
  { key: 'cta_target', label: 'Cible CTA (URL)' },
  { key: 'keywords', label: 'Mots-clés' },
  { key: 'notes', label: 'Notes internes', multiline: true },
];

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

// ============================================================
// Types Plan 03 — IA, publication et intégration
// ============================================================

// --- Configuration fournisseur IA ---
export type AIProviderScope = 'global' | 'user';

export interface AIProviderConfig {
  id: string;
  scope: AIProviderScope;
  user_id: string | null;
  provider_key: string;
  provider_label: string;
  api_base_url: string | null;
  encrypted_api_key: string;
  default_model: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Fournisseurs supportés ---
export const AI_PROVIDERS: { key: string; label: string; models: string[] }[] = [
  { key: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { key: 'anthropic', label: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'] },
  { key: 'mistral', label: 'Mistral', models: ['mistral-large-latest', 'mistral-medium-latest'] },
];

// --- Prompt système ---
export interface AISystemPrompt {
  id: string;
  name: string;
  prompt_text: string;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Conversation IA par document ---
export interface AIConversation {
  id: string;
  document_id: string;
  provider_config_id: string | null;
  model_name: string | null;
  system_prompt_id: string | null;
  system_prompt_snapshot: string;
  created_at: string;
  updated_at: string;
}

// --- Message IA ---
export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: AIMessageRole;
  content: string;
  created_by: string | null;
  created_at: string;
}

// --- Publication ---
export type PublicationTargetMode = 'create_page' | 'update_page';
export type PublicationRunStatus = 'pending' | 'succeeded' | 'failed';

export interface PublicationRun {
  id: string;
  document_id: string;
  actor_user_id: string | null;
  target_mode: PublicationTargetMode;
  target_page_id: string | null;
  template_id: string | null;
  generated_json_snapshot: Record<string, unknown>;
  status: PublicationRunStatus;
  error_message: string | null;
  created_at: string;
}
