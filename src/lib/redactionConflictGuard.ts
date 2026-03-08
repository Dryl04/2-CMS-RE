import { supabase } from './supabase';
import type { SEODocument } from './redactionTypes';

// ============================================================
// Verrou léger informatif — prévention minimale des conflits
// ============================================================

const LOCK_STALE_MS = 5 * 60 * 1000; // 5 minutes

/** Acquérir le verrou d'édition */
export async function acquireEditLock(
  documentId: string,
  userId: string
): Promise<{ acquired: boolean; lockedBy?: string; lockedAt?: string }> {
  // Lire l'état courant
  const { data: doc, error } = await supabase
    .from('seo_documents')
    .select('edit_lock_user_id, edit_lock_at')
    .eq('id', documentId)
    .single();

  if (error) throw error;

  // Si un verrou actif existe pour un autre utilisateur
  if (doc.edit_lock_user_id && doc.edit_lock_user_id !== userId) {
    const lockAge = Date.now() - new Date(doc.edit_lock_at ?? 0).getTime();
    if (lockAge < LOCK_STALE_MS) {
      return {
        acquired: false,
        lockedBy: doc.edit_lock_user_id,
        lockedAt: doc.edit_lock_at,
      };
    }
    // Verrou périmé → on le reprend
  }

  // Poser le verrou
  const { error: updateError } = await supabase
    .from('seo_documents')
    .update({
      edit_lock_user_id: userId,
      edit_lock_at: new Date().toISOString(),
    })
    .eq('id', documentId);

  if (updateError) throw updateError;

  return { acquired: true };
}

/** Renouveler le verrou (heartbeat) */
export async function renewEditLock(
  documentId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('seo_documents')
    .update({ edit_lock_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('edit_lock_user_id', userId);
}

/** Libérer le verrou */
export async function releaseEditLock(
  documentId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('seo_documents')
    .update({ edit_lock_user_id: null, edit_lock_at: null })
    .eq('id', documentId)
    .eq('edit_lock_user_id', userId);
}

/** Vérifier si le document est verrouillé par un autre utilisateur */
export function isLockedByOther(
  doc: Pick<SEODocument, 'edit_lock_user_id' | 'edit_lock_at'>,
  userId: string
): boolean {
  if (!doc.edit_lock_user_id || doc.edit_lock_user_id === userId) return false;
  const lockAge = Date.now() - new Date(doc.edit_lock_at ?? 0).getTime();
  return lockAge < LOCK_STALE_MS;
}
