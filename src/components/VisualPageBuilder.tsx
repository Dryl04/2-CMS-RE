import { useState } from 'react';
import { Plus, Eye, Save, ArrowLeft, Sparkles, X, Check } from 'lucide-react';
import { widgetLibrary } from '../lib/widgetLibrary';
import { PageBuilderSection } from '../lib/pageBuilderTypes';
import { supabase } from '../lib/supabase';
import SectionRenderer from './PageBuilder/SectionRenderer';

interface VisualPageBuilderProps {
  onClose?: () => void;
}

export default function VisualPageBuilder({ onClose }: VisualPageBuilderProps) {
  const [selectedSections, setSelectedSections] = useState<PageBuilderSection[]>([]);
  const [pageName, setPageName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tous les widgets' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'content', label: 'Contenu' },
  ];

  const allWidgetVariants = widgetLibrary.flatMap((widget) =>
    widget.variants.map((variant, index) => ({
      widget,
      variant,
      id: `${widget.type}-${variant.id}`,
      number: widgetLibrary.indexOf(widget) * 10 + index + 1,
    }))
  );

  const filteredVariants = selectedCategory === 'all'
    ? allWidgetVariants
    : allWidgetVariants.filter(wv => wv.widget.category === selectedCategory || !wv.widget.category);

  const addSection = (widget: typeof widgetLibrary[0], variantId: string) => {
    const newSection: PageBuilderSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      type: widget.type,
      variant: variantId,
      order: selectedSections.length,
      content: { ...widget.defaultContent },
      design: {
        ...widget.defaultDesign,
        typography: {
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          headingColor: '#111827',
          textColor: '#4B5563',
          ...(widget.defaultDesign.typography || {}),
        },
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          buttonBackground: '#000000',
          buttonText: '#ffffff',
          buttonBackgroundHover: '#1F2937',
          ...(widget.defaultDesign.colors || {}),
        },
      },
      advanced: {
        cssClasses: [],
        customCSS: '',
        animations: {},
        visibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
    };

    if (widget.unique && selectedSections.some(s => s.type === widget.type)) {
      alert('Ce widget ne peut être ajouté qu\'une seule fois');
      return;
    }

    setSelectedSections([...selectedSections, newSection]);
  };

  const removeSection = (id: string) => {
    setSelectedSections(selectedSections.filter(s => s.id !== id));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const savePage = async () => {
    if (!pageName.trim()) {
      alert('Veuillez remplir le nom de la page');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Vous devez être connecté');
        return;
      }

      const finalSlug = pageSlug.trim() || generateSlug(pageName);

      const { data: template, error: templateError } = await supabase
        .from('page_templates')
        .insert({
          name: pageName,
          slug: finalSlug,
          user_id: user.id,
          is_published: true,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      const sectionsToInsert = selectedSections.map((section, index) => ({
        template_id: template.id,
        section_type: section.type,
        section_variant: section.variant,
        section_order: index,
        section_data: section.content,
        design_settings: section.design,
        advanced_settings: section.advanced,
      }));

      const { error: sectionsError } = await supabase
        .from('page_content_sections')
        .insert(sectionsToInsert);

      if (sectionsError) throw sectionsError;

      alert('Page créée avec succès!');
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error saving page:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const createPreviewSection = (widget: typeof widgetLibrary[0], variantId: string): PageBuilderSection => ({
    id: `preview-${widget.type}-${variantId}`,
    type: widget.type,
    variant: variantId,
    order: 0,
    content: { ...widget.defaultContent },
    design: {
      ...widget.defaultDesign,
      typography: {
        fontFamily: 'inherit',
        fontSize: '1rem',
        lineHeight: '1.5',
        headingColor: '#111827',
        textColor: '#4B5563',
        ...(widget.defaultDesign.typography || {}),
      },
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        buttonBackground: '#000000',
        buttonText: '#ffffff',
        buttonBackgroundHover: '#1F2937',
        ...(widget.defaultDesign.colors || {}),
      },
    },
    advanced: {
      cssClasses: [],
      customCSS: '',
      animations: {},
      visibility: {
        desktop: true,
        tablet: true,
        mobile: true,
      },
    },
  });

  if (showPreview) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour à l'éditeur</span>
            </button>
            <h1 className="text-xl font-bold">Aperçu de la page</h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedSections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isSelected={false}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>
    );
  }

  const isAdded = (widgetType: string, variantId: string) => {
    return selectedSections.some(s => s.type === widgetType && s.variant === variantId);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Galerie de Sections</h1>
                <p className="text-sm text-gray-600">Cliquez sur une section pour l'ajouter à votre page</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedSections.length > 0 && (
                <>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Aperçu</span>
                  </button>
                  <button
                    onClick={savePage}
                    disabled={saving || !pageName.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              value={pageName}
              onChange={(e) => {
                const name = e.target.value;
                setPageName(name);
                if (!pageSlug || pageSlug === generateSlug(pageName)) {
                  setPageSlug(generateSlug(name));
                }
              }}
              placeholder="Nom de la page"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <input
              type="text"
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="slug-de-la-page (généré automatiquement)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {selectedSections.length > 0 && (
              <div className="ml-auto flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <span className="font-medium">{selectedSections.length} section{selectedSections.length > 1 ? 's' : ''} sélectionnée{selectedSections.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariants.map((wv) => {
            const section = createPreviewSection(wv.widget, wv.variant.id);
            const added = isAdded(wv.widget.type, wv.variant.id);

            return (
              <div
                key={wv.id}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-all duration-300 hover:shadow-xl"
                onMouseEnter={() => setHoveredWidget(wv.id)}
                onMouseLeave={() => setHoveredWidget(null)}
              >
                <div className="absolute top-4 left-4 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-gray-200">
                  <span className="text-sm font-bold text-gray-900">{wv.number}</span>
                </div>

                {added && (
                  <div className="absolute top-4 right-4 z-10 bg-green-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="relative overflow-hidden bg-gray-50" style={{ height: '300px' }}>
                  <div
                    className="absolute inset-0 origin-top-left"
                    style={{
                      transform: 'scale(0.4)',
                      transformOrigin: 'top left',
                      width: '250%',
                      height: '250%',
                    }}
                  >
                    <SectionRenderer
                      section={section}
                      isSelected={false}
                      onSelect={() => {}}
                    />
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${hoveredWidget === wv.id ? 'opacity-100' : 'opacity-0'}`} />

                  <button
                    onClick={() => addSection(wv.widget, wv.variant.id)}
                    disabled={added}
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 ${
                      added
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                    } ${hoveredWidget === wv.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ajoutée</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Ajouter</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {wv.widget.label}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{wv.variant.label}</p>
                  <p className="text-xs text-gray-500">{wv.widget.description}</p>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {selectedSections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{selectedSections.length}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Sections sélectionnées</p>
                    <p className="text-xs text-gray-600">Cliquez pour voir le détail</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2 mr-4">
                  {selectedSections.slice(0, 5).map((section, index) => {
                    const widget = widgetLibrary.find(w => w.type === section.type);
                    return (
                      <div
                        key={section.id}
                        className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-gray-700"
                        title={widget?.label}
                      >
                        {index + 1}
                      </div>
                    );
                  })}
                  {selectedSections.length > 5 && (
                    <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-gray-700">
                      +{selectedSections.length - 5}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedSections([])}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200"
                >
                  <X className="w-4 h-4" />
                  <span>Tout effacer</span>
                </button>

                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Aperçu</span>
                </button>

                <button
                  onClick={savePage}
                  disabled={saving || !pageName.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Sauvegarde...' : 'Sauvegarder la page'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
