import { useState, useMemo, useCallback } from 'react';
import { X, Link2, Image, Search, ExternalLink, Replace, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import ImageUploadField from './ImageUploadField';

interface PageAssetManagerProps {
    sections: PageBuilderSection[];
    onUpdateSection: (id: string, updates: Partial<PageBuilderSection>) => void;
    onClose: () => void;
}

type TabType = 'links' | 'images';

interface FoundLink {
    sectionId: string;
    sectionType: string;
    sectionOrder: number;
    path: string;
    label: string;
    url: string;
}

interface FoundImage {
    sectionId: string;
    sectionType: string;
    sectionOrder: number;
    path: string;
    label: string;
    url: string;
}

/** Deep-scan an object for string values matching URL/link patterns */
function extractLinks(obj: any, path: string, results: Omit<FoundLink, 'sectionId' | 'sectionType' | 'sectionOrder'>[]) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
            const lower = key.toLowerCase();
            const isLink =
                lower.includes('link') ||
                lower.includes('href') ||
                lower.includes('url') ||
                lower === 'src' ||
                (value.startsWith('http') && (lower.includes('cta') || lower.includes('action'))) ||
                (value.startsWith('/') && !value.startsWith('//') && lower !== 'id');

            // Also detect links inside HTML strings: <a href="...">
            if (typeof value === 'string' && value.includes('<a ')) {
                const hrefMatches = value.matchAll(/href="([^"]+)"/g);
                for (const match of hrefMatches) {
                    results.push({
                        path: `${currentPath}[href]`,
                        label: `HTML link in ${key}`,
                        url: match[1],
                    });
                }
            }

            if (isLink && value.trim()) {
                results.push({
                    path: currentPath,
                    label: humanizeKey(key),
                    url: value,
                });
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                extractLinks(item, `${currentPath}[${idx}]`, results);
            });
        } else if (typeof value === 'object') {
            extractLinks(value, currentPath, results);
        }
    }
}

function extractImages(obj: any, path: string, results: Omit<FoundImage, 'sectionId' | 'sectionType' | 'sectionOrder'>[]) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string' && value.trim()) {
            const lower = key.toLowerCase();
            const isImage =
                lower.includes('image') ||
                lower.includes('img') ||
                lower.includes('photo') ||
                lower.includes('avatar') ||
                lower.includes('logo') ||
                lower.includes('thumbnail') ||
                lower.includes('icon') ||
                lower === 'src' ||
                lower === 'url' ||
                /\.(jpg|jpeg|png|gif|svg|webp|avif|ico)(\?|$)/i.test(value);

            // Exclude video URLs, links, etc.
            const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(value);
            const isNonMediaUrl = lower.includes('link') || lower.includes('href') || lower.includes('cta');

            if (isImage && !isVideo && !isNonMediaUrl) {
                results.push({
                    path: currentPath,
                    label: humanizeKey(key),
                    url: value,
                });
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                extractImages(item, `${currentPath}[${idx}]`, results);
            });
        } else if (typeof value === 'object') {
            extractImages(value, currentPath, results);
        }
    }
}

function humanizeKey(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
}

/** Set a value at a dot/bracket path in an object, returning a deep clone */
function setAtPath(obj: any, path: string, newValue: string): any {
    const clone = JSON.parse(JSON.stringify(obj));
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = clone;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const idx = parseInt(key, 10);
        current = isNaN(idx) ? current[key] : current[idx];
        if (!current) return clone;
    }
    const lastKey = parts[parts.length - 1];
    const lastIdx = parseInt(lastKey, 10);
    if (isNaN(lastIdx)) {
        current[lastKey] = newValue;
    } else {
        current[lastIdx] = newValue;
    }
    return clone;
}

