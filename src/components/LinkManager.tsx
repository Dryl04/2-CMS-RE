import { useState, useEffect, useCallback } from 'react';
import {
  Link as LinkIcon,
  ExternalLink,
  ArrowRight,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAllPageLinks, PageLinkEntry } from '@/lib/linkRegistry';
import { useAuth } from '@/contexts/AuthContext';

interface Redirect {
  id: string;
  old_path: string;
  new_path: string;
  redirect_type: number;
  is_manual: boolean;
  created_at: string;
}

interface LinkManagerProps {
  onNavigate?: (view: string) => void;
}

type Tab = 'links' | 'redirects';

export default function LinkManager({ onNavigate }: LinkManagerProps) {
  const { profile } = useAuth();
  const canManage =
    profile?.role === 'admin' || profile?.role === 'seo_manager';

  const [activeTab, setActiveTab] = useState<Tab>('links');

  // ── Links tab state ──────────────────────────────────────────────────────
  const [allLinks, setAllLinks] = useState<PageLinkEntry[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSearch, setLinksSearch] = useState('');
  const [linksTypeFilter, setLinksTypeFilter] = useState<'all' | 'internal' | 'external' | 'anchor'>('all');

  // ── Redirects tab state ──────────────────────────────────────────────────
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(false);
  const [redirectsSearch, setRedirectsSearch] = useState('');
  const [newOldPath, setNewOldPath] = useState('');
  const [newNewPath, setNewNewPath] = useState('');
  const [addError, setAddError] = useState('');
  const [isSavingRedirect, setIsSavingRedirect] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load data ────────────────────────────────────────────────────────────

  const loadLinks = useCallback(async () => {
    setLinksLoading(true);
    try {
      const entries = await getAllPageLinks();
      setAllLinks(entries);
    } finally {
      setLinksLoading(false);
    }
  }, []);

  const loadRedirects = useCallback(async () => {
    setRedirectsLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRedirects(data ?? []);
    } catch {
      showToast('Erreur lors du chargement des redirections', 'error');
    } finally {
      setRedirectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'links') {
      loadLinks();
    } else {
      loadRedirects();
    }
  }, [activeTab, loadLinks, loadRedirects]);

  // ── Filtered lists ───────────────────────────────────────────────────────

  const filteredLinks = allLinks.filter((l) => {
    const matchesType = linksTypeFilter === 'all' || l.linkType === linksTypeFilter;
    const q = linksSearch.toLowerCase();
    const matchesSearch =
      !q ||
      l.pageTitle.toLowerCase().includes(q) ||
      l.pageKey.toLowerCase().includes(q) ||
      l.linkValue.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const filteredRedirects = redirects.filter((r) => {
    const q = redirectsSearch.toLowerCase();
    return (
      !q ||
      r.old_path.toLowerCase().includes(q) ||
      r.new_path.toLowerCase().includes(q)
    );
  });

  // ── Add redirect ─────────────────────────────────────────────────────────

  const handleAddRedirect = async () => {
    setAddError('');
    const oldTrimmed = newOldPath.trim().replace(/^\/+/, '');
    const newTrimmed = newNewPath.trim().replace(/^\/+/, '');

    if (!oldTrimmed || !newTrimmed) {
      setAddError('Les deux chemins sont obligatoires');
      return;
    }
    if (oldTrimmed === newTrimmed) {
      setAddError("L'ancien et le nouveau chemin doivent être différents");
      return;
    }

    setIsSavingRedirect(true);
    try {
      const { error } = await supabase.from('page_redirects').upsert(
        {
          old_path: oldTrimmed,
          new_path: newTrimmed,
          redirect_type: 301,
          is_manual: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'old_path' },
      );
      if (error) throw error;
      setNewOldPath('');
      setNewNewPath('');
      showToast('Redirection ajoutée');
      loadRedirects();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast(`Erreur : ${msg}`, 'error');
    } finally {
      setIsSavingRedirect(false);
    }
  };

  // ── Delete redirect ───────────────────────────────────────────────────────

  const handleDeleteRedirect = async (id: string) => {
    if (!window.confirm('Supprimer cette redirection ?')) return;
    try {
      const { error } = await supabase
        .from('page_redirects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Redirection supprimée');
      loadRedirects();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  // ── Type badge ────────────────────────────────────────────────────────────

  const linkTypeBadge = (type: PageLinkEntry['linkType']) => {
    if (type === 'internal')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <LinkIcon className="w-3 h-3" /> Interne
        </span>
      );
    if (type === 'external')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          <Globe className="w-3 h-3" /> Externe
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Hash className="w-3 h-3" /> Ancre
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour au tableau de bord</span>
          </button>
        )}
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des liens</h1>
        </div>
        <p className="text-gray-500 ml-13">
          Recherchez et gérez les liens internes/externes et les redirections automatiques 301.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        {(['links', 'redirects'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab === 'links' ? (
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Liens ({allLinks.length})
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Redirections ({redirects.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── LINKS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'links' && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un lien, une page..."
                value={linksSearch}
                onChange={(e) => setLinksSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <select
              value={linksTypeFilter}
              onChange={(e) => setLinksTypeFilter(e.target.value as typeof linksTypeFilter)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="internal">Internes</option>
              <option value="external">Externes</option>
              <option value="anchor">Ancres</option>
            </select>
            <button
              onClick={loadLinks}
              disabled={linksLoading}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${linksLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(['internal', 'external', 'anchor'] as const).map((t) => {
              const count = allLinks.filter((l) => l.linkType === t).length;
              const labels = { internal: 'Internes', external: 'Externes', anchor: 'Ancres' };
              const colors = {
                internal: 'bg-blue-50 text-blue-700',
                external: 'bg-purple-50 text-purple-700',
                anchor: 'bg-gray-50 text-gray-700',
              };
              return (
                <div key={t} className={`p-4 rounded-2xl ${colors[t]} flex items-center gap-3`}>
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-sm font-medium">{labels[t]}</span>
                </div>
              );
            })}
          </div>

          {/* Table */}
          {linksLoading ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              Chargement des liens…
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <LinkIcon className="w-8 h-8 mx-auto mb-3 opacity-30" />
              Aucun lien trouvé
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Page source</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lien</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((entry, i) => (
                    <tr key={`${entry.pageId}-${entry.linkValue}-${i}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{entry.pageTitle}</p>
                        <p className="text-xs text-gray-400 truncate">/{entry.pageKey}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700">
                          {entry.linkType === 'external' && (
                            <ExternalLink className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          )}
                          <span className="truncate max-w-xs">{entry.linkValue}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{linkTypeBadge(entry.linkType)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 border-t border-gray-100">
                {filteredLinks.length} lien{filteredLinks.length > 1 ? 's' : ''} affiché{filteredLinks.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REDIRECTS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'redirects' && (
        <div>
          {/* Add redirect form (admin/seo_manager only) */}
          {canManage && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une redirection manuelle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ancien chemin (sans /)</label>
                  <input
                    type="text"
                    placeholder="ex: ancienne-page"
                    value={newOldPath}
                    onChange={(e) => setNewOldPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nouveau chemin (sans /)</label>
                  <input
                    type="text"
                    placeholder="ex: nouvelle-page"
                    value={newNewPath}
                    onChange={(e) => setNewNewPath(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              {addError && (
                <p className="text-xs text-red-600 mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {addError}
                </p>
              )}
              <button
                onClick={handleAddRedirect}
                disabled={isSavingRedirect}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isSavingRedirect ? 'Enregistrement…' : 'Ajouter la redirection 301'}
              </button>
            </div>
          )}

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un chemin…"
                value={redirectsSearch}
                onChange={(e) => setRedirectsSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <button
              onClick={loadRedirects}
              disabled={redirectsLoading}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${redirectsLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Table */}
          {redirectsLoading ? (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
              Chargement des redirections…
            </div>
          ) : filteredRedirects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ArrowRight className="w-8 h-8 mx-auto mb-3 opacity-30" />
              Aucune redirection configurée
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ancien chemin</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nouveau chemin</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Origine</th>
                    {canManage && <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRedirects.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">/{r.old_path}</td>
                      <td className="px-2 py-3 text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">/{r.new_path}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          {r.redirect_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_manual ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                          {r.is_manual ? 'Manuel' : 'Auto'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteRedirect(r.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 border-t border-gray-100">
                {filteredRedirects.length} redirection{filteredRedirects.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.text}
        </div>
      )}
    </div>
  );
}
