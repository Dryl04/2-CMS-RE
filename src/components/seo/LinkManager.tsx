import { useEffect, useMemo, useRef, useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Link2Off,
  RefreshCw,
  Replace,
  Route,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { api, SEOMetadata, SEORedirect } from '@/lib/api';
import {
  classifyLink,
  extractLinksFromSections,
  normalizeInternalPath,
  replaceLiteralLinkInSections,
  replaceInternalLinksInSections,
  replaceTargetedLinkInSections,
} from '@/lib/linkRegistry';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';

interface LinkManagerProps {
  onNavigate?: (view: string) => void;
}

type LinkHealth = 'ok' | 'redirected' | 'broken';
type ActiveTab = 'internal' | 'external' | 'by-page';

interface PageLinkEntry {
  pageId: string;
  pageKey: string;
  pageTitle: string;
  count: number;
}

interface SectionLinkEntry {
  sectionId: string;
  sectionType: string;
  sectionIndex: number;
  value: string;
  type: 'internal' | 'external' | 'empty';
  key: string;
  fieldPath?: string;
  elementLabel?: string;
  normalizedPath?: string;
  health?: LinkHealth;
  redirectTarget?: string;
}

interface PageDetailEntry {
  pageId: string;
  pageKey: string;
  pageTitle: string;
  links: SectionLinkEntry[];
}

interface DetectedLinkEntry {
  value: string;
  type: 'internal' | 'external' | 'empty';
  totalCount: number;
  pages: PageLinkEntry[];
  normalizedPath?: string;
  health?: LinkHealth;
  redirectTarget?: string;
}

interface ReplaceDialog {
  entry: DetectedLinkEntry | null;
  sectionLink: SectionLinkEntry | null;
  pageEntry: PageLinkEntry | null;
  newValue: string;
  scope: 'all' | string;
  saving: boolean;
}

const WIDGET_LABELS: Record<string, string> = {
  hero: 'Hero',
  features: 'Fonctionnalités',
  pricing: 'Tarifs',
  testimonials: 'Témoignages',
  contact: 'Contact',
  faq: 'FAQ',
  cta: 'Appel à l\'action',
  footer: 'Pied de page',
  header: 'En-tête',
  gallery: 'Galerie',
  team: 'Équipe',
  stats: 'Statistiques',
  newsletter: 'Newsletter',
  timeline: 'Chronologie',
  process: 'Processus',
  services: 'Services',
  blog: 'Blog',
  embed: 'Intégration',
  video: 'Vidéo',
  text: 'Texte',
  image: 'Image',
  logo: 'Logo',
  social: 'Réseaux sociaux',
  code: 'Code',
  map: 'Carte',
  form: 'Formulaire',
};

function getWidgetLabel(type: string): string {
  const lower = type.toLowerCase();
  for (const [key, label] of Object.entries(WIDGET_LABELS)) {
    if (lower.includes(key)) return label;
  }
  return type;
}

function getSiteHost() {
  return typeof window !== 'undefined' ? window.location.host : '';
}

function healthBadge(health: LinkHealth) {
  if (health === 'ok')
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        OK
      </span>
    );
  if (health === 'redirected')
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 shrink-0">
        <Route className="w-3.5 h-3.5" />
        Redirigé
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 shrink-0">
      <AlertTriangle className="w-3.5 h-3.5" />
      Cassé
    </span>
  );
}

