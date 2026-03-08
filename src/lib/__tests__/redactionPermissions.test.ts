import { describe, it, expect } from 'vitest';
import { canUserEditDocument } from '@/lib/redactionPermissions';
import type { SEODocumentPermission } from '@/lib/redactionTypes';

// ===================================================================
// Tests unitaires : permissions
// ===================================================================

describe('canUserEditDocument', () => {
  const doc = { owner_user_id: 'owner-123' };

  it('le owner peut éditer', () => {
    expect(canUserEditDocument(doc, 'owner-123', 'content_creator', [])).toBe(true);
  });

  it('un admin peut éditer', () => {
    expect(canUserEditDocument(doc, 'other-user', 'admin', [])).toBe(true);
  });

  it('un seo_manager peut éditer', () => {
    expect(canUserEditDocument(doc, 'other-user', 'seo_manager', [])).toBe(true);
  });

  it('un éditeur partagé peut éditer', () => {
    const perms: SEODocumentPermission[] = [
      {
        id: 'p1',
        document_id: 'doc-1',
        user_id: 'collab-999',
        permission_level: 'editor',
        granted_by: 'owner-123',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    expect(canUserEditDocument(doc, 'collab-999', 'content_creator', perms)).toBe(true);
  });

  it('un reader ne peut PAS éditer', () => {
    const perms: SEODocumentPermission[] = [
      {
        id: 'p1',
        document_id: 'doc-1',
        user_id: 'reader-777',
        permission_level: 'reader',
        granted_by: 'owner-123',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    expect(canUserEditDocument(doc, 'reader-777', 'content_creator', perms)).toBe(false);
  });

  it('un utilisateur sans permission ni rôle ne peut PAS éditer', () => {
    expect(canUserEditDocument(doc, 'random-user', 'content_creator', [])).toBe(false);
  });

  it('un utilisateur avec permission « owner » peut éditer', () => {
    const perms: SEODocumentPermission[] = [
      {
        id: 'p1',
        document_id: 'doc-1',
        user_id: 'promoted-user',
        permission_level: 'owner',
        granted_by: 'owner-123',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    expect(canUserEditDocument(doc, 'promoted-user', 'content_creator', perms)).toBe(true);
  });
});
