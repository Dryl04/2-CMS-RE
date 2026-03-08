import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { AI_PROVIDERS } from '@/lib/redactionTypes';
import type { AIProviderConfig, AISystemPrompt } from '@/lib/redactionTypes';
import {
  fetchAIConfigs,
  upsertAIConfig,
  deleteAIConfig,
  fetchSystemPrompts,
  updateSystemPrompt,
} from '@/lib/redactionAiClient';

interface AIConfigModalProps {
  userId: string;
  userRole: string;
  onClose: () => void;
  onConfigsChanged: () => void;
}

export default function AIConfigModal({
  userId,
  userRole,
  onClose,
  onConfigsChanged,
}: AIConfigModalProps) {
  const isAdmin = userRole === 'admin' || userRole === 'seo_manager';

  // Onglet actif
  const [tab, setTab] = useState<'providers' | 'prompts'>('providers');

  // --- Providers ---
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [prompts, setPrompts] = useState<AISystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Formulaire nouveau provider ---
  const [showForm, setShowForm] = useState(false);
  const [formScope, setFormScope] = useState<'user' | 'global'>('user');
  const [formProvider, setFormProvider] = useState(AI_PROVIDERS[0].key);
  const [formApiKey, setFormApiKey] = useState('');
  const [formModel, setFormModel] = useState(AI_PROVIDERS[0].models[0]);
  const [formSaving, setFormSaving] = useState(false);

  // --- Édition prompt ---
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingPromptText, setEditingPromptText] = useState('');
  const [promptSaving, setPromptSaving] = useState(false);

  // --- Visibilité clés ---
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [cfgs, prms] = await Promise.all([
        fetchAIConfigs(),
        fetchSystemPrompts(),
      ]);
      setConfigs(cfgs);
      setPrompts(prms);
    } catch (err) {
      console.error('[AIConfig] Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }

  // --- Provider CRUD ---
  async function handleAddProvider() {
    if (!formApiKey.trim()) return;
    setFormSaving(true);
    try {
      const provider = AI_PROVIDERS.find((p) => p.key === formProvider);
      const scope = isAdmin ? formScope : 'user';
      await upsertAIConfig({
        scope,
        user_id: scope === 'user' ? userId : null,
        provider_key: formProvider,
        provider_label: provider?.label ?? formProvider,
        encrypted_api_key: formApiKey.trim(),
        default_model: formModel,
      });
      setFormApiKey('');
      setShowForm(false);
      await loadData();
      onConfigsChanged();
    } catch (err) {
      console.error('[AIConfig] Erreur ajout:', err);
      alert('Erreur lors de l\'ajout de la configuration.');
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteConfig(configId: string) {
    if (!confirm('Supprimer cette configuration IA ?')) return;
    try {
      await deleteAIConfig(configId);
      await loadData();
      onConfigsChanged();
    } catch (err) {
      console.error('[AIConfig] Erreur suppression:', err);
    }
  }

  function toggleKeyVisibility(id: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function maskKey(key: string): string {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  }

  // --- Prompt editing ---
  async function handleSavePrompt() {
    if (!editingPromptId) return;
    setPromptSaving(true);
    try {
      await updateSystemPrompt(editingPromptId, { prompt_text: editingPromptText });
      setEditingPromptId(null);
      await loadData();
    } catch (err) {
      console.error('[AIConfig] Erreur prompt:', err);
    } finally {
      setPromptSaving(false);
    }
  }

  const selectedProvider = AI_PROVIDERS.find((p) => p.key === formProvider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuration IA</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('providers')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors
              ${tab === 'providers' ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Fournisseurs
          </button>
          {isAdmin && (
            <button
              onClick={() => setTab('prompts')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors
                ${tab === 'prompts' ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Prompt système
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
            </div>
          ) : tab === 'providers' ? (
            <div className="space-y-4">
              {/* Liste des configs */}
              {configs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune configuration IA. Ajoutez-en une pour commencer.
                </p>
              ) : (
                <div className="space-y-2">
                  {configs.map((c) => {
                    const provider = AI_PROVIDERS.find((p) => p.key === c.provider_key);
                    const canDelete =
                      c.scope === 'user' ? c.user_id === userId : isAdmin;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {provider?.label ?? c.provider_key}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                              ${c.scope === 'global' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                              {c.scope === 'global' ? 'Global' : 'Personnel'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Modèle : {c.default_model ?? 'Non défini'}
                            </span>
                            <span className="text-gray-300">·</span>
                            <button
                              onClick={() => toggleKeyVisibility(c.id)}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                            >
                              {visibleKeys.has(c.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              <span className="font-mono text-[10px]">
                                {visibleKeys.has(c.id)
                                  ? c.encrypted_api_key
                                  : maskKey(c.encrypted_api_key)}
                              </span>
                            </button>
                          </div>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteConfig(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bouton/Formulaire ajout */}
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une configuration
                </button>
              ) : (
                <div className="border border-emerald-200 rounded-xl p-4 space-y-3 bg-emerald-50/30">
                  {/* Scope */}
                  {isAdmin && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Portée
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormScope('user')}
                          className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors
                            ${formScope === 'user'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          Personnel
                        </button>
                        <button
                          onClick={() => setFormScope('global')}
                          className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors
                            ${formScope === 'global'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          Global
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Provider */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Fournisseur
                    </label>
                    <select
                      value={formProvider}
                      onChange={(e) => {
                        setFormProvider(e.target.value);
                        const p = AI_PROVIDERS.find((x) => x.key === e.target.value);
                        if (p) setFormModel(p.models[0]);
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
                    >
                      {AI_PROVIDERS.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Modèle par défaut
                    </label>
                    <select
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
                    >
                      {selectedProvider?.models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Clé API
                    </label>
                    <input
                      type="password"
                      value={formApiKey}
                      onChange={(e) => setFormApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleAddProvider}
                      disabled={!formApiKey.trim() || formSaving}
                      className="flex-1 text-xs font-medium py-2 bg-emerald-600 text-white rounded-lg
                        hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                    >
                      {formSaving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setFormApiKey('');
                      }}
                      className="px-4 text-xs font-medium py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab Prompts */
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-800">
                  Le prompt marqué comme défaut est utilisé comme prompt système global pour toutes les conversations et chaque génération de JSON.
                </p>
              </div>
              {prompts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun prompt système configuré.
                </p>
              ) : (
                prompts.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                        {p.is_default && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            Défaut
                          </span>
                        )}
                      </div>
                      {editingPromptId !== p.id && (
                        <button
                          onClick={() => {
                            setEditingPromptId(p.id);
                            setEditingPromptText(p.prompt_text);
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Modifier
                        </button>
                      )}
                    </div>
                    {editingPromptId === p.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingPromptText}
                          onChange={(e) => setEditingPromptText(e.target.value)}
                          rows={6}
                          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none resize-y font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePrompt}
                            disabled={promptSaving}
                            className="text-xs font-medium px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                          >
                            {promptSaving ? 'Enregistrement…' : 'Sauvegarder'}
                          </button>
                          <button
                            onClick={() => setEditingPromptId(null)}
                            className="text-xs font-medium px-4 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4 font-mono bg-gray-50 rounded-lg p-2">
                        {p.prompt_text}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
