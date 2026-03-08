/*
  # Menu Rédaction — Socle données et sécurité

  Plan technique 01 : création des tables coeur du module Rédaction.

  Structure du script (ordre résolvant les dépendances inter-tables) :
    0. Extension pg_trgm
    1. Création des 4 tables + index + triggers
    2. Activation RLS + politiques de sécurité (après que toutes les tables existent)
    3. Fonctions helpers
*/

-- ============================================================
-- 0. EXTENSION pg_trgm (requise pour l'index gin_trgm_ops)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ============================================================
-- 1a. TABLE : seo_document_folders
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid NULL REFERENCES seo_document_folders(id) ON DELETE CASCADE,
  path text NOT NULL DEFAULT '',
  depth integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT uq_folder_name_per_parent UNIQUE NULLS NOT DISTINCT (parent_id, name)
);

CREATE INDEX IF NOT EXISTS idx_seo_document_folders_parent_id ON seo_document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_seo_document_folders_path ON seo_document_folders(path);
CREATE INDEX IF NOT EXISTS idx_seo_document_folders_depth ON seo_document_folders(depth);

DROP TRIGGER IF EXISTS on_seo_document_folders_updated ON seo_document_folders;
CREATE TRIGGER on_seo_document_folders_updated
  BEFORE UPDATE ON seo_document_folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1b. TABLE : seo_documents
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  editor_mode text NOT NULL DEFAULT 'plain' CHECK (editor_mode IN ('plain', 'rich', 'structured')),
  plain_content text NULL,
  rich_content jsonb NULL,
  structured_content jsonb NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready_for_ai', 'json_generated', 'published', 'archived')),
  folder_id uuid NULL REFERENCES seo_document_folders(id) ON DELETE SET NULL,
  author_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  owner_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  linked_template_id uuid NULL REFERENCES page_templates(id) ON DELETE SET NULL,
  linked_template_snapshot jsonb NULL,
  last_generated_json jsonb NULL,
  last_generated_at timestamptz NULL,
  last_generated_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  published_page_id uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_seo_documents_folder_id ON seo_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_author_user_id ON seo_documents(author_user_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_owner_user_id ON seo_documents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_seo_documents_status ON seo_documents(status);
CREATE INDEX IF NOT EXISTS idx_seo_documents_name ON seo_documents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_seo_documents_created_at ON seo_documents(created_at DESC);

DROP TRIGGER IF EXISTS on_seo_documents_updated ON seo_documents;
CREATE TRIGGER on_seo_documents_updated
  BEFORE UPDATE ON seo_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 1c. TABLE : seo_document_permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_level text NOT NULL CHECK (permission_level IN ('reader', 'editor', 'owner')),
  granted_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT uq_document_permission_per_user UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_seo_doc_permissions_document_id ON seo_document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_seo_doc_permissions_user_id ON seo_document_permissions(user_id);


-- ============================================================
-- 1d. TABLE : seo_document_activity_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_document_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES seo_documents(id) ON DELETE CASCADE,
  actor_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_summary text NOT NULL,
  event_payload jsonb NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_document_created
  ON seo_document_activity_logs(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_event_type
  ON seo_document_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_seo_doc_logs_actor
  ON seo_document_activity_logs(actor_user_id);


-- ============================================================
-- 2. RLS + POLITIQUES (toutes les tables existent à ce stade)
-- ============================================================

-- --- seo_document_folders ---
ALTER TABLE seo_document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all folders"
  ON seo_document_folders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create folders"
  ON seo_document_folders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update folders"
  ON seo_document_folders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins and managers can delete folders"
  ON seo_document_folders FOR DELETE
  TO authenticated
  USING (public.is_admin_or_manager());

-- --- seo_documents ---
ALTER TABLE seo_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all documents"
  ON seo_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own documents"
  ON seo_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_user_id AND auth.uid() = owner_user_id);

CREATE POLICY "Owners and editors can update documents"
  ON seo_documents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM seo_document_permissions
      WHERE document_id = seo_documents.id
        AND user_id = auth.uid()
        AND permission_level IN ('editor', 'owner')
    )
  )
  WITH CHECK (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
    OR EXISTS (
      SELECT 1 FROM seo_document_permissions
      WHERE document_id = seo_documents.id
        AND user_id = auth.uid()
        AND permission_level IN ('editor', 'owner')
    )
  );

CREATE POLICY "Owners and admins can delete documents"
  ON seo_documents FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_user_id
    OR public.is_admin_or_manager()
  );

-- --- seo_document_permissions ---
ALTER TABLE seo_document_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document permissions"
  ON seo_document_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Document owners can grant permissions"
  ON seo_document_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

CREATE POLICY "Document owners can update permissions"
  ON seo_document_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

CREATE POLICY "Document owners can revoke permissions"
  ON seo_document_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seo_documents
      WHERE id = document_id AND owner_user_id = auth.uid()
    )
    OR public.is_admin_or_manager()
  );

-- --- seo_document_activity_logs ---
ALTER TABLE seo_document_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity logs"
  ON seo_document_activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
  ON seo_document_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_user_id);

-- UPDATE : interdit (pas de policy = aucune mise à jour possible)

CREATE POLICY "Only admins can delete activity logs"
  ON seo_document_activity_logs FOR DELETE
  TO authenticated
  USING (public.is_admin_or_manager());


-- ============================================================
-- 3a. FONCTION HELPER : log_document_activity
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_document_activity(
  p_document_id uuid,
  p_actor_user_id uuid,
  p_event_type text,
  p_event_summary text,
  p_event_payload jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.seo_document_activity_logs (
    document_id, actor_user_id, event_type, event_summary, event_payload
  ) VALUES (
    p_document_id, p_actor_user_id, p_event_type, p_event_summary, p_event_payload
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;


-- ============================================================
-- 3b. FONCTION HELPER : recalcul du chemin de dossier
-- ============================================================

CREATE OR REPLACE FUNCTION public.recalculate_folder_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_parent_path text;
  v_parent_depth integer;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := NEW.name;
    NEW.depth := 0;
  ELSE
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'Un dossier ne peut pas être son propre parent';
    END IF;

    SELECT path, depth INTO v_parent_path, v_parent_depth
    FROM public.seo_document_folders
    WHERE id = NEW.parent_id;

    IF v_parent_path IS NULL THEN
      RAISE EXCEPTION 'Dossier parent introuvable';
    END IF;

    NEW.path := v_parent_path || '/' || NEW.name;
    NEW.depth := v_parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_seo_document_folder_path ON seo_document_folders;
CREATE TRIGGER on_seo_document_folder_path
  BEFORE INSERT OR UPDATE ON seo_document_folders
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_folder_path();



