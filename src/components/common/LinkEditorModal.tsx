/**
 * LinkEditorModal — Modale réutilisable pour l'insertion et l'édition de liens.
 *
 * Fonctionnalités:
 *   - Recherche / autosuggestion parmi les liens **internes** (pages du projet)
 *     ET **externes** (URLs utilisées dans les sections de toutes les pages)
 *   - Options SEO: target, rel=noopener/nofollow/sponsored
 *   - Validation URL (interne, externe, ancre, mailto, tel)
 *   - Texte d'ancre optionnel (contexte rich text)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Link, Globe, Home, Search } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinkEditorResult {
  url: string;
  anchorText: string;
  targetBlank: boolean;
  relNoopener: boolean;
  relNofollow: boolean;
  relSponsored: boolean;
}

export interface LinkEditorModalProps {
  isOpen: boolean;
  title?: string;
  initialUrl?: string;
  initialAnchorText?: string;
  showAnchorText?: boolean;
  allowOpenInNewTab?: boolean;
  allowNofollow?: boolean;
  allowNoopener?: boolean;
  allowSponsored?: boolean;
  defaultTargetBlank?: boolean;
  onCancel: () => void;
  onSubmit: (result: LinkEditorResult) => void;
}

// ---------------------------------------------------------------------------
// Helpers — URL validation
// ---------------------------------------------------------------------------

function validateUrl(url: string): string | null {
  if (!url.trim()) return 'L\'URL ne peut pas être vide.';
  if (url.startsWith('/')) return null;
  if (url.startsWith('#')) return null;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL invalide. Utilisez https://... ou /chemin pour un lien interne.';
  }
}

export function buildRelAttribute(
  noopener: boolean,
  nofollow: boolean,
  sponsored: boolean,
): string {
  const parts: string[] = [];
  if (noopener) parts.push('noopener');
  if (nofollow) parts.push('nofollow');
  if (sponsored) parts.push('sponsored');
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Link suggestion item
// ---------------------------------------------------------------------------

interface LinkSuggestionItem {
  url: string;
  label: string;
  kind: 'internal' | 'external';
}

// ---------------------------------------------------------------------------
// Cached project-wide link suggestions (pages + external URLs in sections)
// ---------------------------------------------------------------------------

let _cachedProjectLinks: LinkSuggestionItem[] | null = null;
let _cacheTs = 0;
const CACHE_TTL = 60_000;

/** Link-like content keys in widget content JSONB */
const LINK_CONTENT_KEYS = [
  'ctaLink', 'primaryLink', 'secondaryLink', 'secondaryCtaLink',
  'buttonUrl', 'link', 'accountLink', 'searchLink', 'cartLink',
];

/** Extract unique link values from JSONB section content */
function extractLinksFromSections(sectionsData: any[]): string[] {
  const links = new Set<string>();
  if (!Array.isArray(sectionsData)) return [];
  for (const section of sectionsData) {
    const content = section?.content;
    if (!content || typeof content !== 'object') continue;
    // Direct link keys
    for (const key of LINK_CONTENT_KEYS) {
      const val = content[key];
      if (typeof val === 'string' && val.trim()) links.add(val.trim());
    }
    // navItems
    if (Array.isArray(content.navItems)) {
      for (const item of content.navItems) {
        if (item?.link && typeof item.link === 'string') links.add(item.link.trim());
      }
    }
    // columns with links (footer)
    if (Array.isArray(content.columns)) {
      for (const col of content.columns) {
        if (Array.isArray(col?.links)) {
          for (const l of col.links) {
            if (l?.url && typeof l.url === 'string') links.add(l.url.trim());
          }
        }
      }
    }
    // socialLinks
    if (Array.isArray(content.socialLinks)) {
      for (const s of content.socialLinks) {
        if (s?.url && typeof s.url === 'string') links.add(s.url.trim());
      }
    }
  }
  return Array.from(links);
}

