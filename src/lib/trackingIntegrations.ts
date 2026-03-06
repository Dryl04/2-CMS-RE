import {
  ConsentCategory,
  TrackingIntegration,
  TrackingPlacement,
  TrackingScope,
  supabase,
} from '@/lib/supabase';

export type TrackingProvider =
  | 'google_tag_manager'
  | 'ga4'
  | 'google_ads'
  | 'meta_pixel'
  | 'linkedin_insight'
  | 'tiktok_pixel'
  | 'pinterest_tag'
  | 'custom';

export interface ProviderDefinition {
  value: TrackingProvider;
  label: string;
  fieldLabel?: string;
  fieldKey?: string;
  placeholder?: string;
  defaultConsentCategory: ConsentCategory;
  defaultPlacement: TrackingPlacement;
}

export const TRACKING_PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    value: 'google_tag_manager',
    label: 'Google Tag Manager',
    fieldLabel: 'Container ID',
    fieldKey: 'containerId',
    placeholder: 'GTM-XXXXXXX',
    defaultConsentCategory: 'analytics',
    defaultPlacement: 'head',
  },
  {
    value: 'ga4',
    label: 'Google Analytics 4',
    fieldLabel: 'Measurement ID',
    fieldKey: 'measurementId',
    placeholder: 'G-XXXXXXXXXX',
    defaultConsentCategory: 'analytics',
    defaultPlacement: 'head',
  },
  {
    value: 'google_ads',
    label: 'Google Ads',
    fieldLabel: 'Conversion ID',
    fieldKey: 'conversionId',
    placeholder: 'AW-123456789',
    defaultConsentCategory: 'ads',
    defaultPlacement: 'head',
  },
  {
    value: 'meta_pixel',
    label: 'Meta Pixel',
    fieldLabel: 'Pixel ID',
    fieldKey: 'pixelId',
    placeholder: '123456789012345',
    defaultConsentCategory: 'ads',
    defaultPlacement: 'head',
  },
  {
    value: 'linkedin_insight',
    label: 'LinkedIn Insight Tag',
    fieldLabel: 'Partner ID',
    fieldKey: 'partnerId',
    placeholder: '1234567',
    defaultConsentCategory: 'ads',
    defaultPlacement: 'head',
  },
  {
    value: 'tiktok_pixel',
    label: 'TikTok Pixel',
    fieldLabel: 'Pixel ID',
    fieldKey: 'pixelId',
    placeholder: 'C123ABC456DEF789',
    defaultConsentCategory: 'ads',
    defaultPlacement: 'head',
  },
  {
    value: 'pinterest_tag',
    label: 'Pinterest Tag',
    fieldLabel: 'Tag ID',
    fieldKey: 'tagId',
    placeholder: '2612345678901',
    defaultConsentCategory: 'social',
    defaultPlacement: 'head',
  },
  {
    value: 'custom',
    label: 'Script personnalise',
    defaultConsentCategory: 'necessary',
    defaultPlacement: 'body_end',
  },
];

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  social: boolean;
}

export const CONSENT_STORAGE_KEY = 'seo-manager-consent';

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  ads: false,
  social: false,
};

export function getProviderDefinition(provider: string): ProviderDefinition | undefined {
  return TRACKING_PROVIDER_DEFINITIONS.find((item) => item.value === provider);
}

export async function loadTrackingIntegrations(scope: TrackingScope, pageId?: string | null): Promise<TrackingIntegration[]> {
  let query = supabase
    .from('tracking_integrations')
    .select('*')
    .eq('scope', scope)
    .order('updated_at', { ascending: false });

  if (scope === 'page') {
    query = query.eq('page_id', pageId || '');
  }

  const { data, error } = await query;
  if (error) {
    console.error('[trackingIntegrations] Error loading integrations:', error);
    return [];
  }
  return (data || []) as TrackingIntegration[];
}

export async function resolveTrackingIntegrations(pageId?: string | null): Promise<TrackingIntegration[]> {
  const [siteIntegrations, pageIntegrations] = await Promise.all([
    loadTrackingIntegrations('site'),
    pageId ? loadTrackingIntegrations('page', pageId) : Promise.resolve([]),
  ]);

  const disabledProviders = new Set(
    pageIntegrations.filter((item) => item.disable_inherited).map((item) => item.provider)
  );

  const merged = [
    ...siteIntegrations.filter((item) => !disabledProviders.has(item.provider)),
    ...pageIntegrations,
  ];

  return merged.filter((item) => item.is_active);
}

export function readConsentPreferences(): ConsentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONSENT_PREFERENCES;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      ads: !!parsed.ads,
      social: !!parsed.social,
    };
  } catch {
    return DEFAULT_CONSENT_PREFERENCES;
  }
}

export function writeConsentPreferences(preferences: ConsentPreferences) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent('seo-consent-changed', { detail: preferences }));
}

export function canLoadIntegration(
  integration: TrackingIntegration,
  preferences: ConsentPreferences
): boolean {
  if (!integration.requires_consent) return true;
  if (integration.consent_category === 'necessary') return true;
  return preferences[integration.consent_category];
}

export function generateTrackingMarkup(integration: TrackingIntegration): string {
  const config = integration.config_json || {};

  switch (integration.provider as TrackingProvider) {
    case 'google_tag_manager': {
      const containerId = String(config.containerId || '').trim();
      if (!containerId) return '';
      return `<script>window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});(function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+'&l='+l;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');</script>`;
    }
    case 'ga4': {
      const measurementId = String(config.measurementId || '').trim();
      if (!measurementId) return '';
      return `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:true});</script>`;
    }
    case 'google_ads': {
      const conversionId = String(config.conversionId || '').trim();
      if (!conversionId) return '';
      return `<script async src="https://www.googletagmanager.com/gtag/js?id=${conversionId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${conversionId}');</script>`;
    }
    case 'meta_pixel': {
      const pixelId = String(config.pixelId || '').trim();
      if (!pixelId) return '';
      return `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');</script>`;
    }
    case 'linkedin_insight': {
      const partnerId = String(config.partnerId || '').trim();
      if (!partnerId) return '';
      return `<script>_linkedin_partner_id='${partnerId}';window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);</script><script>(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s);})(window.lintrk);</script>`;
    }
    case 'tiktok_pixel': {
      const pixelId = String(config.pixelId || '').trim();
      if (!pixelId) return '';
      return `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=n;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]={};var a=document.createElement('script');a.type='text/javascript';a.async=!0;a.src=n+'?sdkid='+e+'&lib='+t;var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(a,s)};ttq.load('${pixelId}');ttq.page();}(window,document,'ttq');</script>`;
    }
    case 'pinterest_tag': {
      const tagId = String(config.tagId || '').trim();
      if (!tagId) return '';
      return `<script>!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[];n.version='3.0';var t=document.createElement('script');t.async=!0;t.src=e;var r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}('https://s.pinimg.com/ct/core.js');pintrk('load','${tagId}',{em:''});pintrk('page');</script>`;
    }
    case 'custom':
      return integration.custom_code || '';
    default:
      return '';
  }
}

export function getTrackingSummary(integration: TrackingIntegration): string {
  const config = integration.config_json || {};
  const definition = getProviderDefinition(integration.provider);
  if (!definition?.fieldKey) return integration.mode === 'custom' ? 'Code personnalise' : integration.provider;
  const value = config[definition.fieldKey];
  return value ? `${definition.label} - ${value}` : definition.label;
}