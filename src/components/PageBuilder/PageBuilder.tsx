import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, Eye, Save, Undo, Redo, ArrowLeft, CheckCircle, Plus, Trash2, Edit3, FolderOpen, Download, FileJson, FileSpreadsheet, X, Palette, Settings, Copy } from 'lucide-react';
import { PageBuilderSection, DeviceType } from '../../lib/pageBuilderTypes';
import { supabase, PageTemplate, SEOMetadata } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDaisyTheme } from '../../contexts/DaisyThemeContext';
import { exportTemplateAsJSON, exportTemplateAsCSV, downloadFile } from '../../lib/templateExport';
import { generateCustomThemeCSS, getThemeInlineVars, type DaisyThemeTokens } from '../../lib/daisyThemes';
import { savePreviewData } from './BuilderPreviewPage';
import WidgetLibrary from './WidgetLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import SEOPageViewer from '../SEOPageViewer';
import DaisyThemeManager from '../DaisyThemeManager';
import { normalizeSectionForTheme } from '../../lib/widgetThemeHelper';

interface PageBuilderProps {
  onNavigate?: (view: string) => void;
  editingPageId?: string;
  initialSections?: PageBuilderSection[];
  mode?: 'template' | 'page';
  onSavePageSections?: (sections: PageBuilderSection[]) => void;
}

type BuilderView = 'list' | 'editor';

function isMissingDaisyThemeSlugColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  return e.code === 'PGRST204' && (e.message || '').includes('daisy_theme_slug');
}

