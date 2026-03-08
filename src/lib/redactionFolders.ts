import { supabase } from './supabase';
import type { SEODocumentFolder, FolderTreeNode } from './redactionTypes';

// ============================================================
// CRUD Dossiers
// ============================================================

/** Récupérer tous les dossiers */
export async function fetchAllFolders(): Promise<SEODocumentFolder[]> {
  const { data, error } = await supabase
    .from('seo_document_folders')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Créer un dossier */
export async function createFolder(
  name: string,
  parentId: string | null,
  userId: string
): Promise<SEODocumentFolder> {
  const { data, error } = await supabase
    .from('seo_document_folders')
    .insert({
      name: name.trim(),
      parent_id: parentId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Renommer un dossier */
export async function renameFolder(
  folderId: string,
  newName: string
): Promise<SEODocumentFolder> {
  const { data, error } = await supabase
    .from('seo_document_folders')
    .update({ name: newName.trim() })
    .eq('id', folderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Déplacer un dossier vers un nouveau parent */
export async function moveFolder(
  folderId: string,
  newParentId: string | null
): Promise<SEODocumentFolder> {
  const { data, error } = await supabase
    .from('seo_document_folders')
    .update({ parent_id: newParentId })
    .eq('id', folderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Supprimer un dossier */
export async function deleteFolder(folderId: string): Promise<void> {
  const { error } = await supabase
    .from('seo_document_folders')
    .delete()
    .eq('id', folderId);

  if (error) throw error;
}

// ============================================================
// Utilitaires arborescence
// ============================================================

/** Construire l'arbre de dossiers à partir d'une liste plate */
export function buildFolderTree(folders: SEODocumentFolder[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>();
  const roots: FolderTreeNode[] = [];

  // Créer les nœuds
  for (const f of folders) {
    map.set(f.id, { ...f, children: [] });
  }

  // Assembler l'arbre
  for (const f of folders) {
    const node = map.get(f.id)!;
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Obtenir tous les descendants d'un dossier (IDs) */
export function getFolderDescendantIds(
  tree: FolderTreeNode[],
  folderId: string
): string[] {
  const ids: string[] = [];

  function collect(nodes: FolderTreeNode[]) {
    for (const node of nodes) {
      if (node.id === folderId || ids.length > 0) {
        // On est dans le sous-arbre
      }
      ids.push(node.id);
      collect(node.children);
    }
  }

  // Trouver le nœud cible puis collecter ses descendants
  function findAndCollect(nodes: FolderTreeNode[]): boolean {
    for (const node of nodes) {
      if (node.id === folderId) {
        collectAll(node.children);
        return true;
      }
      if (findAndCollect(node.children)) return true;
    }
    return false;
  }

  function collectAll(nodes: FolderTreeNode[]) {
    for (const node of nodes) {
      ids.push(node.id);
      collectAll(node.children);
    }
  }

  findAndCollect(tree);
  return ids;
}
