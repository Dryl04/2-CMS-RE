import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// ===================================================================
// Tests fonctionnels : validation migration SQL Plan 02
// ===================================================================

describe("Migration SQL - Plan 02 : Édition & Collaboration", () => {
  const migrationPath = join(
    process.cwd(),
    'supabase/migrations/20260308120000_redaction_edition_collaboration.sql'
  );

  let sql: string;

  try {
    sql = readFileSync(migrationPath, 'utf-8');
  } catch {
    sql = '';
  }

  it("le fichier de migration existe et n'est pas vide", () => {
    expect(sql.length).toBeGreaterThan(50);
  });

  // --- Colonnes seo_documents ---
  it("ajoute la colonne last_edited_by", () => {
    expect(sql).toContain('last_edited_by');
    expect(sql).toContain('uuid');
  });

  it("ajoute la colonne edit_lock_user_id", () => {
    expect(sql).toContain('edit_lock_user_id');
  });

  it("ajoute la colonne edit_lock_at", () => {
    expect(sql).toContain('edit_lock_at');
    expect(sql).toContain('timestamptz');
  });

  it("ajoute la colonne trashed_at", () => {
    expect(sql).toContain('trashed_at');
  });

  it("ajoute la colonne trashed_by", () => {
    expect(sql).toContain('trashed_by');
  });

  it("utilise ADD COLUMN IF NOT EXISTS pour l'idempotence", () => {
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS');
  });

  // --- Index ---
  it("crée un index sur trashed_at", () => {
    expect(sql).toContain('idx_seo_documents_trashed_at');
  });

  it("crée un index sur last_edited_by", () => {
    expect(sql).toContain('idx_seo_documents_last_edited_by');
  });

  // --- Colonne permissions ---
  it("ajoute updated_at à seo_document_permissions", () => {
    expect(sql).toContain('seo_document_permissions');
    expect(sql).toContain('updated_at');
  });

  // --- Trigger ---
  it("crée un trigger updated_at sur les permissions", () => {
    expect(sql).toContain('on_seo_document_permissions_updated');
    expect(sql).toContain('handle_updated_at');
  });
});
