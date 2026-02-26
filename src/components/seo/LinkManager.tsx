import { useEffect, useMemo, useState } from 'react';
import { Link2, Search, RefreshCw, AlertTriangle, CheckCircle2, Route, Trash2 } from 'lucide-react';
import { supabase, SEOMetadata, SEORedirect } from '@/lib/supabase';
import { extractLinksFromSections, normalizeInternalPath } from '@/lib/linkRegistry';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';

interface LinkManagerProps {
  onNavigate?: (view: string) => void;
}

type LinkHealth = 'ok' | 'redirected' | 'broken';

interface InternalLinkItem {
  path: string;
  count: number;
  pages: string[];
  health: LinkHealth;
  target?: string;
}

function resolveInternalPath(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  if (
    raw.startsWith('#') ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:') ||
    raw.startsWith('javascript:') ||
    raw.startsWith('data:')
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (typeof window !== 'undefined' && parsed.host !== window.location.host) {
        return null;
      }
      return normalizeInternalPath(parsed.pathname);
    } catch {
      return null;
    }
  }

  if (raw.startsWith('/')) {
    return normalizeInternalPath(raw);
  }

  if (/^[a-z0-9][a-z0-9\-\/_]*(?:[?#].*)?$/i.test(raw)) {
    return normalizeInternalPath(raw);
  }

  return null;
}

export default function LinkManager({ onNavigate }: LinkManagerProps) {
  const [pages, setPages] = useState<SEOMetadata[]>([]);
  const [redirects, setRedirects] = useState<SEORedirect[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesResult, redirectsResult] = await Promise.all([
        supabase.from('seo_metadata').select('id, page_key, title, sections_data, status').order('updated_at', { ascending: false }),
        supabase.from('seo_redirects').select('*').order('created_at', { ascending: false }),
      ]);

      if (pagesResult.error) throw pagesResult.error;
      if (redirectsResult.error) throw redirectsResult.error;

      setPages((pagesResult.data || []) as SEOMetadata[]);
      setRedirects((redirectsResult.data || []) as SEORedirect[]);
    } catch (error) {
      console.error('[LinkManager] Error loading data:', error);
      showToast('Erreur lors du chargement des liens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const internalLinks = useMemo<InternalLinkItem[]>(() => {
    const index = new Map<string, { count: number; pages: Set<string> }>();
    const publishedPages = new Set(
      pages
        .filter((p) => p.status === 'published')
        .map((p) => normalizeInternalPath(p.page_key))
        .filter(Boolean),
    );

    const activeRedirects = new Map(
      redirects
        .filter((r) => r.is_active)
        .map((r) => [normalizeInternalPath(r.source_path), normalizeInternalPath(r.target_path)]),
    );

    for (const page of pages) {
      const sections = Array.isArray(page.sections_data) ? (page.sections_data as PageBuilderSection[]) : [];
      if (sections.length === 0) continue;

      const found = extractLinksFromSections(sections);
      for (const item of found) {
        const normalizedPath = resolveInternalPath(item.value);
        if (!normalizedPath) continue;

        const existing = index.get(normalizedPath) || { count: 0, pages: new Set<string>() };
        existing.count += 1;
        existing.pages.add(page.page_key);
        index.set(normalizedPath, existing);
      }
    }

    return Array.from(index.entries())
      .map(([path, meta]) => {
        const redirectTarget = activeRedirects.get(path);
        let health: LinkHealth = 'broken';
        if (publishedPages.has(path)) {
          health = 'ok';
        } else if (redirectTarget) {
          health = 'redirected';
        }

        return {
          path,
          count: meta.count,
          pages: Array.from(meta.pages),
          health,
          target: redirectTarget,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [pages, redirects]);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return internalLinks;
    const q = searchQuery.toLowerCase();
    return internalLinks.filter((item) =>
      item.path.toLowerCase().includes(q) ||
      item.pages.some((pageKey) => pageKey.toLowerCase().includes(q)) ||
      (item.target || '').toLowerCase().includes(q),
    );
  }, [internalLinks, searchQuery]);

  const handleDeleteRedirect = async (id: string) => {
    if (!confirm('Supprimer cette redirection ?')) return;

    try {
      const { error } = await supabase.from('seo_redirects').delete().eq('id', id);
      if (error) throw error;
      showToast('Redirection supprimée');
      loadData();
    } catch (error) {
      console.error('[LinkManager] Error deleting redirect:', error);
      showToast('Suppression impossible');
    }
  };

  const okCount = internalLinks.filter((item) => item.health === 'ok').length;
  const redirectedCount = internalLinks.filter((item) => item.health === 'redirected').length;
  const brokenCount = internalLinks.filter((item) => item.health === 'broken').length;

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-gray-50 border-gray-200 text-gray-800">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Gestion des liens</h1>
          <p className="text-gray-500 text-sm">Vue centralisée des liens internes et redirections automatiques</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pages')}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour pages
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Liens valides</p>
          <p className="text-xl font-bold text-emerald-700">{okCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Liens redirigés</p>
          <p className="text-xl font-bold text-blue-700">{redirectedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Liens cassés</p>
          <p className="text-xl font-bold text-red-700">{brokenCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un chemin, une page source, une cible..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Link2 className="w-4 h-4" />
              Liens internes détectés ({filteredLinks.length})
            </div>
            <div className="divide-y divide-gray-100">
              {filteredLinks.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">Aucun lien interne trouvé.</div>
              ) : (
                filteredLinks.map((item) => (
                  <div key={item.path} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-gray-900 break-all">/{item.path}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.count} occurrence(s) • {item.pages.length} page(s) source(s)
                      </p>
                      {item.target && (
                        <p className="text-xs text-blue-700 mt-1 font-mono">→ /{item.target}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {item.health === 'ok' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          OK
                        </span>
                      )}
                      {item.health === 'redirected' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          <Route className="w-3.5 h-3.5" />
                          Redirigé
                        </span>
                      )}
                      {item.health === 'broken' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Cassé
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Route className="w-4 h-4" />
              Redirections enregistrées ({redirects.length})
            </div>
            <div className="divide-y divide-gray-100">
              {redirects.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">Aucune redirection.</div>
              ) : (
                redirects.map((redirect) => (
                  <div key={redirect.id} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{redirect.is_active ? 'Active' : 'Inactive'}</p>
                      <p className="font-mono text-sm text-gray-900 break-all">/{normalizeInternalPath(redirect.source_path)}</p>
                      <p className="font-mono text-xs text-blue-700 break-all mt-1">→ /{normalizeInternalPath(redirect.target_path)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRedirect(redirect.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
