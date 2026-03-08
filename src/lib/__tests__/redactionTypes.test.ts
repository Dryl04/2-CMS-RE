import { describe, it, expect } from 'vitest';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DEFAULT_DOCUMENT_FILTERS,
} from '@/lib/redactionTypes';
import type {
  EditorMode,
  DocumentStatus,
  PermissionLevel,
  DocumentFilters,
  FolderTreeNode,
  SEODocument,
  SEODocumentFolder,
} from '@/lib/redactionTypes';

// ===================================================================
// Tests unitaires : Types & constantes
// ===================================================================

describe('Redaction Types - constantes', () => {
  it('STATUS_LABELS couvre tous les statuts', () => {
    const statuts: DocumentStatus[] = ['draft', 'ready_for_ai', 'json_generated', 'published', 'archived'];
    for (const s of statuts) {
      expect(STATUS_LABELS[s]).toBeDefined();
      expect(typeof STATUS_LABELS[s]).toBe('string');
      expect(STATUS_LABELS[s].length).toBeGreaterThan(0);
    }
  });

  it('STATUS_COLORS couvre tous les statuts', () => {
    const statuts: DocumentStatus[] = ['draft', 'ready_for_ai', 'json_generated', 'published', 'archived'];
    for (const s of statuts) {
      expect(STATUS_COLORS[s]).toBeDefined();
      expect(STATUS_COLORS[s]).toMatch(/^badge-/);
    }
  });

  it('DEFAULT_DOCUMENT_FILTERS a les bonnes valeurs par défaut', () => {
    expect(DEFAULT_DOCUMENT_FILTERS.search).toBe('');
    expect(DEFAULT_DOCUMENT_FILTERS.folderId).toBeNull();
    expect(DEFAULT_DOCUMENT_FILTERS.status).toBe('all');
    expect(DEFAULT_DOCUMENT_FILTERS.authorId).toBeNull();
    expect(DEFAULT_DOCUMENT_FILTERS.sortBy).toBe('updated_at');
    expect(DEFAULT_DOCUMENT_FILTERS.sortOrder).toBe('desc');
  });
});

describe('Redaction Types - typage', () => {
  it('EditorMode accepte les bonnes valeurs', () => {
    const modes: EditorMode[] = ['plain', 'rich', 'structured'];
    expect(modes).toHaveLength(3);
  });

  it('PermissionLevel accepte les bonnes valeurs', () => {
    const levels: PermissionLevel[] = ['reader', 'editor', 'owner'];
    expect(levels).toHaveLength(3);
  });

  it('DocumentFilters a le bon type de sortBy', () => {
    const validSorts: DocumentFilters['sortBy'][] = ['name', 'created_at', 'updated_at', 'author'];
    expect(validSorts).toHaveLength(4);
  });
});
