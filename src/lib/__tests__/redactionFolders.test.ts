import { describe, it, expect } from 'vitest';
import { buildFolderTree, getFolderDescendantIds } from '@/lib/redactionFolders';
import type { SEODocumentFolder, FolderTreeNode } from '@/lib/redactionTypes';

// --- Helpers ---
function makeFolder(overrides: Partial<SEODocumentFolder> & { id: string; name: string }): SEODocumentFolder {
  return {
    parent_id: null,
    path: overrides.name,
    depth: 0,
    sort_order: 0,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ===================================================================
// Tests unitaires : buildFolderTree
// ===================================================================

describe('buildFolderTree', () => {
  it('retourne un arbre vide pour une liste vide', () => {
    expect(buildFolderTree([])).toEqual([]);
  });

  it('retourne des racines pour des dossiers sans parent', () => {
    const folders: SEODocumentFolder[] = [
      makeFolder({ id: '1', name: 'Services' }),
      makeFolder({ id: '2', name: 'Blog' }),
    ];
    const tree = buildFolderTree(folders);
    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe('Services');
    expect(tree[1].name).toBe('Blog');
    expect(tree[0].children).toEqual([]);
    expect(tree[1].children).toEqual([]);
  });

  it('construit un arbre parent/enfant correctement', () => {
    const folders: SEODocumentFolder[] = [
      makeFolder({ id: '1', name: 'Services', path: 'Services' }),
      makeFolder({ id: '2', name: 'Plomberie', parent_id: '1', path: 'Services/Plomberie', depth: 1 }),
      makeFolder({ id: '3', name: 'Électricité', parent_id: '1', path: 'Services/Électricité', depth: 1 }),
    ];
    const tree = buildFolderTree(folders);
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Services');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].name).toBe('Plomberie');
    expect(tree[0].children[1].name).toBe('Électricité');
  });

  it('gère une arborescence à 3 niveaux', () => {
    const folders: SEODocumentFolder[] = [
      makeFolder({ id: '1', name: 'Root', path: 'Root' }),
      makeFolder({ id: '2', name: 'N1', parent_id: '1', path: 'Root/N1', depth: 1 }),
      makeFolder({ id: '3', name: 'N2', parent_id: '2', path: 'Root/N1/N2', depth: 2 }),
    ];
    const tree = buildFolderTree(folders);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].name).toBe('N2');
  });

  it('place en racine un dossier dont le parent nexiste pas', () => {
    const folders: SEODocumentFolder[] = [
      makeFolder({ id: '1', name: 'Orphelin', parent_id: 'inexistant' }),
    ];
    const tree = buildFolderTree(folders);
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Orphelin');
  });
});

// ===================================================================
// Tests unitaires : getFolderDescendantIds
// ===================================================================

describe('getFolderDescendantIds', () => {
  it('retourne un tableau vide si le dossier na pas denfants', () => {
    const tree: FolderTreeNode[] = [
      { ...makeFolder({ id: '1', name: 'Seul' }), children: [] },
    ];
    const ids = getFolderDescendantIds(tree, '1');
    expect(ids).toEqual([]);
  });

  it('retourne les IDs des enfants directs', () => {
    const tree: FolderTreeNode[] = [
      {
        ...makeFolder({ id: '1', name: 'Parent' }),
        children: [
          { ...makeFolder({ id: '2', name: 'E1', parent_id: '1' }), children: [] },
          { ...makeFolder({ id: '3', name: 'E2', parent_id: '1' }), children: [] },
        ],
      },
    ];
    const ids = getFolderDescendantIds(tree, '1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(ids).toHaveLength(2);
  });

  it('retourne les IDs des descendants à tous les niveaux', () => {
    const tree: FolderTreeNode[] = [
      {
        ...makeFolder({ id: '1', name: 'Parent' }),
        children: [
          {
            ...makeFolder({ id: '2', name: 'E1', parent_id: '1' }),
            children: [
              { ...makeFolder({ id: '4', name: 'SE1', parent_id: '2' }), children: [] },
            ],
          },
          { ...makeFolder({ id: '3', name: 'E2', parent_id: '1' }), children: [] },
        ],
      },
    ];
    const ids = getFolderDescendantIds(tree, '1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(ids).toContain('4');
    expect(ids).toHaveLength(3);
  });

  it('retourne un tableau vide si le dossier nexiste pas dans larbre', () => {
    const tree: FolderTreeNode[] = [
      { ...makeFolder({ id: '1', name: 'Quelconque' }), children: [] },
    ];
    const ids = getFolderDescendantIds(tree, 'introuvable');
    expect(ids).toEqual([]);
  });
});
