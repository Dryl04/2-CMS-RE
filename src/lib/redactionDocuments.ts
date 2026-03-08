import { supabase } from './supabase';
import type {
  SEODocument,
  SEODocumentWithAuthor,
  EditorMode,
  DocumentStatus,
  DocumentFilters,
} from './redactionTypes';

// ============================================================
// CRUD Documents
// ============================================================

/** Récupérer les documents avec filtres */
export async function fetchDocuments(
  filters: DocumentFilters
): Promise<SEODocumentWithAuthor[]> {
  let query = supabase
    .from('seo_documents')
    .select(`
      *,
      author_profile:user_profiles!seo_documents_author_user_id_fkey(id, email, full_name),
      owner_profile:user_profiles!seo_documents_owner_user_id_fkey(id, email, full_name)
    `);

  // Filtre par dossier
  if (filters.folderId !== null) {
    query = query.eq('folder_id', filters.folderId);
  }

  // Filtre par statut
  if (filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Filtre par auteur
  if (filters.authorId) {
    query = query.eq('author_user_id', filters.authorId);
  }

  // Recherche textuelle
  if (filters.search.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`);
  }

  // Tri
  const ascending = filters.sortOrder === 'asc';
  if (filters.sortBy === 'author') {
    // Le tri par auteur se fait côté client
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order(filters.sortBy, { ascending });
  }

  const { data, error } = await query;

  if (error) throw error;

  let results = (data ?? []) as SEODocumentWithAuthor[];

  // Tri côté client pour "author"
  if (filters.sortBy === 'author') {
    results.sort((a, b) => {
      const nameA = a.author_profile?.full_name || a.author_profile?.email || '';
      const nameB = b.author_profile?.full_name || b.author_profile?.email || '';
      return ascending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }

  return results;
}

/** Récupérer un document par ID */
export async function fetchDocumentById(
  documentId: string
): Promise<SEODocumentWithAuthor | null> {
  const { data, error } = await supabase
    .from('seo_documents')
    .select(`
      *,
      author_profile:user_profiles!seo_documents_author_user_id_fkey(id, email, full_name),
      owner_profile:user_profiles!seo_documents_owner_user_id_fkey(id, email, full_name)
    `)
    .eq('id', documentId)
    .maybeSingle();

  if (error) throw error;
  return data as SEODocumentWithAuthor | null;
}

/** Créer un document */
export async function createDocument(params: {
  name: string;
  editorMode: EditorMode;
  folderId: string | null;
  userId: string;
  plainContent?: string;
}): Promise<SEODocument> {
  const { data, error } = await supabase
    .from('seo_documents')
    .insert({
      name: params.name.trim(),
      editor_mode: params.editorMode,
      folder_id: params.folderId,
      author_user_id: params.userId,
      owner_user_id: params.userId,
      plain_content: params.plainContent ?? '',
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Mettre à jour un document */
export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<SEODocument,
    'name' | 'editor_mode' | 'plain_content' | 'rich_content' |
    'structured_content' | 'status' | 'folder_id' |
    'linked_template_id' | 'linked_template_snapshot' |
    'last_generated_json' | 'last_generated_at' | 'last_generated_by' |
    'last_edited_by' | 'edit_lock_user_id' | 'edit_lock_at' |
    'archived_at' | 'trashed_at' | 'trashed_by' | 'published_page_id'
  >>
): Promise<SEODocument> {
  const { data, error } = await supabase
    .from('seo_documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Supprimer un document */
export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('seo_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

/** Archiver un document */
export async function archiveDocument(documentId: string): Promise<SEODocument> {
  return updateDocument(documentId, {
    status: 'archived',
    archived_at: new Date().toISOString(),
  });
}

/** Mettre un document en corbeille (suppression logique) */
export async function trashDocument(documentId: string, userId: string): Promise<SEODocument> {
  return updateDocument(documentId, {
    trashed_at: new Date().toISOString(),
    trashed_by: userId,
  });
}

/** Restaurer un document depuis la corbeille */
export async function restoreDocument(documentId: string): Promise<SEODocument> {
  return updateDocument(documentId, {
    trashed_at: null,
    trashed_by: null,
  });
}

/** Déplacer un document dans un dossier */
export async function moveDocument(
  documentId: string,
  folderId: string | null
): Promise<SEODocument> {
  return updateDocument(documentId, { folder_id: folderId });
}

/** Dupliquer un document */
export async function duplicateDocument(
  sourceDocumentId: string,
  userId: string,
  newName?: string
): Promise<SEODocument> {
  const source = await fetchDocumentById(sourceDocumentId);
  if (!source) throw new Error('Document source introuvable');

  const { data, error } = await supabase
    .from('seo_documents')
    .insert({
      name: newName || `${source.name} (copie)`,
      editor_mode: source.editor_mode,
      plain_content: source.plain_content,
      rich_content: source.rich_content,
      structured_content: source.structured_content,
      status: 'draft',
      folder_id: source.folder_id,
      author_user_id: userId,
      owner_user_id: userId,
      linked_template_id: source.linked_template_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Actions de masse : déplacer */
export async function bulkMoveDocuments(
  documentIds: string[],
  folderId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('seo_documents')
    .update({ folder_id: folderId })
    .in('id', documentIds);

  if (error) throw error;
}

/** Actions de masse : archiver */
export async function bulkArchiveDocuments(
  documentIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from('seo_documents')
    .update({
      status: 'archived' as DocumentStatus,
      archived_at: new Date().toISOString(),
    })
    .in('id', documentIds);

  if (error) throw error;
}

/** Actions de masse : supprimer */
export async function bulkDeleteDocuments(
  documentIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from('seo_documents')
    .delete()
    .in('id', documentIds);

  if (error) throw error;
}

/** Actions de masse : changer le statut */
export async function bulkChangeStatus(
  documentIds: string[],
  status: DocumentStatus
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === 'archived') {
    updates.archived_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('seo_documents')
    .update(updates)
    .in('id', documentIds);

  if (error) throw error;
}