export default function PageAssetManager({ sections, onUpdateSection, onClose }: PageAssetManagerProps) {
    const [tab, setTab] = useState<TabType>('links');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [replaceOld, setReplaceOld] = useState('');
    const [replaceNew, setReplaceNew] = useState('');
    const [replaceMode, setReplaceMode] = useState(false);
    const [replacedCount, setReplacedCount] = useState<number | null>(null);

    const allLinks = useMemo(() => {
        const results: FoundLink[] = [];
        sections.forEach((section, idx) => {
            const sectionLinks: Omit<FoundLink, 'sectionId' | 'sectionType' | 'sectionOrder'>[] = [];
            extractLinks(section.content, 'content', sectionLinks);
            sectionLinks.forEach(link => {
                results.push({
                    ...link,
                    sectionId: section.id,
                    sectionType: section.type,
                    sectionOrder: idx,
                });
            });
        });
        return results;
    }, [sections]);

    const allImages = useMemo(() => {
        const results: FoundImage[] = [];
        sections.forEach((section, idx) => {
            const sectionImages: Omit<FoundImage, 'sectionId' | 'sectionType' | 'sectionOrder'>[] = [];
            extractImages(section.content, 'content', sectionImages);
            // Also extract from design.background and design.media
            if (section.design?.background?.value && section.design.background.type === 'image') {
                sectionImages.push({
                    path: 'design.background.value',
                    label: 'Image de fond',
                    url: section.design.background.value,
                });
            }
            if (section.design?.media?.overlayImage) {
                sectionImages.push({
                    path: 'design.media.overlayImage',
                    label: 'Image overlay',
                    url: section.design.media.overlayImage,
                });
            }
            sectionImages.forEach(img => {
                results.push({
                    ...img,
                    sectionId: section.id,
                    sectionType: section.type,
                    sectionOrder: idx,
                });
            });
        });
        return results;
    }, [sections]);

    const filteredLinks = useMemo(() => {
        if (!searchQuery.trim()) return allLinks;
        const q = searchQuery.toLowerCase();
        return allLinks.filter(l =>
            l.url.toLowerCase().includes(q) ||
            l.label.toLowerCase().includes(q) ||
            l.sectionType.toLowerCase().includes(q)
        );
    }, [allLinks, searchQuery]);

    const filteredImages = useMemo(() => {
        if (!searchQuery.trim()) return allImages;
        const q = searchQuery.toLowerCase();
        return allImages.filter(i =>
            i.url.toLowerCase().includes(q) ||
            i.label.toLowerCase().includes(q) ||
            i.sectionType.toLowerCase().includes(q)
        );
    }, [allImages, searchQuery]);

    const handleUpdateLink = useCallback((item: FoundLink, newUrl: string) => {
        const section = sections.find(s => s.id === item.sectionId);
        if (!section) return;

        // Handle HTML href replacements
        if (item.path.endsWith('[href]')) {
            const realPath = item.path.replace('[href]', '');
            const parts = realPath.replace(/\[(\d+)\]/g, '.$1').split('.');
            let current: any = section;
            for (const p of parts) {
                const idx = parseInt(p, 10);
                current = isNaN(idx) ? current?.[p] : current?.[idx];
            }
            if (typeof current === 'string') {
                const updated = current.replace(`href="${item.url}"`, `href="${newUrl}"`);
                const newObj = setAtPath(section, realPath, updated);
                const contentPath = realPath.split('.')[0];
                onUpdateSection(item.sectionId, { [contentPath]: newObj[contentPath] });
            }
        } else {
            // Regular path update
            const topKey = item.path.split('.')[0] as 'content' | 'design';
            const subPath = item.path.substring(topKey.length + 1);
            const newObj = setAtPath(section[topKey], subPath, newUrl);
            onUpdateSection(item.sectionId, { [topKey]: newObj });
        }
        setEditingItem(null);
    }, [sections, onUpdateSection]);

    const handleUpdateImage = useCallback((item: FoundImage, newUrl: string) => {
        const section = sections.find(s => s.id === item.sectionId);
        if (!section) return;

        const topKey = item.path.split('.')[0] as 'content' | 'design';
        const subPath = item.path.substring(topKey.length + 1);
        const newObj = setAtPath(section[topKey], subPath, newUrl);
        onUpdateSection(item.sectionId, { [topKey]: newObj });
        setEditingItem(null);
    }, [sections, onUpdateSection]);

    const handleBulkReplaceImages = useCallback(() => {
        if (!replaceOld.trim()) return;
        let count = 0;
        allImages.forEach(img => {
            if (img.url === replaceOld) {
                handleUpdateImage(img, replaceNew);
                count++;
            }
        });
        setReplacedCount(count);
        setTimeout(() => setReplacedCount(null), 3000);
    }, [allImages, replaceOld, replaceNew, handleUpdateImage]);

    const handleBulkReplaceLinks = useCallback(() => {
        if (!replaceOld.trim()) return;
        let count = 0;
        allLinks.forEach(link => {
            if (link.url === replaceOld) {
                handleUpdateLink(link, replaceNew);
                count++;
            }
        });
        setReplacedCount(count);
        setTimeout(() => setReplacedCount(null), 3000);
    }, [allLinks, replaceOld, replaceNew, handleUpdateLink]);

    const uniqueImages = useMemo(() => {
        const map = new Map<string, { count: number; items: FoundImage[] }>();
        allImages.forEach(img => {
            const existing = map.get(img.url) || { count: 0, items: [] };
            existing.count++;
            existing.items.push(img);
            map.set(img.url, existing);
        });
        return map;
    }, [allImages]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Gestion centralisée des assets</h2>
                        <p className="text-xs text-gray-500">
                            {tab === 'links' ? `${allLinks.length} liens trouvés` : `${allImages.length} images trouvées`} sur {sections.length} sections
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs + Search */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => { setTab('links'); setSearchQuery(''); setReplaceMode(false); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'links' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Link2 className="w-3.5 h-3.5" />
                            Liens ({allLinks.length})
                        </button>
                        <button
                            onClick={() => { setTab('images'); setSearchQuery(''); setReplaceMode(false); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'images' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Image className="w-3.5 h-3.5" />
                            Images ({allImages.length})
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setReplaceMode(!replaceMode); setReplaceOld(''); setReplaceNew(''); }}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${replaceMode ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <Replace className="w-3.5 h-3.5" />
                        Remplacer
                    </button>
                </div>

                {/* Bulk replace bar */}
                {replaceMode && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                        {tab === 'images' ? (
                            <>
                                <select
                                    value={replaceOld}
                                    onChange={(e) => setReplaceOld(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Sélectionner l'image à remplacer...</option>
                                    {Array.from(uniqueImages.entries()).map(([url, data]) => (
                                        <option key={url} value={url}>
                                            {url.split('/').pop()} ({data.count} occurrence{data.count > 1 ? 's' : ''})
                                        </option>
                                    ))}
                                </select>
                                <ImageUploadField
                                    label=""
                                    value={replaceNew}
                                    onChange={setReplaceNew}
                                    placeholder="Nouvelle image"
                                    mediaType="image"
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={replaceOld}
                                    onChange={(e) => setReplaceOld(e.target.value)}
                                    placeholder="URL à remplacer"
                                    className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={replaceNew}
                                    onChange={(e) => setReplaceNew(e.target.value)}
                                    placeholder="Nouvelle URL"
                                    className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm"
                                />
                            </>
                        )}
                        <button
                            onClick={tab === 'images' ? handleBulkReplaceImages : handleBulkReplaceLinks}
                            disabled={!replaceOld.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                        >
                            Remplacer tout
                        </button>
                        {replacedCount !== null && (
                            <span className="flex items-center gap-1 text-sm text-green-600 font-medium whitespace-nowrap">
                                <Check className="w-4 h-4" />
                                {replacedCount} remplacé{replacedCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {tab === 'links' && (
                        <div className="space-y-2">
                            {filteredLinks.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">Aucun lien trouvé</p>
                            ) : (
                                filteredLinks.map((link, idx) => {
                                    const key = `${link.sectionId}-${link.path}-${idx}`;
                                    const isEditing = editingItem === key;
                                    return (
                                        <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                <Link2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-400 uppercase">
                                                        #{link.sectionOrder + 1} {link.sectionType}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{link.label}</span>
                                                </div>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateLink(link, editValue);
                                                                if (e.key === 'Escape') setEditingItem(null);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateLink(link, editValue)}
                                                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingItem(null)}
                                                            className="p-1 bg-gray-300 text-gray-600 rounded hover:bg-gray-400"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-700 truncate font-mono">{link.url}</p>
                                                )}
                                            </div>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => { setEditingItem(key); setEditValue(link.url); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded transition-all"
                                                    title="Modifier"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {tab === 'images' && (
                        <div className="space-y-2">
                            {filteredImages.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">Aucune image trouvée</p>
                            ) : (
                                filteredImages.map((img, idx) => {
                                    const key = `${img.sectionId}-${img.path}-${idx}`;
                                    const isEditing = editingItem === key;
                                    return (
                                        <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors">
                                            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                                <img
                                                    src={img.url}
                                                    alt={img.label}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-400 uppercase">
                                                        #{img.sectionOrder + 1} {img.sectionType}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{img.label}</span>
                                                </div>
                                                {isEditing ? (
                                                    <div className="mt-1">
                                                        <ImageUploadField
                                                            label=""
                                                            value={editValue}
                                                            onChange={(url) => { setEditValue(url); handleUpdateImage(img, url); }}
                                                            placeholder="Nouvelle URL"
                                                            mediaType="image"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 truncate font-mono">{img.url}</p>
                                                )}
                                            </div>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => { setEditingItem(key); setEditValue(img.url); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded transition-all"
                                                    title="Modifier"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
