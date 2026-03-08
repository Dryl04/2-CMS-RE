import { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderInput,
} from 'lucide-react';
import type { FolderTreeNode, SEODocumentFolder } from '@/lib/redactionTypes';
import { deleteFolder } from '@/lib/redactionFolders';

interface RedactionFolderTreeProps {
  tree: FolderTreeNode[];
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onRename: (folder: SEODocumentFolder) => void;
  onRefresh: () => void;
  folders: SEODocumentFolder[];
}

export default function RedactionFolderTree({
  tree,
  currentFolderId,
  onSelect,
  onRename,
  onRefresh,
  folders,
}: RedactionFolderTreeProps) {
  return (
    <div className="py-2">
      {/* Racine (tous les documents) */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
          currentFolderId === null
            ? 'bg-emerald-50 text-emerald-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Folder className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">Tous les documents</span>
      </button>

      {/* Arbre */}
      {tree.map((node) => (
        <FolderNode
          key={node.id}
          node={node}
          currentFolderId={currentFolderId}
          onSelect={onSelect}
          onRename={onRename}
          onRefresh={onRefresh}
          depth={0}
        />
      ))}

      {tree.length === 0 && (
        <p className="px-4 py-3 text-xs text-gray-400 italic">
          Aucun dossier créé
        </p>
      )}
    </div>
  );
}

// --- Nœud récursif ---
function FolderNode({
  node,
  currentFolderId,
  onSelect,
  onRename,
  onRefresh,
  depth,
}: {
  node: FolderTreeNode;
  currentFolderId: string | null;
  onSelect: (id: string | null) => void;
  onRename: (folder: SEODocumentFolder) => void;
  onRefresh: () => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isActive = currentFolderId === node.id;
  const hasChildren = node.children.length > 0;

  const handleDelete = async () => {
    if (!confirm(`Supprimer le dossier « ${node.name} » et tout son contenu ?`)) return;
    setDeleting(true);
    try {
      await deleteFolder(node.id);
      onRefresh();
    } catch (err) {
      console.error('[Redaction] Erreur suppression dossier:', err);
      alert('Erreur lors de la suppression du dossier.');
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 pr-2 transition-colors ${
          isActive ? 'bg-emerald-50' : 'hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
      >
        {/* Chevron expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        {/* Nom du dossier */}
        <button
          onClick={() => onSelect(node.id)}
          className={`flex-1 flex items-center gap-2 py-2 text-sm truncate transition-colors ${
            isActive ? 'text-emerald-700 font-medium' : 'text-gray-600'
          }`}
        >
          {isActive ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0 text-gray-400" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {/* Menu contextuel */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onRename(node);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Renommer
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enfants */}
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <FolderNode
            key={child.id}
            node={child}
            currentFolderId={currentFolderId}
            onSelect={onSelect}
            onRename={onRename}
            onRefresh={onRefresh}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}