function normalizeSectionsData(raw: unknown): PageBuilderSection[] {
  if (Array.isArray(raw)) {
    return raw as PageBuilderSection[];
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizeSectionsData(parsed);
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

const DEVICE_VIEWPORT_WIDTHS: Record<DeviceType, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 375,
};

export default function PageBuilder({
  onNavigate,
  editingPageId,
  initialSections,
  mode = 'template',
  onSavePageSections,
}: PageBuilderProps) {
  const { profile } = useAuth();
  const { themes: daisyThemes } = useDaisyTheme();
  const [builderView, setBuilderView] = useState<BuilderView>(editingPageId ? 'editor' : 'list');
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);

  const [sections, setSections] = useState<PageBuilderSection[]>(initialSections || []);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [templateName, setTemplateName] = useState('Nouveau modele');
  const [templateDescription, setTemplateDescription] = useState('');
  const [daisyThemeSlug, setDaisyThemeSlug] = useState<string | null>(null);
  const [showDaisyThemeManager, setShowDaisyThemeManager] = useState(false);
  const [history, setHistory] = useState<PageBuilderSection[][]>([initialSections || []]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedSection = sections.find(s => s.id === selectedSectionId) || null;

  useEffect(() => {
    if (mode === 'template') {
      loadTemplates();
    }
  }, [mode]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addSection = (section: PageBuilderSection) => {
    const newSections = [...sections, section];
    setSections(newSections);
    setSelectedSectionId(section.id);
    addToHistory(newSections);
  };

  const updateSection = (id: string, updates: Partial<PageBuilderSection>) => {
    const newSections = sections.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    setSections(newSections);
    addToHistory(newSections);
  };

  const deleteSection = (id: string) => {
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    setSelectedSectionId(null);
    addToHistory(newSections);
  };

  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    const duplicate: PageBuilderSection = {
      ...section,
      id: `section-${Date.now()}`,
      order: sections.length,
    };
    const newSections = [...sections, duplicate];
    setSections(newSections);
    addToHistory(newSections);
  };

  const reorderSections = (oldIndex: number, newIndex: number) => {
    const newSections = [...sections];
    const [removed] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, removed);
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
    addToHistory(reordered);
  };

  const addToHistory = (newSections: PageBuilderSection[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSections(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSections(history[newIndex]);
    }
  };

  const saveTemplate = async () => {
    if (sections.length === 0) {
      showToast('Ajoutez au moins une section');
      return;
    }
    if (!templateName.trim()) {
      showToast('Le nom du modele est requis');
      return;
    }

    setSaving(true);
    try {
      const normalizedSections = sections.map((section) => normalizeSectionForTheme(section));

      const templateData: Record<string, any> = {
        name: templateName,
        description: templateDescription || null,
        sections_data: normalizedSections,
        is_public: true,
      };

      const templateDataWithTheme: Record<string, any> = {
        ...templateData,
        daisy_theme_slug: daisyThemeSlug,
      };

      if (editingTemplateId) {
        templateData.updated_at = new Date().toISOString();
        templateDataWithTheme.updated_at = templateData.updated_at;

        let { error } = await supabase
          .from('page_templates')
          .update(templateDataWithTheme)
          .eq('id', editingTemplateId);

        if (error && isMissingDaisyThemeSlugColumnError(error)) {
          const retry = await supabase
            .from('page_templates')
            .update(templateData)
            .eq('id', editingTemplateId);
          error = retry.error;
        }

        if (error) throw error;
      } else {
        if (profile?.id) {
          templateData.created_by = profile.id;
          templateDataWithTheme.created_by = profile.id;
        }

        let { error } = await supabase
          .from('page_templates')
          .insert(templateDataWithTheme);

        if (error && isMissingDaisyThemeSlugColumnError(error)) {
          const retry = await supabase
            .from('page_templates')
            .insert(templateData);
          error = retry.error;
        }

        if (error) throw error;
      }

      showToast('Modele enregistre');
      await loadTemplates();
      setBuilderView('list');
      resetEditor();
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const savePageSections = () => {
    if (onSavePageSections) {
      onSavePageSections(sections.map((section) => normalizeSectionForTheme(section)));
    }
  };

  const editTemplate = (template: PageTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setDaisyThemeSlug(template.daisy_theme_slug || null);
    const loadedSections = normalizeSectionsData(template.sections_data);
    setSections(loadedSections);
    setHistory([loadedSections]);
    setHistoryIndex(0);
    setSelectedSectionId(null);
    setShowPreview(false);
    setBuilderView('editor');
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Supprimer ce modele ?')) return;
    try {
      const { error } = await supabase
        .from('page_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Modele supprime');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Erreur lors de la suppression');
    }
  };

  const duplicateTemplate = async (template: PageTemplate) => {
    try {
      const duplicateData: Record<string, any> = {
        name: `${template.name} (copie)`,
        description: template.description || null,
        sections_data: template.sections_data,
        is_public: template.is_public ?? true,
        daisy_theme_slug: template.daisy_theme_slug || null,
      };
      if (profile?.id) {
        duplicateData.created_by = profile.id;
      }
      const { error } = await supabase.from('page_templates').insert(duplicateData);
      if (error) throw error;
      showToast('Modele duplique');
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      showToast('Erreur lors de la duplication');
    }
  };

  const resetEditor = () => {
    setEditingTemplateId(null);
    setTemplateName('Nouveau modele');
    setTemplateDescription('');
    setDaisyThemeSlug(null);
    setSections([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedSectionId(null);
    setShowPreview(false);
  };

  const startNewTemplate = () => {
    resetEditor();
    setBuilderView('editor');
  };

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const editorResponsiveIframeRef = useRef<HTMLIFrameElement>(null);

  const buildPreviewPayload = useCallback(() => {
    const normalizedSections = sections.map((section) => normalizeSectionForTheme(section));
    const customThemesCSS = daisyThemes
      .filter(t => t.source === 'custom')
      .map(t => generateCustomThemeCSS(t.slug, t.tokens, t.font_config))
      .join('\n\n');
    const themeTokens = daisyThemeSlug
      ? daisyThemes.find(t => t.slug === daisyThemeSlug)?.tokens
      : undefined;
    return { sections: normalizedSections, daisyThemeSlug, customThemesCSS, themeTokens };
  }, [sections, daisyThemeSlug, daisyThemes]);

  const postPreviewPayload = useCallback((targetWindow: Window | null, payload: ReturnType<typeof buildPreviewPayload>) => {
    if (!targetWindow) return;
    const delays = [0, 80, 220, 500];
    delays.forEach((delay) => {
      window.setTimeout(() => {
        targetWindow.postMessage(
          { type: 'BUILDER_PREVIEW_UPDATE', payload },
          '*'
        );
      }, delay);
    });
  }, []);

  useEffect(() => {
    const shouldSyncPreview = showPreview;
    const shouldSyncEditorResponsive = !showPreview && device !== 'desktop';
    if (!shouldSyncPreview && !shouldSyncEditorResponsive) return;

    const payload = buildPreviewPayload();
    savePreviewData(payload);

    if (shouldSyncPreview && previewIframeRef.current?.contentWindow) {
      postPreviewPayload(previewIframeRef.current.contentWindow, payload);
    }

    if (shouldSyncEditorResponsive && editorResponsiveIframeRef.current?.contentWindow) {
      postPreviewPayload(editorResponsiveIframeRef.current.contentWindow, payload);
    }
  }, [showPreview, device, buildPreviewPayload, postPreviewPayload]);

  const renderTemplateListView = () => (
    <div className="flex flex-col flex-1">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Modeles de pages</h1>
            <p className="text-gray-500 text-sm">Creez des modeles reutilisables pour vos pages</p>
          </div>
          <button
            onClick={startNewTemplate}
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau modele</span>
          </button>
        </div>

        {loadingTemplates ? (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun modele</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Creez votre premier modele de page avec le builder visuel drag & drop
            </p>
            <button
              onClick={startNewTemplate}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Creer un modele
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const templateSections = normalizeSectionsData(template.sections_data);
              const sectionCount = templateSections.length;
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden rounded-t-2xl">
                    <TemplateThumbnail sections={templateSections} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {sectionCount} section{sectionCount > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="relative group/export">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Exporter"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-[100] w-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const json = exportTemplateAsJSON(template);
                                downloadFile(json, `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`, 'application/json');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <FileJson className="w-4 h-4 text-blue-500" />
                              <span>JSON ultra-compact</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const csv = exportTemplateAsCSV(template);
                                downloadFile(csv, `${template.name.toLowerCase().replace(/\s+/g, '-')}.csv`, 'text/csv');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-green-500" />
                              <span>CSV</span>
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Previsualiser"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editTemplate(template);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'template' && builderView === 'list') {
    return (
      <>
        {renderTemplateListView()}

        {previewTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h2>
                  {previewTemplate.description && (
                    <p className="text-sm text-gray-500">{previewTemplate.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <SEOPageViewer
                  page={{
                    id: previewTemplate.id,
                    page_key: previewTemplate.name,
                    title: previewTemplate.name,
                    description: previewTemplate.description,
                    status: 'published',
                    sections_data: normalizeSectionsData(previewTemplate.sections_data),
                    daisy_theme_slug: previewTemplate.daisy_theme_slug || null,
                    created_at: previewTemplate.created_at,
                    updated_at: previewTemplate.updated_at,
                  } as SEOMetadata}
                  onEdit={() => { }}
                  onBack={() => setPreviewTemplate(null)}
                  isPublic={true}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (mode === 'template') {
                setBuilderView('list');
                resetEditor();
              } else {
                onNavigate?.('pages');
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col space-y-1">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-sm font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-black rounded px-2 py-0.5"
              placeholder={mode === 'template' ? 'Nom du modele' : 'Nom de la page'}
            />
            {mode === 'template' && (
              <input
                type="text"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="text-xs text-gray-500 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-2 py-0.5"
                placeholder="Description du modele (optionnel)"
              />
            )}
          </div>

          {daisyThemes.length > 0 && (
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              <Palette className="w-4 h-4 text-primary" />
              <select
                value={daisyThemeSlug || ''}
                onChange={(e) => setDaisyThemeSlug(e.target.value || null)}
                className="text-xs bg-base-200 border border-base-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Thème (couleurs et polices)"
              >
                <option value="">Hérité (global)</option>
                {daisyThemes.map(theme => (
                  <option key={theme.id} value={theme.slug}>
                    {theme.name} {theme.source === 'custom' ? '(personnalisé)' : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowDaisyThemeManager(true)}
                className="p-1.5 hover:bg-base-300 rounded transition-colors"
                title="Gestionnaire de thèmes"
              >
                <Settings className="w-4 h-4 text-primary" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded ${device === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded ${device === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              title="Tablette"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded ${device === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"
            title="Annuler"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30"
            title="Retablir"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200" />

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm ${showPreview ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
              }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Apercu</span>
          </button>

          <button
            onClick={mode === 'template' ? saveTemplate : savePageSections}
            disabled={saving || sections.length === 0}
            className="flex items-center space-x-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {showPreview ? (
        <div ref={previewContainerRef} className="flex-1 overflow-hidden bg-gray-200 flex flex-col items-center py-6 px-4">
          {sections.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Aucune section à prévisualiser
            </div>
          ) : (
            <div
              className="flex-1 w-full flex flex-col items-center"
              style={{ maxWidth: DEVICE_VIEWPORT_WIDTHS[device] ? `${DEVICE_VIEWPORT_WIDTHS[device]}px` : '100%' }}
            >
              {DEVICE_VIEWPORT_WIDTHS[device] && (
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium">
                  {device === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                  {device === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                  <span>{DEVICE_VIEWPORT_WIDTHS[device]}px</span>
                </div>
              )}
              <iframe
                ref={previewIframeRef}
                src="/__preview"
                title="Aperçu"
                className="w-full bg-white rounded-lg shadow-xl border border-gray-300"
                style={{
                  height: '100%',
                  minHeight: '600px',
                  display: 'block',
                }}
                onLoad={() => {
                  const payload = buildPreviewPayload();
                  if (previewIframeRef.current?.contentWindow) {
                    postPreviewPayload(previewIframeRef.current.contentWindow, payload);
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            <WidgetLibrary onAddSection={addSection} existingSections={sections} />
          </div>

          <div ref={editorContainerRef} className="flex-1 overflow-auto bg-gray-100 p-6 custom-scrollbar">
            {device === 'desktop' ? (
              <CanvasWrapper
                device={device}
                daisyThemeSlug={daisyThemeSlug}
                themeTokens={daisyThemes.find(t => t.slug === daisyThemeSlug)?.tokens}
              >
                <Canvas
                  sections={sections}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={setSelectedSectionId}
                  onUpdateSection={updateSection}
                  onDeleteSection={deleteSection}
                  onDuplicateSection={duplicateSection}
                  onReorder={reorderSections}
                  canvasThemeSlug={daisyThemeSlug}
                />
              </CanvasWrapper>
            ) : (
              <div className="h-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium">
                  {device === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                  {device === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
                  <span>{DEVICE_VIEWPORT_WIDTHS[device]}px • rendu responsive live</span>
                </div>
                <div
                  className="w-full flex-1"
                  style={{ maxWidth: DEVICE_VIEWPORT_WIDTHS[device] ? `${DEVICE_VIEWPORT_WIDTHS[device]}px` : '100%' }}
                >
                  <iframe
                    key={`editor-responsive-${device}`}
                    ref={editorResponsiveIframeRef}
                    src="/__preview"
                    title="Rendu responsive éditeur"
                    className="w-full bg-white rounded-lg shadow-xl border border-gray-300"
                    style={{
                      height: '100%',
                      minHeight: '600px',
                      display: 'block',
                    }}
                    onLoad={() => {
                      const payload = buildPreviewPayload();
                      savePreviewData(payload);
                      if (editorResponsiveIframeRef.current?.contentWindow) {
                        postPreviewPayload(editorResponsiveIframeRef.current.contentWindow, payload);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <PropertiesPanel
              section={selectedSection}
              onUpdateSection={(updates) => {
                if (selectedSectionId) {
                  updateSection(selectedSectionId, updates);
                }
              }}
            />
          </div>
        </div>
      )}

      {showDaisyThemeManager && (
        <DaisyThemeManager
          onClose={() => setShowDaisyThemeManager(false)}
        />
      )}
    </div>
  );
}

function CanvasWrapper({
  device,
  daisyThemeSlug,
  themeTokens,
  children,
}: {
  device: DeviceType;
  daisyThemeSlug: string | null;
  themeTokens?: DaisyThemeTokens;
  children: React.ReactNode;
}) {
  const themeVars = themeTokens ? getThemeInlineVars(themeTokens) : {};
  return (
    <div
      className="mx-auto page-themed bg-base-100 text-base-content"
      style={{
        width: DEVICE_VIEWPORT_WIDTHS[device] ? `${DEVICE_VIEWPORT_WIDTHS[device]}px` : '100%',
        maxWidth: '100%',
        ...themeVars,
      }}
      data-theme={daisyThemeSlug || 'light'}
      data-canvas-device={device !== 'desktop' ? device : undefined}
    >
      {children}
    </div>
  );
}

function TemplateThumbnail({ sections }: { sections: PageBuilderSection[] }) {
  if (sections.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        <FolderOpen className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 flex flex-col gap-1.5 pointer-events-none">
      {sections.slice(0, 4).map((section, i) => {
        const normalizedSection = normalizeSectionForTheme(section);
        const bg = normalizedSection.design.background.type === 'color' ? normalizedSection.design.background.value : '#f9fafb';
        const isDark = bg === '#000000' || bg === '#1a1a1a';
        return (
          <div
            key={i}
            className="flex-1 rounded-md flex items-center justify-center min-h-0 overflow-hidden"
            style={{ backgroundColor: bg }}
          >
            <span className={`text-[9px] font-medium truncate px-2 ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
              {normalizedSection.type}
            </span>
          </div>
        );
      })}
      {sections.length > 4 && (
        <div className="text-[9px] text-gray-400 text-center">+{sections.length - 4}</div>
      )}
    </div>
  );
}
