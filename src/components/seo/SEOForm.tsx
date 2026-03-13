import { useEffect, useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { Save, Link as LinkIcon, Globe, HelpCircle, Sparkles, LayoutGrid as Layout, ChevronRight, FolderPlus, X } from 'lucide-react';
import { supabase, PageTemplate, Site } from '@/lib/supabase';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { normalizeInternalPath, replaceInternalLinksInSections } from '@/lib/linkRegistry';
import { loadActiveGlobalHFSetting, applySectionsWithGlobalHF } from '@/lib/globalHFSettings';
import {
    buildSitePageUrl,
    extractDomainIdFromCanonicalUrl,
    getActiveSiteDomains,
    getCanonicalSiteDomain,
    getDomainLabel,
    getSiteLabel,
    loadSites,
} from '@/lib/sites';

interface SEOFormProps {
    onSaveComplete: () => void;
    editingPage?: any;
    userId?: string;
    onOpenBuilder?: (sections: PageBuilderSection[], onDone: (sections: PageBuilderSection[]) => void) => void;
}

interface AvailablePage {
    id: string;
    page_key: string;
    title: string;
    site_id?: string | null;
}

function normalizeSectionsData(raw: unknown): PageBuilderSection[] {
    if (Array.isArray(raw)) {
        return raw as PageBuilderSection[];
    }

    if (typeof raw === 'string') {
        try {
            return normalizeSectionsData(JSON.parse(raw));
        } catch {
            return [];
        }
    }

    if (raw && typeof raw === 'object') {
        const maybeRecord = raw as Record<string, unknown>;
        if (Array.isArray(maybeRecord.sections)) {
            return maybeRecord.sections as PageBuilderSection[];
        }
        if (Array.isArray(maybeRecord.sections_data)) {
            return maybeRecord.sections_data as PageBuilderSection[];
        }
    }

    return [];
}

export default function SEOForm({ onSaveComplete, editingPage, userId, onOpenBuilder }: SEOFormProps) {
    const modal = useModal();

    const normalizeSlug = (value: string) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');

    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [selectedDomainId, setSelectedDomainId] = useState('');
    const [parentPageId, setParentPageId] = useState<string | null>(null);
    const [newParentPath, setNewParentPath] = useState('');
    const [showNewParent, setShowNewParent] = useState(false);
    const [availablePages, setAvailablePages] = useState<AvailablePage[]>([]);
    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [content, setContent] = useState('');
    const [ogTitle, setOgTitle] = useState('');
    const [ogDescription, setOgDescription] = useState('');
    const [ogImage, setOgImage] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [sectionsData, setSectionsData] = useState<PageBuilderSection[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [templates, setTemplates] = useState<PageTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [loadingSites, setLoadingSites] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showHelp, setShowHelp] = useState(true);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [folder, setFolder] = useState('');
    const [existingPageFolders, setExistingPageFolders] = useState<string[]>([]);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const selectedSite = sites.find((site) => site.id === selectedSiteId) || null;
    const selectedSiteDomains = getActiveSiteDomains(selectedSite);

    useEffect(() => {
        loadTemplates();
        loadSitesList();
        loadAvailablePages();
        loadExistingPageFolders();
    }, []);

    useEffect(() => {
        if (editingPage && availablePages.length > 0 && sites.length > 0) {
            const pageKey = editingPage.page_key || '';
            const parts = pageKey.split('/');

            if (parts.length > 1) {
                setSlug(normalizeSlug(parts[parts.length - 1]));
                const parentPath = parts.slice(0, -1).join('/');
                const parentPage = availablePages.find((page) => page.page_key === parentPath);
                if (parentPage) {
                    setParentPageId(parentPage.id);
                    setShowNewParent(false);
                    setNewParentPath('');
                } else {
                    setNewParentPath(parentPath);
                    setShowNewParent(true);
                }
            } else {
                setSlug(normalizeSlug(pageKey));
                setParentPageId(null);
                setShowNewParent(false);
                setNewParentPath('');
            }

            setTitle(editingPage.title || '');
            setDescription(editingPage.description || '');
            setKeywords(Array.isArray(editingPage.keywords) ? editingPage.keywords.join(', ') : editingPage.keywords || '');
            setContent(editingPage.content || '');
            setOgTitle(editingPage.og_title || '');
            setOgDescription(editingPage.og_description || '');
            setOgImage(editingPage.og_image || '');
            setStatus(editingPage.status || 'draft');
            setSectionsData(normalizeSectionsData(editingPage.sections_data));
            setSelectedTemplateId(editingPage.template_id || null);
            setFolder((editingPage as any).folder || '');

            const siteId = (editingPage as any).site_id || (editingPage as any).site?.id || '';
            setSelectedSiteId(siteId);

            const matchingSite = sites.find((site) => site.id === siteId) || null;
            const matchedDomainId = extractDomainIdFromCanonicalUrl(matchingSite, editingPage.canonical_url);
            const fallbackDomain = getCanonicalSiteDomain(matchingSite);
            setSelectedDomainId(matchedDomainId || fallbackDomain?.id || '');
        }
    }, [availablePages, editingPage, sites]);

    useEffect(() => {
        if (editingPage || sites.length === 0 || selectedSiteId) {
            return;
        }

        const defaultSite = sites.find((site) => site.is_active) || sites[0];
        if (defaultSite) {
            setSelectedSiteId(defaultSite.id);
        }
    }, [editingPage, selectedSiteId, sites]);

    useEffect(() => {
        const domains = getActiveSiteDomains(selectedSite);

        if (domains.length === 0) {
            setSelectedDomainId('');
            return;
        }

        if (selectedDomainId && domains.some((domain) => domain.id === selectedDomainId)) {
            return;
        }

        const fallbackDomain = getCanonicalSiteDomain(selectedSite);
        setSelectedDomainId(fallbackDomain?.id || domains[0].id);
    }, [selectedDomainId, selectedSite]);

    const loadTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const { data, error } = await supabase
                .from('page_templates')
                .select('*')
                .order('name');
            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const loadSitesList = async () => {
        setLoadingSites(true);
        try {
            const nextSites = await loadSites();
            setSites(nextSites);
        } catch (error) {
            console.error('Error loading sites:', error);
        } finally {
            setLoadingSites(false);
        }
    };

    const loadAvailablePages = async () => {
        try {
            const { data, error } = await supabase
                .from('seo_metadata')
                .select('id, page_key, title, site_id')
                .order('page_key');
            if (error) throw error;
            setAvailablePages((data || []) as AvailablePage[]);
        } catch (error) {
            console.error('Error loading pages:', error);
        }
    };

    const loadExistingPageFolders = async () => {
        try {
            const { data, error } = await supabase
                .from('seo_metadata')
                .select('folder')
                .not('folder', 'is', null);
            if (error) throw error;
            const uniqueFolders = Array.from(new Set((data || []).map((entry: any) => entry.folder).filter(Boolean))) as string[];
            setExistingPageFolders(uniqueFolders.sort());
        } catch (error) {
            console.error('Error loading page folders:', error);
        }
    };

    const handleAddNewFolder = () => {
        const trimmed = newFolderName.trim();
        if (!trimmed) return;

        const alreadyExists = existingPageFolders.some((value) => value.toLowerCase() === trimmed.toLowerCase());
        if (alreadyExists) {
            modal.alert(`Un dossier portant le nom "${trimmed}" existe deja (la casse est ignoree).`, 'Dossier existant');
            return;
        }

        setExistingPageFolders((previous) => [...previous, trimmed].sort());
        setFolder(trimmed);
        setNewFolderName('');
        setShowNewFolderInput(false);
    };

    const applyTemplate = (template: PageTemplate) => {
        setSelectedTemplateId(template.id);
        setSectionsData(normalizeSectionsData(template.sections_data));
        setShowTemplateSelector(false);
    };

    const getParentPath = () => {
        if (showNewParent && newParentPath) {
            return newParentPath.trim().replace(/^\/+|\/+$/g, '');
        }

        if (parentPageId) {
            const parentPage = availablePages.find((page) => page.id === parentPageId);
            return parentPage ? parentPage.page_key : '';
        }

        return '';
    };

    const getPageKey = () => {
        const parentPath = getParentPath();
        const cleanSlug = normalizeSlug(slug.trim().replace(/^\/+|\/+$/g, ''));
        return parentPath ? `${parentPath}/${cleanSlug}` : cleanSlug;
    };

    const getFullUrl = () => buildSitePageUrl(selectedSite, getPageKey(), selectedDomainId) || '';

    const handleSave = async () => {
        if (!selectedSiteId || !slug || !title) {
            modal.alert('Le groupe de publication, le slug et le titre sont obligatoires', 'Champs obligatoires');
            return;
        }

        if (selectedSiteDomains.length === 0) {
            modal.alert('Ajoutez au moins un domaine actif sur le groupe sélectionné avant de publier une page.', 'Domaine requis');
            return;
        }

        setIsSaving(true);

        try {
            const currentSiteId = selectedSiteId;
            const pageKey = getPageKey();
            const keywordsArray = keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean);
            let sectionsToSave = sectionsData;
            const activeGlobalHFSetting = !editingPage?.id ? await loadActiveGlobalHFSetting() : null;
            const selectedTemplate = selectedTemplateId
                ? templates.find((template) => template.id === selectedTemplateId)
                : null;

            if (selectedTemplateId && (!Array.isArray(sectionsData) || sectionsData.length === 0)) {
                const templateSections = normalizeSectionsData(selectedTemplate?.sections_data);
                if (templateSections.length > 0) {
                    sectionsToSave = templateSections;
                }
            }

            if (activeGlobalHFSetting) {
                sectionsToSave = applySectionsWithGlobalHF(sectionsToSave, activeGlobalHFSetting, { context: 'create' });
            }

            const data: Record<string, any> = {
                site_id: currentSiteId,
                page_key: pageKey,
                title,
                description: description || null,
                keywords: keywordsArray,
                content: content || null,
                sections_data: sectionsToSave,
                template_id: selectedTemplateId || null,
                daisy_theme_slug: selectedTemplate?.daisy_theme_slug || editingPage?.daisy_theme_slug || null,
                og_title: ogTitle || null,
                og_description: ogDescription || null,
                og_image: ogImage || null,
                canonical_url: getFullUrl() || null,
                language: 'fr',
                status,
                imported_at: new Date().toISOString(),
                folder: folder.trim() || null,
            };

            if (userId) {
                data.user_id = userId;
            } else if (editingPage?.user_id) {
                data.user_id = editingPage.user_id;
            }

            let savedPageId = editingPage?.id || '';

            if (editingPage?.id) {
                const { error } = await supabase
                    .from('seo_metadata')
                    .update({ ...data, updated_at: new Date().toISOString() })
                    .eq('id', editingPage.id);

                if (error) throw error;
                savedPageId = editingPage.id;
            } else {
                const { data: insertedPage, error } = await supabase
                    .from('seo_metadata')
                    .insert(data)
                    .select('id')
                    .single();

                if (error) throw error;
                savedPageId = insertedPage.id;
            }

            const previousPageKey = editingPage?.page_key ? normalizeInternalPath(editingPage.page_key) : '';
            const nextPageKey = normalizeInternalPath(pageKey);

            if (previousPageKey && nextPageKey && previousPageKey !== nextPageKey) {
                const { data: allPages, error: pagesError } = await supabase
                    .from('seo_metadata')
                    .select('id, sections_data')
                    .eq('site_id', currentSiteId);

                if (pagesError) throw pagesError;

                for (const page of allPages || []) {
                    const pageSections = Array.isArray((page as any).sections_data)
                        ? ((page as any).sections_data as PageBuilderSection[])
                        : [];

                    if (pageSections.length === 0) continue;

                    const replacement = replaceInternalLinksInSections(pageSections, previousPageKey, nextPageKey);

                    if (replacement.updatedCount > 0) {
                        const { error: updateSectionsError } = await supabase
                            .from('seo_metadata')
                            .update({ sections_data: replacement.sections, updated_at: new Date().toISOString() })
                            .eq('id', (page as any).id);

                        if (updateSectionsError) throw updateSectionsError;
                    }
                }

                const redirectPayload: Record<string, unknown> = {
                    site_id: currentSiteId,
                    source_path: previousPageKey,
                    target_path: nextPageKey,
                    source_page_id: savedPageId,
                    target_page_id: savedPageId,
                    reason: 'slug_change',
                    is_active: true,
                    created_by: userId || editingPage?.user_id || null,
                };

                const { data: existingRedirect, error: existingRedirectError } = await supabase
                    .from('seo_redirects')
                    .select('id')
                    .eq('site_id', currentSiteId)
                    .eq('source_path', previousPageKey)
                    .maybeSingle();

                if (existingRedirectError) throw existingRedirectError;

                if (existingRedirect?.id) {
                    const { error: updateRedirectError } = await supabase
                        .from('seo_redirects')
                        .update({ ...redirectPayload, updated_at: new Date().toISOString() })
                        .eq('id', existingRedirect.id);

                    if (updateRedirectError) throw updateRedirectError;
                } else {
                    const { error: insertRedirectError } = await supabase
                        .from('seo_redirects')
                        .insert(redirectPayload);

                    if (insertRedirectError) throw insertRedirectError;
                }
            }

            onSaveComplete();
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
            modal.alert(`Erreur lors de la sauvegarde : ${errorMessage}`, 'Erreur');
        } finally {
            setIsSaving(false);
        }
    };

    const sectionCount = sectionsData.length;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {editingPage ? 'Modifier la page' : 'Creer une nouvelle page'}
                </h3>
                <p className="text-gray-600">
                    {editingPage ? 'Modifiez les metadonnees SEO de votre page' : 'Definissez toutes les metadonnees SEO pour votre nouvelle page'}
                </p>
            </div>

            {showHelp && !editingPage && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 mb-2">Comment ca marche ?</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                    <li><strong>Choisissez un modele</strong> pour le design visuel de votre page</li>
                                    <li><strong>Choisissez un groupe de domaines</strong> pour la publication</li>
                                    <li><strong>Configurez le chemin</strong> et le slug de votre page</li>
                                    <li><strong>Publiez</strong> pour rendre la page disponible sur tous les domaines du groupe</li>
                                </ol>
                            </div>
                        </div>
                        <button onClick={() => setShowHelp(false)} className="text-blue-600 hover:text-blue-800 ml-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border-2 border-teal-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Layout className="w-5 h-5 text-teal-700" />
                            <h4 className="font-bold text-gray-900">1. Modele de page</h4>
                        </div>
                        {sectionCount > 0 && (
                            <span className="text-xs bg-teal-200 text-teal-800 px-2.5 py-1 rounded-full font-medium">
                                {sectionCount} section{sectionCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {sectionCount > 0 ? (
                        <div className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-teal-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {templates.find((template) => template.id === selectedTemplateId)?.name || 'Design personnalise'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {sectionCount} section{sectionCount > 1 ? 's' : ''} configuree{sectionCount > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {onOpenBuilder && (
                                            <button
                                                onClick={() => onOpenBuilder(sectionsData, (newSections) => setSectionsData(newSections))}
                                                className="text-sm text-teal-700 hover:text-teal-900 font-medium flex items-center space-x-1"
                                            >
                                                <span>Modifier le design</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowTemplateSelector(true)}
                                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            Changer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-1.5 overflow-hidden">
                                {sectionsData.slice(0, 5).map((section, index) => {
                                    const bg = section.design.background.type === 'color' ? section.design.background.value : '#f9fafb';
                                    const isDark = bg === '#000000' || bg === '#1a1a1a';

                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 h-8 rounded-md flex items-center justify-center"
                                            style={{ backgroundColor: bg }}
                                        >
                                            <span className={`text-[9px] font-medium ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
                                                {section.type}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {showTemplateSelector || templates.length === 0 ? null : (
                                <button
                                    onClick={() => setShowTemplateSelector(true)}
                                    className="w-full py-4 bg-white border-2 border-dashed border-teal-300 rounded-xl text-teal-700 hover:border-teal-400 hover:bg-teal-50 transition-all font-medium text-sm"
                                >
                                    Choisir un modele
                                </button>
                            )}
                        </div>
                    )}

                    {(showTemplateSelector || (sectionCount === 0 && templates.length === 0)) && (
                        <div className="mt-4">
                            {loadingTemplates ? (
                                <div className="text-center py-4 text-sm text-gray-500">Chargement des modeles...</div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-6 bg-white rounded-xl border border-teal-200">
                                    <p className="text-sm text-gray-500 mb-2">Aucun modele disponible</p>
                                    <p className="text-xs text-gray-400">Creez des modeles dans la section "Modeles" pour les utiliser ici</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {templates.map((template) => {
                                        const templateSections = normalizeSectionsData(template.sections_data);
                                        const isSelected = selectedTemplateId === template.id;

                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => applyTemplate(template)}
                                                className={`p-4 bg-white border-2 rounded-xl text-left transition-all hover:shadow-sm ${isSelected ? 'border-teal-500 shadow-md' : 'border-teal-200 hover:border-teal-400'}`}
                                            >
                                                <div className="flex gap-1 mb-3 h-6">
                                                    {templateSections.slice(0, 4).map((section, index) => {
                                                        const bg = section.design.background.type === 'color' ? section.design.background.value : '#f3f4f6';
                                                        return <div key={index} className="flex-1 rounded" style={{ backgroundColor: bg }} />;
                                                    })}
                                                    {templateSections.length === 0 && <div className="flex-1 rounded bg-gray-100" />}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{template.name}</div>
                                                {template.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{template.description}</div>}
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {templateSections.length} section{templateSections.length > 1 ? 's' : ''}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {showTemplateSelector && templates.length > 0 && (
                                <button
                                    onClick={() => setShowTemplateSelector(false)}
                                    className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-gray-700" />
                        <h4 className="font-bold text-gray-900">2. Configurez l'URL de votre page</h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Groupe de publication <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedSiteId}
                                onChange={(e) => {
                                    setSelectedSiteId(e.target.value);
                                    setParentPageId(null);
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                                disabled={loadingSites}
                            >
                                <option value="">Choisir un groupe de domaines</option>
                                {sites.map((site) => (
                                    <option key={site.id} value={site.id}>
                                        {getSiteLabel(site)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Un groupe permet de publier la même page sur plusieurs domaines synchronisés.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Domaine canonique / aperçu</label>
                            <select
                                value={selectedDomainId}
                                onChange={(e) => setSelectedDomainId(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                                disabled={!selectedSiteId || selectedSiteDomains.length === 0}
                            >
                                <option value="">{selectedSiteId ? 'Choisir un domaine actif' : 'Choisissez d\'abord un groupe'}</option>
                                {selectedSiteDomains.map((domain) => (
                                    <option key={domain.id} value={domain.id}>
                                        {getDomainLabel(domain)}
                                        {domain.is_canonical ? ' · canonique' : domain.is_primary ? ' · principal' : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">La page restera rattachée au groupe, mais l'URL canonique utilisera ce domaine.</p>
                        </div>

                        {selectedSite && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedSite.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedSiteDomains.length} domaine{selectedSiteDomains.length > 1 ? 's' : ''} actif{selectedSiteDomains.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSiteDomains.map((domain) => (
                                            <span
                                                key={domain.id}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${domain.id === selectedDomainId ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {domain.host}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {selectedSiteDomains.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-3">Aucun domaine actif n'est encore rattaché à ce groupe. Ajoutez-en dans les paramètres.</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Page parente (optionnel)
                                <span className="text-gray-500 font-normal ml-2">Organisez vos pages hierarchiquement</span>
                            </label>

                            {!showNewParent ? (
                                <div className="space-y-2">
                                    <select
                                        value={parentPageId || ''}
                                        onChange={(e) => setParentPageId(e.target.value || null)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                                    >
                                        <option value="">Aucune (page racine)</option>
                                        {availablePages
                                            .filter((page) => (page.site_id || '') === selectedSiteId)
                                            .filter((page) => page.id !== editingPage?.id)
                                            .map((page) => (
                                                <option key={page.id} value={page.id}>
                                                    /{page.page_key} - {page.title}
                                                </option>
                                            ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewParent(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Creer un nouveau chemin parent
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={newParentPath}
                                        onChange={(e) => setNewParentPath(e.target.value)}
                                        placeholder="blog/categorie ou produits"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewParent(false);
                                            setNewParentPath('');
                                        }}
                                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Annuler - Choisir une page existante
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Slug de la page <span className="text-red-500">*</span>
                                <span className="text-gray-500 font-normal ml-2">Ex: a-propos, contact, mon-article</span>
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                                placeholder="mon-slug-de-page"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                                required
                            />
                        </div>

                        <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
                            <div className="flex items-center space-x-2 mb-2">
                                <LinkIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Apercu de l'URL :</span>
                            </div>
                            <div className="font-mono text-sm text-gray-900 break-all bg-gray-50 p-3 rounded-lg">
                                {getFullUrl() || 'Choisissez un groupe et un domaine pour générer l\'URL finale'}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                <strong>Identifiant unique (page_key) :</strong> {getPageKey() || 'Non defini'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-700" />
                        <h4 className="font-bold text-gray-900">3. Definissez les metadonnees SEO</h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Titre SEO <span className="text-red-500">*</span>
                                <span className="text-gray-500 font-normal ml-2">(max 60 caracteres)</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Titre accrocheur qui apparaitra dans Google"
                                maxLength={60}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
                                required
                            />
                            <div className="text-xs text-gray-600 mt-1">{title.length}/60 caracteres</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description SEO
                                <span className="text-gray-500 font-normal ml-2">(max 160 caracteres)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description qui apparaitra sous le titre dans les resultats Google"
                                maxLength={160}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
                            />
                            <div className="text-xs text-gray-600 mt-1">{description.length}/160 caracteres</div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mots-cles
                                <span className="text-gray-500 font-normal ml-2">(separes par des virgules)</span>
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="mot-cle 1, mot-cle 2, mot-cle 3"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <h4 className="font-bold text-gray-900">Contenu texte (optionnel)</h4>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Texte additionnel
                            <span className="text-gray-500 font-normal ml-2">(HTML accepte)</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Saisissez du contenu texte additionnel ici..."
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-sm"
                        />
                    </div>
                </div>

                <details className="bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <summary className="p-6 cursor-pointer font-bold text-gray-900 hover:text-gray-700">Options avancees (Open Graph, etc.)</summary>
                    <div className="px-6 pb-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre Open Graph (reseaux sociaux)</label>
                            <input
                                type="text"
                                value={ogTitle}
                                onChange={(e) => setOgTitle(e.target.value)}
                                placeholder="Titre pour Facebook, LinkedIn, Twitter"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description Open Graph</label>
                            <textarea
                                value={ogDescription}
                                onChange={(e) => setOgDescription(e.target.value)}
                                placeholder="Description pour les reseaux sociaux"
                                rows={2}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image Open Graph (URL)</label>
                            <input
                                type="text"
                                value={ogImage}
                                onChange={(e) => setOgImage(e.target.value)}
                                placeholder="https://example.com/image-1200x630.jpg"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                            />
                            <div className="text-xs text-gray-600 mt-1">Recommande : 1200x630 pixels</div>
                        </div>
                    </div>
                </details>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-bold text-gray-900">4. Choisissez le statut</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setStatus('draft')}
                            className={`p-4 rounded-xl border-2 transition-all ${status === 'draft' ? 'bg-white border-amber-500 shadow-md' : 'bg-white border-gray-200 hover:border-amber-300'}`}
                        >
                            <div className="font-semibold text-gray-900">Brouillon</div>
                            <div className="text-xs text-gray-600 mt-1">Non publie</div>
                        </button>
                        <button
                            onClick={() => setStatus('published')}
                            className={`p-4 rounded-xl border-2 transition-all ${status === 'published' ? 'bg-white border-emerald-500 shadow-md' : 'bg-white border-gray-200 hover:border-emerald-300'}`}
                        >
                            <div className="font-semibold text-gray-900">Publie</div>
                            <div className="text-xs text-gray-600 mt-1">En ligne</div>
                        </button>
                        <button
                            onClick={() => setStatus('archived')}
                            className={`p-4 rounded-xl border-2 transition-all ${status === 'archived' ? 'bg-white border-gray-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="font-semibold text-gray-900">Archive</div>
                            <div className="text-xs text-gray-600 mt-1">Retire</div>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h4 className="font-bold text-gray-900">Dossier (optionnel)</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={folder}
                            onChange={(e) => setFolder(e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 bg-white"
                        >
                            <option value="">Sans dossier</option>
                            {existingPageFolders.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex-shrink-0"
                            title="Creer un nouveau dossier"
                        >
                            <FolderPlus className="w-5 h-5" />
                        </button>
                        {folder && (
                            <button
                                type="button"
                                onClick={() => setFolder('')}
                                className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors flex-shrink-0"
                                title="Retirer du dossier"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {showNewFolderInput && (
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleAddNewFolder();
                                    }
                                }}
                                placeholder="Nom du nouveau dossier..."
                                className="flex-1 px-4 py-2.5 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-600"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddNewFolder}
                                disabled={!newFolderName.trim()}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors text-sm"
                            >
                                Ajouter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewFolderInput(false);
                                    setNewFolderName('');
                                }}
                                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Organisez vos pages dans des dossiers</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!slug || !title || !selectedSiteId || selectedSiteDomains.length === 0 || isSaving}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                    <Save className="w-6 h-6" />
                    <span>{isSaving ? 'Sauvegarde...' : (editingPage ? 'Mettre a jour la page' : 'Creer la page')}</span>
                </button>
            </div>
        </div>
    );
}
