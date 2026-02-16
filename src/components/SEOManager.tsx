import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, FileUp, FormInput, ExternalLink, ArrowLeft } from 'lucide-react';
import { supabase, SEOMetadata } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEOImporter from './SEOImporter';
import SEOForm from './SEOForm';
import SEOPageViewer from './SEOPageViewer';

type ViewMode = 'list' | 'form' | 'import' | 'view';

interface SEOManagerProps {
  onNavigate?: (view: string) => void;
}

export default function SEOManager({ onNavigate }: SEOManagerProps) {
  const { profile } = useAuth();
  const [metadata, setMetadata] = useState<SEOMetadata[]>([]);
  const [filteredMetadata, setFilteredMetadata] = useState<SEOMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPage, setEditingPage] = useState<SEOMetadata | undefined>(undefined);
  const [viewingPage, setViewingPage] = useState<SEOMetadata | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMetadata = async () => {
    setIsLoading(true);
    try {
      console.log('[SEOManager] Loading metadata...');

      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[SEOManager] Query result:', { data, error });

      if (error) {
        console.error('[SEOManager] Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('[SEOManager] Loaded', data?.length || 0, 'pages');
      setMetadata(data || []);
    } catch (error) {
      console.error('[SEOManager] Error loading metadata:', error);
      showToast('Erreur lors du chargement des pages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    let filtered = metadata;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.page_key.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    setFilteredMetadata(filtered);
  }, [searchQuery, statusFilter, metadata]);

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('seo_metadata')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      const labels: Record<string, string> = { draft: 'Brouillon', published: 'Publie', archived: 'Archive' };
      showToast(`Statut : ${labels[newStatus]}`);
      loadMetadata();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Erreur lors de la mise a jour', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette page ? Cette action est irreversible.')) return;

    try {
      const { error } = await supabase
        .from('seo_metadata')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Page supprimee');
      loadMetadata();
    } catch (error) {
      console.error('Error deleting metadata:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; label: string }> = {
      draft: { bg: 'bg-gray-100 text-gray-700', label: 'Brouillon' },
      published: { bg: 'bg-emerald-100 text-emerald-700', label: 'Publie' },
      archived: { bg: 'bg-orange-100 text-orange-700', label: 'Archive' },
    };
    return styles[status] || styles.draft;
  };

  const handleEdit = (page: SEOMetadata) => {
    setEditingPage(page);
    setViewMode('form');
  };

  const handleView = (page: SEOMetadata) => {
    setViewingPage(page);
    setViewMode('view');
  };

  return (
    <div>
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toastMessage.text}
        </div>
      )}

      <div className="mb-6">
        {viewMode === 'list' && onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour au tableau de bord</span>
          </button>
        )}
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Gestion des pages</h1>
        <p className="text-gray-500 text-sm">Creez, modifiez et publiez vos pages SEO</p>
      </div>

      {viewMode !== 'list' && viewMode !== 'view' && (
        <button
          onClick={() => {
            setViewMode('list');
            setEditingPage(undefined);
            setViewingPage(undefined);
          }}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2 font-medium text-sm"
        >
          <span>&larr; Retour a la liste</span>
        </button>
      )}

      {viewMode === 'view' && viewingPage ? (
        <SEOPageViewer
          page={viewingPage}
          isPublic={false}
          onEdit={() => {
            setEditingPage(viewingPage);
            setViewMode('form');
            setViewingPage(undefined);
          }}
          onBack={() => {
            setViewMode('list');
            setViewingPage(undefined);
          }}
        />
      ) : viewMode === 'form' ? (
        <SEOForm
          onSaveComplete={() => {
            loadMetadata();
            setViewMode('list');
            setEditingPage(undefined);
          }}
          editingPage={editingPage}
          userId={profile?.id}
        />
      ) : viewMode === 'import' ? (
        <SEOImporter
          userId={profile?.id}
          onImportComplete={() => {
            loadMetadata();
            setViewMode('list');
          }}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="draft">Brouillons</option>
                  <option value="published">Publies</option>
                  <option value="archived">Archives</option>
                </select>

                <button
                  onClick={() => {
                    setEditingPage(undefined);
                    setViewMode('form');
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors text-sm"
                >
                  <FormInput className="w-4 h-4" />
                  <span className="hidden sm:inline">Creer</span>
                </button>

                <button
                  onClick={() => setViewMode('import')}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors text-sm"
                >
                  <FileUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Importer</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
            </div>
          ) : filteredMetadata.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Aucune page ne correspond a votre recherche'
                  : 'Aucune page creee'}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setEditingPage(undefined);
                    setViewMode('form');
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 text-sm"
                >
                  <FormInput className="w-4 h-4" />
                  <span>Creer une page</span>
                </button>
                <button
                  onClick={() => setViewMode('import')}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 text-sm"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Importer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">{filteredMetadata.length} page(s)</p>
              {filteredMetadata.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {item.page_key}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        )}
                        {item.keywords && item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.keywords.slice(0, 4).map((keyword, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[11px] rounded">
                                {keyword}
                              </span>
                            ))}
                            {item.keywords.length > 4 && (
                              <span className="text-gray-400 text-[11px] py-0.5">+{item.keywords.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleView(item)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Visualiser"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {item.status === 'published' && (
                          <button
                            onClick={() => {
                              window.history.pushState({}, '', `/${item.page_key}`);
                              window.location.reload();
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title={`Voir a /${item.page_key}`}
                          >
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5 mx-1">
                          <button
                            onClick={() => handleStatusChange(item.id, 'draft')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              item.status === 'draft' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Brouillon
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'published')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              item.status === 'published' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Publie
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'archived')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              item.status === 'archived' ? 'bg-white shadow-sm text-orange-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Archive
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-3">
                        {item.status === 'published' && (
                          <button
                            onClick={() => {
                              window.history.pushState({}, '', `/${item.page_key}`);
                              window.location.reload();
                            }}
                            className="text-blue-500 hover:text-blue-700 font-mono flex items-center space-x-1 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>/{item.page_key}</span>
                          </button>
                        )}
                        {item.status !== 'published' && (
                          <span className="font-mono">/{item.page_key}</span>
                        )}
                      </div>
                      <div>
                        Modifie le {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
