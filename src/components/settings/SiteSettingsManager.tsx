import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Globe, Save, Search, ShieldCheck } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import TrackingIntegrationsPanel from '@/components/settings/TrackingIntegrationsPanel';
import { SiteSettings } from '@/lib/supabase';
import {
  formatSocialLinks,
  loadSiteSettings,
  normalizeSiteSettings,
  saveSiteSettings,
  splitSocialLinks,
} from '@/lib/siteSettings';

interface SiteSettingsManagerProps {
  onNavigate: (view: string) => void;
  userId?: string | null;
}

export default function SiteSettingsManager({ onNavigate, userId }: SiteSettingsManagerProps) {
  const modal = useModal();
  const [settings, setSettings] = useState<SiteSettings>(normalizeSiteSettings());
  const [sameAsInput, setSameAsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSiteSettings()
      .then((data) => {
        setSettings(data);
        setSameAsInput(formatSocialLinks(data.organization_same_as));
      })
      .finally(() => setLoading(false));
  }, []);

  const robotsPreview = useMemo(() => {
    const baseUrl = settings.base_url?.replace(/\/$/, '') || 'https://example.com';
    const lines = [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ];
    if (settings.robots_txt_overrides?.trim()) {
      lines.push('', settings.robots_txt_overrides.trim());
    }
    return lines.join('\n');
  }, [settings.base_url, settings.robots_txt_overrides]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveSiteSettings(
        {
          ...settings,
          organization_same_as: splitSocialLinks(sameAsInput),
        },
        settings.id,
        userId || null
      );
      setSettings(saved);
      setSameAsInput(formatSocialLinks(saved.organization_same_as));
      await modal.alert('Les parametres SEO du site ont ete enregistres.', 'Parametres enregistres');
    } catch (error: any) {
      console.error('[SiteSettingsManager] Error saving settings:', error);
      await modal.alert(error?.message || 'Erreur lors de l\'enregistrement.', 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement des parametres...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au tableau de bord</span>
        </button>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Parametres SEO du site</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configurez les defaults globaux, l'indexation et les integrations marketing du site.
        </p>
      </div>

      <div className="grid xl:grid-cols-[2fr,1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Identite et SEO global</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(event) => setField('site_name', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de base</label>
                <input
                  type="url"
                  value={settings.base_url}
                  onChange={(event) => setField('base_url', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://votre-domaine.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locale par defaut</label>
                <input
                  type="text"
                  value={settings.default_locale}
                  onChange={(event) => setField('default_locale', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suffixe de titre</label>
                <input
                  type="text"
                  value={settings.default_title_suffix || ''}
                  onChange={(event) => setField('default_title_suffix', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="| Ma marque"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta description par defaut</label>
              <textarea
                value={settings.default_meta_description || ''}
                onChange={(event) => setField('default_meta_description', event.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image OG par defaut</label>
                <input
                  type="url"
                  value={settings.default_og_image || ''}
                  onChange={(event) => setField('default_og_image', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://.../og-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter card</label>
                <select
                  value={settings.default_twitter_card}
                  onChange={(event) => setField('default_twitter_card', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Directive robots par defaut</label>
                <input
                  type="text"
                  value={settings.default_meta_robots}
                  onChange={(event) => setField('default_meta_robots', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="index,follow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schema par defaut</label>
                <select
                  value={settings.default_schema_type || 'WebPage'}
                  onChange={(event) => setField('default_schema_type', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="WebPage">WebPage</option>
                  <option value="Article">Article</option>
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Search className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Favicons, verification et robots</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
                <input
                  type="url"
                  value={settings.favicon_url || ''}
                  onChange={(event) => setField('favicon_url', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://.../favicon.ico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apple touch icon</label>
                <input
                  type="url"
                  value={settings.apple_touch_icon_url || ''}
                  onChange={(event) => setField('apple_touch_icon_url', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://.../apple-touch-icon.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manifest</label>
                <input
                  type="text"
                  value={settings.site_webmanifest_url || ''}
                  onChange={(event) => setField('site_webmanifest_url', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="/site.webmanifest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google site verification</label>
                <input
                  type="text"
                  value={settings.google_site_verification || ''}
                  onChange={(event) => setField('google_site_verification', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bing site verification</label>
                <input
                  type="text"
                  value={settings.bing_site_verification || ''}
                  onChange={(event) => setField('bing_site_verification', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overrides robots.txt</label>
              <textarea
                value={settings.robots_txt_overrides || ''}
                onChange={(event) => setField('robots_txt_overrides', event.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Disallow: /__preview"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Organisation et consentement</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'organisation</label>
                <input
                  type="text"
                  value={settings.organization_name || ''}
                  onChange={(event) => setField('organization_name', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo de l'organisation</label>
                <input
                  type="url"
                  value={settings.organization_logo_url || ''}
                  onChange={(event) => setField('organization_logo_url', event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profils sociaux de l'organisation</label>
              <textarea
                value={sameAsInput}
                onChange={(event) => setSameAsInput(event.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="https://www.linkedin.com/company/...
https://www.facebook.com/..."
              />
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.enable_cookie_banner}
                  onChange={(event) => setField('enable_cookie_banner', event.target.checked)}
                />
                Activer le bandeau de consentement cookie
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message du bandeau</label>
                <textarea
                  value={settings.cookie_banner_message || ''}
                  onChange={(event) => setField('cookie_banner_message', event.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <TrackingIntegrationsPanel
            scope="site"
            userId={userId}
            title="Tracking global du site"
            description="Configurez ici les integrations heritees par defaut sur l'ensemble des pages publiques."
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer les parametres du site'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Apercu robots.txt</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-x-auto">{robotsPreview}</pre>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Check rapide</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${settings.base_url ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{settings.base_url ? 'Domaine principal configure.' : 'Domaine principal manquant.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${settings.default_og_image ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{settings.default_og_image ? 'Image sociale par defaut configuree.' : 'Image sociale par defaut manquante.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${settings.favicon_url ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{settings.favicon_url ? 'Favicon configure.' : 'Favicon manquant.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${settings.organization_name ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span>{settings.organization_name ? 'Schema organisation pret.' : 'Schema organisation non renseigne, fallback page seulement.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}