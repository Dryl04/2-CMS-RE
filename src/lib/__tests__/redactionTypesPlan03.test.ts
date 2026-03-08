import { describe, it, expect } from 'vitest';
import {
  AI_PROVIDERS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../redactionTypes';
import type {
  AIProviderConfig,
  AISystemPrompt,
  AIConversation,
  AIMessage,
  PublicationRun,
} from '../redactionTypes';

describe('redactionTypes Plan 03', () => {
  it('AI_PROVIDERS contains required providers', () => {
    const keys = AI_PROVIDERS.map((p) => p.key);
    expect(keys).toContain('openai');
    expect(keys).toContain('anthropic');
    expect(keys).toContain('mistral');
  });

  it('each AI_PROVIDERS entry has label and models', () => {
    for (const p of AI_PROVIDERS) {
      expect(typeof p.label).toBe('string');
      expect(p.label.length).toBeGreaterThan(0);
      expect(Array.isArray(p.models)).toBe(true);
      expect(p.models.length).toBeGreaterThan(0);
    }
  });

  it('AIProviderConfig shape is correct', () => {
    const config: AIProviderConfig = {
      id: 'cfg-1',
      scope: 'global',
      user_id: null,
      provider_key: 'openai',
      provider_label: 'OpenAI',
      api_base_url: null,
      encrypted_api_key: 'sk-test',
      default_model: 'gpt-4o',
      is_active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    expect(config.scope).toBe('global');
    expect(config.is_active).toBe(true);
  });

  it('AISystemPrompt shape is correct', () => {
    const prompt: AISystemPrompt = {
      id: 'prompt-1',
      name: 'Default SEO',
      prompt_text: 'Tu es un expert SEO.',
      is_default: true,
      created_by: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    expect(prompt.is_default).toBe(true);
  });

  it('AIConversation shape is correct', () => {
    const conv: AIConversation = {
      id: 'conv-1',
      document_id: 'doc-1',
      provider_config_id: null,
      model_name: null,
      system_prompt_id: null,
      system_prompt_snapshot: '',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    expect(conv.document_id).toBe('doc-1');
  });

  it('AIMessage shape is correct', () => {
    const msg: AIMessage = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'Hello',
      created_by: null,
      created_at: '2026-01-01',
    };
    expect(msg.role).toBe('assistant');
  });

  it('PublicationRun shape is correct', () => {
    const run: PublicationRun = {
      id: 'run-1',
      document_id: 'doc-1',
      actor_user_id: 'user-1',
      target_mode: 'create_page',
      target_page_id: null,
      template_id: null,
      generated_json_snapshot: { pages: [] },
      status: 'pending',
      error_message: null,
      created_at: '2026-01-01',
    };
    expect(run.target_mode).toBe('create_page');
    expect(run.status).toBe('pending');
  });

  it('STATUS_LABELS has all expected statuses', () => {
    expect(STATUS_LABELS.draft).toBe('Brouillon');
    expect(STATUS_LABELS.ready_for_ai).toBe('Prêt pour IA');
    expect(STATUS_LABELS.json_generated).toBe('JSON généré');
    expect(STATUS_LABELS.published).toBe('Publié');
    expect(STATUS_LABELS.archived).toBe('Archivé');
  });
});
