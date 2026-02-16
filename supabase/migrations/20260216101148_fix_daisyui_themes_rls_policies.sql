/*
  # Correction des policies RLS pour daisyui_themes
  
  1. Changements
    - Supprime l'ancienne policy UPDATE trop restrictive
    - Ajoute une policy pour permettre de changer is_active sur tous les thèmes
    - Ajoute une policy pour permettre de modifier les autres champs uniquement sur les thèmes personnalisés
  
  2. Raison
    - La policy précédente empêchait de changer le thème actif car elle bloquait
      les UPDATE sur les thèmes officiels (user_id = NULL)
    - Maintenant on sépare la logique : is_active peut être modifié sur tous les thèmes,
      mais les autres champs (name, slug, tokens) uniquement sur les thèmes personnalisés
*/

-- Supprimer l'ancienne policy UPDATE trop restrictive
DROP POLICY IF EXISTS "Users can update own custom themes" ON daisyui_themes;

-- Permettre à tous les utilisateurs authentifiés de changer is_active sur n'importe quel thème
CREATE POLICY "Users can activate any theme"
  ON daisyui_themes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Créer une fonction trigger pour empêcher la modification des autres champs sur les thèmes officiels
CREATE OR REPLACE FUNCTION prevent_official_theme_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un thème officiel
  IF OLD.source = 'daisyui' THEN
    -- Seul is_active peut être modifié
    IF NEW.name IS DISTINCT FROM OLD.name OR
       NEW.slug IS DISTINCT FROM OLD.slug OR
       NEW.tokens IS DISTINCT FROM OLD.tokens OR
       NEW.source IS DISTINCT FROM OLD.source OR
       NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Cannot modify official DaisyUI themes';
    END IF;
  END IF;
  
  -- Si c'est un thème personnalisé, vérifier que l'utilisateur est le propriétaire
  IF OLD.source = 'custom' AND OLD.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify themes owned by other users';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS check_theme_modification ON daisyui_themes;
CREATE TRIGGER check_theme_modification
  BEFORE UPDATE ON daisyui_themes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_official_theme_modification();
