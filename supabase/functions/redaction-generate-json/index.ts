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
 * Edge Function : redaction-generate-json
 *
 * Génère un JSON SEO à partir d'un document rédactionnel via l'IA,
 * valide le résultat côté serveur, et stocke le JSON dans le document.
 *
 * Body attendu :
 *   { document_id, provider_config_id?, model? }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Non autorisé", 401);
    }

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

    const { document_id, provider_config_id, model } = await req.json();
    if (!document_id) return jsonError("document_id requis", 400);

    // 1. Récupérer le document
    const { data: doc, error: docErr } = await supabase
      .from("seo_documents")
      .select("*")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) return jsonError("Document introuvable", 404);

    // 2. Récupérer la conversation (ou créer)
    let { data: conversation } = await supabase
      .from("seo_document_ai_conversations")
      .select("*")
      .eq("document_id", document_id)
      .maybeSingle();

    if (!conversation) {
      const { data: defaultPrompt } = await supabase
        .from("seo_ai_system_prompts")
        .select("*")
        .eq("is_default", true)
        .maybeSingle();

      const { data: newConv } = await supabase
        .from("seo_document_ai_conversations")
        .insert({
          document_id,
          provider_config_id: provider_config_id ?? null,
          system_prompt_id: defaultPrompt?.id ?? null,
          system_prompt_snapshot: defaultPrompt?.prompt_text ?? "",
        })
        .select()
        .single();
      conversation = newConv;
    }

    // 3. Récupérer le provider config
    const configId =
      provider_config_id || conversation?.provider_config_id;
    if (!configId) {
      return jsonError("Aucun fournisseur IA configuré", 400);
    }

    const { data: config } = await supabase
      .from("seo_ai_provider_configs")
      .select("*")
      .eq("id", configId)
      .single();
    if (!config) return jsonError("Configuration IA introuvable", 404);

    const modelName =
      model || conversation?.model_name || config.default_model;
    if (!modelName) return jsonError("Aucun modèle IA spécifié", 400);

    // 4. Récupérer le template lié (si existant)
    let template = null;
    if (doc.linked_template_id) {
      const { data: tpl } = await supabase
        .from("page_templates")
        .select("*")
        .eq("id", doc.linked_template_id)
        .maybeSingle();
      template = tpl;
    }

    // 5. Construire le prompt de génération
    const sourceText = doc.plain_content || "(aucun contenu)";
    const prompt = buildPrompt(doc, sourceText, template);

    // 6. Appeler l'IA
    let assistantText: string;
    const systemPrompt = conversation?.system_prompt_snapshot || "";

    if (config.provider_key === "anthropic") {
      assistantText = await callAnthropic(
        config.encrypted_api_key,
        modelName,
        systemPrompt,
        [{ role: "user", content: prompt }],
        config.api_base_url,
      );
    } else {
      assistantText = await callOpenAICompatible(
        config.encrypted_api_key,
        modelName,
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        config.api_base_url || getDefaultBaseUrl(config.provider_key),
      );
    }

    // 7. Extraire et valider le JSON
    const extracted = extractJsonFromText(assistantText);
    if (!extracted) {
      return jsonResponse({
        success: false,
        error: "L'IA n'a pas retourné de JSON valide.",
        raw_response: assistantText,
      });
    }

    const validation = validateJson(extracted.json);

    // 8. Sauvegarder les messages et le JSON
    if (conversation) {
      await supabase.from("seo_document_ai_messages").insert([
        {
          conversation_id: conversation.id,
          role: "user",
          content: prompt,
          created_by: user.id,
        },
        {
          conversation_id: conversation.id,
          role: "assistant",
          content: assistantText,
          created_by: null,
        },
      ]);
    }

    // 9. Mettre à jour le document
    await supabase
      .from("seo_documents")
      .update({
        last_generated_json: extracted.json,
        last_generated_at: new Date().toISOString(),
        last_generated_by: user.id,
        status: "json_generated",
      })
      .eq("id", document_id);

    // 10. Logger l'activité
    await supabase.from("seo_document_activity_logs").insert({
      document_id,
      actor_user_id: user.id,
      event_type: "ai_json_generated",
      event_summary: "JSON généré par IA",
      event_payload: { model: modelName, provider: config.provider_key },
    });

    return jsonResponse({
      success: true,
      json: extracted.json,
      validation,
    });
  } catch (err) {
    console.error("[redaction-generate-json] Error:", err);
    return jsonError(
      err instanceof Error ? err.message : "Erreur interne",
      500,
    );
  }
});

// --- Extraction et validation ---

function extractJsonFromText(
  text: string,
): { json: unknown; raw: string } | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();
  try {
    return { json: JSON.parse(jsonStr), raw: jsonStr };
  } catch {
    return null;
  }
}

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

// --- Prompt ---

function buildPrompt(
  doc: Record<string, unknown>,
  sourceText: string,
  template: Record<string, unknown> | null,
): string {
  const parts = [
    "## Texte source\n" + sourceText,
    "\n\n## Document\n- Nom : " + doc.name + "\n- Mode : " + doc.editor_mode,
  ];

  if (template) {
    parts.push(
      "\n\n## Template CMS\n- Nom : " +
        template.name +
        "\n- ID : " +
        template.id,
    );
    if (template.sections_data) {
      parts.push(
        "\n\n## Export template\n```json\n" +
          JSON.stringify(template.sections_data, null, 2) +
          "\n```",
      );
    }
  }

  parts.push(
    '\n\n## Format de sortie\nGénère un JSON au format content_overrides. page_key en minuscules/tirets. title obligatoire. Retourne UNIQUEMENT le JSON, sans texte autour.',
  );
  parts.push(
    "\nRègles : Ne modifie JAMAIS les blocs design, les URLs d'images, les icônes.",
  );

  return parts.join("\n");
}

// --- Appels IA ---

async function callOpenAICompatible(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  baseUrl: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`AI error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
  apiBaseUrl?: string | null,
): Promise<string> {
  const baseUrl = apiBaseUrl ?? "https://api.anthropic.com";
  const res = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== "system"),
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic error (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

function getDefaultBaseUrl(providerKey: string): string {
  switch (providerKey) {
    case "openai":
      return "https://api.openai.com/v1";
    case "mistral":
      return "https://api.mistral.ai/v1";
    default:
      return "https://api.openai.com/v1";
  }
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
