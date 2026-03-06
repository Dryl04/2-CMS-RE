import { useEffect, useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import {
  ConsentCategory,
  TrackingIntegration,
  TrackingLoadStrategy,
  TrackingPlacement,
  TrackingScope,
  supabase,
} from '@/lib/supabase';
import {
  getProviderDefinition,
  getTrackingSummary,
  TRACKING_PROVIDER_DEFINITIONS,
} from '@/lib/trackingIntegrations';

interface TrackingIntegrationsPanelProps {
  scope: TrackingScope;
  pageId?: string | null;
  userId?: string | null;
  title: string;
  description: string;
}

interface FormState {
  id?: string;
  label: string;
  provider: string;
  placement: TrackingPlacement;
  requiresConsent: boolean;
  consentCategory: ConsentCategory;
  isActive: boolean;
  loadStrategy: TrackingLoadStrategy;
  customCode: string;
  providerValue: string;
  disableInherited: boolean;
}

const EMPTY_STATE: FormState = {
  label: '',
  provider: 'google_tag_manager',
  placement: 'head',
  requiresConsent: true,
  consentCategory: 'analytics',
  isActive: true,
  loadStrategy: 'after_consent',
  customCode: '',
  providerValue: '',
  disableInherited: false,
};

export default function TrackingIntegrationsPanel({
  scope,
  pageId,
  userId,
  title,
  description,
}: TrackingIntegrationsPanelProps) {
  const modal = useModal();
  const [integrations, setIntegrations] = useState<TrackingIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<FormState | null>(null);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tracking_integrations')
        .select('*')
        .eq('scope', scope)
        .order('updated_at', { ascending: false });

      if (scope === 'page') {
        query = query.eq('page_id', pageId || '');
      }

      const { data, error } = await query;
      if (error) throw error;
      setIntegrations((data || []) as TrackingIntegration[]);
    } catch (error) {
      console.error('[TrackingIntegrationsPanel] Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scope === 'page' && !pageId) {
      setIntegrations([]);
      setLoading(false);
      return;
    }
    loadIntegrations();
  }, [scope, pageId]);

  const beginCreate = () => {
    const providerDefinition = getProviderDefinition(EMPTY_STATE.provider);
    setEditing({
      ...EMPTY_STATE,
      consentCategory: providerDefinition?.defaultConsentCategory || 'analytics',
      placement: providerDefinition?.defaultPlacement || 'head',
    });
  };

  const beginEdit = (integration: TrackingIntegration) => {
    const providerDefinition = getProviderDefinition(integration.provider);
    const providerValue = providerDefinition?.fieldKey
      ? String(integration.config_json?.[providerDefinition.fieldKey] || '')
      : '';

    setEditing({
      id: integration.id,
      label: integration.label,
      provider: integration.provider,
      placement: integration.placement,
      requiresConsent: integration.requires_consent,
      consentCategory: integration.consent_category,
      isActive: integration.is_active,
      loadStrategy: integration.load_strategy,
      customCode: integration.custom_code || '',
      providerValue,
      disableInherited: integration.disable_inherited,
    });
  };

  const resetForm = () => setEditing(null);

  const handleProviderChange = (provider: string) => {
    const definition = getProviderDefinition(provider);
    setEditing((current) => current
      ? {
        ...current,
        provider,
        providerValue: '',
        customCode: '',
        consentCategory: definition?.defaultConsentCategory || current.consentCategory,
        placement: definition?.defaultPlacement || current.placement,
      }
      : current);
  };

  const handleSave = async () => {
    if (!editing) return;

    if (scope === 'page' && !pageId) {
      await modal.alert('Enregistrez d\'abord la page avant de lui rattacher un tracking specifique.', 'Page requise');
      return;
    }

    if (!editing.label.trim()) {
      await modal.alert('Le libelle est obligatoire.', 'Champ obligatoire');
      return;
    }

    const definition = getProviderDefinition(editing.provider);
    if (editing.provider !== 'custom' && definition?.fieldKey && !editing.providerValue.trim()) {
      await modal.alert('La valeur du provider est obligatoire.', 'Champ obligatoire');
      return;
    }

    if (editing.provider === 'custom' && !editing.customCode.trim()) {
      await modal.alert('Le code personnalise est obligatoire.', 'Champ obligatoire');
      return;
    }

    setSaving(true);
    try {
      const configJson = definition?.fieldKey
        ? { [definition.fieldKey]: editing.providerValue.trim() }
        : null;

      const payload = {
        scope,
        page_id: scope === 'page' ? pageId || null : null,
        provider: editing.provider,
        label: editing.label.trim(),
        placement: editing.placement,
        mode: editing.provider === 'custom' ? 'custom' : 'preset',
        config_json: configJson,
        custom_code: editing.provider === 'custom' ? editing.customCode : null,
        requires_consent: editing.requiresConsent,
        consent_category: editing.consentCategory,
        is_active: editing.isActive,
        load_strategy: editing.loadStrategy,
        disable_inherited: scope === 'page' ? editing.disableInherited : false,
        created_by: userId || null,
        updated_at: new Date().toISOString(),
      };

      if (editing.id) {
        const { error } = await supabase
          .from('tracking_integrations')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tracking_integrations').insert(payload);
        if (error) throw error;
      }

      resetForm();
      await loadIntegrations();
    } catch (error: any) {
      console.error('[TrackingIntegrationsPanel] Error saving integration:', error);
      await modal.alert(error?.message || 'Erreur lors de l\'enregistrement du tracking.', 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (integrationId: string) => {
    if (!await modal.confirm('Supprimer cette integration ?', 'Supprimer le tracking')) return;
    try {
      const { error } = await supabase
        .from('tracking_integrations')
        .delete()
        .eq('id', integrationId);
      if (error) throw error;
      await loadIntegrations();
    } catch (error: any) {
      console.error('[TrackingIntegrationsPanel] Error deleting integration:', error);
      await modal.alert(error?.message || 'Erreur lors de la suppression.', 'Erreur');
    }
  };

  const currentProvider = editing ? getProviderDefinition(editing.provider) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <button
          type="button"
          onClick={beginCreate}
          className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Ajouter un tracking
        </button>
      </div>

      {scope === 'page' && !pageId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Enregistrez d'abord la page pour pouvoir lui associer des integrations de suivi specifiques.
        </div>
      ) : (
        <>
          {editing && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Libelle</label>
                  <input
                    type="text"
                    value={editing.label}
                    onChange={(event) => setEditing({ ...editing, label: event.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Ex: GA4 principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select
                    value={editing.provider}
                    onChange={(event) => handleProviderChange(event.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {TRACKING_PROVIDER_DEFINITIONS.map((provider) => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editing.provider !== 'custom' && currentProvider?.fieldKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{currentProvider.fieldLabel}</label>
                  <input
                    type="text"
                    value={editing.providerValue}
                    onChange={(event) => setEditing({ ...editing, providerValue: event.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder={currentProvider.placeholder}
                  />
                </div>
              )}

              {editing.provider === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code personnalise</label>
                  <textarea
                    value={editing.customCode}
                    onChange={(event) => setEditing({ ...editing, customCode: event.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="<script>...</script>"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select
                    value={editing.placement}
                    onChange={(event) => setEditing({ ...editing, placement: event.target.value as TrackingPlacement })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="head">Head</option>
                    <option value="body_start">Debut du body</option>
                    <option value="body_end">Fin du body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strategie de chargement</label>
                  <select
                    value={editing.loadStrategy}
                    onChange={(event) => setEditing({ ...editing, loadStrategy: event.target.value as TrackingLoadStrategy })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="immediate">Immediat</option>
                    <option value="after_consent">Apres consentement</option>
                    <option value="lazy">Differe</option>
                    <option value="route_change">Au changement de page</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editing.requiresConsent}
                    onChange={(event) => setEditing({ ...editing, requiresConsent: event.target.checked })}
                  />
                  Soumis au consentement
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editing.isActive}
                    onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })}
                  />
                  Actif
                </label>

                {scope === 'page' && (
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editing.disableInherited}
                      onChange={(event) => setEditing({ ...editing, disableInherited: event.target.checked })}
                    />
                    Desactiver l'heritage du meme provider
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorie de consentement</label>
                <select
                  value={editing.consentCategory}
                  onChange={(event) => setEditing({ ...editing, consentCategory: event.target.value as ConsentCategory })}
                  className="w-full md:w-72 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="necessary">Necessaire</option>
                  <option value="analytics">Analytics</option>
                  <option value="ads">Ads</option>
                  <option value="social">Social</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-500">Chargement des integrations...</div>
          ) : integrations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
              Aucune integration configuree pour ce scope.
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{integration.label}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${integration.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {integration.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{integration.placement}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{integration.consent_category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{getTrackingSummary(integration)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => beginEdit(integration)}
                        className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(integration.id)}
                        className="px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}