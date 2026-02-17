import { useState } from 'react';
import { Settings, Palette, Code } from 'lucide-react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import { widgetLibrary } from '../../lib/widgetLibrary';
import WidgetThemeSelector from './WidgetThemeSelector';
import {
  HeroContentEditor,
  CTAContentEditor,
  HeaderContentEditor,
  ContactContentEditor,
  FeaturesContentEditor,
  TestimonialsContentEditor,
  FooterContentEditor,
  ImageTextSplitContentEditor,
  ContentShowcaseContentEditor,
  CenteredContentContentEditor,
  TextColumnsContentEditor,
} from './ContentEditors';
import { HeroAdvancedEditor } from './HeroAdvancedEditor';
import GenericObjectEditor from './GenericObjectEditor';

interface PropertiesPanelProps {
  section: PageBuilderSection | null;
  onUpdateSection: (updates: Partial<PageBuilderSection>) => void;
}

type TabType = 'content' | 'design' | 'advanced';

export default function PropertiesPanel({ section, onUpdateSection }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content');

  const toPickerColor = (value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback;
  };

  if (!section) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col items-center justify-center p-8 text-center">
        <Settings className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">
          Selectionnez une section pour editer ses proprietes
        </p>
      </div>
    );
  }

  const updateContent = (key: string, value: any) => {
    onUpdateSection({
      content: { ...section.content, [key]: value },
    });
  };

  const updateDesign = (category: string, key: string, value: any) => {
    onUpdateSection({
      design: {
        ...section.design,
        [category]: { ...section.design[category as keyof typeof section.design], [key]: value },
      },
    });
  };

  const updateVariant = (newVariant: string) => {
    onUpdateSection({ variant: newVariant });
  };

  const editorProps = { section, updateContent };

  const renderContentTab = () => {
    switch (section.type) {
      case 'hero':
        return <HeroContentEditor {...editorProps} />;
      case 'features':
        return <FeaturesContentEditor {...editorProps} />;
      case 'cta':
        return <CTAContentEditor {...editorProps} />;
      case 'header':
        return <HeaderContentEditor {...editorProps} />;
      case 'contact':
        return <ContactContentEditor {...editorProps} />;
      case 'testimonials':
        return <TestimonialsContentEditor {...editorProps} />;
      case 'footer':
        return <FooterContentEditor {...editorProps} />;
      case 'image-text-split':
        return <ImageTextSplitContentEditor {...editorProps} />;
      case 'content-showcase':
        return <ContentShowcaseContentEditor {...editorProps} />;
      case 'centered-content':
        return <CenteredContentContentEditor {...editorProps} />;
      case 'text-columns':
        return <TextColumnsContentEditor {...editorProps} />;
      default:
        return (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Éditeur générique du contenu pour ce widget.
            </p>
            <GenericObjectEditor
              value={section.content}
              onChange={(nextContent) => onUpdateSection({ content: nextContent })}
            />
          </div>
        );
    }
  };

  const renderDesignTab = () => {
    if (section.type === 'hero') {
      return (
        <div className="space-y-6">
          <WidgetThemeSelector section={section} onUpdateSection={onUpdateSection} />
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Boutons</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Taille des boutons</label>
                <select
                  value={section.design.colors?.buttonSize || 'md'}
                  onChange={(e) => updateDesign('colors', 'buttonSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="sm">Petit</option>
                  <option value="md">Moyen</option>
                  <option value="lg">Grand</option>
                  <option value="xl">Très grand</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Arrondi des boutons (widget)</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="1"
                    value={parseInt((section.design.colors?.buttonRadius || '12').replace('px', ''), 10) || 12}
                    onChange={(e) => updateDesign('colors', 'buttonRadius', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <input
                    type="text"
                    value={section.design.colors?.buttonRadius || '12px'}
                    onChange={(e) => updateDesign('colors', 'buttonRadius', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <HeroAdvancedEditor section={section} updateDesign={updateDesign} />
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Paramètres design complets</h3>
            <GenericObjectEditor
              value={section.design}
              onChange={(nextDesign) => onUpdateSection({ design: nextDesign })}
            />
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      <WidgetThemeSelector section={section} onUpdateSection={onUpdateSection} />

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Typographie</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur titre</label>
            <input
              type="color"
              value={toPickerColor(section.design.typography?.headingColor, '#111827')}
              onChange={(e) => updateDesign('typography', 'headingColor', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur texte</label>
            <input
              type="color"
              value={toPickerColor(section.design.typography?.textColor, '#4B5563')}
              onChange={(e) => updateDesign('typography', 'textColor', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Boutons</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur bouton</label>
            <input
              type="color"
              value={toPickerColor(section.design.colors?.buttonBackground, '#000000')}
              onChange={(e) => updateDesign('colors', 'buttonBackground', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur texte bouton</label>
            <input
              type="color"
              value={toPickerColor(section.design.colors?.buttonText, '#ffffff')}
              onChange={(e) => updateDesign('colors', 'buttonText', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur bouton (hover)</label>
            <input
              type="color"
              value={toPickerColor(section.design.colors?.buttonBackgroundHover, '#1F2937')}
              onChange={(e) => updateDesign('colors', 'buttonBackgroundHover', e.target.value)}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille des boutons</label>
            <select
              value={section.design.colors?.buttonSize || 'md'}
              onChange={(e) => updateDesign('colors', 'buttonSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            >
              <option value="sm">Petit</option>
              <option value="md">Moyen</option>
              <option value="lg">Grand</option>
              <option value="xl">Très grand</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Arrondi des boutons (widget)</label>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <input
                type="range"
                min="0"
                max="32"
                step="1"
                value={parseInt((section.design.colors?.buttonRadius || '12').replace('px', ''), 10) || 12}
                onChange={(e) => updateDesign('colors', 'buttonRadius', `${e.target.value}px`)}
                className="w-full"
              />
              <input
                type="text"
                value={section.design.colors?.buttonRadius || '12px'}
                onChange={(e) => updateDesign('colors', 'buttonRadius', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Arriere-plan</h3>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Couleur</label>
          <input
            type="color"
            value={toPickerColor(section.design.background.value, '#ffffff')}
            onChange={(e) => updateDesign('background', 'value', e.target.value)}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Espacement</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding haut</label>
            <input
              type="text"
              value={section.design.spacing.paddingTop}
              onChange={(e) => updateDesign('spacing', 'paddingTop', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="ex: 80px"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding bas</label>
            <input
              type="text"
              value={section.design.spacing.paddingBottom}
              onChange={(e) => updateDesign('spacing', 'paddingBottom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="ex: 80px"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Paramètres design complets</h3>
        <GenericObjectEditor
          value={section.design}
          onChange={(nextDesign) => onUpdateSection({ design: nextDesign })}
        />
      </div>
    </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Visibilite</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.advanced.visibility?.desktop !== false}
              onChange={(e) =>
                onUpdateSection({
                  advanced: {
                    ...section.advanced,
                    visibility: {
                      ...section.advanced.visibility,
                      desktop: e.target.checked,
                      tablet: section.advanced.visibility?.tablet !== false,
                      mobile: section.advanced.visibility?.mobile !== false,
                    },
                  },
                })
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Visible sur desktop</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.advanced.visibility?.tablet !== false}
              onChange={(e) =>
                onUpdateSection({
                  advanced: {
                    ...section.advanced,
                    visibility: {
                      desktop: section.advanced.visibility?.desktop !== false,
                      tablet: e.target.checked,
                      mobile: section.advanced.visibility?.mobile !== false,
                    },
                  },
                })
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Visible sur tablette</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.advanced.visibility?.mobile !== false}
              onChange={(e) =>
                onUpdateSection({
                  advanced: {
                    ...section.advanced,
                    visibility: {
                      desktop: section.advanced.visibility?.desktop !== false,
                      tablet: section.advanced.visibility?.tablet !== false,
                      mobile: e.target.checked,
                    },
                  },
                })
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Visible sur mobile</span>
          </label>
        </div>
      </div>
    </div>
  );

  const widgetDef = widgetLibrary.find(w => w.type === section.type);

  return (
    <>
      {widgetDef && widgetDef.variants.length > 1 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Variante du widget
          </label>
          <select
            value={section.variant}
            onChange={(e) => updateVariant(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          >
            {widgetDef.variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Contenu</span>
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'design'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Design</span>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'advanced'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Avance</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'design' && renderDesignTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>
    </>
  );
}