async function fetchProjectLinks(): Promise<LinkSuggestionItem[]> {
  const now = Date.now();
  if (_cachedProjectLinks && now - _cacheTs < CACHE_TTL) return _cachedProjectLinks;

  const items: LinkSuggestionItem[] = [];
  const seenUrls = new Set<string>();

  try {
    // 1) Internal pages from seo_metadata
    const { data: pages } = await api.links.listPageLinks();

    if (pages) {
      for (const p of pages) {
        const slug = `/${p.page_key}`;
        if (!seenUrls.has(slug)) {
          seenUrls.add(slug);
          items.push({ url: slug, label: p.title || p.page_key, kind: 'internal' });
        }
      }
    }

    // 2) External + all links used across pages (from page_templates.sections_data)
    const { data: templates } = await api.links.listTemplateLinks();

    if (templates) {
      for (const tpl of templates) {
        const extracted = extractLinksFromSections(tpl.sections_data as any[]);
        for (const link of extracted) {
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);
          const isInternal = link.startsWith('/') || link.startsWith('#');
          items.push({
            url: link,
            label: isInternal ? `Page: ${link}` : link,
            kind: isInternal ? 'internal' : 'external',
          });
        }
      }
    }
  } catch {
    // Silently fail — return what we have
  }

  _cachedProjectLinks = items;
  _cacheTs = now;
  return items;
}

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

type SuggestionFilter = 'all' | 'internal' | 'external';

