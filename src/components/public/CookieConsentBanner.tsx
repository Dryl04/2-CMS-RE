import { useEffect, useState } from 'react';
import { SiteSettings } from '@/lib/supabase';
import {
  ConsentPreferences,
  DEFAULT_CONSENT_PREFERENCES,
  readConsentPreferences,
  writeConsentPreferences,
} from '@/lib/trackingIntegrations';

interface CookieConsentBannerProps {
  settings?: SiteSettings | null;
}

export default function CookieConsentBanner({ settings }: CookieConsentBannerProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const saved = readConsentPreferences();
    setPreferences(saved);
    const hasStoredChoice = typeof window !== 'undefined' && window.localStorage.getItem('seo-manager-consent');
    setIsVisible(!hasStoredChoice);
  }, []);

  if (!settings?.enable_cookie_banner || !isVisible) return null;

  const acceptAll = () => {
    const next = { necessary: true as const, analytics: true, ads: true, social: true };
    writeConsentPreferences(next);
    setPreferences(next);
    setIsVisible(false);
  };

  const acceptEssentialOnly = () => {
    writeConsentPreferences(DEFAULT_CONSENT_PREFERENCES);
    setPreferences(DEFAULT_CONSENT_PREFERENCES);
    setIsVisible(false);
  };

  const savePreferences = () => {
    writeConsentPreferences(preferences);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-2xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Gestion du consentement</h3>
            <p className="text-sm text-gray-600 mt-1">
              {settings.cookie_banner_message || 'Nous utilisons des cookies pour mesurer l\'audience et personnaliser les campagnes marketing.'}
            </p>
            {showCustomize && (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={preferences.analytics} onChange={(event) => setPreferences({ ...preferences, analytics: event.target.checked })} />
                  Analytics
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={preferences.ads} onChange={(event) => setPreferences({ ...preferences, ads: event.target.checked })} />
                  Ads
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={preferences.social} onChange={(event) => setPreferences({ ...preferences, social: event.target.checked })} />
                  Social
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowCustomize((value) => !value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {showCustomize ? 'Fermer' : 'Personnaliser'}
            </button>
            {showCustomize && (
              <button type="button" onClick={savePreferences} className="px-4 py-2.5 rounded-xl bg-gray-900 text-sm font-medium text-white hover:bg-gray-800">
                Enregistrer mes choix
              </button>
            )}
            <button type="button" onClick={acceptEssentialOnly} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Essentiels uniquement
            </button>
            <button type="button" onClick={acceptAll} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700">
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}