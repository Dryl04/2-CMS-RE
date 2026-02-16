import { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Eye, Save, Undo, Redo, ArrowLeft, CheckCircle, Plus, Trash2, Edit3, FolderOpen, Download, FileJson, FileSpreadsheet, X, Palette, Settings } from 'lucide-react';
import { PageBuilderSection, DeviceType } from '../../lib/pageBuilderTypes';
import { supabase, PageTemplate, SEOMetadata } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTheme } from '../../contexts/PageThemeContext';
import { exportTemplateAsJSON, exportTemplateAsCSV, downloadFile } from '../../lib/templateExport';
import WidgetLibrary from './WidgetLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import SEOPageViewer from '../SEOPageViewer';
import HeaderWidget from './Widgets/HeaderWidget';
import HeroWidget from './Widgets/HeroWidget';
import FeaturesWidget from './Widgets/FeaturesWidget';
import CTAWidget from './Widgets/CTAWidget';
import TestimonialsWidget from './Widgets/TestimonialsWidget';
import ContactWidget from './Widgets/ContactWidget';
import FooterWidget from './Widgets/FooterWidget';
import PricingWidget from './Widgets/PricingWidget';
import StatsWidget from './Widgets/StatsWidget';
import TeamWidget from './Widgets/TeamWidget';
import FAQWidget from './Widgets/FAQWidget';
import LogoCloudWidget from './Widgets/LogoCloudWidget';
import VideoHeroWidget from './Widgets/VideoHeroWidget';
import GalleryWidget from './Widgets/GalleryWidget';
import TimelineWidget from './Widgets/TimelineWidget';
import NewsletterWidget from './Widgets/NewsletterWidget';
import ProcessWidget from './Widgets/ProcessWidget';
import ImageTextSplitWidget from './Widgets/ImageTextSplitWidget';
import ContentShowcaseWidget from './Widgets/ContentShowcaseWidget';
import CenteredContentWidget from './Widgets/CenteredContentWidget';
import TextColumnsWidget from './Widgets/TextColumnsWidget';
import PageThemeInjector from '../PageThemeInjector';
import PageThemeEditor from '../PageThemeEditor';

interface PageBuilderProps {
  onNavigate?: (view: string) => void;
  editingPageId?: string;
  initialSections?: PageBuilderSection[];
  mode?: 'template' | 'page';
  onSavePageSections?: (sections: PageBuilderSection[]) => void;
}

type BuilderView = 'list' | 'editor';

