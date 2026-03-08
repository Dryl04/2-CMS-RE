import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RedactionFolderTree from '@/components/redaction/RedactionFolderTree';
import type { FolderTreeNode, SEODocumentFolder } from '@/lib/redactionTypes';
import userEvent from '@testing-library/user-event';

function makeNode(overrides: Partial<FolderTreeNode> & { id: string; name: string }): FolderTreeNode {
  return {
    parent_id: null,
    path: overrides.name,
    depth: 0,
    sort_order: 0,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    children: [],
    ...overrides,
  };
}

describe('RedactionFolderTree', () => {
  it('affiche "Tous les documents" comme racine', () => {
    render(
      <RedactionFolderTree
        tree={[]}
        currentFolderId={null}
        onSelect={() => {}}
        onRename={() => {}}
        onRefresh={() => {}}
        folders={[]}
      />
    );
    expect(screen.getByText('Tous les documents')).toBeInTheDocument();
  });

  it('affiche les dossiers de premier niveau', () => {
    const tree: FolderTreeNode[] = [
      makeNode({ id: '1', name: 'Services' }),
      makeNode({ id: '2', name: 'Blog' }),
    ];
    render(
      <RedactionFolderTree
        tree={tree}
        currentFolderId={null}
        onSelect={() => {}}
        onRename={() => {}}
        onRefresh={() => {}}
        folders={[]}
      />
    );
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('affiche un message quand il ny a pas de dossiers', () => {
    render(
      <RedactionFolderTree
        tree={[]}
        currentFolderId={null}
        onSelect={() => {}}
        onRename={() => {}}
        onRefresh={() => {}}
        folders={[]}
      />
    );
    expect(screen.getByText('Aucun dossier créé')).toBeInTheDocument();
  });

  it('appelle onSelect au clic sur un dossier', async () => {
    const user = userEvent.setup();
    let selectedId: string | null = 'initial';
    const tree: FolderTreeNode[] = [
      makeNode({ id: 'abc', name: 'MonDossier' }),
    ];
    render(
      <RedactionFolderTree
        tree={tree}
        currentFolderId={null}
        onSelect={(id) => { selectedId = id; }}
        onRename={() => {}}
        onRefresh={() => {}}
        folders={[]}
      />
    );
    await user.click(screen.getByText('MonDossier'));
    expect(selectedId).toBe('abc');
  });

  it('appelle onSelect(null) au clic sur Tous les documents', async () => {
    const user = userEvent.setup();
    let selectedId: string | null = 'something';
    render(
      <RedactionFolderTree
        tree={[makeNode({ id: '1', name: 'Test' })]}
        currentFolderId={'1'}
        onSelect={(id) => { selectedId = id; }}
        onRename={() => {}}
        onRefresh={() => {}}
        folders={[]}
      />
    );
    await user.click(screen.getByText('Tous les documents'));
    expect(selectedId).toBeNull();
  });
});