export function LinkEditorModal({
  isOpen,
  title = 'Insérer un lien',
  initialUrl = '',
  initialAnchorText = '',
  showAnchorText = false,
  allowOpenInNewTab = true,
  allowNofollow = true,
  allowNoopener = true,
  allowSponsored = false,
  defaultTargetBlank = false,
  onCancel,
  onSubmit,
}: LinkEditorModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [anchorText, setAnchorText] = useState(initialAnchorText);
  const [targetBlank, setTargetBlank] = useState(defaultTargetBlank);
  const [relNoopener, setRelNoopener] = useState(defaultTargetBlank);
  const [relNofollow, setRelNofollow] = useState(false);
  const [relSponsored, setRelSponsored] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Autosuggestion — project-wide links
  const [allProjectLinks, setAllProjectLinks] = useState<LinkSuggestionItem[]>([]);
  const [suggestions, setSuggestions] = useState<LinkSuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState<SuggestionFilter>('all');
  const suggWrapperRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Sync state with new initial values each time modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setAnchorText(initialAnchorText);
      setTargetBlank(defaultTargetBlank);
      setRelNoopener(defaultTargetBlank);
      setRelNofollow(false);
      setRelSponsored(false);
      setUrlError(null);
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionFilter('all');
      fetchProjectLinks().then(setAllProjectLinks);
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync noopener with targetBlank suggestion
  useEffect(() => {
    if (targetBlank && allowNoopener) setRelNoopener(true);
  }, [targetBlank, allowNoopener]);

  // Close on click outside suggestions
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggWrapperRef.current && !suggWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  const filterSuggestions = useCallback(
    (query: string, filter: SuggestionFilter) => {
      const q = query.toLowerCase().trim();
      let pool = allProjectLinks;
      if (filter === 'internal') pool = pool.filter((l) => l.kind === 'internal');
      if (filter === 'external') pool = pool.filter((l) => l.kind === 'external');

      if (!q) {
        // Show first items when empty
        const result = pool.slice(0, 10);
        setSuggestions(result);
        setShowSuggestions(result.length > 0);
        return;
      }

      const filtered = pool
        .filter((l) => l.url.toLowerCase().includes(q) || l.label.toLowerCase().includes(q))
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    },
    [allProjectLinks],
  );

  const handleUrlChange = useCallback(
    (val: string) => {
      setUrl(val);
      setUrlError(null);
      filterSuggestions(val, suggestionFilter);
    },
    [filterSuggestions, suggestionFilter],
  );

  const handleFilterChange = useCallback(
    (filter: SuggestionFilter) => {
      setSuggestionFilter(filter);
      filterSuggestions(url, filter);
    },
    [url, filterSuggestions],
  );

  const handleSubmit = () => {
    const error = validateUrl(url.trim());
    if (error) {
      setUrlError(error);
      return;
    }
    onSubmit({
      url: url.trim(),
      anchorText: anchorText.trim(),
      targetBlank,
      relNoopener,
      relNofollow,
      relSponsored,
    });
  };

  const isInternalLink = url.startsWith('/');
  const isValid = url.trim().length > 0 && !validateUrl(url.trim());

  if (!isOpen) return null;

  const modalContent = (
    // Backdrop
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Link size={16} className="text-gray-600" />
            <h2 id="link-modal-title" className="font-semibold text-gray-900 text-sm">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* URL Input with project-wide search */}
          <div ref={suggWrapperRef} className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL du lien
              {isInternalLink && (
                <span className="ml-2 text-blue-600 font-normal">→ page interne</span>
              )}
              {!isInternalLink && url && !url.startsWith('#') && (
                <span className="ml-2 text-gray-400 font-normal">→ lien externe</span>
              )}
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={urlInputRef}
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onFocus={() => filterSuggestions(url, suggestionFilter)}
                  placeholder="Rechercher ou saisir une URL..."
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                    urlError
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-300'
                  } focus:outline-none focus:ring-2`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  className="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                  title="Vérifier le lien"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            {urlError && (
              <p className="mt-1 text-xs text-red-500">{urlError}</p>
            )}

            {/* Filter tabs + suggestion dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {/* Filter tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                  {([
                    { key: 'all' as const, icon: Search, label: 'Tous' },
                    { key: 'internal' as const, icon: Home, label: 'Internes' },
                    { key: 'external' as const, icon: Globe, label: 'Externes' },
                  ]).map(({ key, icon: Icon, label: filterLabel }) => (
                    <button
                      key={key}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleFilterChange(key); }}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${
                        suggestionFilter === key
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={10} />
                      {filterLabel}
                    </button>
                  ))}
                </div>
                {/* Suggestion list */}
                <div className="max-h-48 overflow-y-auto">
                  {suggestions.length > 0 ? suggestions.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-start gap-2 border-b border-gray-50 last:border-0 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setUrl(item.url);
                        setUrlError(null);
                        setShowSuggestions(false);
                      }}
                    >
                      {item.kind === 'internal' ? (
                        <Home size={11} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Globe size={11} className="text-orange-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="font-medium text-gray-800 truncate block">{item.label}</span>
                        <span className="text-gray-400 truncate block">{item.url}</span>
                      </div>
                    </button>
                  )) : (
                    <div className="px-3 py-3 text-xs text-gray-400 text-center">
                      Aucun lien trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Anchor text */}
          {showAnchorText && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Texte d'affichage
                <span className="ml-1 text-gray-400 font-normal">(laissez vide pour utiliser la sélection)</span>
              </label>
              <input
                type="text"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder="Texte visible du lien"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          )}

          {/* SEO & behaviour options */}
          {(allowOpenInNewTab || allowNoopener || allowNofollow || allowSponsored) && (
            <div className="border border-gray-100 rounded-lg p-3 space-y-2 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                Options
              </p>
              {allowOpenInNewTab && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetBlank}
                    onChange={(e) => setTargetBlank(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">
                    Ouvrir dans un nouvel onglet{' '}
                    <code className="bg-gray-100 px-1 rounded text-gray-500">target=_blank</code>
                  </span>
                </label>
              )}
              {allowNoopener && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relNoopener}
                    onChange={(e) => setRelNoopener(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">
                    <code className="bg-gray-100 px-1 rounded text-gray-500">rel=noopener</code>
                    <span className="text-gray-400 ml-1">(sécurité, recommandé avec _blank)</span>
                  </span>
                </label>
              )}
              {allowNofollow && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relNofollow}
                    onChange={(e) => setRelNofollow(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">
                    <code className="bg-gray-100 px-1 rounded text-gray-500">rel=nofollow</code>
                    <span className="text-gray-400 ml-1">(ne pas transmettre de jus SEO)</span>
                  </span>
                </label>
              )}
              {allowSponsored && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relSponsored}
                    onChange={(e) => setRelSponsored(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">
                    <code className="bg-gray-100 px-1 rounded text-gray-500">rel=sponsored</code>
                    <span className="text-gray-400 ml-1">(lien sponsorisé)</span>
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
