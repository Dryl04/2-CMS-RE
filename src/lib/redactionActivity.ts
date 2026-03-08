import { supabase } from './supabase';
import type { SEODocumentActivityLog, ActivityEventType } from './redactionTypes';

// ============================================================
// Logs d'activité
// ============================================================

/** Récupérer les logs d'un document */
export async function fetchDocumentLogs(
  documentId: string,
  limit = 50
): Promise<(SEODocumentActivityLog & { actor_profile?: { id: string; email: string; full_name?: string } })[]> {
  const { data, error } = await supabase
    .from('seo_document_activity_logs')
    .select(`
      *,
      actor_profile:user_profiles!seo_document_activity_logs_actor_user_id_fkey(id, email, full_name)
    `)
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Créer un log d'activité */
export async function logDocumentActivity(
  documentId: string,
  actorUserId: string,
  eventType: ActivityEventType,
  eventSummary: string,
  eventPayload?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('seo_document_activity_logs')
    .insert({
      document_id: documentId,
      actor_user_id: actorUserId,
      event_type: eventType,
      event_summary: eventSummary,
      event_payload: eventPayload ?? null,
    });

  if (error) {
    console.error('[RedactionActivity] Erreur log:', error);
    // Ne pas bloquer l'action principale en cas d'erreur de log
  }
}
