import { supabase } from './supabase';
import type { SEODocumentPermission, PermissionLevel } from './redactionTypes';

// ============================================================
// CRUD Permissions
// ============================================================

/** Récupérer les permissions d'un document */
export async function fetchDocumentPermissions(
  documentId: string
): Promise<(SEODocumentPermission & { user_profile?: { id: string; email: string; full_name?: string } })[]> {
  const { data, error } = await supabase
    .from('seo_document_permissions')
    .select(`
      *,
      user_profile:user_profiles!seo_document_permissions_user_id_fkey(id, email, full_name)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Accorder une permission */
export async function grantPermission(
  documentId: string,
  userId: string,
  level: PermissionLevel,
  grantedBy: string
): Promise<SEODocumentPermission> {
  const { data, error } = await supabase
    .from('seo_document_permissions')
    .upsert(
      {
        document_id: documentId,
        user_id: userId,
        permission_level: level,
        granted_by: grantedBy,
      },
      { onConflict: 'document_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Révoquer une permission */
export async function revokePermission(
  documentId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('seo_document_permissions')
    .delete()
    .eq('document_id', documentId)
    .eq('user_id', userId);

  if (error) throw error;
}

/** Vérifier si un utilisateur peut éditer un document */
export function canUserEditDocument(
  document: { owner_user_id: string },
  userId: string,
  userRole: string,
  permissions: SEODocumentPermission[]
): boolean {
  // Owner
  if (document.owner_user_id === userId) return true;
  // Admin ou seo_manager
  if (userRole === 'admin' || userRole === 'seo_manager') return true;
  // Éditeur partagé
  return permissions.some(
    (p) => p.user_id === userId && (p.permission_level === 'editor' || p.permission_level === 'owner')
  );
}
