import { supabase } from './supabase';
import type {
  AIProviderConfig,
  AISystemPrompt,
  AIConversation,
  AIMessage,
} from './redactionTypes';

// ============================================================
// Client IA — abstraction multi-fournisseurs
// ============================================================

// --- Configurations fournisseur ---

/** Récupérer les configs IA accessibles (globales + utilisateur) */
export async function fetchAIConfigs(): Promise<AIProviderConfig[]> {
  const { data, error } = await supabase
    .from('seo_ai_provider_configs')
    .select('*')
    .eq('is_active', true)
    .order('provider_label');

  if (error) throw error;
  return data ?? [];
}

/** Créer ou mettre à jour une config IA */
export async function upsertAIConfig(config: {
  scope: 'global' | 'user';
  user_id?: string | null;
  provider_key: string;
  provider_label: string;
  api_base_url?: string | null;
  encrypted_api_key: string;
  default_model?: string | null;
}): Promise<AIProviderConfig> {
  const { data, error } = await supabase
    .from('seo_ai_provider_configs')
    .upsert(config, { onConflict: config.scope === 'global' ? 'provider_key' : 'user_id,provider_key' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Supprimer une config IA */
export async function deleteAIConfig(configId: string): Promise<void> {
  const { error } = await supabase
    .from('seo_ai_provider_configs')
    .delete()
    .eq('id', configId);

  if (error) throw error;
}

// --- Prompts système ---

/** Récupérer le prompt système par défaut */
export async function fetchDefaultSystemPrompt(): Promise<AISystemPrompt | null> {
  const { data, error } = await supabase
    .from('seo_ai_system_prompts')
    .select('*')
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Récupérer tous les prompts système */
export async function fetchSystemPrompts(): Promise<AISystemPrompt[]> {
  const { data, error } = await supabase
    .from('seo_ai_system_prompts')
    .select('*')
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Mettre à jour un prompt système */
export async function updateSystemPrompt(
  promptId: string,
  updates: Partial<Pick<AISystemPrompt, 'name' | 'prompt_text' | 'is_default'>>
): Promise<AISystemPrompt> {
  const { data, error } = await supabase
    .from('seo_ai_system_prompts')
    .update(updates)
    .eq('id', promptId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Conversations ---

/** Récupérer ou créer la conversation d'un document */
export async function getOrCreateConversation(
  documentId: string,
  providerConfigId?: string | null,
  modelName?: string | null,
): Promise<AIConversation> {
  // Essayer de récupérer une existante
  const { data: existing } = await supabase
    .from('seo_document_ai_conversations')
    .select('*')
    .eq('document_id', documentId)
    .maybeSingle();

  if (existing) return existing;

  // Récupérer le prompt par défaut
  const prompt = await fetchDefaultSystemPrompt();

  const { data, error } = await supabase
    .from('seo_document_ai_conversations')
    .insert({
      document_id: documentId,
      provider_config_id: providerConfigId ?? null,
      model_name: modelName ?? null,
      system_prompt_id: prompt?.id ?? null,
      system_prompt_snapshot: prompt?.prompt_text ?? '',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Mettre à jour les paramètres de conversation */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Pick<AIConversation, 'provider_config_id' | 'model_name' | 'system_prompt_id' | 'system_prompt_snapshot'>>
): Promise<AIConversation> {
  const { data, error } = await supabase
    .from('seo_document_ai_conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Messages ---

/** Récupérer les messages d'une conversation */
export async function fetchMessages(
  conversationId: string,
): Promise<AIMessage[]> {
  const { data, error } = await supabase
    .from('seo_document_ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Ajouter un message à une conversation */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  createdBy?: string | null,
): Promise<AIMessage> {
  const { data, error } = await supabase
    .from('seo_document_ai_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      created_by: createdBy ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Appel IA via Edge Function (proxy sécurisé) ---

interface AIChatParams {
  providerKey: string;
  apiKey?: string;
  apiBaseUrl?: string | null;
  model: string;
  systemPrompt: string;
  messages: { role: string; content: string }[];
  conversationId?: string;
  providerConfigId?: string;
}

/**
 * Appeler le fournisseur IA via l'Edge Function redaction-ai-chat.
 * Les clés API ne transitent JAMAIS par le client — le proxy serveur
 * récupère la config et injecte la clé côté backend.
 */
export async function callAIProvider(params: AIChatParams): Promise<string> {
  const { model, messages, conversationId, providerConfigId } = params;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Non authentifié');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const response = await fetch(`${supabaseUrl}/functions/v1/redaction-ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify({
      conversation_id: conversationId ?? null,
      messages,
      provider_config_id: providerConfigId ?? null,
      model: model ?? null,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur IA (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content ?? data.message ?? '';
  }
}
