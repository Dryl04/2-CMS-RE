import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, FolderPlus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllFolders, buildFolderTree } from '@/lib/redactionFolders';
import { fetchDocuments } from '@/lib/redactionDocuments';
import type {
  SEODocumentFolder,
  SEODocumentWithAuthor,
  FolderTreeNode,
  DocumentFilters,
  DEFAULT_DOCUMENT_FILTERS,
} from '@/lib/redactionTypes';
import RedactionEmptyState from './RedactionEmptyState';
import RedactionFolderTree from './RedactionFolderTree';
import RedactionDocumentList from './RedactionDocumentList';
import RedactionToolbar from './RedactionToolbar';
import RedactionBulkActionsBar from './RedactionBulkActionsBar';
import CreateDocumentModal from './CreateDocumentModal';
import CreateFolderModal from './CreateFolderModal';
import RenameFolderModal from './RenameFolderModal';
import DocumentDetailPanel from './DocumentDetailPanel';

interface RedactionManagerProps {
  onNavigate: (view: string) => void;
}

export default function RedactionManager({ onNavigate }: RedactionManagerProps) {
  const { user, profile } = useAuth();

  // --- État données ---
  const [folders, setFolders] = useState<SEODocumentFolder[]>([]);
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [documents, setDocuments] = useState<SEODocumentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- État navigation ---
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // --- État filtres ---
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    folderId: null,
    status: 'all',
    authorId: null,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  // --- État modales ---
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<SEODocumentFolder | null>(null);

  // --- État sidebar dossiers ---
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Chargement des données ---
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [foldersData, docsData] = await Promise.all([
        fetchAllFolders(),
        fetchDocuments({ ...filters, folderId: currentFolderId }),
      ]);
      setFolders(foldersData);
      setFolderTree(buildFolderTree(foldersData));
      setDocuments(docsData);
    } catch (err) {
      console.error('[Redaction] Erreur chargement:', err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  }, [user, filters, currentFolderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handlers navigation dossier ---
  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedDocIds(new Set());
    setSelectedDocId(null);
  };

  // --- Handlers sélection document ---
  const handleDocSelect = (docId: string) => {
    setSelectedDocId(docId);
  };

  const handleDocToggle = (docId: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map((d) => d.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocIds(new Set());
  };

  // --- Handlers après mutation ---
  const handleMutationDone = () => {
    loadData();
    setSelectedDocIds(new Set());
  };

  // --- Nom du dossier courant ---
  const currentFolderName = currentFolderId
    ? folders.find((f) => f.id === currentFolderId)?.name ?? 'Dossier'
    : 'Tous les documents';

  // --- Fil d'Ariane ---
  const getBreadcrumb = (): { id: string | null; name: string }[] => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Rédaction' }];
    if (!currentFolderId) return crumbs;

    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return crumbs;

    // Remonter le chemin
    const pathParts = folder.path.split('/');
    let accumulated = '';
    for (const part of pathParts) {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const match = folders.find((f) => f.path === accumulated);
      if (match) {
        crumbs.push({ id: match.id, name: match.name });
      }
    }
    return crumbs;
  };

  const breadcrumb = getBreadcrumb();

  // --- Document sélectionné pour le panel de détail ---
  const selectedDocument = selectedDocId
    ? documents.find((d) => d.id === selectedDocId) ?? null
    : null;

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour au tableau de bord</span>
          </button>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Rédaction</h1>
          <p className="text-gray-500 mt-1">
            Produisez, organisez et transformez vos textes SEO
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau dossier</span>
          </button>
          <button
            onClick={() => setShowCreateDoc(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau document</span>
          </button>
        </div>
      </div>

      {/* Fil d'Ariane */}
      {breadcrumb.length > 1 && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id ?? 'root'} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              <button
                onClick={() => handleFolderSelect(crumb.id)}
                className={`hover:text-gray-900 transition-colors ${
                  i === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : ''
                }`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      )}

      {/* Contenu principal */}
      <div className="flex gap-6">
        {/* Sidebar dossiers */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Dossiers</h3>
              </div>
              <RedactionFolderTree
                tree={folderTree}
                currentFolderId={currentFolderId}
                onSelect={handleFolderSelect}
                onRename={setRenamingFolder}
                onRefresh={handleMutationDone}
                folders={folders}
              />
            </div>
          </div>
        )}

        {/* Zone principale */}
        <div className="flex-1 min-w-0">
          {/* Toolbar filtres */}
          <RedactionToolbar
            filters={filters}
            onFiltersChange={setFilters}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onRefresh={loadData}
            loading={loading}
          />

          {/* Barre d'actions de masse */}
          {selectedDocIds.size > 0 && (
            <RedactionBulkActionsBar
              selectedCount={selectedDocIds.size}
              totalCount={documents.length}
              selectedIds={Array.from(selectedDocIds)}
              folders={folders}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onDone={handleMutationDone}
            />
          )}

          {/* Liste des documents ou état vide */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={loadData} className="text-red-600 underline text-sm mt-1">
                Réessayer
              </button>
            </div>
          )}

          {!loading && documents.length === 0 && !error ? (
            <RedactionEmptyState
              hasFilters={
                filters.search !== '' ||
                filters.status !== 'all' ||
                filters.authorId !== null
              }
              currentFolderName={currentFolderName}
              onCreateDocument={() => setShowCreateDoc(true)}
              onClearFilters={() =>
                setFilters({
                  search: '',
                  folderId: null,
                  status: 'all',
                  authorId: null,
                  sortBy: 'updated_at',
                  sortOrder: 'desc',
                })
              }
            />
          ) : (
            <RedactionDocumentList
              documents={documents}
              loading={loading}
              selectedIds={selectedDocIds}
              activeDocId={selectedDocId}
              userId={user?.id ?? ''}
              onSelect={handleDocSelect}
              onToggle={handleDocToggle}
              onRefresh={handleMutationDone}
              folders={folders}
            />
          )}
        </div>

        {/* Panel de détail document */}
        {selectedDocument && (
          <DocumentDetailPanel
            document={selectedDocument}
            userId={user?.id ?? ''}
            userRole={profile?.role ?? 'content_creator'}
            onClose={() => setSelectedDocId(null)}
            onRefresh={handleMutationDone}
            folders={folders}
          />
        )}
      </div>

      {/* Modales */}
      {showCreateDoc && (
        <CreateDocumentModal
          currentFolderId={currentFolderId}
          userId={user?.id ?? ''}
          onClose={() => setShowCreateDoc(false)}
          onCreated={handleMutationDone}
        />
      )}

      {showCreateFolder && (
        <CreateFolderModal
          parentId={currentFolderId}
          userId={user?.id ?? ''}
          onClose={() => setShowCreateFolder(false)}
          onCreated={handleMutationDone}
        />
      )}

      {renamingFolder && (
        <RenameFolderModal
          folder={renamingFolder}
          onClose={() => setRenamingFolder(null)}
          onRenamed={handleMutationDone}
        />
      )}
    </div>
  );
}
