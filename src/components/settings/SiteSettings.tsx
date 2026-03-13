import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Globe,
    Layers,
    Pencil,
    Plus,
    Save,
    Settings2,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { Site, SiteDomain, supabase } from '@/lib/supabase';
import { getDomainLabel, loadSites } from '@/lib/sites';

interface SiteSettingsProps {
    onNavigate?: (view: string) => void;
}

type DomainFunctionValue = 'primary-canonical' | 'primary' | 'canonical' | 'served' | 'redirect';

type SiteFormState = {
    id: string;
    name: string;
    code: string;
    default_locale: string;
    homepage_page_key: string;
    canonical_strategy: string;
    is_active: boolean;
};

type DomainFormState = {
    id: string;
    site_id: string;
    host: string;
    scheme: string;
    locale: string;
    is_primary: boolean;
    is_canonical: boolean;
    is_active: boolean;
    redirect_to_primary: boolean;
    business_owner: string;
    technical_owner: string;
    registrar: string;
    dns_provider: string;
    dns_target: string;
    hosting_target: string;
    verification_method: string;
    verification_status: string;
    verification_token: string;
    verified_at: string;
    ssl_status: string;
    robots_txt_enabled: boolean;
    sitemap_enabled: boolean;
    allow_indexing: boolean;
    notes: string;
    go_live_at: string;
};

const EMPTY_SITE_FORM: SiteFormState = {
    id: '',
    name: '',
    code: '',
    default_locale: 'fr',
    homepage_page_key: 'home',
    canonical_strategy: 'canonical_domain',
    is_active: true,
};

const EMPTY_DOMAIN_FORM: DomainFormState = {
    id: '',
    site_id: '',
    host: '',
    scheme: 'https',
    locale: 'fr',
    is_primary: false,
    is_canonical: true,
    is_active: true,
    redirect_to_primary: false,
    business_owner: '',
    technical_owner: '',
    registrar: '',
    dns_provider: '',
    dns_target: '',
    hosting_target: '',
    verification_method: 'manual',
    verification_status: 'pending',
    verification_token: '',
    verified_at: '',
    ssl_status: 'pending',
    robots_txt_enabled: true,
    sitemap_enabled: true,
    allow_indexing: true,
    notes: '',
    go_live_at: '',
};

const SITE_CANONICAL_STRATEGY_OPTIONS = [
    {
        value: 'canonical_domain',
        label: 'Un seul domaine canonique',
        hint: 'Recommandé si tes domaines sont surtout des variantes techniques.',
    },
    {
        value: 'served_domain',
        label: 'Chaque domaine garde sa propre canonical',
        hint: 'À utiliser si chaque domaine vit réellement pour Google.',
    },
];

const SITE_STATUS_OPTIONS = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
];

const DOMAIN_SCHEME_OPTIONS = [
    { value: 'https', label: 'https (recommandé)' },
    { value: 'http', label: 'http' },
];

const DOMAIN_FUNCTION_OPTIONS: Array<{ value: DomainFunctionValue; label: string; hint: string }> = [
    {
        value: 'primary-canonical',
        label: 'Domaine principal + canonique',
        hint: 'Le domaine de référence pour le site et le SEO.',
    },
    {
        value: 'primary',
        label: 'Domaine principal seulement',
        hint: 'Le domaine sert les pages mais n’est pas la canonical SEO.',
    },
    {
        value: 'canonical',
        label: 'Domaine canonique seulement',
        hint: 'Le domaine sert les pages et devient la référence SEO.',
    },
    {
        value: 'served',
        label: 'Domaine secondaire qui sert les pages',
        hint: 'Le domaine reste accessible, sans rôle spécial.',
    },
    {
        value: 'redirect',
        label: 'Domaine secondaire qui redirige',
        hint: 'Le domaine renvoie automatiquement vers le domaine principal.',
    },
];

const DOMAIN_STATUS_OPTIONS = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
];

