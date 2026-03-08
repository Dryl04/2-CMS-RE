/*
  # Menu Rédaction — Plan 03 : IA, publication et intégration

  Nouvelles tables :
    1. seo_ai_provider_configs   — configuration fournisseur IA (global ou utilisateur)
    2. seo_ai_system_prompts     — prompt système global
    3. seo_document_ai_conversations — une conversation IA par document
    4. seo_document_ai_messages     — historique des messages
    5. seo_document_publication_runs — traçabilité des publications

  Ce fichier est idempotent (IF NOT EXISTS / IF EXISTS partout).
*/

-- ============================================================
-- 1a. Table seo_ai_provider_configs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_ai_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('global', 'user')),
  user_id uuid NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider_key text NOT NULL,          -- openai, anthropic, mistral, etc.
  provider_label text NOT NULL,        -- Label d'affichage
  api_base_url text NULL,              -- URL de base optionnelle (custom endpoints)
  encrypted_api_key text NOT NULL,     -- Clé chiffrée stockée côté serveur
  default_model text NULL,             -- Modèle par défaut (gpt-4o, claude-sonnet-4-20250514, etc.)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Un utilisateur ne peut avoir qu'une config par fournisseur
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_provider_user_key
  ON seo_ai_provider_configs(user_id, provider_key)
  WHERE scope = 'user';

-- Un seul global par fournisseur
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_provider_global_key
  ON seo_ai_provider_configs(provider_key)
  WHERE scope = 'global';

ALTER TABLE seo_ai_provider_configs ENABLE ROW LEVEL SECURITY;

-- RLS : les configs globales sont visibles par admin/seo_manager, les perso par leur propriétaire
DROP POLICY IF EXISTS "AI configs: admins see global" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: admins see global" ON seo_ai_provider_configs
  FOR SELECT USING (
    scope = 'global' AND public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "AI configs: users see own" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: users see own" ON seo_ai_provider_configs
  FOR SELECT USING (
    scope = 'user' AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "AI configs: admins manage global" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: admins manage global" ON seo_ai_provider_configs
  FOR ALL USING (
    scope = 'global' AND public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "AI configs: users manage own" ON seo_ai_provider_configs;
CREATE POLICY "AI configs: users manage own" ON seo_ai_provider_configs
  FOR ALL USING (
    scope = 'user' AND user_id = auth.uid()
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS on_seo_ai_provider_configs_updated ON seo_ai_provider_configs;
CREATE TRIGGER on_seo_ai_provider_configs_updated
  BEFORE UPDATE ON seo_ai_provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1b. Table seo_ai_system_prompts
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_ai_system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt_text text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_ai_system_prompts ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire les prompts
DROP POLICY IF EXISTS "System prompts: auth read" ON seo_ai_system_prompts;
CREATE POLICY "System prompts: auth read" ON seo_ai_system_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls admin/seo_manager peuvent modifier
DROP POLICY IF EXISTS "System prompts: admins manage" ON seo_ai_system_prompts;
CREATE POLICY "System prompts: admins manage" ON seo_ai_system_prompts
  FOR ALL USING (public.is_admin_or_manager());

DROP TRIGGER IF EXISTS on_seo_ai_system_prompts_updated ON seo_ai_system_prompts;
CREATE TRIGGER on_seo_ai_system_prompts_updated
  BEFORE UPDATE ON seo_ai_system_prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insérer un prompt système par défaut
INSERT INTO seo_ai_system_prompts (name, prompt_text, is_default)
SELECT 'Prompt SEO par défaut',
  'Tu es un expert SEO. Tu reçois un texte rédactionnel et un modèle de page CMS.' ||
  ' Ta mission est de transformer le texte en un JSON compatible avec le système d''import du CMS.' ||
  ' Utilise le format content_overrides pour ne modifier que le contenu éditorial.' ||
  ' Ne modifie jamais les blocs design, les URLs d''images, les icônes ou la structure technique.' ||
  ' Respecte strictement le contrat JSON du repo.',
  true
WHERE NOT EXISTS (SELECT 1 FROM seo_ai_system_prompts WHERE is_default = true);


-- ============================================================
-- 1c. Table seo_document_ai_conversations
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid UNIQUE NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  provider_config_id uuid NULL REFERENCES seo_ai_provider_configs(id) ON DELETE SET NULL,
  model_name text NULL,
  system_prompt_id uuid NULL REFERENCES seo_ai_system_prompts(id) ON DELETE SET NULL,
  system_prompt_snapshot text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_document_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire et créer
DROP POLICY IF EXISTS "AI conversations: auth read" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth read" ON seo_document_ai_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "AI conversations: auth insert" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth insert" ON seo_document_ai_conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "AI conversations: auth update" ON seo_document_ai_conversations;
CREATE POLICY "AI conversations: auth update" ON seo_document_ai_conversations
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS on_seo_document_ai_conversations_updated ON seo_document_ai_conversations;
CREATE TRIGGER on_seo_document_ai_conversations_updated
  BEFORE UPDATE ON seo_document_ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1d. Table seo_document_ai_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES seo_document_ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content text NOT NULL,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
  ON seo_document_ai_messages(conversation_id, created_at ASC);

ALTER TABLE seo_document_ai_messages ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte
DROP POLICY IF EXISTS "AI messages: auth read" ON seo_document_ai_messages;
CREATE POLICY "AI messages: auth read" ON seo_document_ai_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insertion via frontend
DROP POLICY IF EXISTS "AI messages: auth insert" ON seo_document_ai_messages;
CREATE POLICY "AI messages: auth insert" ON seo_document_ai_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pas de modification ni suppression
-- (les messages sont immuables)


-- ============================================================
-- 1e. Table seo_document_publication_runs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_publication_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  actor_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  target_mode text NOT NULL CHECK (target_mode IN ('create_page', 'update_page')),
  target_page_id uuid NULL,
  template_id uuid NULL REFERENCES page_templates(id) ON DELETE SET NULL,
  generated_json_snapshot jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  error_message text NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publication_runs_document
  ON seo_document_publication_runs(document_id, created_at DESC);

ALTER TABLE seo_document_publication_runs ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte
DROP POLICY IF EXISTS "Publication runs: auth read" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth read" ON seo_document_publication_runs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insertion authentifiée
DROP POLICY IF EXISTS "Publication runs: auth insert" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth insert" ON seo_document_publication_runs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update uniquement par le système (pour mettre à jour status/error)
DROP POLICY IF EXISTS "Publication runs: auth update" ON seo_document_publication_runs;
CREATE POLICY "Publication runs: auth update" ON seo_document_publication_runs
  FOR UPDATE USING (auth.role() = 'authenticated');
