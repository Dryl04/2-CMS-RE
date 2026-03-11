import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { ArrowLeft, Save, Plus, Trash2, Pencil as Edit3, Check, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, LayoutGrid as Layout, FileText, X, Layers } from 'lucide-react';
import { supabase, SEOMetadata } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  GlobalHFSetting,
  loadAllGlobalHFSettings,
} from '@/lib/globalHFSettings';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';

interface GlobalHFManagerProps {
  onNavigate: (view: string) => void;
  onOpenHFBuilder: (
    type: 'header' | 'footer',
    initialSection: PageBuilderSection | null,
    onDone: (section: PageBuilderSection | null) => void
  ) => void;
}

export default function GlobalHFManager({ onNavigate, onOpenHFBuilder }: GlobalHFManagerProps) {
  const modal = useModal();
  const { profile } = useAuth();
  const [settings, setSettings] = useState<GlobalHFSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pages, setPages] = useState<SEOMetadata[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingLabel, setEditingLabel] = useState('');
  const [editingApplyOnImport, setEditingApplyOnImport] = useState(false);
  const [editingApplyOnCreate, setEditingApplyOnCreate] = useState(false);
  const [editingTargetPageIds, setEditingTargetPageIds] = useState<string[]>([]);
  const [editingHeader, setEditingHeader] = useState<PageBuilderSection | null>(null);
  const [editingFooter, setEditingFooter] = useState<PageBuilderSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const showToast = useCallback((text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, pagesResult] = await Promise.all([
        loadAllGlobalHFSettings(),
        supabase
          .from('seo_metadata')
          .select('id, page_key, title, status')
          .order('title', { ascending: true }),
      ]);
      setSettings(settingsData);
      setPages((pagesResult.data || []) as SEOMetadata[]);
    } catch (error) {
      console.error('[GlobalHFManager] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetEditingState = () => {
    setEditingLabel('');
    setEditingApplyOnImport(false);
    setEditingApplyOnCreate(false);
    setEditingTargetPageIds([]);
    setEditingHeader(null);
    setEditingFooter(null);
    setIsCreating(false);
    setEditingSettingId(null);
    setShowPageSelector(false);
  };

  const startCreate = () => {
    resetEditingState();
    setEditingLabel('Configuration globale');
    setIsCreating(true);
    setExpandedId(null);
  };

  const startEdit = (setting: GlobalHFSetting) => {
    setEditingSettingId(setting.id);
    setEditingLabel(setting.label);
    setEditingApplyOnImport(setting.apply_on_import);
    setEditingApplyOnCreate(setting.apply_on_create);
    setEditingTargetPageIds(setting.target_page_ids || []);
    setEditingHeader(setting.header_section);
    setEditingFooter(setting.footer_section);
    setIsCreating(false);
    setExpandedId(setting.id);
    setShowPageSelector(false);
  };

  const handleSave = async () => {
    if (!editingLabel.trim()) {
      showToast('Le nom est requis');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        label: editingLabel.trim(),
        header_section: editingHeader,
        footer_section: editingFooter,
        apply_on_import: editingApplyOnImport,
        apply_on_create: editingApplyOnCreate,
        target_page_ids: editingTargetPageIds.length > 0 ? editingTargetPageIds : null,
        updated_at: new Date().toISOString(),
      };

      if (editingSettingId) {
        const { error } = await supabase
          .from('global_hf_settings')
          .update(payload)
          .eq('id', editingSettingId);
        if (error) throw error;
        showToast('Configuration mise a jour');
      } else {
        payload.created_by = profile?.id || null;
        payload.is_active = true;
        const { error } = await supabase
          .from('global_hf_settings')
          .insert(payload);
        if (error) throw error;
        showToast('Configuration creee');
      }

      resetEditingState();
      await loadData();
    } catch (error) {
      console.error('[GlobalHFManager] Error saving:', error);
      showToast('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (setting: GlobalHFSetting) => {
    try {
      const { error } = await supabase
        .from('global_hf_settings')
        .update({ is_active: !setting.is_active, updated_at: new Date().toISOString() })
        .eq('id', setting.id);
      if (error) throw error;
      showToast(setting.is_active ? 'Configuration desactivee' : 'Configuration activee');
      await loadData();
    } catch (error) {
      console.error('[GlobalHFManager] Error toggling:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await modal.confirm('Supprimer cette configuration ?', 'Supprimer la configuration')) return;
    try {
      const { error } = await supabase
        .from('global_hf_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Configuration supprimee');
      if (editingSettingId === id) resetEditingState();
      await loadData();
    } catch (error) {
      console.error('[GlobalHFManager] Error deleting:', error);
    }
  };

  const togglePageId = (pageId: string) => {
    setEditingTargetPageIds(prev =>
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  const selectAllPages = () => {
    setEditingTargetPageIds(pages.map(p => p.id));
  };

  const deselectAllPages = () => {
    setEditingTargetPageIds([]);
  };

  const getHeaderLabel = (section: PageBuilderSection | null): string => {
    if (!section) return 'Aucun';
    const variant = section.variant && section.variant !== 'default' ? ` (${section.variant})` : '';
    return `${section.type}${variant}`;
  };

  const isEditing = isCreating || editingSettingId !== null;

  const renderEditor = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {isCreating ? 'Nouvelle configuration' : 'Modifier la configuration'}
        </h3>
        <button
          onClick={resetEditingState}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            value={editingLabel}
            onChange={(e) => setEditingLabel(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Ex: Header/Footer principal"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Header global</h4>
              {editingHeader && (
                <button
                  onClick={() => setEditingHeader(null)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Retirer
                </button>
              )}
            </div>
            {editingHeader ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {getHeaderLabel(editingHeader)}
                    </span>
                  </div>
                  {editingHeader.content?.logoText && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Logo: {editingHeader.content.logoText}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    onOpenHFBuilder('header', editingHeader, (section) => {
                      setEditingHeader(section);
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Personnaliser le header</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenHFBuilder('header', null, (section) => {
                    setEditingHeader(section);
                  });
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Configurer un header</span>
              </button>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Footer global</h4>
              {editingFooter && (
                <button
                  onClick={() => setEditingFooter(null)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Retirer
                </button>
              )}
            </div>
            {editingFooter ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {getHeaderLabel(editingFooter)}
                    </span>
                  </div>
                  {editingFooter.content?.logoText && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Logo: {editingFooter.content.logoText}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    onOpenHFBuilder('footer', editingFooter, (section) => {
                      setEditingFooter(section);
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Personnaliser le footer</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenHFBuilder('footer', null, (section) => {
                    setEditingFooter(section);
                  });
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Configurer un footer</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Options d'application</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setEditingApplyOnCreate(!editingApplyOnCreate)}
                className="flex-shrink-0"
              >
                {editingApplyOnCreate ? (
                  <ToggleRight className="w-8 h-5 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-8 h-5 text-gray-400 group-hover:text-gray-500" />
                )}
              </button>
              <div>
                <span className="text-sm font-medium text-gray-900">Appliquer aux nouvelles pages creees</span>
                <p className="text-xs text-gray-500">Le header/footer sera automatiquement insere lors de la creation manuelle</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setEditingApplyOnImport(!editingApplyOnImport)}
                className="flex-shrink-0"
              >
                {editingApplyOnImport ? (
                  <ToggleRight className="w-8 h-5 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-8 h-5 text-gray-400 group-hover:text-gray-500" />
                )}
              </button>
              <div>
                <span className="text-sm font-medium text-gray-900">Appliquer aux pages importees</span>
                <p className="text-xs text-gray-500">Le header/footer sera automatiquement insere lors de l'importation</p>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Appliquer aux pages existantes</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Le header/footer global remplacera celui de ces pages a l'affichage
              </p>
            </div>
            <button
              onClick={() => setShowPageSelector(!showPageSelector)}
              className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <span>{editingTargetPageIds.length} page(s)</span>
              {showPageSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showPageSelector && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-600">
                  {editingTargetPageIds.length}/{pages.length} selectionnee(s)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllPages}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Tout selectionner
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={deselectAllPages}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Tout deselectionner
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {pages.map((page) => {
                  const isSelected = editingTargetPageIds.includes(page.id);
                  return (
                    <button
                      key={page.id}
                      onClick={() => togglePageId(page.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                        <p className="text-xs text-gray-500 font-mono">/{page.page_key}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${page.status === 'published' ? 'bg-emerald-100 text-emerald-700' : page.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                        {page.status === 'published' ? 'Publie' : page.status === 'draft' ? 'Brouillon' : 'Archive'}
                      </span>
                    </button>
                  );
                })}
                {pages.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    Aucune page disponible
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={resetEditingState}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !editingLabel.trim()}
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingCard = (setting: GlobalHFSetting) => {
    const isExpanded = expandedId === setting.id && !isEditing;
    const pageCount = setting.target_page_ids?.length || 0;
    const targetPages = pages.filter(p => setting.target_page_ids?.includes(p.id));

    return (
      <div
        key={setting.id}
        className={`bg-white rounded-2xl border transition-all ${setting.is_active ? 'border-blue-200 shadow-sm' : 'border-gray-200 opacity-75'}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-base font-bold text-gray-900 truncate">{setting.label}</h3>
                {setting.is_active && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                    Actif
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {setting.header_section && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <Layout className="w-3 h-3" />
                    <span>Header: {setting.header_section.type}</span>
                  </span>
                )}
                {setting.footer_section && (
                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <Layout className="w-3 h-3" />
                    <span>Footer: {setting.footer_section.type}</span>
                  </span>
                )}
                {!setting.header_section && !setting.footer_section && (
                  <span className="text-xs text-gray-400">Aucun header/footer configure</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {setting.apply_on_create && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                    Nouvelles pages
                  </span>
                )}
                {setting.apply_on_import && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                    Importation
                  </span>
                )}
                {pageCount > 0 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {pageCount} page(s) ciblees
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
              <button
                onClick={() => toggleActive(setting)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={setting.is_active ? 'Desactiver' : 'Activer'}
              >
                {setting.is_active ? (
                  <ToggleRight className="w-5 h-5 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => startEdit(setting)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(setting.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
              <button
                onClick={() => setExpandedId(isExpanded ? null : setting.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-5 pt-0 border-t border-gray-100 mt-0">
            <div className="pt-4 space-y-3">
              {pageCount > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Pages ciblees</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {targetPages.slice(0, 10).map(p => (
                      <span key={p.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-lg text-xs text-blue-700">
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{p.title}</span>
                      </span>
                    ))}
                    {targetPages.length > 10 && (
                      <span className="text-xs text-gray-400 self-center">+{targetPages.length - 10} autres</span>
                    )}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Cree le {new Date(setting.created_at).toLocaleDateString('fr-FR')}
                {' - '}Modifie le {new Date(setting.updated_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au tableau de bord</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Header & Footer global</h1>
            <p className="text-gray-500 text-sm">Definissez un header et footer centralise pour vos pages</p>
          </div>
          {!isEditing && (
            <button
              onClick={startCreate}
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle configuration</span>
            </button>
          )}
        </div>
      </div>

      {isEditing && renderEditor()}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
        </div>
      ) : settings.length === 0 && !isEditing ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune configuration</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Creez une configuration globale pour imposer un header et/ou footer uniforme a vos pages
          </p>
          <button
            onClick={startCreate}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Creer une configuration
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map(renderSettingCard)}
        </div>
      )}
    </div>
  );
}
