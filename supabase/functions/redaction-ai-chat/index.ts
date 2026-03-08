import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/**
 * Edge Function : redaction-ai-chat
 *
 * Proxy sécurisé pour les appels IA.
 * Récupère la config fournisseur côté serveur (clé API déchiffrée),
 * injecte le prompt système et appelle le fournisseur.
 *
 * Body attendu :
 *   { conversation_id, messages: [{ role, content }], provider_config_id?, model? }
 */
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier l'utilisateur
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await anonClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { conversation_id, messages, provider_config_id, model } = body;

    if (!conversation_id || !messages?.length) {
      return new Response(
        JSON.stringify({ error: "conversation_id et messages requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Récupérer la conversation
    const { data: conversation, error: convErr } = await supabase
      .from("seo_document_ai_conversations")
      .select("*")
      .eq("id", conversation_id)
      .single();

    if (convErr || !conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation introuvable" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Récupérer la config fournisseur
    const configId = provider_config_id || conversation.provider_config_id;
    if (!configId) {
      return new Response(
        JSON.stringify({
          error: "Aucun fournisseur IA configuré pour cette conversation",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: config, error: cfgErr } = await supabase
      .from("seo_ai_provider_configs")
      .select("*")
      .eq("id", configId)
      .single();

    if (cfgErr || !config) {
      return new Response(
        JSON.stringify({ error: "Configuration IA introuvable" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const modelName = model || conversation.model_name || config.default_model;
    if (!modelName) {
      return new Response(
        JSON.stringify({ error: "Aucun modèle IA spécifié" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Construire les messages avec prompt système
    const systemPrompt = conversation.system_prompt_snapshot || "";
    const allMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages,
    ];

    // Appeler le fournisseur
    let assistantContent: string;

    if (config.provider_key === "anthropic") {
      assistantContent = await callAnthropic(
        config.encrypted_api_key,
        modelName,
        systemPrompt,
        messages,
        config.api_base_url,
      );
    } else {
      assistantContent = await callOpenAICompatible(
        config.encrypted_api_key,
        modelName,
        allMessages,
        config.api_base_url || getDefaultBaseUrl(config.provider_key),
      );
    }

    // Sauvegarder le message assistant
    await supabase.from("seo_document_ai_messages").insert({
      conversation_id,
      role: "assistant",
      content: assistantContent,
      created_by: null,
    });

    return new Response(
      JSON.stringify({ content: assistantContent }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[redaction-ai-chat] Error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erreur interne",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// --- Helpers d'appel ---

async function callOpenAICompatible(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  baseUrl: string,
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI provider error (${response.status}): ${err}`);
  }

  const data = await response.json();
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

  const response = await fetch(`${baseUrl}/v1/messages`, {
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic error (${response.status}): ${err}`);
  }

  const data = await response.json();
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
