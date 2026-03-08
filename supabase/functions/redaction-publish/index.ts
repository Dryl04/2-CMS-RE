import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAGE_KEY_REGEX = /^[a-z0-9-]+$/;

/**
 * Edge Function : redaction-publish
 *
 * Publie le JSON généré d'un document rédactionnel vers le CMS :
 * - Mode "create_page" : insère une nouvelle entrée dans seo_metadata
 * - Mode "update_page" : met à jour une entrée existante
 *
 * Body attendu :
 *   { document_id, mode: "create_page"|"update_page", target_page_id? }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError("Non autorisé", 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
    } = await anonClient.auth.getUser();
    if (!user) return jsonError("Non autorisé", 401);

    const { document_id, mode, target_page_id } = await req.json();
    if (!document_id) return jsonError("document_id requis", 400);
    if (!mode || !["create_page", "update_page"].includes(mode)) {
      return jsonError("mode doit être 'create_page' ou 'update_page'", 400);
    }
    if (mode === "update_page" && !target_page_id) {
      return jsonError("target_page_id requis pour update_page", 400);
    }

    // 1. Récupérer le document
    const { data: doc, error: docErr } = await supabase
      .from("seo_documents")
      .select("*")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) return jsonError("Document introuvable", 404);

    const jsonPayload = doc.last_generated_json;
    if (!jsonPayload) {
      return jsonError("Aucun JSON généré pour ce document", 400);
    }

    // 2. Revalider le JSON côté serveur
    const validation = validateJson(jsonPayload);
    if (!validation.valid) {
      return jsonResponse(
        {
          success: false,
          error: "Le JSON généré est invalide",
          validation,
        },
        400,
      );
    }

    // 3. Créer le run de publication
    const { data: run } = await supabase
      .from("seo_document_publication_runs")
      .insert({
        document_id,
        actor_user_id: user.id,
        target_mode: mode,
        target_page_id: target_page_id || null,
        generated_json_snapshot: jsonPayload,
        status: "pending",
      })
      .select()
      .single();

    const runId = run?.id;

    try {
      const pages = (jsonPayload as { pages: Array<Record<string, unknown>> })
        .pages;
      const publishedIds: string[] = [];

      if (mode === "create_page") {
        for (const page of pages) {
          const pageKey = page.page_key as string;
          const title = page.title as string;
          const metaDesc = (page.meta_description as string) || "";
          const status = (page.status as string) || "draft";
          const contentOverrides = page.content_overrides || page;

          const { data: created, error: createErr } = await supabase
            .from("seo_metadata")
            .insert({
              page_key: pageKey,
              title,
              meta_description: metaDesc,
              status,
              content_overrides: contentOverrides,
              robots: "index, follow",
            })
            .select("id")
            .single();

          if (createErr) {
            throw new Error(
              `Erreur création page "${pageKey}": ${createErr.message}`,
            );
          }
          if (created) publishedIds.push(created.id);
        }
      } else {
        // update_page
        const page = pages[0];
        if (!page) throw new Error("Aucune page dans le JSON");

        const title = page.title as string;
        const metaDesc = (page.meta_description as string) || undefined;
        const status = (page.status as string) || undefined;
        const contentOverrides = page.content_overrides || page;

        const updatePayload: Record<string, unknown> = {
          title,
          content_overrides: contentOverrides,
        };
        if (metaDesc !== undefined) updatePayload.meta_description = metaDesc;
        if (status !== undefined) updatePayload.status = status;

        const { error: updateErr } = await supabase
          .from("seo_metadata")
          .update(updatePayload)
          .eq("id", target_page_id);

        if (updateErr) {
          throw new Error(`Erreur mise à jour page: ${updateErr.message}`);
        }
        publishedIds.push(target_page_id);
      }

      // 4. Succès : mettre à jour le run + document
      if (runId) {
        await supabase
          .from("seo_document_publication_runs")
          .update({
            status: "succeeded",
          })
          .eq("id", runId);
      }

      // Mettre à jour le document
      await supabase
        .from("seo_documents")
        .update({
          status: "published",
          published_page_id: publishedIds[0] || null,
        })
        .eq("id", document_id);

      // Logger l'activité
      await supabase.from("seo_document_activity_logs").insert({
        document_id,
        actor_user_id: user.id,
        event_type: "document_published",
        event_summary: `Document publié en mode ${mode}`,
        event_payload: {
          mode,
          published_ids: publishedIds,
          run_id: runId,
        },
      });

      return jsonResponse({
        success: true,
        mode,
        published_ids: publishedIds,
        run_id: runId,
      });
    } catch (publishErr) {
      // Echec : mettre à jour le run
      if (runId) {
        await supabase
          .from("seo_document_publication_runs")
          .update({
            status: "failed",
            error_message:
              publishErr instanceof Error
                ? publishErr.message
                : String(publishErr),
          })
          .eq("id", runId);
      }

      await supabase.from("seo_document_activity_logs").insert({
        document_id,
        actor_user_id: user.id,
        event_type: "publication_failed",
        event_summary: "Échec de la publication",
        event_payload: {
          mode,
          error:
            publishErr instanceof Error
              ? publishErr.message
              : String(publishErr),
        },
      });

      return jsonResponse(
        {
          success: false,
          error:
            publishErr instanceof Error
              ? publishErr.message
              : "Erreur de publication",
          run_id: runId,
        },
        500,
      );
    }
  } catch (err) {
    console.error("[redaction-publish] Error:", err);
    return jsonError(
      err instanceof Error ? err.message : "Erreur interne",
      500,
    );
  }
});

// --- Validation ---

function validateJson(
  json: unknown,
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!json || typeof json !== "object") {
    return { valid: false, errors: ["JSON doit être un objet"], warnings: [] };
  }
  const payload = json as Record<string, unknown>;
  if (!Array.isArray(payload.pages)) {
    return {
      valid: false,
      errors: ['Tableau "pages" manquant'],
      warnings: [],
    };
  }
  if (payload.pages.length === 0) {
    return { valid: false, errors: ['"pages" est vide'], warnings: [] };
  }

  for (let i = 0; i < payload.pages.length; i++) {
    const page = payload.pages[i] as Record<string, unknown>;
    const p = `pages[${i}]`;
    if (!page.page_key || typeof page.page_key !== "string") {
      errors.push(`${p}.page_key obligatoire`);
    } else if (!PAGE_KEY_REGEX.test(page.page_key as string)) {
      errors.push(`${p}.page_key format invalide`);
    }
    if (!page.title || typeof page.title !== "string") {
      errors.push(`${p}.title obligatoire`);
    }
    if (
      page.status &&
      !["draft", "published", "archived"].includes(page.status as string)
    ) {
      errors.push(`${p}.status invalide`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// --- Helpers ---

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