export default function LinkManager({ onNavigate }: LinkManagerProps) {
  const modal = useModal();
  const [pages, setPages] = useState<SEOMetadata[]>([]);
  const [redirects, setRedirects] = useState<SEORedirect[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('internal');
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [replaceDialog, setReplaceDialog] = useState<ReplaceDialog | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: 'ok' | 'err' } | null>(null);
  const newValueRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, variant: 'ok' | 'err' = 'ok') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesResult, redirectsResult] = await Promise.all([
        api.pages.list({ order: 'updated_at:desc' }),
        api.redirects.list(),
      ]);
      if (pagesResult.error) throw pagesResult.error;
      if (redirectsResult.error) throw redirectsResult.error;
      setPages((pagesResult.data || []) as SEOMetadata[]);
      setRedirects((redirectsResult.data || []) as SEORedirect[]);
    } catch (error) {
      console.error('[LinkManager] loadData error:', error);
      showToast('Erreur de chargement', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (replaceDialog) setTimeout(() => newValueRef.current?.focus(), 50);
  }, [replaceDialog?.entry?.value, replaceDialog?.sectionLink?.value]);

  const { internalLinks, externalLinks, pageDetails } = useMemo(() => {
    const host = getSiteHost();
    const publishedSet = new Set(
      pages.filter((p) => p.status === 'published').map((p) => normalizeInternalPath(p.page_key)).filter(Boolean),
    );
    const activeRedirects = new Map(
      redirects
        .filter((r) => r.is_active)
        .map((r) => [normalizeInternalPath(r.source_path), normalizeInternalPath(r.target_path)]),
    );

    const internalMap = new Map<string, { pages: Map<string, PageLinkEntry> }>();
    const externalMap = new Map<string, { pages: Map<string, PageLinkEntry> }>();
    const pageDetailsMap = new Map<string, PageDetailEntry>();

    for (const page of pages) {
      const sections = Array.isArray(page.sections_data) ? (page.sections_data as PageBuilderSection[]) : [];
      if (!sections.length) continue;

      const found = extractLinksFromSections(sections);
      for (const item of found) {
        const raw = item.value.trim();
        if (!raw) continue;
        const kind = classifyLink(raw, host);
        if (kind === 'anchor' || kind === 'protocol' || kind === 'unknown') continue;

        const bucket = kind === 'external' ? externalMap : internalMap;
        if (!bucket.has(raw)) bucket.set(raw, { pages: new Map() });
        const entry = bucket.get(raw)!;
        if (!entry.pages.has(page.id)) {
          entry.pages.set(page.id, {
            pageId: page.id,
            pageKey: page.page_key,
            pageTitle: (page as SEOMetadata & { title?: string }).title || page.page_key,
            count: 0,
          });
        }
        entry.pages.get(page.id)!.count += 1;

        // Build per-page detail
        if (!pageDetailsMap.has(page.id)) {
          pageDetailsMap.set(page.id, {
            pageId: page.id,
            pageKey: page.page_key,
            pageTitle: (page as SEOMetadata & { title?: string }).title || page.page_key,
            links: [],
          });
        }
        const normalizedPath = kind === 'internal' ? normalizeInternalPath(raw) : undefined;
        const redirectTarget = normalizedPath ? activeRedirects.get(normalizedPath) : undefined;
        let health: LinkHealth | undefined;
        if (kind === 'internal') {
          if (publishedSet.has(normalizedPath!)) health = 'ok';
          else if (redirectTarget) health = 'redirected';
          else health = 'broken';
        }

        pageDetailsMap.get(page.id)!.links.push({
          sectionId: item.sectionId || '',
          sectionType: item.sectionType || '',
          sectionIndex: item.sectionIndex ?? -1,
          value: raw,
          type: kind,
          key: item.key,
          fieldPath: item.path,
          elementLabel: item.elementLabel,
          normalizedPath,
          health,
          redirectTarget,
        });
      }
    }

    for (const page of pages) {
      const sections = Array.isArray(page.sections_data) ? (page.sections_data as PageBuilderSection[]) : [];
      if (!sections.length) continue;

      const allFound = extractLinksFromSections(sections, { includeEmpty: true });
      for (const item of allFound) {
        const raw = item.value.trim();
        const kind = classifyLink(raw || '', host);
        const isEmptyOrPlaceholder = !raw || raw === '#' || kind === 'anchor';
        if (!isEmptyOrPlaceholder) continue;

        if (!pageDetailsMap.has(page.id)) {
          pageDetailsMap.set(page.id, {
            pageId: page.id,
            pageKey: page.page_key,
            pageTitle: (page as SEOMetadata & { title?: string }).title || page.page_key,
            links: [],
          });
        }

        pageDetailsMap.get(page.id)!.links.push({
          sectionId: item.sectionId || '',
          sectionType: item.sectionType || '',
          sectionIndex: item.sectionIndex ?? -1,
          value: raw || '',
          type: 'empty',
          key: item.key,
          fieldPath: item.path,
          elementLabel: item.elementLabel,
        });
      }
    }

    const toInternalEntry = ([value, meta]: [string, { pages: Map<string, PageLinkEntry> }]): DetectedLinkEntry => {
      const normalizedPath = normalizeInternalPath(value);
      const redirectTarget = activeRedirects.get(normalizedPath);
      let health: LinkHealth = 'broken';
      if (publishedSet.has(normalizedPath)) health = 'ok';
      else if (redirectTarget) health = 'redirected';

      const pagesArr = Array.from(meta.pages.values());
      return {
        value,
        type: 'internal',
        totalCount: pagesArr.reduce((s, p) => s + p.count, 0),
        pages: pagesArr,
        normalizedPath,
        health,
        redirectTarget,
      };
    };

    const toExternalEntry = ([value, meta]: [string, { pages: Map<string, PageLinkEntry> }]): DetectedLinkEntry => {
      const pagesArr = Array.from(meta.pages.values());
      return {
        value,
        type: 'external',
        totalCount: pagesArr.reduce((s, p) => s + p.count, 0),
        pages: pagesArr,
      };
    };

    return {
      internalLinks: Array.from(internalMap.entries()).map(toInternalEntry).sort((a, b) => b.totalCount - a.totalCount),
      externalLinks: Array.from(externalMap.entries()).map(toExternalEntry).sort((a, b) => b.totalCount - a.totalCount),
      pageDetails: Array.from(pageDetailsMap.values()).sort((a, b) => a.pageTitle.localeCompare(b.pageTitle)),
    };
  }, [pages, redirects]);

  const activeLinks = activeTab === 'internal' ? internalLinks : externalLinks;

  const filteredLinks = useMemo(() => {
    if (activeTab === 'by-page') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeLinks;
    return activeLinks.filter(
      (item) =>
        item.value.toLowerCase().includes(q) ||
        item.normalizedPath?.toLowerCase().includes(q) ||
        item.pages.some((p) => p.pageKey.toLowerCase().includes(q) || p.pageTitle.toLowerCase().includes(q)) ||
        (item.redirectTarget || '').toLowerCase().includes(q),
    );
  }, [activeLinks, searchQuery, activeTab]);

  const filteredPageDetails = useMemo(() => {
    if (activeTab !== 'by-page') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pageDetails;
    return pageDetails
      .map((pd) => ({
        ...pd,
        links: pd.links.filter(
          (l) =>
            l.value.toLowerCase().includes(q) ||
            l.normalizedPath?.toLowerCase().includes(q) ||
            l.sectionType.toLowerCase().includes(q) ||
            getWidgetLabel(l.sectionType).toLowerCase().includes(q),
        ),
      }))
      .filter((pd) =>
        pd.pageTitle.toLowerCase().includes(q) ||
        pd.pageKey.toLowerCase().includes(q) ||
        pd.links.length > 0,
      );
  }, [pageDetails, searchQuery, activeTab]);

  const toggleExpand = (value: string) => {
    setExpandedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleExpandPage = (pageId: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const openReplaceAll = (entry: DetectedLinkEntry) => {
    setReplaceDialog({ entry, sectionLink: null, pageEntry: null, newValue: entry.value, scope: 'all', saving: false });
  };

  const openReplaceOnPage = (entry: DetectedLinkEntry, pageEntry: PageLinkEntry) => {
    setReplaceDialog({ entry, sectionLink: null, pageEntry, newValue: entry.value, scope: pageEntry.pageId, saving: false });
  };

  const openReplaceFromPageView = (sectionLink: SectionLinkEntry, pageEntry: PageDetailEntry) => {
    const fakeEntry: DetectedLinkEntry = {
      value: sectionLink.value,
      type: sectionLink.type,
      totalCount: 1,
      pages: [{ pageId: pageEntry.pageId, pageKey: pageEntry.pageKey, pageTitle: pageEntry.pageTitle, count: 1 }],
      normalizedPath: sectionLink.normalizedPath,
      health: sectionLink.health,
      redirectTarget: sectionLink.redirectTarget,
    };
    setReplaceDialog({
      entry: fakeEntry,
      sectionLink,
      pageEntry: { pageId: pageEntry.pageId, pageKey: pageEntry.pageKey, pageTitle: pageEntry.pageTitle, count: 1 },
      newValue: sectionLink.value,
      scope: pageEntry.pageId,
      saving: false,
    });
  };

  const confirmReplace = async () => {
    if (!replaceDialog?.entry) return;
    const { entry, sectionLink, newValue, scope } = replaceDialog;
    const trimmedNew = newValue.trim();
    if (!trimmedNew || trimmedNew === entry.value) {
      showToast('La nouvelle valeur est identique à l\'ancienne', 'err');
      return;
    }

    setReplaceDialog((d) => d && { ...d, saving: true });

    const targetPages = scope === 'all'
      ? pages.filter((p) => entry.pages.some((ep) => ep.pageId === p.id))
      : pages.filter((p) => p.id === scope && entry.pages.some((ep) => ep.pageId === p.id));

    let totalUpdated = 0;
    let errors = 0;

    const isEmptyLink = entry.type === 'empty';

    for (const page of targetPages) {
      const sections = Array.isArray(page.sections_data) ? (page.sections_data as PageBuilderSection[]) : [];
      if (!sections.length) continue;

      let result;
      if (isEmptyLink && sectionLink) {
        result = replaceTargetedLinkInSections(
          sections,
          sectionLink.sectionIndex,
          sectionLink.key,
          entry.value,
          trimmedNew,
          sectionLink.fieldPath,
        );
      } else if (entry.type === 'internal' && entry.normalizedPath) {
        const newNormalized = normalizeInternalPath(trimmedNew);
        result = replaceInternalLinksInSections(sections, entry.normalizedPath, newNormalized || trimmedNew);
      } else {
        result = replaceLiteralLinkInSections(sections, entry.value, trimmedNew);
      }

      if (result.updatedCount === 0) continue;

      const { error } = await api.pages.update(page.id, { sections_data: result.sections });

      if (error) {
        console.error('[LinkManager] Replace error on page', page.page_key, error);
        errors += 1;
      } else {
        totalUpdated += result.updatedCount;
      }
    }

    setReplaceDialog(null);

    if (errors > 0) {
      showToast(`${errors} erreur(s) lors de la mise à jour`, 'err');
    } else {
      showToast(`${totalUpdated} lien(s) remplacé(s) avec succès`);
    }

    loadData();
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!await modal.confirm('Supprimer cette redirection ?', 'Supprimer la redirection')) return;
    const { error } = await api.redirects.delete(id);
    if (error) {
      showToast('Suppression impossible', 'err');
    } else {
      showToast('Redirection supprimée');
      loadData();
    }
  };

  const internalOk = internalLinks.filter((i) => i.health === 'ok').length;
  const internalBroken = internalLinks.filter((i) => i.health === 'broken').length;
  const emptyLinksTotal = pageDetails.reduce((sum, pd) => sum + pd.links.filter((l) => l.type === 'empty').length, 0);

  const currentDialogValue = replaceDialog?.entry?.value ?? '';
  const currentDialogScopeLabel = replaceDialog?.scope === 'all'
    ? `toutes les pages (${replaceDialog.entry?.pages.length})`
    : replaceDialog?.pageEntry?.pageTitle || replaceDialog?.scope || '';

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.variant === 'err'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Replace modal */}
      {replaceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Replace className="w-4 h-4" />
                Remplacer un lien
              </h2>
              <button
                onClick={() => setReplaceDialog(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                {replaceDialog.scope === 'all' ? (
                  <span>
                    Portée :{' '}
                    <strong className="text-gray-800">{currentDialogScopeLabel}</strong>
                  </span>
                ) : (
                  <span>
                    Portée :{' '}
                    <strong className="text-gray-800">{currentDialogScopeLabel}</strong>{' '}
                    uniquement
                    {replaceDialog.sectionLink && (
                      <span className="ml-1 text-gray-400">
                        · <strong className="text-gray-600">{getWidgetLabel(replaceDialog.sectionLink.sectionType)}</strong>
                        {replaceDialog.sectionLink.elementLabel && (
                          <span> · <strong className="text-gray-600">{replaceDialog.sectionLink.elementLabel}</strong></span>
                        )}
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valeur actuelle</label>
                <div className={`font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 break-all ${currentDialogValue ? 'text-gray-700' : 'text-amber-600 italic'}`}>
                  {currentDialogValue || '(vide)'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nouvelle valeur</label>
                <input
                  ref={newValueRef}
                  value={replaceDialog.newValue}
                  onChange={(e) => setReplaceDialog((d) => d && { ...d, newValue: e.target.value })}
                  className="w-full font-mono text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder={replaceDialog.entry?.type === 'empty' ? '/page-cible ou https://...' : replaceDialog.entry?.type === 'internal' ? 'nouveau-slug' : 'https://'}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmReplace(); if (e.key === 'Escape') setReplaceDialog(null); }}
                />
                {replaceDialog.entry?.type === 'internal' && (
                  <p className="text-xs text-gray-400 mt-1">Les formats /slug, slug et https://site/slug sont tous acceptés.</p>
                )}
                {replaceDialog.entry?.type === 'empty' && (
                  <p className="text-xs text-gray-400 mt-1">Renseignez un lien interne (/slug) ou externe (https://...).</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setReplaceDialog(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={confirmReplace}
                disabled={replaceDialog.saving || !replaceDialog.newValue.trim() || replaceDialog.newValue.trim() === currentDialogValue}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {replaceDialog.saving && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Remplacer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Gestion des liens</h1>
          <p className="text-gray-500 text-sm">
            Audit, remplacement et redirections — liens internes et externes
          </p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Liens internes</p>
          <p className="text-xl font-bold text-gray-900">{internalLinks.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Valides</p>
          <p className="text-xl font-bold text-emerald-700">{internalOk}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Liens externes</p>
          <p className="text-xl font-bold text-blue-700">{externalLinks.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Non definis</p>
          <p className="text-xl font-bold text-amber-600">{emptyLinksTotal}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Casses</p>
          <p className="text-xl font-bold text-red-700">{internalBroken}</p>
        </div>
      </div>

      {/* Tab bar + search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shrink-0">
          <button
            onClick={() => setActiveTab('internal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'internal' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Internes ({internalLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'external' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Externes ({externalLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('by-page')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'by-page' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Par page ({pageDetails.length})
          </button>
        </div>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'by-page'
                ? 'Filtrer par page, URL, widget...'
                : 'Filtrer par URL, page source...'
            }
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Internal / External tab                                          */}
          {/* ---------------------------------------------------------------- */}
          {activeTab !== 'by-page' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  {activeTab === 'internal' ? (
                    <><Link2 className="w-4 h-4" />Liens internes détectés</>
                  ) : (
                    <><Globe className="w-4 h-4" />Liens externes détectés</>
                  )}
                  <span className="text-xs font-normal text-gray-400">({filteredLinks.length})</span>
                </span>
                {filteredLinks.length > 0 && (
                  <span className="text-xs text-gray-400">
                    Cliquer sur une ligne pour voir les pages sources
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {filteredLinks.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-gray-500 text-center">
                    Aucun lien {activeTab === 'internal' ? 'interne' : 'externe'} trouvé.
                  </div>
                ) : (
                  filteredLinks.map((item) => {
                    const isExpanded = expandedLinks.has(item.value);
                    return (
                      <div key={item.value}>
                        <div
                          className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleExpand(item.value)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="shrink-0 text-gray-400">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono text-sm text-gray-900 break-all">
                                {item.type === 'internal' ? `/${item.normalizedPath}` : item.value}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.totalCount} occurrence(s) · {item.pages.length} page(s) source(s)
                              </p>
                              {item.redirectTarget && (
                                <p className="text-xs text-blue-600 font-mono mt-0.5">→ /{item.redirectTarget}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {item.health && healthBadge(item.health)}
                            {item.type === 'external' && (
                              <a
                                href={item.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Ouvrir dans un onglet"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                              </a>
                            )}
                            <button
                              onClick={() => openReplaceAll(item)}
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Remplacer sur toutes les pages"
                            >
                              <Replace className="w-3.5 h-3.5" />
                              Remplacer partout
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {item.pages.map((pageEntry) => (
                              <div
                                key={pageEntry.pageId}
                                className="flex items-center justify-between gap-3 px-8 py-2.5 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-800 font-medium truncate">{pageEntry.pageTitle}</p>
                                  <p className="text-xs font-mono text-gray-400">/{pageEntry.pageKey}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs text-gray-400">{pageEntry.count} occ.</span>
                                  <button
                                    onClick={() => openReplaceOnPage(item, pageEntry)}
                                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
                                    title="Remplacer sur cette page uniquement"
                                  >
                                    <Replace className="w-3 h-3" />
                                    Cette page
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* By-page tab                                                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === 'by-page' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Liens par page
                  <span className="text-xs font-normal text-gray-400">({filteredPageDetails.length} page(s))</span>
                </span>
                <span className="text-xs text-gray-400">
                  Cliquer sur une page pour voir ses liens
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredPageDetails.length === 0 ? (
                  <div className="px-4 py-10 text-sm text-gray-500 text-center">
                    Aucune page avec des liens trouvée.
                  </div>
                ) : (
                  filteredPageDetails.map((pd) => {
                    const isExpanded = expandedPages.has(pd.pageId);
                    const internalCount = pd.links.filter((l) => l.type === 'internal').length;
                    const externalCount = pd.links.filter((l) => l.type === 'external').length;
                    const brokenCount = pd.links.filter((l) => l.health === 'broken').length;
                    const emptyCount = pd.links.filter((l) => l.type === 'empty').length;

                    return (
                      <div key={pd.pageId}>
                        {/* Page row */}
                        <div
                          className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleExpandPage(pd.pageId)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="shrink-0 text-gray-400">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{pd.pageTitle}</p>
                              <p className="text-xs font-mono text-gray-400 mt-0.5">/{pd.pageKey}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
                            {internalCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                <Link2 className="w-3 h-3" />
                                {internalCount}
                              </span>
                            )}
                            {externalCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                <Globe className="w-3 h-3" />
                                {externalCount}
                              </span>
                            )}
                            {emptyCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                                <Link2Off className="w-3 h-3" />
                                {emptyCount}
                              </span>
                            )}
                            {brokenCount > 0 && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                {brokenCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded: per-link list */}
                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                            {pd.links.length === 0 ? (
                              <div className="px-8 py-4 text-xs text-gray-400">Aucun lien sur cette page.</div>
                            ) : (
                              pd.links.map((link, idx) => (
                                <div
                                  key={`${link.sectionId}-${link.key}-${idx}`}
                                  className="flex items-center justify-between gap-3 px-8 py-2.5"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <span className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md shrink-0">
                                        {getWidgetLabel(link.sectionType) || `Widget ${link.sectionIndex + 1}`}
                                      </span>
                                      {link.elementLabel && (
                                        <>
                                          <span className="text-gray-300 text-xs shrink-0">·</span>
                                          <span className="text-xs text-gray-700 font-medium shrink-0 max-w-[160px] truncate" title={link.elementLabel}>
                                            {link.elementLabel}
                                          </span>
                                        </>
                                      )}
                                      <span className="ml-auto shrink-0">
                                        {link.type === 'external' ? (
                                          <Globe className="w-3 h-3 text-gray-400" />
                                        ) : link.type === 'empty' ? (
                                          <Link2Off className="w-3 h-3 text-amber-400" />
                                        ) : (
                                          <Link2 className="w-3 h-3 text-gray-400" />
                                        )}
                                      </span>
                                    </div>
                                    {link.type === 'empty' ? (
                                      <p className="font-mono text-sm text-amber-600 italic break-all">
                                        {link.value ? link.value : '(vide)'}
                                      </p>
                                    ) : (
                                      <p className="font-mono text-sm text-gray-900 break-all">
                                        {link.type === 'internal' && link.normalizedPath
                                          ? `/${link.normalizedPath}`
                                          : link.value}
                                      </p>
                                    )}
                                    {link.redirectTarget && (
                                      <p className="text-xs text-blue-600 font-mono mt-0.5">→ /{link.redirectTarget}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {link.type === 'empty' && (
                                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 shrink-0">
                                        <Link2Off className="w-3.5 h-3.5" />
                                        Non defini
                                      </span>
                                    )}
                                    {link.health && healthBadge(link.health)}
                                    {link.type === 'external' && (
                                      <a
                                        href={link.value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                        title="Ouvrir dans un onglet"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => openReplaceFromPageView(link, pd)}
                                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
                                      title="Modifier ce lien"
                                    >
                                      <Replace className="w-3 h-3" />
                                      Modifier
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Redirections panel */}
          {activeTab !== 'by-page' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Route className="w-4 h-4" />
                Changements automatiques enregistrés
                <span className="text-xs font-normal text-gray-400">({redirects.length})</span>
              </div>
              <div className="divide-y divide-gray-100">
                {redirects.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-gray-500 text-center">Aucune redirection.</div>
                ) : (
                  redirects.map((redirect) => (
                    <div key={redirect.id} className="px-4 py-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-1 ${
                            redirect.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {redirect.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          /{normalizeInternalPath(redirect.source_path)}
                        </p>
                        <p className="font-mono text-xs text-blue-700 break-all mt-0.5">
                          → /{normalizeInternalPath(redirect.target_path)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteRedirect(redirect.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
