/*
  # Menu Rédaction — Plan 02 : Édition, collaboration et actions métier

  Ajouts sur seo_documents :
    - last_edited_by   : dernier utilisateur ayant modifié
    - edit_lock_user_id : verrou léger informatif
    - edit_lock_at      : horodatage du verrou
    - trashed_at        : corbeille logique
    - trashed_by        : utilisateur ayant mis en corbeille

  Ajout sur seo_document_permissions :
    - updated_at : horodatage de dernière modification de permission
*/

-- ============================================================
-- 1. Nouvelles colonnes sur seo_documents
-- ============================================================

ALTER TABLE seo_documents
  ADD COLUMN IF NOT EXISTS last_edited_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edit_lock_user_id uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edit_lock_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS trashed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS trashed_by uuid NULL REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Index pour filtrer rapidement les documents non mis en corbeille
CREATE INDEX IF NOT EXISTS idx_seo_documents_trashed_at ON seo_documents(trashed_at);
CREATE INDEX IF NOT EXISTS idx_seo_documents_last_edited_by ON seo_documents(last_edited_by);


-- ============================================================
-- 2. Nouvelle colonne sur seo_document_permissions
-- ============================================================

ALTER TABLE seo_document_permissions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger updated_at sur permissions
DROP TRIGGER IF EXISTS on_seo_document_permissions_updated ON seo_document_permissions;
CREATE TRIGGER on_seo_document_permissions_updated
  BEFORE UPDATE ON seo_document_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
