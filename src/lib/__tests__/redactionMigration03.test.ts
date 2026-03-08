import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Migration Plan 03 — IA et Publication', () => {
  const sql = readFileSync(
    join(__dirname, '../../../supabase/migrations/20260308140000_redaction_ia_publication.sql'),
    'utf-8',
  );

  // --- Tables ---

  it('creates seo_ai_provider_configs table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_ai_provider_configs');
    expect(sql).toContain("scope text NOT NULL CHECK (scope IN ('global', 'user'))");
    expect(sql).toContain('provider_key text NOT NULL');
    expect(sql).toContain('encrypted_api_key text NOT NULL');
    expect(sql).toContain('is_active boolean NOT NULL DEFAULT true');
  });

  it('creates seo_ai_system_prompts table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_ai_system_prompts');
    expect(sql).toContain('prompt_text text NOT NULL');
    expect(sql).toContain('is_default boolean NOT NULL DEFAULT false');
  });

  it('creates seo_document_ai_conversations table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_ai_conversations');
    expect(sql).toContain('document_id uuid UNIQUE NOT NULL');
    expect(sql).toContain('system_prompt_snapshot text NOT NULL');
  });

  it('creates seo_document_ai_messages table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_ai_messages');
    expect(sql).toContain("role text NOT NULL CHECK (role IN ('system', 'user', 'assistant'))");
    expect(sql).toContain('content text NOT NULL');
  });

  it('creates seo_document_publication_runs table', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_publication_runs');
    expect(sql).toContain("target_mode text NOT NULL CHECK (target_mode IN ('create_page', 'update_page'))");
    expect(sql).toContain("status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed'))");
    expect(sql).toContain('generated_json_snapshot jsonb NOT NULL');
  });

  // --- RLS ---

  it('enables RLS on all five tables', () => {
    expect(sql).toContain('ALTER TABLE seo_ai_provider_configs ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE seo_ai_system_prompts ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE seo_document_ai_conversations ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE seo_document_ai_messages ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE seo_document_publication_runs ENABLE ROW LEVEL SECURITY');
  });

  // --- Policies ---

  it('creates SELECT policies for ai provider configs', () => {
    expect(sql).toContain('AI configs: admins see global');
    expect(sql).toContain('AI configs: users see own');
  });

  it('creates management policies for provider configs', () => {
    expect(sql).toContain('AI configs: admins manage global');
    expect(sql).toContain('AI configs: users manage own');
  });

  it('creates policies for system prompts', () => {
    expect(sql).toContain('System prompts: auth read');
    expect(sql).toContain('System prompts: admins manage');
  });

  it('creates policies for conversations', () => {
    expect(sql).toContain('AI conversations: auth read');
    expect(sql).toContain('AI conversations: auth insert');
    expect(sql).toContain('AI conversations: auth update');
  });

  it('creates policies for messages', () => {
    expect(sql).toContain('AI messages: auth read');
    expect(sql).toContain('AI messages: auth insert');
  });

  it('creates policies for publication runs', () => {
    expect(sql).toContain('Publication runs: auth read');
    expect(sql).toContain('Publication runs: auth insert');
    expect(sql).toContain('Publication runs: auth update');
  });

  // --- Indexes ---

  it('creates unique indexes for provider configs', () => {
    expect(sql).toContain('uq_ai_provider_user_key');
    expect(sql).toContain('uq_ai_provider_global_key');
  });

  it('creates index for messages by conversation', () => {
    expect(sql).toContain('idx_ai_messages_conversation');
  });

  it('creates index for publication runs by document', () => {
    expect(sql).toContain('idx_publication_runs_document');
  });

  // --- Triggers ---

  it('creates updated_at triggers for relevant tables', () => {
    expect(sql).toContain('on_seo_ai_provider_configs_updated');
    expect(sql).toContain('on_seo_ai_system_prompts_updated');
    expect(sql).toContain('on_seo_document_ai_conversations_updated');
    expect(sql).toContain('handle_updated_at');
  });

  // --- Seed data ---

  it('seeds a default system prompt', () => {
    expect(sql).toContain('INSERT INTO seo_ai_system_prompts');
    expect(sql).toContain('Prompt SEO par défaut');
    expect(sql).toContain('is_default = true');
  });

  // --- Idempotency ---

  it('uses IF NOT EXISTS / IF EXISTS for idempotency', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS');
    expect(sql).toContain('DROP POLICY IF EXISTS');
    expect(sql).toContain('DROP TRIGGER IF EXISTS');
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  });
});
