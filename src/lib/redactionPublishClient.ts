import { supabase } from './supabase';
import type { PublicationRun, PublicationTargetMode } from './redactionTypes';

// ============================================================
// Client Publication — création / mise à jour de pages
// ============================================================

/** Créer une nouvelle page depuis un document rédactionnel */
export async function publishNewPage(params: {
  documentId: string;
  actorUserId: string;
  templateId: string | null;
  generatedJson: Record<string, unknown>;
}): Promise<PublicationRun> {
  const page = (params.generatedJson as { pages?: Record<string, unknown>[] })?.pages?.[0];
  if (!page) throw new Error('Le JSON ne contient aucune page.');

  // Créer le run
  const run = await createPublicationRun({
    document_id: params.documentId,
    actor_user_id: params.actorUserId,
    target_mode: 'create_page',
    template_id: params.templateId,
    generated_json_snapshot: params.generatedJson,
  });

  try {
    // Insérer dans seo_metadata
    const { data: newPage, error } = await supabase
      .from('seo_metadata')
      .insert({
        page_key: page.page_key as string,
        title: page.title as string,
        description: (page.description as string) ?? null,
        keywords: Array.isArray(page.keywords)
          ? page.keywords
          : typeof page.keywords === 'string'
            ? (page.keywords as string).split(',').map((k: string) => k.trim())
            : null,
        status: (page.status as string) ?? 'draft',
        template_id: (page.template_id as string) ?? params.templateId,
        daisy_theme_slug: (page.daisy_theme_slug as string) ?? null,
        sections_data: page.sections_data ?? null,
        seo_h1: (page.seo_h1 as string) ?? null,
        seo_h2: (page.seo_h2 as string) ?? null,
        og_title: (page.og_title as string) ?? null,
        og_description: (page.og_description as string) ?? null,
        og_image: (page.og_image as string) ?? null,
        content: (page.content as string) ?? null,
        user_id: params.actorUserId,
        created_by: params.actorUserId,
      })
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour le run et le document
    await updatePublicationRun(run.id, {
      status: 'succeeded',
      target_page_id: newPage.id,
    });

    // Lier la page au document
    await supabase
      .from('seo_documents')
      .update({
        published_page_id: newPage.id,
        status: 'published',
      })
      .eq('id', params.documentId);

    return { ...run, status: 'succeeded', target_page_id: newPage.id };
  } catch (err) {
    await updatePublicationRun(run.id, {
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/** Mettre à jour une page existante */
export async function publishUpdatePage(params: {
  documentId: string;
  actorUserId: string;
  targetPageId: string;
  templateId: string | null;
  generatedJson: Record<string, unknown>;
}): Promise<PublicationRun> {
  const page = (params.generatedJson as { pages?: Record<string, unknown>[] })?.pages?.[0];
  if (!page) throw new Error('Le JSON ne contient aucune page.');

  const run = await createPublicationRun({
    document_id: params.documentId,
    actor_user_id: params.actorUserId,
    target_mode: 'update_page',
    target_page_id: params.targetPageId,
    template_id: params.templateId,
    generated_json_snapshot: params.generatedJson,
  });

  try {
    const updates: Record<string, unknown> = {};
    if (page.title) updates.title = page.title;
    if (page.description !== undefined) updates.description = page.description;
    if (page.keywords) {
      updates.keywords = Array.isArray(page.keywords)
        ? page.keywords
        : typeof page.keywords === 'string'
          ? (page.keywords as string).split(',').map((k: string) => k.trim())
          : null;
    }
    if (page.sections_data) updates.sections_data = page.sections_data;
    if (page.seo_h1) updates.seo_h1 = page.seo_h1;
    if (page.seo_h2) updates.seo_h2 = page.seo_h2;
    if (page.og_title) updates.og_title = page.og_title;
    if (page.og_description) updates.og_description = page.og_description;
    if (page.content) updates.content = page.content;

    const { error } = await supabase
      .from('seo_metadata')
      .update(updates)
      .eq('id', params.targetPageId);

    if (error) throw error;

    await updatePublicationRun(run.id, { status: 'succeeded' });
    return { ...run, status: 'succeeded' };
  } catch (err) {
    await updatePublicationRun(run.id, {
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

// --- Helpers internes ---

async function createPublicationRun(params: {
  document_id: string;
  actor_user_id: string;
  target_mode: PublicationTargetMode;
  target_page_id?: string | null;
  template_id?: string | null;
  generated_json_snapshot: Record<string, unknown>;
}): Promise<PublicationRun> {
  const { data, error } = await supabase
    .from('seo_document_publication_runs')
    .insert({
      document_id: params.document_id,
      actor_user_id: params.actor_user_id,
      target_mode: params.target_mode,
      target_page_id: params.target_page_id ?? null,
      template_id: params.template_id ?? null,
      generated_json_snapshot: params.generated_json_snapshot,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePublicationRun(
  runId: string,
  updates: Partial<Pick<PublicationRun, 'status' | 'error_message' | 'target_page_id'>>
): Promise<void> {
  const { error } = await supabase
    .from('seo_document_publication_runs')
    .update(updates)
    .eq('id', runId);

  if (error) console.error('[PublishClient] Erreur update run:', error);
}

/** Récupérer les runs de publication d'un document */
export async function fetchPublicationRuns(
  documentId: string,
): Promise<PublicationRun[]> {
  const { data, error } = await supabase
    .from('seo_document_publication_runs')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