export default function PageBuilder({
  onNavigate,
  editingPageId,
  initialSections,
  mode = 'template',
  onSavePageSections,
}: PageBuilderProps) {
  const { profile } = useAuth();
  const { pageThemes, refreshThemes } = usePageTheme();
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
  const [pageThemeId, setPageThemeId] = useState<string | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
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

  useEffect(() => {
    if (pageThemes.length > 0 && !pageThemeId) {
      setPageThemeId(pageThemes[0].id);
    }
  }, [pageThemes]);

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
      const templateData: Record<string, any> = {
        name: templateName,
        description: templateDescription || null,
        sections_data: sections,
        is_public: true,
        page_theme_id: pageThemeId,
      };

      if (editingTemplateId) {
        templateData.updated_at = new Date().toISOString();
        const { error } = await supabase
          .from('page_templates')
          .update(templateData)
          .eq('id', editingTemplateId);
        if (error) throw error;
      } else {
        if (profile?.id) {
          templateData.created_by = profile.id;
        }
        const { error } = await supabase
          .from('page_templates')
          .insert(templateData);
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
      onSavePageSections(sections);
    }
  };

  const editTemplate = (template: PageTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setSelectedThemeId((template as any).theme_id || null);
    const loadedSections = (template.sections_data || []) as PageBuilderSection[];
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

  const resetEditor = () => {
    setEditingTemplateId(null);
    setTemplateName('Nouveau modele');
    setTemplateDescription('');
    setPageThemeId(pageThemes.length > 0 ? pageThemes[0].id : null);
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

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

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
                const sectionCount = (template.sections_data || []).length;
                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden rounded-t-2xl">
                      <TemplateThumbnail sections={(template.sections_data || []) as PageBuilderSection[]} />
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
                                <span>JSON</span>
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
                    sections_data: previewTemplate.sections_data,
                    created_at: previewTemplate.created_at,
                    updated_at: previewTemplate.updated_at,
                  } as SEOMetadata}
                  onEdit={() => {}}
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

          {pageThemes.length > 0 && (
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              <Palette className="w-4 h-4 text-blue-500" />
              <select
                value={pageThemeId || ''}
                onChange={(e) => setPageThemeId(e.target.value || null)}
                className="text-xs bg-blue-50 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Thème typographique"
              >
                {pageThemes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setShowThemeEditor(true);
                }}
                className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                title="Gérer les thèmes"
              >
                <Settings className="w-4 h-4 text-blue-500" />
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
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm ${
              showPreview ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
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
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <PageThemeInjector themeId={pageThemeId} />
          <div
            className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 page-themed"
            style={{ width: getDeviceWidth(), maxWidth: '100%' }}
          >
            {sections.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Aucune section a previsualiser</div>
            ) : (
              sections.map((section) => {
                const noop = () => {};
                const widgetProps = { section, onUpdate: noop };
                const renderWidget = () => {
                  switch (section.type) {
                    case 'header': return <HeaderWidget {...widgetProps} />;
                    case 'hero': return <HeroWidget {...widgetProps} />;
                    case 'features': return <FeaturesWidget {...widgetProps} />;
                    case 'cta': return <CTAWidget {...widgetProps} />;
                    case 'testimonials': return <TestimonialsWidget {...widgetProps} />;
                    case 'contact': return <ContactWidget {...widgetProps} />;
                    case 'footer': return <FooterWidget {...widgetProps} />;
                    case 'pricing': return <PricingWidget {...widgetProps} />;
                    case 'stats': return <StatsWidget {...widgetProps} />;
                    case 'team': return <TeamWidget {...widgetProps} />;
                    case 'faq': return <FAQWidget {...widgetProps} />;
                    case 'logocloud': return <LogoCloudWidget {...widgetProps} />;
                    case 'videohero': return <VideoHeroWidget {...widgetProps} />;
                    case 'gallery': return <GalleryWidget {...widgetProps} />;
                    case 'timeline': return <TimelineWidget {...widgetProps} />;
                    case 'newsletter': return <NewsletterWidget {...widgetProps} />;
                    case 'process': return <ProcessWidget {...widgetProps} />;
                    case 'image-text-split': return <ImageTextSplitWidget {...widgetProps} />;
                    case 'content-showcase': return <ContentShowcaseWidget {...widgetProps} />;
                    case 'centered-content': return <CenteredContentWidget {...widgetProps} />;
                    case 'text-columns': return <TextColumnsWidget {...widgetProps} />;
                    default: return null;
                  }
                };
                return (
                  <div
                    key={section.id}
                    style={{
                      backgroundColor: section.design.background.type === 'color' ? section.design.background.value : undefined,
                      paddingTop: section.design.spacing.paddingTop,
                      paddingBottom: section.design.spacing.paddingBottom,
                    }}
                  >
                    {renderWidget()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
<div className="flex flex-1 overflow-hidden">
  <PageThemeInjector themeId={pageThemeId} />
  <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
    <WidgetLibrary onAddSection={addSection} existingSections={sections} />
  </div>

          <div className="flex-1 overflow-auto bg-gray-100 p-6 custom-scrollbar">
            <div
              className="mx-auto transition-all duration-300 page-themed"
              style={{ width: getDeviceWidth(), maxWidth: '100%' }}
            >
              <Canvas
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
                onDuplicateSection={duplicateSection}
                onReorder={reorderSections}
              />
            </div>
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

      {showThemeEditor && (
        <PageThemeEditor
          onClose={() => {
            setShowThemeEditor(false);
            refreshThemes();
          }}
        />
      )}
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
        const bg = section.design.background.type === 'color' ? section.design.background.value : '#f9fafb';
        const isDark = bg === '#000000' || bg === '#1a1a1a';
        return (
          <div
            key={i}
            className="flex-1 rounded-md flex items-center justify-center min-h-0 overflow-hidden"
            style={{ backgroundColor: bg }}
          >
            <span className={`text-[9px] font-medium truncate px-2 ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
              {section.type}
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