const DOMAIN_VERIFICATION_METHOD_OPTIONS = [
    { value: 'manual', label: 'Validation manuelle' },
    { value: 'dns_txt', label: 'DNS TXT' },
    { value: 'http_file', label: 'Fichier HTTP (.well-known)' },
];

const DOMAIN_VERIFICATION_STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente' },
    { value: 'verified', label: 'Vérifié' },
    { value: 'failed', label: 'Échec' },
];

const DOMAIN_SSL_STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente' },
    { value: 'active', label: 'Actif' },
    { value: 'issue', label: 'Incident' },
];

const YES_NO_OPTIONS = [
    { value: 'yes', label: 'Oui' },
    { value: 'no', label: 'Non' },
];

const LOCALE_SUGGESTIONS = ['fr', 'fr-fr', 'en', 'en-gb', 'en-us', 'es', 'de', 'it', 'pt'];
const REGISTRAR_SUGGESTIONS = ['OVHcloud', 'Gandi', 'IONOS', 'GoDaddy', 'Namecheap', 'Cloudflare Registrar'];
const DNS_PROVIDER_SUGGESTIONS = ['Cloudflare', 'Route53', 'OVH DNS', 'Gandi LiveDNS', 'Vercel DNS', 'Netlify DNS'];
const HOSTING_TARGET_SUGGESTIONS = ['Reverse proxy', 'Vercel', 'Netlify', 'Cloudflare', 'Nginx', 'Traefik', 'Load balancer'];

function formatSiteCanonicalStrategy(value?: string | null) {
    return SITE_CANONICAL_STRATEGY_OPTIONS.find((option) => option.value === value)?.label || 'Un seul domaine canonique';
}

function formatDomainVerificationStatus(value?: string | null) {
    return DOMAIN_VERIFICATION_STATUS_OPTIONS.find((option) => option.value === value)?.label || 'En attente';
}

function formatDomainSslStatus(value?: string | null) {
    return DOMAIN_SSL_STATUS_OPTIONS.find((option) => option.value === value)?.label || 'En attente';
}

function getDomainFunctionValue(domain: Pick<DomainFormState, 'is_primary' | 'is_canonical' | 'redirect_to_primary'>): DomainFunctionValue {
    if (domain.redirect_to_primary) return 'redirect';
    if (domain.is_primary && domain.is_canonical) return 'primary-canonical';
    if (domain.is_primary) return 'primary';
    if (domain.is_canonical) return 'canonical';
    return 'served';
}

function applyDomainFunction(form: DomainFormState, value: DomainFunctionValue): DomainFormState {
    return {
        ...form,
        is_primary: value === 'primary' || value === 'primary-canonical',
        is_canonical: value === 'canonical' || value === 'primary-canonical',
        redirect_to_primary: value === 'redirect',
    };
}

function getDomainFunctionMeta(value: DomainFunctionValue) {
    return DOMAIN_FUNCTION_OPTIONS.find((option) => option.value === value) || DOMAIN_FUNCTION_OPTIONS[0];
}

function getSiteStatusLabel(value: boolean) {
    return value ? 'Actif' : 'Inactif';
}

function formatBooleanLabel(value: boolean, yesLabel: string, noLabel: string) {
    return value ? yesLabel : noLabel;
}

function hasAdvancedSiteSettings(site: Pick<SiteFormState, 'canonical_strategy'> | Pick<Site, 'canonical_strategy'>) {
    return (site.canonical_strategy || 'canonical_domain') !== 'canonical_domain';
}

function hasAdvancedDomainSettings(domain: DomainFormState | SiteDomain) {
    return Boolean(
        domain.business_owner ||
        domain.technical_owner ||
        domain.registrar ||
        domain.dns_provider ||
        domain.dns_target ||
        domain.hosting_target ||
        (domain.verification_method || 'manual') !== 'manual' ||
        (domain.verification_status || 'pending') !== 'pending' ||
        domain.verification_token ||
        domain.verified_at ||
        (domain.ssl_status || 'pending') !== 'pending' ||
        !(domain.robots_txt_enabled ?? true) ||
        !(domain.sitemap_enabled ?? true) ||
        !(domain.allow_indexing ?? true) ||
        domain.notes ||
        domain.go_live_at,
    );
}

