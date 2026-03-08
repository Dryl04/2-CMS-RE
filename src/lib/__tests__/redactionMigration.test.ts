import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// ===================================================================
// Tests fonctionnels : validation de la migration SQL
// ===================================================================

describe('Migration SQL - socle rédaction', () => {
  const migrationPath = join(
    process.cwd(),
    'supabase/migrations/20260308100000_create_redaction_tables.sql'
  );

  let sql: string;

  try {
    sql = readFileSync(migrationPath, 'utf-8');
  } catch {
    sql = '';
  }

  it('le fichier de migration existe et nest pas vide', () => {
    expect(sql.length).toBeGreaterThan(100);
  });

  // --- Table seo_document_folders ---
  it('crée la table seo_document_folders', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_folders');
  });

  it('a une contrainte dunicité nom/parent pour les dossiers', () => {
    expect(sql).toContain('uq_folder_name_per_parent');
  });

  it('seo_document_folders a RLS activé', () => {
    expect(sql).toContain('ALTER TABLE seo_document_folders ENABLE ROW LEVEL SECURITY');
  });

  it('seo_document_folders a un trigger updated_at', () => {
    expect(sql).toContain('on_seo_document_folders_updated');
  });

  // --- Table seo_documents ---
  it('crée la table seo_documents', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_documents');
  });

  it('seo_documents a les modes dédition corrects', () => {
    expect(sql).toContain("editor_mode IN ('plain', 'rich', 'structured')");
  });

  it('seo_documents a les statuts corrects', () => {
    expect(sql).toContain("status IN ('draft', 'ready_for_ai', 'json_generated', 'published', 'archived')");
  });

  it('seo_documents a RLS activé', () => {
    expect(sql).toContain('ALTER TABLE seo_documents ENABLE ROW LEVEL SECURITY');
  });

  it('seo_documents a une policy SELECT pour tous les authentifiés', () => {
    expect(sql).toContain('Authenticated users can read all documents');
  });

  it('seo_documents a une policy INSERT restreinte à lauteur', () => {
    expect(sql).toContain('auth.uid() = author_user_id AND auth.uid() = owner_user_id');
  });

  it('seo_documents a une policy UPDATE avec vérification owner/editor/admin', () => {
    expect(sql).toContain('Owners and editors can update documents');
    expect(sql).toContain('is_admin_or_manager()');
    expect(sql).toContain('seo_document_permissions');
  });

  it('seo_documents a une policy DELETE pour owner et admin', () => {
    expect(sql).toContain('Owners and admins can delete documents');
  });

  // --- Table seo_document_permissions ---
  it('crée la table seo_document_permissions', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_permissions');
  });

  it('seo_document_permissions a la contrainte dunicité document/user', () => {
    expect(sql).toContain('uq_document_permission_per_user');
  });

  it('seo_document_permissions a les niveaux de permission corrects', () => {
    expect(sql).toContain("permission_level IN ('reader', 'editor', 'owner')");
  });

  it('seo_document_permissions a des policies basées sur le owner du document', () => {
    expect(sql).toContain('Document owners can grant permissions');
    expect(sql).toContain('Document owners can revoke permissions');
  });

  // --- Table seo_document_activity_logs ---
  it('crée la table seo_document_activity_logs', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS seo_document_activity_logs');
  });

  it('les logs sont non modifiables (pas de policy UPDATE)', () => {
    // On vérifie qu'il n'y a PAS de policy UPDATE sur les logs
    // Le pattern est que les commentaires disent "UPDATE : interdit"
    const logsSection = sql.split('seo_document_activity_logs')[4] || '';
    // Vérification indirecte : pas de CREATE POLICY ... FOR UPDATE ... ON seo_document_activity_logs
    const updatePolicyRegex = /CREATE POLICY.*FOR UPDATE.*ON seo_document_activity_logs/i;
    expect(updatePolicyRegex.test(sql)).toBe(false);
  });

  it('les logs ont un index composite (document_id, created_at)', () => {
    expect(sql).toContain('idx_seo_doc_logs_document_created');
  });

  // --- Fonctions helpers ---
  it('crée la fonction log_document_activity', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.log_document_activity');
  });

  it('crée la fonction recalculate_folder_path', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.recalculate_folder_path');
  });

  it('recalculate_folder_path empêche les boucles parent/enfant', () => {
    expect(sql).toContain('Un dossier ne peut pas être son propre parent');
  });

  // --- Extension ---
  it('active lextension pg_trgm', () => {
    expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  });
});