function countAdvancedDomainSettings(domain: DomainFormState) {
    return [
        domain.business_owner,
        domain.technical_owner,
        domain.registrar,
        domain.dns_provider,
        domain.dns_target,
        domain.hosting_target,
        domain.verification_method !== 'manual' ? domain.verification_method : '',
        domain.verification_status !== 'pending' ? domain.verification_status : '',
        domain.verification_token,
        domain.verified_at,
        domain.ssl_status !== 'pending' ? domain.ssl_status : '',
        domain.robots_txt_enabled ? '' : 'robots',
        domain.sitemap_enabled ? '' : 'sitemap',
        domain.allow_indexing ? '' : 'indexing',
        domain.notes,
        domain.go_live_at,
    ].filter(Boolean).length;
}

function toDateInput(value?: string | null) {
    return value ? value.slice(0, 10) : '';
}

function scrollToTopSmooth() {
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function SummaryBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'blue' | 'violet' | 'amber'; children: ReactNode }) {
    const toneClass = {
        neutral: 'bg-gray-100 text-gray-700',
        green: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        violet: 'bg-violet-100 text-violet-700',
        amber: 'bg-amber-100 text-amber-700',
    }[tone];

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${toneClass}`}>{children}</span>;
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
            <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
    );
}

function SectionShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 md:p-6">
            <div className="mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export default function SiteSettings({ onNavigate }: SiteSettingsProps) {
    const modal = useModal();
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSite, setSavingSite] = useState(false);
    const [savingDomain, setSavingDomain] = useState(false);
    const [siteForm, setSiteForm] = useState<SiteFormState>({ ...EMPTY_SITE_FORM });
    const [domainForm, setDomainForm] = useState<DomainFormState>({ ...EMPTY_DOMAIN_FORM });
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [siteAdvancedOpen, setSiteAdvancedOpen] = useState(false);
    const [domainAdvancedOpen, setDomainAdvancedOpen] = useState(false);
    const [toast, setToast] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

    const selectedSite = useMemo(
        () => sites.find((site) => site.id === (domainForm.site_id || selectedSiteId)) || null,
        [domainForm.site_id, selectedSiteId, sites],
    );

    const currentDomainFunction = getDomainFunctionValue(domainForm);
    const currentDomainFunctionMeta = getDomainFunctionMeta(currentDomainFunction);
    const advancedDomainCount = countAdvancedDomainSettings(domainForm);

    const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const nextSites = await loadSites();
            setSites(nextSites);
            if ((!selectedSiteId || !nextSites.some((site) => site.id === selectedSiteId)) && nextSites[0]) {
                setSelectedSiteId(nextSites[0].id);
            }
        } catch (error) {
            console.error('[SiteSettings] loadData error:', error);
            showToast('Erreur lors du chargement des groupes', 'err');
        } finally {
            setLoading(false);
        }
    }, [selectedSiteId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetSiteForm = () => {
        setSiteForm({ ...EMPTY_SITE_FORM });
        setSiteAdvancedOpen(false);
    };

    const resetDomainForm = () => {
        setDomainForm({ ...EMPTY_DOMAIN_FORM });
        setDomainAdvancedOpen(false);
    };

    const handleSaveSite = async () => {
        if (!siteForm.name.trim() || !siteForm.code.trim()) {
            showToast('Nom et code du groupe requis', 'err');
            return;
        }

        setSavingSite(true);
        try {
            const payload = {
                name: siteForm.name.trim(),
                code: siteForm.code.trim().toLowerCase(),
                default_locale: siteForm.default_locale.trim().toLowerCase() || 'fr',
                homepage_page_key: siteForm.homepage_page_key.trim().toLowerCase() || 'home',
                canonical_strategy: siteForm.canonical_strategy,
                is_active: siteForm.is_active,
            };

            if (siteForm.id) {
                const { error } = await supabase.from('sites').update(payload).eq('id', siteForm.id);
                if (error) throw error;
                showToast('Groupe mis à jour');
            } else {
                const { error } = await supabase.from('sites').insert(payload);
                if (error) throw error;
                showToast('Groupe créé');
            }

            resetSiteForm();
            await loadData();
        } catch (error) {
            console.error('[SiteSettings] handleSaveSite error:', error);
            showToast('Erreur lors de l’enregistrement du groupe', 'err');
        } finally {
            setSavingSite(false);
        }
    };

    const handleEditSite = (site: Site) => {
        setSiteForm({
            id: site.id,
            name: site.name,
            code: site.code,
            default_locale: site.default_locale,
            homepage_page_key: site.homepage_page_key || 'home',
            canonical_strategy: site.canonical_strategy || 'canonical_domain',
            is_active: site.is_active,
        });
        setSiteAdvancedOpen(hasAdvancedSiteSettings(site));
        setSelectedSiteId(site.id);
        scrollToTopSmooth();
    };

    const handleDeleteSite = async (site: Site) => {
        if (!await modal.confirm(`Supprimer le groupe "${site.name}" ?`, 'Supprimer le groupe')) {
            return;
        }

        try {
            const { error } = await supabase.from('sites').delete().eq('id', site.id);
            if (error) throw error;
            showToast('Groupe supprimé');
            if (selectedSiteId === site.id) {
                setSelectedSiteId('');
            }
            await loadData();
        } catch (error: any) {
            console.error('[SiteSettings] handleDeleteSite error:', error);
            showToast(error?.message || 'Suppression impossible', 'err');
        }
    };

    const handleSaveDomain = async () => {
        if (!domainForm.site_id || !domainForm.host.trim()) {
            showToast('Groupe et domaine requis', 'err');
            return;
        }

        setSavingDomain(true);
        try {
            const payload = {
                site_id: domainForm.site_id,
                host: domainForm.host.trim().toLowerCase(),
                scheme: domainForm.scheme,
                locale: domainForm.locale.trim().toLowerCase() || null,
                is_primary: domainForm.is_primary,
                is_canonical: domainForm.is_canonical,
                is_active: domainForm.is_active,
                redirect_to_primary: domainForm.redirect_to_primary,
                business_owner: domainForm.business_owner.trim() || null,
                technical_owner: domainForm.technical_owner.trim() || null,
                registrar: domainForm.registrar.trim() || null,
                dns_provider: domainForm.dns_provider.trim() || null,
                dns_target: domainForm.dns_target.trim() || null,
                hosting_target: domainForm.hosting_target.trim() || null,
                verification_method: domainForm.verification_method,
                verification_status: domainForm.verification_status,
                verification_token: domainForm.verification_token.trim() || null,
                verified_at: domainForm.verified_at || null,
                ssl_status: domainForm.ssl_status,
                robots_txt_enabled: domainForm.robots_txt_enabled,
                sitemap_enabled: domainForm.sitemap_enabled,
                allow_indexing: domainForm.allow_indexing,
                notes: domainForm.notes.trim() || null,
                go_live_at: domainForm.go_live_at || null,
            };

            if (domainForm.id) {
                const { error } = await supabase.from('site_domains').update(payload).eq('id', domainForm.id);
                if (error) throw error;
                showToast('Domaine mis à jour');
            } else {
                const { error } = await supabase.from('site_domains').insert(payload);
                if (error) throw error;
                showToast('Domaine ajouté');
            }

            resetDomainForm();
            await loadData();
        } catch (error) {
            console.error('[SiteSettings] handleSaveDomain error:', error);
            showToast('Erreur lors de l’enregistrement du domaine', 'err');
        } finally {
            setSavingDomain(false);
        }
    };

    const handleEditDomain = (domain: SiteDomain) => {
        setDomainForm({
            id: domain.id,
            site_id: domain.site_id,
            host: domain.host,
            scheme: domain.scheme,
            locale: domain.locale || 'fr',
            is_primary: domain.is_primary,
            is_canonical: domain.is_canonical,
            is_active: domain.is_active,
            redirect_to_primary: domain.redirect_to_primary,
            business_owner: domain.business_owner || '',
            technical_owner: domain.technical_owner || '',
            registrar: domain.registrar || '',
            dns_provider: domain.dns_provider || '',
            dns_target: domain.dns_target || '',
            hosting_target: domain.hosting_target || '',
            verification_method: domain.verification_method || 'manual',
            verification_status: domain.verification_status || 'pending',
            verification_token: domain.verification_token || '',
            verified_at: toDateInput(domain.verified_at),
            ssl_status: domain.ssl_status || 'pending',
            robots_txt_enabled: domain.robots_txt_enabled ?? true,
            sitemap_enabled: domain.sitemap_enabled ?? true,
            allow_indexing: domain.allow_indexing ?? true,
            notes: domain.notes || '',
            go_live_at: toDateInput(domain.go_live_at),
        });
        setSelectedSiteId(domain.site_id);
        setDomainAdvancedOpen(hasAdvancedDomainSettings(domain));
        scrollToTopSmooth();
    };

    const handleDeleteDomain = async (domain: SiteDomain) => {
        if (!await modal.confirm(`Supprimer le domaine ${domain.host} ?`, 'Supprimer le domaine')) {
            return;
        }

        try {
            const { error } = await supabase.from('site_domains').delete().eq('id', domain.id);
            if (error) throw error;
            showToast('Domaine supprimé');
            await loadData();
        } catch (error) {
            console.error('[SiteSettings] handleDeleteDomain error:', error);
            showToast('Erreur lors de la suppression du domaine', 'err');
        }
    };

    const prepareDomainForSite = (site: Site) => {
        setSelectedSiteId(site.id);
        setDomainForm({
            ...EMPTY_DOMAIN_FORM,
            site_id: site.id,
            locale: site.default_locale,
        });
        setDomainAdvancedOpen(false);
        scrollToTopSmooth();
    };

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {toast.text}
                </div>
            )}

            <div>
                <button
                    onClick={() => onNavigate?.('dashboard')}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 inline-block font-medium"
                >
                    ← Retour au tableau de bord
                </button>
                <div className="flex flex-col gap-1 mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Sites & domaines</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mt-2">
                        Organisez vos marques (groupes) et gérez les domaines associés pour configurer le comportement de chaque site. 
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <Layers className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">Groupe de domaines</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Configuration générale et localisation logicielle.
                            </p>
                        </div>
                    </div>

                    <SectionShell title="Informations générales">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du groupe</label>
                                <input
                                    value={siteForm.name}
                                    onChange={(e) => setSiteForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder="ScaNetwork France"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Code interne</label>
                                <input
                                    value={siteForm.code}
                                    onChange={(e) => setSiteForm((prev) => ({ ...prev, code: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder="scanetwork-fr"
                                />
                                <p className="mt-1 text-xs text-gray-500">Utilisé en interne pour identifier le groupe.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Locale par défaut</label>
                                <input
                                    list="site-locale-suggestions"
                                    value={siteForm.default_locale}
                                    onChange={(e) => setSiteForm((prev) => ({ ...prev, default_locale: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder="fr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug de la page d’accueil</label>
                                <input
                                    value={siteForm.homepage_page_key}
                                    onChange={(e) => setSiteForm((prev) => ({ ...prev, homepage_page_key: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder="home"
                                />
                                <p className="mt-1 text-xs text-gray-500">Le chemin utilisé quand un visiteur ouvre simplement `/`.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Statut du groupe</label>
                                <select
                                    value={siteForm.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setSiteForm((prev) => ({ ...prev, is_active: e.target.value === 'active' }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    {SITE_STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </SectionShell>

                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                        <button
                            type="button"
                            onClick={() => setSiteAdvancedOpen((prev) => !prev)}
                            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-bold text-gray-900">Paramètres SEO avancés</p>
                                <p className="text-xs text-gray-500 mt-0.5">Configuration de la stratégie Canonical.</p>
                            </div>
                            {siteAdvancedOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {siteAdvancedOpen && (
                            <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                                <div className="pt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stratégie canonical</label>
                                    <select
                                        value={siteForm.canonical_strategy}
                                        onChange={(e) => setSiteForm((prev) => ({ ...prev, canonical_strategy: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                    >
                                        {SITE_CANONICAL_STRATEGY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {SITE_CANONICAL_STRATEGY_OPTIONS.find((option) => option.value === siteForm.canonical_strategy)?.hint}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSaveSite}
                            disabled={savingSite}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center shadow-md transition-all active:scale-95"
                        >
                            <span>{siteForm.id ? 'Mettre à jour le groupe' : 'Créer le groupe'}</span>
                        </button>
                        {siteForm.id && (
                            <button
                                onClick={resetSiteForm}
                                className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <Globe className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">Domaine</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Liez un domaine web à votre groupe.
                            </p>
                        </div>
                    </div>

                    <SectionShell title="Informations de routage">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Groupe concerné</label>
                                <select
                                    value={domainForm.site_id}
                                    onChange={(e) => {
                                        const nextSiteId = e.target.value;
                                        const nextSite = sites.find((site) => site.id === nextSiteId);
                                        setDomainForm((prev) => ({
                                            ...prev,
                                            site_id: nextSiteId,
                                            locale: prev.locale || nextSite?.default_locale || 'fr',
                                        }));
                                        setSelectedSiteId(nextSiteId);
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    <option value="">Choisir un groupe</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Protocole</label>
                                <select
                                    value={domainForm.scheme}
                                    onChange={(e) => setDomainForm((prev) => ({ ...prev, scheme: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    {DOMAIN_SCHEME_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Locale du domaine</label>
                                <input
                                    list="domain-locale-suggestions"
                                    value={domainForm.locale}
                                    onChange={(e) => setDomainForm((prev) => ({ ...prev, locale: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder={selectedSite?.default_locale || 'fr'}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de domaine</label>
                                <input
                                    value={domainForm.host}
                                    onChange={(e) => setDomainForm((prev) => ({ ...prev, host: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    placeholder="www.scanetwork.fr"
                                />
                                <p className="mt-1 text-xs text-gray-500">Saisis uniquement le host, sans chemin ni slash.</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle du domaine</label>
                                <select
                                    value={currentDomainFunction}
                                    onChange={(e) => setDomainForm((prev) => applyDomainFunction(prev, e.target.value as DomainFunctionValue))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    {DOMAIN_FUNCTION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-gray-500">{currentDomainFunctionMeta.hint}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Statut du domaine</label>
                                <select
                                    value={domainForm.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setDomainForm((prev) => ({ ...prev, is_active: e.target.value === 'active' }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                >
                                    {DOMAIN_STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </SectionShell>

                    {selectedSite && (
                        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex gap-4 text-sm">
                            <div className="flex flex-col text-blue-900">
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Locale</span>
                                <span className="font-semibold">{selectedSite.default_locale}</span>
                            </div>
                            <div className="w-px bg-blue-200"></div>
                            <div className="flex flex-col text-blue-900">
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Accueil</span>
                                <span className="font-semibold">/{selectedSite.homepage_page_key || 'home'}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                        <button
                            type="button"
                            onClick={() => setDomainAdvancedOpen((prev) => !prev)}
                            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-bold text-gray-900">Gestion de production et DNS</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {advancedDomainCount > 0 ? `${advancedDomainCount} paramètre(s) technique(s) défini(s)` : 'Optionnel. Métadonnées infra et statut SSL.'}
                                </p>
                            </div>
                            {domainAdvancedOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {domainAdvancedOpen && (
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
                                <SectionShell title="Gouvernance et Cloud">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Propriétaire métier</label>
                                            <input
                                                value={domainForm.business_owner}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, business_owner: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="Marketing, communication..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Propriétaire technique</label>
                                            <input
                                                value={domainForm.technical_owner}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, technical_owner: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="Infra, devops, agence..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Registrar</label>
                                            <input
                                                list="registrar-suggestions"
                                                value={domainForm.registrar}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, registrar: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="OVHcloud"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fournisseur DNS</label>
                                            <input
                                                list="dns-provider-suggestions"
                                                value={domainForm.dns_provider}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, dns_provider: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="Cloudflare"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cible DNS</label>
                                            <input
                                                value={domainForm.dns_target}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, dns_target: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="lb-prod.example.net"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hébergement cible</label>
                                            <input
                                                list="hosting-target-suggestions"
                                                value={domainForm.hosting_target}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, hosting_target: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                                placeholder="Reverse proxy"
                                            />
                                        </div>
                                    </div>
                                </SectionShell>

                                <SectionShell title="Vérification et SSL">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Méthode de vérification</label>
                                            <select
                                                value={domainForm.verification_method}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, verification_method: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {DOMAIN_VERIFICATION_METHOD_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut de vérification</label>
                                            <select
                                                value={domainForm.verification_status}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, verification_status: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {DOMAIN_VERIFICATION_STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Token de vérification</label>
                                            <input
                                                value={domainForm.verification_token}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, verification_token: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white font-mono text-sm"
                                                placeholder="Généré automatiquement"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de vérification</label>
                                            <input
                                                type="date"
                                                value={domainForm.verified_at}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, verified_at: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut SSL</label>
                                            <select
                                                value={domainForm.ssl_status}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, ssl_status: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {DOMAIN_SSL_STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de mise en production</label>
                                            <input
                                                type="date"
                                                value={domainForm.go_live_at}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, go_live_at: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                </SectionShell>

                                <SectionShell title="Robots & Indexation">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Autoriser l’indexation</label>
                                            <select
                                                value={domainForm.allow_indexing ? 'yes' : 'no'}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, allow_indexing: e.target.value === 'yes' }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {YES_NO_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Exposer `robots.txt`</label>
                                            <select
                                                value={domainForm.robots_txt_enabled ? 'yes' : 'no'}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, robots_txt_enabled: e.target.value === 'yes' }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {YES_NO_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Exposer `sitemap.xml`</label>
                                            <select
                                                value={domainForm.sitemap_enabled ? 'yes' : 'no'}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, sitemap_enabled: e.target.value === 'yes' }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                                            >
                                                {YES_NO_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes d’exploitation</label>
                                            <textarea
                                                value={domainForm.notes}
                                                onChange={(e) => setDomainForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-white min-h-[110px]"
                                                placeholder="Exemple : DNS prêt, certificat en attente, domaine à brancher côté proxy..."
                                            />
                                        </div>
                                    </div>
                                </SectionShell>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSaveDomain}
                            disabled={savingDomain}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center shadow-md transition-all active:scale-95 gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{domainForm.id ? 'Mettre à jour le domaine' : 'Ajouter le domaine'}</span>
                        </button>
                        {domainForm.id && (
                            <button
                                onClick={resetDomainForm}
                                className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-12">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Groupes configurés</h2>
                        <p className="text-sm text-gray-500 mt-1">Vos environnements organisés et leurs domaines respectifs.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
                        Chargement des groupes...
                    </div>
                ) : sites.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
                        Aucun groupe de domaines configuré.
                    </div>
                ) : (
                    sites.map((site) => (
                        <div
                            key={site.id}
                            className={`bg-white rounded-3xl border p-6 transition-all ${selectedSiteId === site.id ? 'border-gray-900 ring-4 ring-gray-900/5 shadow-lg relative' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{site.name}</h3>
                                        <SummaryBadge>{site.code}</SummaryBadge>
                                        <SummaryBadge tone={site.is_active ? 'green' : 'neutral'}>{getSiteStatusLabel(site.is_active)}</SummaryBadge>
                                        {hasAdvancedSiteSettings(site) && <SummaryBadge tone="violet">SEO avancé</SummaryBadge>}
                                    </div>
                                    <p className="text-sm text-gray-500 max-w-3xl">
                                        {site.domains?.length || 0} domaine(s) • {site._count?.pages || 0} page(s)
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => prepareDomainForSite(site)}
                                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-medium text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
                                    >
                                        Ajouter un domaine
                                    </button>
                                    <button
                                        onClick={() => handleEditSite(site)}
                                        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all active:scale-95"
                                        title="Modifier le groupe"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSite(site)}
                                        className="p-2.5 rounded-xl border border-red-100 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all active:scale-95"
                                        title="Supprimer le groupe"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <StatCard title="Locale" value={site.default_locale} description="Locale par défaut" />
                                <StatCard title="Accueil" value={`/${site.homepage_page_key || 'home'}`} description="Page racine" />
                                <StatCard title="Canonicals" value={formatSiteCanonicalStrategy(site.canonical_strategy)} description="Règle SEO" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Domaines associés</h4>
                                {(site.domains || []).length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                                        <p className="text-sm font-medium text-gray-500">Aucun domaine configuré pour ce groupe.</p>
                                        <button onClick={() => prepareDomainForSite(site)} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700">Ajouter votre premier domaine</button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {(site.domains || []).map((domain) => {
                                            const domainFunction = getDomainFunctionMeta(getDomainFunctionValue(domain));
                                            return (
                                                <div key={domain.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-gray-200" style={{ backgroundColor: domain.is_primary ? '#3b82f6' : '#e5e7eb' }}></div>
                                                    <div className="flex items-start justify-between gap-3 pl-2">
                                                        <div>
                                                            <p className="text-base font-bold text-gray-900">{getDomainLabel(domain)}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <SummaryBadge tone={domain.is_active ? 'green' : 'neutral'}>{domain.is_active ? 'Actif' : 'Inactif'}</SummaryBadge>
                                                                <SummaryBadge tone={domain.redirect_to_primary ? 'amber' : 'blue'}>{domainFunction.label}</SummaryBadge>
                                                                <SummaryBadge tone={(domain.allow_indexing ?? true) ? 'green' : 'amber'}>{(domain.allow_indexing ?? true) ? 'Indexable' : 'Noindex'}</SummaryBadge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <button
                                                                onClick={() => handleEditDomain(domain)}
                                                                className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                                title="Modifier le domaine"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDomain(domain)}
                                                                className="p-2 rounded-xl bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                                                                title="Supprimer le domaine"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-2 pl-2">
                                                        <p className="flex justify-between border-b border-gray-50 pb-1">Vérification <span className="font-medium text-gray-900">{formatDomainVerificationStatus(domain.verification_status)}</span></p>
                                                        <p className="flex justify-between border-b border-gray-50 pb-1">SSL <span className="font-medium text-gray-900">{formatDomainSslStatus(domain.ssl_status)}</span></p>
                                                        <p className="flex justify-between border-b border-gray-50 pb-1">Robots <span className="font-medium text-gray-900">{formatBooleanLabel(domain.robots_txt_enabled ?? true, 'Oui', 'Non')}</span></p>
                                                        <p className="flex justify-between border-b border-gray-50 pb-1">Sitemap <span className="font-medium text-gray-900">{formatBooleanLabel(domain.sitemap_enabled ?? true, 'Oui', 'Non')}</span></p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <datalist id="site-locale-suggestions">
                {LOCALE_SUGGESTIONS.map((locale) => <option key={locale} value={locale} />)}
            </datalist>
            <datalist id="domain-locale-suggestions">
                {LOCALE_SUGGESTIONS.map((locale) => <option key={locale} value={locale} />)}
            </datalist>
            <datalist id="registrar-suggestions">
                {REGISTRAR_SUGGESTIONS.map((value) => <option key={value} value={value} />)}
            </datalist>
            <datalist id="dns-provider-suggestions">
                {DNS_PROVIDER_SUGGESTIONS.map((value) => <option key={value} value={value} />)}
            </datalist>
            <datalist id="hosting-target-suggestions">
                {HOSTING_TARGET_SUGGESTIONS.map((value) => <option key={value} value={value} />)}
            </datalist>
        </div>
    );
}
