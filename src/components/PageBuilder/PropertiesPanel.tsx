import { useState } from 'react';
import { Settings, Palette, Code, ChevronDown, ChevronRight } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { LinkInputField } from '@/components/common/LinkInputField';
import { RichTextArea } from '@/components/common/RichTextArea';
import { getWidgetCapabilities } from '@/lib/widgetCapabilities';
import { widgetLibrary } from '@/lib/widgetLibrary';
import { getWidgetFieldLabelForType } from '@/lib/widgetFieldLabels';
import WidgetThemeSelector from './WidgetThemeSelector';
import { GradientPicker } from './GradientPicker';
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
  ClickFunnelCenterCardContentEditor,
  ClickFunnelTestimonialsContentEditor,
  ClickFunnelFeaturesContentEditor,
  ClickFunnelFooterContentEditor,
} from './ContentEditors';
import {
  PricingContentEditor,
  StatsContentEditor,
  TeamContentEditor,
  FAQContentEditor,
  LogoCloudContentEditor,
  VideoHeroContentEditor,
  GalleryContentEditor,
  TimelineContentEditor,
  NewsletterContentEditor,
  ProcessContentEditor,
  ServicesGridContentEditor,
  ContactSplitContentEditor,
  FeedbackContactContentEditor,
  ServicesCardsContentEditor,
  EditorialCardsContentEditor,
  MinimalCTAContentEditor,
  CinematicFooterContentEditor,
  SocialFollowContentEditor,
  NewsletterSignupContentEditor,
  SimpleHeroContentEditor,
  HeroWithTestimonialsContentEditor,
  HeroWithServicesContentEditor,
  ClickFunnelsHeroContentEditor,
  MembershipPricingContentEditor,
  BentoFeaturesContentEditor,
  FeaturesCarouselContentEditor,
} from './ContentEditors2';
import { HeroAdvancedEditor } from './HeroAdvancedEditor';
import GenericObjectEditor from './GenericObjectEditor';
import ImageUploadField from './ImageUploadField';

interface PropertiesPanelProps {
  section: PageBuilderSection | null;
  onUpdateSection: (updates: Partial<PageBuilderSection>) => void;
}

type TabType = 'content' | 'design' | 'advanced';

const FONT_FAMILY_OPTIONS = [
  { value: '', label: 'Héritée du thème' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: "'Geist', sans-serif", label: 'Geist' },
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: "'Lora', serif", label: 'Lora' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
  { value: 'monospace', label: 'Monospace' },
];

const BUTTON_FONT_SIZE_OPTIONS = [
  { value: '', label: 'Automatique (selon taille du bouton)' },
  { value: '0.75rem', label: 'Très petit (0.75rem)' },
  { value: '0.875rem', label: 'Petit (0.875rem)' },
  { value: '1rem', label: 'Normal (1rem)' },
  { value: '1.125rem', label: 'Grand (1.125rem)' },
  { value: '1.25rem', label: 'Très grand (1.25rem)' },
];

const BUTTON_SHADOW_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: '0 2px 6px rgba(0, 0, 0, 0.12)', label: 'Légère' },
  { value: '0 8px 18px rgba(0, 0, 0, 0.18)', label: 'Moyenne' },
  { value: '0 14px 28px rgba(0, 0, 0, 0.24)', label: 'Forte' },
];

const COLOR_PALETTES = [
  { name: 'Classique', accent: '#111827', buttonBg: '#111827', buttonText: '#ffffff', headingColor: '#111827', textColor: '#4B5563' },
  { name: 'Océan', accent: '#0369a1', buttonBg: '#0284c7', buttonText: '#ffffff', headingColor: '#0c4a6e', textColor: '#475569' },
  { name: 'Forêt', accent: '#15803d', buttonBg: '#16a34a', buttonText: '#ffffff', headingColor: '#14532d', textColor: '#4B5563' },
  { name: 'Sunset', accent: '#ea580c', buttonBg: '#f97316', buttonText: '#ffffff', headingColor: '#9a3412', textColor: '#57534e' },
  { name: 'Royal', accent: '#7c3aed', buttonBg: '#8b5cf6', buttonText: '#ffffff', headingColor: '#4c1d95', textColor: '#6b7280' },
  { name: 'Rose', accent: '#e11d48', buttonBg: '#f43f5e', buttonText: '#ffffff', headingColor: '#881337', textColor: '#6b7280' },
  { name: 'Sombre', accent: '#f5f5f5', buttonBg: '#f5f5f5', buttonText: '#111827', headingColor: '#f5f5f5', textColor: '#d1d5db' },
  { name: 'Corail', accent: '#fb923c', buttonBg: '#f97316', buttonText: '#ffffff', headingColor: '#c2410c', textColor: '#78716c' },
];

const HERO_SEO_WIDGET_TYPES = new Set([
  'hero',
  'clickfunnels-hero',
  'videohero',
  'hero-with-services',
  'hero-with-testimonials',
  'brand-identity-hero',
  'simple-centered-hero',
  'creative-network-hero',
]);

const HEADER_WIDGET_TYPES = new Set([
  'header',
  'header-top-info',
  'header-with-icons',
  'header-account-bar',
  'header-full-contact',
  'header-clickfunnel',
]);

const TITLE_FIELD_KEYS = [
  'headline',
  'title',
  'logoText',
  'formTitle',
  'tagline',
] as const;

const PARAGRAPH_FIELD_KEYS = [
  'subheadline',
  'subtitle',
  'description',
  'additionalText',
  'privacyNote',
  'content',
] as const;

const BUTTON_TEXT_FIELD_KEYS = [
  'ctaText',
  'buttonText',
  'primaryCta',
  'secondaryCta',
  'primaryText',
  'secondaryText',
] as const;

const BUTTON_LINK_FIELD_KEYS = [
  'ctaLink',
  'buttonUrl',
  'primaryLink',
  'secondaryLink',
  'link',
] as const;

// Button keys already handled by each widget's specific content editor.
// These are excluded from the uniform quick-edit section to avoid duplicates.
const EDITOR_OWNED_BUTTON_KEYS: Readonly<Record<string, ReadonlyArray<string>>> = {
  hero: ['ctaText', 'ctaLink'],
  cta: ['primaryCta', 'primaryLink', 'secondaryCta', 'secondaryLink'],
  header: ['ctaText', 'ctaLink'],
  'clickfunnel-features': ['buttonText', 'buttonUrl'],
  videohero: ['ctaText', 'ctaLink'],
  'clickfunnels-hero': ['buttonText'],
};

// Title / paragraph keys already handled by each widget's specific content editor.
// These are excluded from the uniform quick-edit section to avoid duplicates.
// Rule: one text field = one editing location. The specific editor is authoritative.
const EDITOR_OWNED_TEXT_KEYS: Readonly<Record<string, ReadonlyArray<string>>> = {
  hero: ['headline', 'subheadline'],
  features: ['title', 'subtitle'],
  cta: ['headline', 'description'],
  header: ['logoText'],
  contact: ['title', 'subtitle'],
  testimonials: ['title', 'subtitle'],
  footer: ['logoText', 'description'],
  'clickfunnel-features': ['title', 'subtitle'],
  videohero: ['title', 'subtitle'],
  'clickfunnels-hero': ['title', 'tagline', 'subtitle'],
};

function ColorOverrideField({
  label,
  value,
  fallback,
  onChange,
  onClear,
}: {
  label: string;
  value: string | undefined;
  fallback: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  const isSet = !!value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
  const pickerValue = isSet ? value : fallback;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
        <label className="flex items-center gap-1 cursor-pointer">
          <span className="text-xs text-gray-400">{isSet ? 'Personnalisé' : 'Hérité'}</span>
          <div
            className={`relative w-8 h-4 rounded-full transition-colors ${isSet ? 'bg-gray-800' : 'bg-gray-300'}`}
            onClick={() => {
              if (isSet) {
                onClear();
              } else {
                onChange(fallback);
              }
            }}
          >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isSet ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>
      {isSet && (
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 rounded border border-gray-300 cursor-pointer"
        />
      )}
      {!isSet && (
        <div className="h-9 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          <span className="text-xs text-gray-400">Couleur du thème actif</span>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200 pt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="pb-2 space-y-3">{children}</div>}
    </div>
  );
}

export default function PropertiesPanel({ section, onUpdateSection }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content');

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

  const clearDesign = (category: string, key: string) => {
    const cat = { ...(section.design[category as keyof typeof section.design] as Record<string, any> || {}) };
    delete cat[key];
    onUpdateSection({ design: { ...section.design, [category]: cat } });
  };

  const clearPaletteColors = () => {
    const colors = { ...(section.design.colors || {}) };
    delete colors.accent;
    delete colors.buttonBackground;
    delete colors.buttonText;
    const typography = { ...(section.design.typography || {}) };
    delete typography.headingColor;
    delete typography.textColor;
    onUpdateSection({ design: { ...section.design, colors, typography } });
  };

  const hasPaletteActive = !!(
    section.design.colors?.accent ||
    section.design.colors?.buttonBackground ||
    section.design.colors?.buttonText ||
    section.design.typography?.headingColor ||
    section.design.typography?.textColor
  );

  const getActivePalette = () => {
    const c = section.design.colors || {};
    const t = section.design.typography || {};
    return COLOR_PALETTES.find(
      (p) =>
        c.accent === p.accent &&
        c.buttonBackground === p.buttonBg &&
        c.buttonText === p.buttonText &&
        t.headingColor === p.headingColor &&
        t.textColor === p.textColor,
    ) ?? null;
  };

  const updateVariant = (newVariant: string) => {
    // Sync background type for header widgets: "transparent" variant ↔ "transparent" background
    if (HEADER_WIDGET_TYPES.has(section.type)) {
      if (newVariant === 'transparent' && section.design?.background?.type !== 'transparent') {
        onUpdateSection({
          variant: newVariant,
          design: {
            ...section.design,
            background: { ...section.design.background, type: 'transparent' as const },
          },
        });
        return;
      }
      if (newVariant !== 'transparent' && section.design?.background?.type === 'transparent') {
        onUpdateSection({
          variant: newVariant,
          design: {
            ...section.design,
            background: { ...section.design.background, type: 'color' as const },
          },
        });
        return;
      }
    }
    onUpdateSection({ variant: newVariant });
  };

  const capabilities = getWidgetCapabilities(section.type);

  const renderUniformQuickEdit = () => {
    const content = section.content || {};
    const ownedKeys = new Set(EDITOR_OWNED_BUTTON_KEYS[section.type] || []);
    const ownedTextKeys = new Set(EDITOR_OWNED_TEXT_KEYS[section.type] || []);
    const allowedTitleKeys = new Set(capabilities.quickEdit.titleKeys);
    const allowedParagraphKeys = new Set(capabilities.quickEdit.paragraphKeys);
    const allowedButtonTextKeys = new Set(capabilities.quickEdit.buttonTextKeys);
    const allowedButtonLinkKeys = new Set(capabilities.quickEdit.buttonLinkKeys);

    const titleFields = TITLE_FIELD_KEYS.filter((key) =>
      allowedTitleKeys.has(key) && typeof content[key] === 'string' && !ownedTextKeys.has(key),
    );
    const paragraphFields = PARAGRAPH_FIELD_KEYS.filter((key) =>
      allowedParagraphKeys.has(key) && typeof content[key] === 'string' && !ownedTextKeys.has(key),
    );
    const buttonTextFields = BUTTON_TEXT_FIELD_KEYS.filter(
      (key) => allowedButtonTextKeys.has(key) && typeof content[key] === 'string' && !ownedKeys.has(key),
    );
    const buttonLinkFields = BUTTON_LINK_FIELD_KEYS.filter(
      (key) => allowedButtonLinkKeys.has(key) && typeof content[key] === 'string' && !ownedKeys.has(key),
    );

    const hasAnyField =
      titleFields.length > 0 ||
      paragraphFields.length > 0 ||
      buttonTextFields.length > 0 ||
      buttonLinkFields.length > 0;

    if (!hasAnyField) return null;

    return (
      <div className="space-y-5">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            Edition rapide uniforme: mêmes sous-sections sur chaque widget (titres, paragraphes, boutons/liens).
          </p>
        </div>

        {titleFields.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Titres</h4>
            <p className="text-[10px] text-gray-400">Supporte le HTML : &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;a&gt;</p>
            {titleFields.map((key) => (
              <RichTextArea
                key={key}
                label={getWidgetFieldLabelForType(section.type, key)}
                value={section.content[key] || ''}
                onChange={(val) => updateContent(key, val)}
                rows={1}
                singleLine
              />
            ))}
          </div>
        )}

        {paragraphFields.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Paragraphes</h4>
            <p className="text-[10px] text-gray-400">Supporte le HTML : &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;a&gt;</p>
            {paragraphFields.map((key) => (
              <RichTextArea
                key={key}
                label={getWidgetFieldLabelForType(section.type, key)}
                value={section.content[key] || ''}
                onChange={(val) => updateContent(key, val)}
                rows={key === 'description' || key === 'content' ? 3 : 2}
              />
            ))}
          </div>
        )}

        {(buttonTextFields.length > 0 || buttonLinkFields.length > 0) && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Boutons & liens</h4>
            {buttonTextFields.map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{getWidgetFieldLabelForType(section.type, key)}</label>
                <input
                  type="text"
                  value={section.content[key] || ''}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            {buttonLinkFields.map((key) => (
              <LinkInputField
                key={key}
                label={getWidgetFieldLabelForType(section.type, key)}
                value={section.content[key] || ''}
                onChange={(val) => updateContent(key, val)}
                allowSeoOptions
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const editorProps = { section, updateContent };

  const renderContentTab = () => {
    const quickEdit = renderUniformQuickEdit();

    switch (section.type) {
      case 'hero':
        return <div className="space-y-5">{quickEdit}<HeroContentEditor {...editorProps} /></div>;
      case 'features':
        return <div className="space-y-5">{quickEdit}<FeaturesContentEditor {...editorProps} /></div>;
      case 'cta':
        return <div className="space-y-5">{quickEdit}<CTAContentEditor {...editorProps} /></div>;
      case 'header':
        return <div className="space-y-5">{quickEdit}<HeaderContentEditor {...editorProps} /></div>;
      case 'contact':
        return <div className="space-y-5">{quickEdit}<ContactContentEditor {...editorProps} /></div>;
      case 'testimonials':
        return <div className="space-y-5">{quickEdit}<TestimonialsContentEditor {...editorProps} /></div>;
      case 'footer':
        return <div className="space-y-5">{quickEdit}<FooterContentEditor {...editorProps} /></div>;
      case 'image-text-split':
        return <ImageTextSplitContentEditor {...editorProps} />;
      case 'content-showcase':
        return <ContentShowcaseContentEditor {...editorProps} />;
      case 'centered-content':
        return <CenteredContentContentEditor {...editorProps} />;
      case 'text-columns':
        return <TextColumnsContentEditor {...editorProps} />;
      case 'clickfunnel-center-card':
        return <ClickFunnelCenterCardContentEditor {...editorProps} />;
      case 'click-funnel-testimonials':
        return <ClickFunnelTestimonialsContentEditor {...editorProps} />;
      case 'clickfunnel-features':
        return <div className="space-y-5">{quickEdit}<ClickFunnelFeaturesContentEditor {...editorProps} /></div>;
      case 'clickfunnel-footer':
        return <ClickFunnelFooterContentEditor {...editorProps} />;
      case 'pricing':
        return <PricingContentEditor {...editorProps} />;
      case 'stats':
        return <StatsContentEditor {...editorProps} />;
      case 'team':
        return <TeamContentEditor {...editorProps} />;
      case 'faq':
      case 'faq-two-columns':
        return <FAQContentEditor {...editorProps} />;
      case 'logocloud':
        return <LogoCloudContentEditor {...editorProps} />;
      case 'videohero':
        return <div className="space-y-5">{quickEdit}<VideoHeroContentEditor {...editorProps} /></div>;
      case 'gallery':
        return <GalleryContentEditor {...editorProps} />;
      case 'timeline':
      case 'timeline-grid':
        return <TimelineContentEditor {...editorProps} />;
      case 'newsletter':
        return <NewsletterContentEditor {...editorProps} />;
      case 'process':
      case 'process-steps-cards':
        return <ProcessContentEditor {...editorProps} />;
      case 'services-grid':
        return <ServicesGridContentEditor {...editorProps} />;
      case 'contact-split':
        return <ContactSplitContentEditor {...editorProps} />;
      case 'feedback-contact':
        return <FeedbackContactContentEditor {...editorProps} />;
      case 'services-cards':
      case 'services-carousel':
        return <ServicesCardsContentEditor {...editorProps} />;
      case 'editorial-cards-row':
        return <EditorialCardsContentEditor {...editorProps} />;
      case 'minimal-final-cta':
        return <MinimalCTAContentEditor {...editorProps} />;
      case 'cinematic-footer':
        return <CinematicFooterContentEditor {...editorProps} />;
      case 'social-follow':
        return <SocialFollowContentEditor {...editorProps} />;
      case 'newsletter-signup':
        return <NewsletterSignupContentEditor {...editorProps} />;
      case 'simple-centered-hero':
      case 'brand-identity-hero':
        return <SimpleHeroContentEditor {...editorProps} />;
      case 'hero-with-testimonials':
      case 'centered-testimonial':
        return <HeroWithTestimonialsContentEditor {...editorProps} />;
      case 'hero-with-services':
      case 'content-with-services':
      case 'content-video-services':
        return <HeroWithServicesContentEditor {...editorProps} />;
      case 'clickfunnels-hero':
        return <div className="space-y-5">{quickEdit}<ClickFunnelsHeroContentEditor {...editorProps} /></div>;
      case 'membership-pricing':
        return <MembershipPricingContentEditor {...editorProps} />;
      case 'bento-features':
        return <BentoFeaturesContentEditor {...editorProps} />;
      case 'features-carousel':
        return <FeaturesCarouselContentEditor {...editorProps} />;
      case 'embed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Titre (optionnel)</label>
              <input
                type="text"
                value={section.content?.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Titre au-dessus du contenu intégré"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Code d'intégration (HTML/iframe)</label>
              <textarea
                value={section.content?.embedCode || ''}
                onChange={(e) => updateContent('embedCode', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder='<iframe src="..." width="100%" height="400"></iframe>'
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Largeur max</label>
              <input
                type="text"
                value={section.content?.maxWidth || '800px'}
                onChange={(e) => updateContent('maxWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="800px"
              />
            </div>
          </div>
        );
      case 'code-insert':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Titre (optionnel)</label>
              <input
                type="text"
                value={section.content?.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Langage</label>
              <select
                value={section.content?.language || 'html'}
                onChange={(e) => updateContent('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="json">JSON</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Code</label>
              <textarea
                value={section.content?.code || ''}
                onChange={(e) => updateContent('code', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="Votre code ici..."
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={section.content?.showLineNumbers !== false}
                onChange={(e) => updateContent('showLineNumbers', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>Afficher les numéros de ligne</span>
            </label>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {quickEdit}
            <p className="text-xs text-gray-500">
              Éditeur générique du contenu pour ce widget.
            </p>
            <GenericObjectEditor
              value={section.content}
              onChange={(nextContent) => {
                if (nextContent && typeof nextContent === 'object' && !Array.isArray(nextContent)) {
                  onUpdateSection({ content: nextContent as Record<string, any> });
                }
              }}
            />
          </div>
        );
    }
  };

  const renderDesignTab = () => {
    if (HERO_SEO_WIDGET_TYPES.has(section.type)) {
      return (
        <div className="space-y-2">
          <WidgetThemeSelector section={section} onUpdateSection={onUpdateSection} />

          {capabilities.supportsPalette && (
            <CollapsibleSection title="Palette globale" defaultOpen={false}>
              {(() => {
                const activePalette = getActivePalette(); return (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs text-gray-600">Palettes prédéfinies</label>
                      {hasPaletteActive && (
                        <button
                          onClick={clearPaletteColors}
                          className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                        >
                          Désactiver
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {COLOR_PALETTES.map((palette) => {
                        const isActive = activePalette?.name === palette.name;
                        return (
                          <button
                            key={palette.name}
                            onClick={() => {
                              if (isActive) {
                                clearPaletteColors();
                              } else {
                                onUpdateSection({
                                  design: {
                                    ...section.design,
                                    colors: {
                                      ...section.design.colors,
                                      accent: palette.accent,
                                      buttonBackground: palette.buttonBg,
                                      buttonText: palette.buttonText,
                                    },
                                    typography: {
                                      ...section.design.typography,
                                      headingColor: palette.headingColor,
                                      textColor: palette.textColor,
                                    },
                                  },
                                });
                              }
                            }}
                            className={`flex flex-col items-center p-1.5 rounded-lg border transition-colors ${isActive ? 'border-gray-800 bg-gray-100 ring-1 ring-gray-800' : 'border-gray-200 hover:border-gray-400'}`}
                            title={isActive ? `${palette.name} (cliquer pour désactiver)` : palette.name}
                          >
                            <div className="flex gap-0.5 mb-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.buttonBg }} />
                            </div>
                            <span className={`text-[9px] ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{palette.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <ColorOverrideField
                label="Couleur Dominante"
                value={section.design.colors?.accent}
                fallback="#111827"
                onChange={(v) => updateDesign('colors', 'accent', v)}
                onClear={() => clearDesign('colors', 'accent')}
              />
            </CollapsibleSection>
          )}

          {capabilities.supportsTypography && (
            <CollapsibleSection title="Typographie des titres" defaultOpen={false}>
              {capabilities.supportsH1 && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Police H1</label>
                    <select
                      value={section.design.typography?.h1FontFamily || ''}
                      onChange={(e) => updateDesign('typography', 'h1FontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Hérité</option>
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="'Geist', sans-serif">Geist</option>
                      <option value="'DM Sans', sans-serif">DM Sans</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="'Lora', serif">Lora</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Taille H1</label>
                    <select
                      value={section.design.typography?.h1FontSize || ''}
                      onChange={(e) => updateDesign('typography', 'h1FontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Par défaut</option>
                      <option value="1.5rem">Petit (1.5rem)</option>
                      <option value="2rem">Moyen (2rem)</option>
                      <option value="2.5rem">Grand (2.5rem)</option>
                      <option value="3rem">Très grand (3rem)</option>
                      <option value="3.75rem">Énorme (3.75rem)</option>
                      <option value="4.5rem">Géant (4.5rem)</option>
                      <option value="6rem">Maxi (6rem)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Graisse H1</label>
                    <select
                      value={section.design.typography?.h1FontWeight || ''}
                      onChange={(e) => updateDesign('typography', 'h1FontWeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Par défaut</option>
                      <option value="300">Léger (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-gras (600)</option>
                      <option value="700">Gras (700)</option>
                      <option value="800">Extra-gras (800)</option>
                      <option value="900">Noir (900)</option>
                    </select>
                  </div>
                  <ColorOverrideField
                    label="Couleur H1"
                    value={section.design.typography?.h1Color}
                    fallback="#111827"
                    onChange={(v) => updateDesign('typography', 'h1Color', v)}
                    onClear={() => clearDesign('typography', 'h1Color')}
                  />
                </>
              )}
              {capabilities.supportsH2 && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Police H2 / sous-titre</label>
                    <select
                      value={section.design.typography?.h2FontFamily || ''}
                      onChange={(e) => updateDesign('typography', 'h2FontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Hérité</option>
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="'Geist', sans-serif">Geist</option>
                      <option value="'DM Sans', sans-serif">DM Sans</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="'Lora', serif">Lora</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Taille H2 / sous-titre</label>
                    <select
                      value={section.design.typography?.h2FontSize || ''}
                      onChange={(e) => updateDesign('typography', 'h2FontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Par défaut</option>
                      <option value="0.875rem">Très petit (0.875rem)</option>
                      <option value="1rem">Petit (1rem)</option>
                      <option value="1.125rem">Normal (1.125rem)</option>
                      <option value="1.25rem">Moyen (1.25rem)</option>
                      <option value="1.5rem">Grand (1.5rem)</option>
                      <option value="1.75rem">Très grand (1.75rem)</option>
                      <option value="2rem">Énorme (2rem)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Graisse H2 / sous-titre</label>
                    <select
                      value={section.design.typography?.h2FontWeight || ''}
                      onChange={(e) => updateDesign('typography', 'h2FontWeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Par défaut</option>
                      <option value="300">Léger (300)</option>
                      <option value="400">Normal (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-gras (600)</option>
                      <option value="700">Gras (700)</option>
                      <option value="800">Extra-gras (800)</option>
                      <option value="900">Noir (900)</option>
                    </select>
                  </div>
                  <ColorOverrideField
                    label="Couleur H2 / sous-titre"
                    value={section.design.typography?.h2Color}
                    fallback="#6B7280"
                    onChange={(v) => updateDesign('typography', 'h2Color', v)}
                    onClear={() => clearDesign('typography', 'h2Color')}
                  />
                </>
              )}
            </CollapsibleSection>
          )}

          {capabilities.supportsButtonStyle && (
            <CollapsibleSection title="Boutons" defaultOpen={false}>
              {capabilities.supportsButtonColorOverrides && (
                <>
                  <ColorOverrideField
                    label="Couleur bouton"
                    value={section.design.colors?.buttonBackground}
                    fallback="#000000"
                    onChange={(v) => updateDesign('colors', 'buttonBackground', v)}
                    onClear={() => clearDesign('colors', 'buttonBackground')}
                  />
                  <ColorOverrideField
                    label="Couleur texte bouton"
                    value={section.design.colors?.buttonText}
                    fallback="#ffffff"
                    onChange={(v) => updateDesign('colors', 'buttonText', v)}
                    onClear={() => clearDesign('colors', 'buttonText')}
                  />
                  <ColorOverrideField
                    label="Couleur bouton (hover)"
                    value={section.design.colors?.buttonBackgroundHover}
                    fallback="#1F2937"
                    onChange={(v) => updateDesign('colors', 'buttonBackgroundHover', v)}
                    onClear={() => clearDesign('colors', 'buttonBackgroundHover')}
                  />
                </>
              )}

              {capabilities.supportsButtonSizeControl && (
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
              )}

              {capabilities.supportsButtonTypographyControl && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Taille du texte du bouton</label>
                    <select
                      value={section.design.typography?.buttonFontSize || ''}
                      onChange={(e) => updateDesign('typography', 'buttonFontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      {BUTTON_FONT_SIZE_OPTIONS.map(option => (
                        <option key={option.value || 'auto'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Police du texte du bouton</label>
                    <select
                      value={section.design.typography?.buttonFontFamily || ''}
                      onChange={(e) => updateDesign('typography', 'buttonFontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      {FONT_FAMILY_OPTIONS.map(option => (
                        <option key={option.value || 'inherit'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {capabilities.supportsButtonRadiusControl && (
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
              )}

              {capabilities.supportsButtonBorderControl && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type de bordure bouton</label>
                    <select
                      value={section.design.colors?.buttonBorderStyle || 'none'}
                      onChange={(e) => updateDesign('colors', 'buttonBorderStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="none">Aucune</option>
                      <option value="solid">Continue</option>
                      <option value="dashed">Tirets</option>
                      <option value="dotted">Pointillés</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Épaisseur bordure bouton ({section.design.colors?.buttonBorderWidth || '0px'})</label>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={parseInt((section.design.colors?.buttonBorderWidth || '0').replace('px', ''), 10) || 0}
                      onChange={(e) => updateDesign('colors', 'buttonBorderWidth', `${e.target.value}px`)}
                      className="w-full"
                    />
                  </div>

                  <ColorOverrideField
                    label="Couleur bordure bouton"
                    value={section.design.colors?.buttonBorderColor}
                    fallback="#111827"
                    onChange={(v) => updateDesign('colors', 'buttonBorderColor', v)}
                    onClear={() => clearDesign('colors', 'buttonBorderColor')}
                  />
                </>
              )}

              {capabilities.supportsButtonShadowControl && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ombre du bouton</label>
                  <select
                    value={section.design.colors?.buttonShadow || 'none'}
                    onChange={(e) => updateDesign('colors', 'buttonShadow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {BUTTON_SHADOW_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CollapsibleSection>
          )}

          {capabilities.supportsIconStyle && (
            <CollapsibleSection title="Icônes" defaultOpen={false}>
              {capabilities.supportsIconColorOverrides && (
                <>
                  <ColorOverrideField
                    label="Couleur contenu icône"
                    value={section.design.colors?.iconColor}
                    fallback="#111827"
                    onChange={(v) => updateDesign('colors', 'iconColor', v)}
                    onClear={() => clearDesign('colors', 'iconColor')}
                  />
                  <ColorOverrideField
                    label="Couleur fond icône"
                    value={section.design.colors?.iconBackground}
                    fallback="#F3F4F6"
                    onChange={(v) => updateDesign('colors', 'iconBackground', v)}
                    onClear={() => clearDesign('colors', 'iconBackground')}
                  />
                  <ColorOverrideField
                    label="Couleur contour icône"
                    value={section.design.colors?.iconBorderColor}
                    fallback="#D1D5DB"
                    onChange={(v) => updateDesign('colors', 'iconBorderColor', v)}
                    onClear={() => clearDesign('colors', 'iconBorderColor')}
                  />
                </>
              )}

              {capabilities.supportsIconBorderControl && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Épaisseur contour icône ({section.design.colors?.iconBorderWidth || '0px'})</label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={parseInt((section.design.colors?.iconBorderWidth || '0').replace('px', ''), 10) || 0}
                    onChange={(e) => updateDesign('colors', 'iconBorderWidth', `${e.target.value}px`)}
                    className="w-full"
                  />
                </div>
              )}

              {capabilities.supportsIconRadiusControl && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Arrondi du contour d'icône</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={parseInt((section.design.colors?.iconRadius || '12px').replace('px', ''), 10) || 12}
                      onChange={(e) => updateDesign('colors', 'iconRadius', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <input
                      type="text"
                      value={section.design.colors?.iconRadius || '12px'}
                      onChange={(e) => updateDesign('colors', 'iconRadius', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}

              {capabilities.supportsIconSizeControl && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Taille des icônes</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <input
                      type="range"
                      min="12"
                      max="64"
                      step="2"
                      value={parseInt(((section.design.colors as any)?.iconSize || '24px').replace('px', ''), 10) || 24}
                      onChange={(e) => updateDesign('colors', 'iconSize', `${e.target.value}px`)}
                      className="w-full"
                    />
                    <input
                      type="text"
                      value={(section.design.colors as any)?.iconSize || '24px'}
                      onChange={(e) => updateDesign('colors', 'iconSize', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}

          {(capabilities.supportsMediaOverlayOnSection || capabilities.supportsMediaOverlayOnFrame) && (
            <CollapsibleSection title="Images & vidéos" defaultOpen={false}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Arrondi des médias</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="1"
                    value={parseInt((section.design.media?.imageRadius || '12px').replace('px', ''), 10) || 12}
                    onChange={(e) => updateDesign('media', 'imageRadius', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <input
                    type="text"
                    value={section.design.media?.imageRadius || '12px'}
                    onChange={(e) => updateDesign('media', 'imageRadius', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <ImageUploadField
                label="Image à superposer (overlay)"
                value={section.design.media?.overlayImage || ''}
                onChange={(url) => updateDesign('media', 'overlayImage', url)}
                placeholder="URL du logo à superposer"
                mediaType="image"
              />
              {section.design.media?.overlayImage && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cible de l'overlay</label>
                    <select
                      value={section.design.media?.overlayTarget || 'section'}
                      onChange={(e) => updateDesign('media', 'overlayTarget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="section">Section (wrapper)</option>
                      <option value="media">Média (frame image/vidéo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Position overlay</label>
                    <select
                      value={section.design.media?.overlayPosition || 'center'}
                      onChange={(e) => updateDesign('media', 'overlayPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="top-left">Haut gauche</option>
                      <option value="top-right">Haut droite</option>
                      <option value="bottom-left">Bas gauche</option>
                      <option value="bottom-right">Bas droite</option>
                      <option value="center">Centre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Taille overlay ({section.design.media?.overlaySize || 'auto'})</label>
                    <input
                      type="range"
                      min="32"
                      max="1500"
                      step="10"
                      value={parseInt((section.design.media?.overlaySize || '').replace('px', ''), 10) || 1500}
                      onChange={(e) => updateDesign('media', 'overlaySize', `${e.target.value}px`)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Couche overlay</label>
                    <select
                      value={section.design.media?.overlayZIndex ?? 'above-bg'}
                      onChange={(e) => updateDesign('media', 'overlayZIndex', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="behind-bg">Derrière l'arrière-plan</option>
                      <option value="above-bg">Au-dessus de l'arrière-plan</option>
                      <option value="above-content">Au-dessus du contenu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opacité overlay ({Math.round((section.design.media?.overlayOpacity ?? 0.5) * 100)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((section.design.media?.overlayOpacity ?? 0.5) * 100)}
                      onChange={(e) => updateDesign('media', 'overlayOpacity', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Luminosité overlay ({Math.round((section.design.media?.overlayBrightness ?? 1) * 100)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={500}
                      value={Math.round((section.design.media?.overlayBrightness ?? 1) * 100)}
                      onChange={(e) => updateDesign('media', 'overlayBrightness', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Contraste overlay ({Math.round((section.design.media?.overlayContrast ?? 1) * 100)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={500}
                      value={Math.round((section.design.media?.overlayContrast ?? 1) * 100)}
                      onChange={(e) => updateDesign('media', 'overlayContrast', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Saturation overlay ({Math.round((section.design.media?.overlaySaturate ?? 1) * 100)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={500}
                      value={Math.round((section.design.media?.overlaySaturate ?? 1) * 100)}
                      onChange={(e) => updateDesign('media', 'overlaySaturate', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              {capabilities.supportsBackgroundVideo && (
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={section.design.media?.hideDecorationsOnVideoPlay === true}
                    onChange={(e) => updateDesign('media', 'hideDecorationsOnVideoPlay', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Masquer textes/icônes pendant lecture vidéo</span>
                </label>
              )}
            </CollapsibleSection>
          )}

          {capabilities.supportsBackground && (
            <CollapsibleSection title="Arrière-plan" defaultOpen={false}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type d'arrière-plan</label>
                <select
                  value={section.design.background?.type || 'color'}
                  onChange={(e) => {
                    const newType = e.target.value as 'color' | 'gradient' | 'image' | 'video' | 'transparent';
                    onUpdateSection({
                      design: {
                        ...section.design,
                        background: { ...section.design.background, type: newType },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {capabilities.supportsBackgroundColor && <option value="color">Couleur</option>}
                  {capabilities.supportsBackgroundGradient && <option value="gradient">Dégradé</option>}
                  {capabilities.supportsBackgroundImage && <option value="image">Image</option>}
                  {capabilities.supportsBackgroundVideo && <option value="video">Vidéo</option>}
                  {capabilities.supportsBackgroundTransparent && (
                    <option value="transparent">Transparent (backdrop blur)</option>
                  )}
                </select>
              </div>

              {capabilities.supportsBackgroundTransparent && (section.design.background?.type === 'transparent' || (HEADER_WIDGET_TYPES.has(section.type) && section.variant === 'transparent')) && (
                <>
                  <ColorOverrideField
                    label="Couleur du fond transparent"
                    value={section.design.background?.backdropColor || undefined}
                    fallback="#ffffff"
                    onChange={(v) => updateDesign('background', 'backdropColor', v)}
                    onClear={() => updateDesign('background', 'backdropColor', '')}
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Opacité du fond ({Math.round((section.design.background?.backdropOpacity ?? 0.75) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round((section.design.background?.backdropOpacity ?? 0.75) * 100)}
                      onChange={(e) => updateDesign('background', 'backdropOpacity', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Intensité du flou ({section.design.background?.backdropBlur || '12px'})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      value={parseInt((section.design.background?.backdropBlur || '12px').replace('px', ''), 10) || 12}
                      onChange={(e) => updateDesign('background', 'backdropBlur', `${e.target.value}px`)}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Le header se superposera au widget suivant avec un effet de transparence et de flou.
                  </p>
                </>
              )}

              {capabilities.supportsBackgroundColor && section.design.background?.type === 'color' && (
                <ColorOverrideField
                  label="Couleur de fond"
                  value={section.design.background?.value || undefined}
                  fallback="#ffffff"
                  onChange={(v) => updateDesign('background', 'value', v)}
                  onClear={() => updateDesign('background', 'value', '')}
                />
              )}

              {capabilities.supportsBackgroundGradient && section.design.background?.type === 'gradient' && (
                <GradientPicker
                  value={section.design.background?.value || ''}
                  onChange={(v) => updateDesign('background', 'value', v)}
                />
              )}

              {capabilities.supportsBackgroundImage && section.design.background?.type === 'image' && (
                <>
                  <ImageUploadField
                    label="Image de fond"
                    value={section.design.background?.value || ''}
                    onChange={(url) => updateDesign('background', 'value', url)}
                    placeholder="URL de l'image de fond"
                    mediaType="image"
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Opacité de l'image ({Math.round((section.design.background?.opacity ?? 1) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round((section.design.background?.opacity ?? 1) * 100)}
                      onChange={(e) => updateDesign('background', 'opacity', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <ColorOverrideField
                    label="Couleur de superposition"
                    value={section.design.background?.overlayColor || undefined}
                    fallback="#000000"
                    onChange={(v) => updateDesign('background', 'overlayColor', v)}
                    onClear={() => {
                      const bg = { ...(section.design.background || {}) };
                      delete (bg as any).overlayColor;
                      onUpdateSection({ design: { ...section.design, background: bg as any } });
                    }}
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Opacité superposition ({Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}
                      onChange={(e) => updateDesign('background', 'overlayOpacity', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {capabilities.supportsBackgroundVideo && section.design.background?.type === 'video' && (
                <>
                  <ImageUploadField
                    label="Vidéo de fond"
                    value={section.design.background?.value || ''}
                    onChange={(url) => updateDesign('background', 'value', url)}
                    placeholder="https://youtube.com/embed/... ou vidéo mp4"
                    mediaType="video"
                  />
                  <ColorOverrideField
                    label="Couleur de superposition vidéo"
                    value={section.design.background?.overlayColor || undefined}
                    fallback="#000000"
                    onChange={(v) => updateDesign('background', 'overlayColor', v)}
                    onClear={() => {
                      const bg = { ...(section.design.background || {}) };
                      delete (bg as any).overlayColor;
                      onUpdateSection({ design: { ...section.design, background: bg as any } });
                    }}
                  />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Opacité superposition ({Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}
                      onChange={(e) => updateDesign('background', 'overlayOpacity', parseInt(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={section.design.background?.videoAutoplay !== false}
                      onChange={(e) => updateDesign('background', 'videoAutoplay', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span>Lecture automatique</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={section.design.background?.videoNoBranding === true}
                      onChange={(e) => updateDesign('background', 'videoNoBranding', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span>Sans branding YouTube</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={section.design.background?.videoFullWidth !== false}
                      onChange={(e) => updateDesign('background', 'videoFullWidth', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span>Pleine largeur</span>
                  </label>
                </>
              )}
            </CollapsibleSection>
          )}

          {section.type === 'hero' && (
            <CollapsibleSection title="Paramètres Hero avancés" defaultOpen={false}>
              <HeroAdvancedEditor section={section} updateDesign={updateDesign} />
            </CollapsibleSection>
          )}

          {section.type === 'logocloud' && (!section.variant || section.variant === 'grid') && (
            <CollapsibleSection title="Disposition des logos" defaultOpen={false}>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={section.design.centerLastRow !== false}
                  onChange={(e) => onUpdateSection({ design: { ...section.design, centerLastRow: e.target.checked } })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Centrer la dernière ligne</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Quand le nombre de logos n'est pas un multiple du nombre de colonnes, les logos restants sont centrés horizontalement.
              </p>
            </CollapsibleSection>
          )}

          {capabilities.supportsSectionBorders && (
            <CollapsibleSection title="Bordures de section" defaultOpen={false}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Arrondi de la section</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="2"
                    value={parseInt((section.design.colors?.sectionRadius || '0px').replace('px', ''), 10) || 0}
                    onChange={(e) => updateDesign('colors', 'sectionRadius', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <input
                    type="text"
                    value={section.design.colors?.sectionRadius || '0px'}
                    onChange={(e) => updateDesign('colors', 'sectionRadius', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </CollapsibleSection>
          )}

          {capabilities.supportsSpacing && (
            <CollapsibleSection title="Espacement" defaultOpen={false}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Padding haut ({section.design.spacing.paddingTop})</label>
                <input
                  type="range"
                  min="0"
                  max="320"
                  step="4"
                  value={parseInt((section.design.spacing.paddingTop || '0').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('spacing', 'paddingTop', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Padding bas ({section.design.spacing.paddingBottom})</label>
                <input
                  type="range"
                  min="0"
                  max="320"
                  step="4"
                  value={parseInt((section.design.spacing.paddingBottom || '0').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('spacing', 'paddingBottom', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Marge haute ({section.design.spacing.marginTop})</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="4"
                  value={parseInt((section.design.spacing.marginTop || '0').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('spacing', 'marginTop', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Marge basse ({section.design.spacing.marginBottom})</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="4"
                  value={parseInt((section.design.spacing.marginBottom || '0').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('spacing', 'marginBottom', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
            </CollapsibleSection>
          )}
        </div>
      );
    }

    const hasAnyColorOverride = !!(
      (capabilities.supportsTypography && (
        section.design.typography?.headingColor ||
        (capabilities.supportsH1 && section.design.typography?.h1Color) ||
        (capabilities.supportsH2 && section.design.typography?.h2Color) ||
        (capabilities.supportsSubtitleTypography && section.design.typography?.subtitleColor) ||
        (capabilities.supportsBodyTypography && section.design.typography?.textColor) ||
        (capabilities.supportsLinkTypography && section.design.typography?.linkColor)
      )) ||
      (capabilities.supportsPalette && section.design.colors?.accent) ||
      (capabilities.supportsButtonStyle && (
        section.design.colors?.buttonBackground ||
        section.design.colors?.buttonText ||
        section.design.colors?.buttonBackgroundHover ||
        section.design.colors?.buttonBorderColor
      )) ||
      (capabilities.supportsIconStyle && (
        section.design.colors?.iconBackground ||
        section.design.colors?.iconColor ||
        section.design.colors?.iconBorderColor
      )) ||
      (capabilities.supportsBackground && section.design.background?.value && section.design.background.value !== '')
    );

    const resetAllColors = () => {
      const typo = { ...(section.design.typography || {}) };
      if (capabilities.supportsTypography) {
        delete typo.headingColor;
        if (capabilities.supportsH1) delete typo.h1Color;
        if (capabilities.supportsH2) delete typo.h2Color;
        if (capabilities.supportsSubtitleTypography) delete typo.subtitleColor;
        if (capabilities.supportsBodyTypography) delete typo.textColor;
        if (capabilities.supportsLinkTypography) delete typo.linkColor;
      }
      const colors = { ...(section.design.colors || {}) };
      if (capabilities.supportsPalette) {
        delete colors.accent;
      }
      if (capabilities.supportsButtonStyle) {
        delete colors.buttonBackground;
        delete colors.buttonText;
        delete colors.buttonBackgroundHover;
        delete colors.buttonBorderColor;
      }
      if (capabilities.supportsIconStyle) {
        delete colors.iconBackground;
        delete colors.iconColor;
        delete colors.iconBorderColor;
      }
      onUpdateSection({
        design: {
          ...section.design,
          typography: typo,
          colors,
          background: capabilities.supportsBackground
            ? { ...section.design.background, value: '' }
            : section.design.background,
        },
      });
    };

    return (
      <div className="space-y-2">
        <WidgetThemeSelector section={section} onUpdateSection={onUpdateSection} />

        {hasAnyColorOverride && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              Des couleurs personnalisées remplacent le thème sur ce widget.
            </p>
            <button
              onClick={resetAllColors}
              className="flex-shrink-0 text-xs text-amber-700 font-medium hover:text-amber-900 underline whitespace-nowrap"
            >
              Tout réinitialiser
            </button>
          </div>
        )}

        {capabilities.supportsPalette && (
          <CollapsibleSection title="Palette globale" defaultOpen={false}>
            {(() => {
              const activePalette = getActivePalette(); return (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-gray-600">Palettes prédéfinies</label>
                    {hasPaletteActive && (
                      <button
                        onClick={clearPaletteColors}
                        className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
                      >
                        Désactiver
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_PALETTES.map((palette) => {
                      const isActive = activePalette?.name === palette.name;
                      return (
                        <button
                          key={palette.name}
                          onClick={() => {
                            if (isActive) {
                              clearPaletteColors();
                            } else {
                              onUpdateSection({
                                design: {
                                  ...section.design,
                                  colors: {
                                    ...section.design.colors,
                                    accent: palette.accent,
                                    buttonBackground: palette.buttonBg,
                                    buttonText: palette.buttonText,
                                  },
                                  typography: {
                                    ...section.design.typography,
                                    headingColor: palette.headingColor,
                                    textColor: palette.textColor,
                                  },
                                },
                              });
                            }
                          }}
                          className={`flex flex-col items-center p-1.5 rounded-lg border transition-colors ${isActive ? 'border-gray-800 bg-gray-100 ring-1 ring-gray-800' : 'border-gray-200 hover:border-gray-400'}`}
                          title={isActive ? `${palette.name} (cliquer pour désactiver)` : palette.name}
                        >
                          <div className="flex gap-0.5 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.buttonBg }} />
                          </div>
                          <span className={`text-[9px] ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{palette.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            <ColorOverrideField
              label="Couleur Dominante"
              value={section.design.colors?.accent}
              fallback="#111827"
              onChange={(v) => updateDesign('colors', 'accent', v)}
              onClear={() => clearDesign('colors', 'accent')}
            />
          </CollapsibleSection>
        )}

        {capabilities.supportsTypography && (
          <CollapsibleSection title="Typographie" defaultOpen={false}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Police globale</label>
              <select
                value={section.design.typography?.fontFamily || ''}
                onChange={(e) => updateDesign('typography', 'fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                {FONT_FAMILY_OPTIONS.map(option => (
                  <option key={option.value || 'inherit'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Police des titres</label>
              <select
                value={section.design.typography?.headingFontFamily || ''}
                onChange={(e) => updateDesign('typography', 'headingFontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                {FONT_FAMILY_OPTIONS.map(option => (
                  <option key={option.value || 'inherit'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <ColorOverrideField
              label="Couleur titres (tous)"
              value={section.design.typography?.headingColor}
              fallback="#111827"
              onChange={(v) => updateDesign('typography', 'headingColor', v)}
              onClear={() => clearDesign('typography', 'headingColor')}
            />

            {capabilities.supportsH1 && (
              <ColorOverrideField
                label="Couleur H1 (spécifique)"
                value={section.design.typography?.h1Color}
                fallback="#111827"
                onChange={(v) => updateDesign('typography', 'h1Color', v)}
                onClear={() => clearDesign('typography', 'h1Color')}
              />
            )}

            {capabilities.supportsH2 && (
              <ColorOverrideField
                label="Couleur H2 (spécifique)"
                value={section.design.typography?.h2Color}
                fallback="#1F2937"
                onChange={(v) => updateDesign('typography', 'h2Color', v)}
                onClear={() => clearDesign('typography', 'h2Color')}
              />
            )}

            {capabilities.supportsSubtitleTypography && (
              <ColorOverrideField
                label="Couleur sous-titre"
                value={section.design.typography?.subtitleColor}
                fallback="#6B7280"
                onChange={(v) => updateDesign('typography', 'subtitleColor', v)}
                onClear={() => clearDesign('typography', 'subtitleColor')}
              />
            )}

            {capabilities.supportsBodyTypography && (
              <ColorOverrideField
                label="Couleur texte corps"
                value={section.design.typography?.textColor}
                fallback="#4B5563"
                onChange={(v) => updateDesign('typography', 'textColor', v)}
                onClear={() => clearDesign('typography', 'textColor')}
              />
            )}

            {capabilities.supportsLinkTypography && (
              <ColorOverrideField
                label="Couleur liens / menu navigation"
                value={section.design.typography?.linkColor}
                fallback="#111827"
                onChange={(v) => updateDesign('typography', 'linkColor', v)}
                onClear={() => clearDesign('typography', 'linkColor')}
              />
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">Graisse des titres</label>
              <select
                value={section.design.typography?.headingFontWeight || ''}
                onChange={(e) => updateDesign('typography', 'headingFontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="">Par defaut</option>
                <option value="300">Leger (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi-gras (600)</option>
                <option value="700">Gras (700)</option>
                <option value="800">Extra-gras (800)</option>
                <option value="900">Noir (900)</option>
              </select>
            </div>
          </CollapsibleSection>
        )}

        {capabilities.supportsButtonStyle && (
          <CollapsibleSection title="Boutons" defaultOpen={false}>
            {capabilities.supportsButtonColorOverrides && (
              <>
                <ColorOverrideField
                  label="Couleur bouton"
                  value={section.design.colors?.buttonBackground}
                  fallback="#000000"
                  onChange={(v) => updateDesign('colors', 'buttonBackground', v)}
                  onClear={() => clearDesign('colors', 'buttonBackground')}
                />

                <ColorOverrideField
                  label="Couleur texte bouton"
                  value={section.design.colors?.buttonText}
                  fallback="#ffffff"
                  onChange={(v) => updateDesign('colors', 'buttonText', v)}
                  onClear={() => clearDesign('colors', 'buttonText')}
                />

                <ColorOverrideField
                  label="Couleur bouton (hover)"
                  value={section.design.colors?.buttonBackgroundHover}
                  fallback="#1F2937"
                  onChange={(v) => updateDesign('colors', 'buttonBackgroundHover', v)}
                  onClear={() => clearDesign('colors', 'buttonBackgroundHover')}
                />
              </>
            )}

            {capabilities.supportsButtonSizeControl && (
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
            )}

            {capabilities.supportsButtonTypographyControl && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Taille du texte du bouton</label>
                  <select
                    value={section.design.typography?.buttonFontSize || ''}
                    onChange={(e) => updateDesign('typography', 'buttonFontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                  >
                    {BUTTON_FONT_SIZE_OPTIONS.map(option => (
                      <option key={option.value || 'auto'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Police du texte du bouton</label>
                  <select
                    value={section.design.typography?.buttonFontFamily || ''}
                    onChange={(e) => updateDesign('typography', 'buttonFontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                  >
                    {FONT_FAMILY_OPTIONS.map(option => (
                      <option key={option.value || 'inherit'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {capabilities.supportsButtonRadiusControl && (
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
            )}

            {capabilities.supportsButtonBorderControl && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type de bordure bouton</label>
                  <select
                    value={section.design.colors?.buttonBorderStyle || 'none'}
                    onChange={(e) => updateDesign('colors', 'buttonBorderStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="none">Aucune</option>
                    <option value="solid">Continue</option>
                    <option value="dashed">Tirets</option>
                    <option value="dotted">Pointillés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Épaisseur bordure bouton ({section.design.colors?.buttonBorderWidth || '0px'})</label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={parseInt((section.design.colors?.buttonBorderWidth || '0').replace('px', ''), 10) || 0}
                    onChange={(e) => updateDesign('colors', 'buttonBorderWidth', `${e.target.value}px`)}
                    className="w-full"
                  />
                </div>

                <ColorOverrideField
                  label="Couleur bordure bouton"
                  value={section.design.colors?.buttonBorderColor}
                  fallback="#111827"
                  onChange={(v) => updateDesign('colors', 'buttonBorderColor', v)}
                  onClear={() => clearDesign('colors', 'buttonBorderColor')}
                />
              </>
            )}

            {capabilities.supportsButtonShadowControl && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ombre du bouton</label>
                <select
                  value={section.design.colors?.buttonShadow || 'none'}
                  onChange={(e) => updateDesign('colors', 'buttonShadow', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {BUTTON_SHADOW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CollapsibleSection>
        )}

        {capabilities.supportsIconStyle && (
          <CollapsibleSection title="Icônes" defaultOpen={false}>
            {capabilities.supportsIconColorOverrides && (
              <>
                <ColorOverrideField
                  label="Couleur contenu icône"
                  value={section.design.colors?.iconColor}
                  fallback="#111827"
                  onChange={(v) => updateDesign('colors', 'iconColor', v)}
                  onClear={() => clearDesign('colors', 'iconColor')}
                />

                <ColorOverrideField
                  label="Couleur fond icône"
                  value={section.design.colors?.iconBackground}
                  fallback="#F3F4F6"
                  onChange={(v) => updateDesign('colors', 'iconBackground', v)}
                  onClear={() => clearDesign('colors', 'iconBackground')}
                />

                <ColorOverrideField
                  label="Couleur contour icône"
                  value={section.design.colors?.iconBorderColor}
                  fallback="#D1D5DB"
                  onChange={(v) => updateDesign('colors', 'iconBorderColor', v)}
                  onClear={() => clearDesign('colors', 'iconBorderColor')}
                />
              </>
            )}

            {capabilities.supportsIconBorderControl && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Épaisseur contour icône ({section.design.colors?.iconBorderWidth || '0px'})</label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={parseInt((section.design.colors?.iconBorderWidth || '0').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('colors', 'iconBorderWidth', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
            )}

            {capabilities.supportsIconRadiusControl && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Arrondi du contour d'icône</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={parseInt((section.design.colors?.iconRadius || '12px').replace('px', ''), 10) || 12}
                    onChange={(e) => updateDesign('colors', 'iconRadius', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <input
                    type="text"
                    value={section.design.colors?.iconRadius || '12px'}
                    onChange={(e) => updateDesign('colors', 'iconRadius', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}

            {capabilities.supportsIconSizeControl && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Taille des icônes</label>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <input
                    type="range"
                    min="12"
                    max="64"
                    step="2"
                    value={parseInt(((section.design.colors as any)?.iconSize || '24px').replace('px', ''), 10) || 24}
                    onChange={(e) => updateDesign('colors', 'iconSize', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <input
                    type="text"
                    value={(section.design.colors as any)?.iconSize || '24px'}
                    onChange={(e) => updateDesign('colors', 'iconSize', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </CollapsibleSection>
        )}

        {(capabilities.supportsMediaOverlayOnSection || capabilities.supportsMediaOverlayOnFrame) && (
          <CollapsibleSection title="Images & vidéos" defaultOpen={false}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Arrondi des médias</label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="1"
                  value={parseInt((section.design.media?.imageRadius || '12px').replace('px', ''), 10) || 12}
                  onChange={(e) => updateDesign('media', 'imageRadius', `${e.target.value}px`)}
                  className="w-full"
                />
                <input
                  type="text"
                  value={section.design.media?.imageRadius || '12px'}
                  onChange={(e) => updateDesign('media', 'imageRadius', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <ImageUploadField
              label="Image à superposer (overlay)"
              value={section.design.media?.overlayImage || ''}
              onChange={(url) => updateDesign('media', 'overlayImage', url)}
              placeholder="URL du logo à superposer"
              mediaType="image"
            />

            {section.design.media?.overlayImage && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Cible de l'overlay</label>
                  <select
                    value={section.design.media?.overlayTarget || 'section'}
                    onChange={(e) => updateDesign('media', 'overlayTarget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="section">Section (wrapper)</option>
                    <option value="media">Média (frame image/vidéo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Position overlay</label>
                  <select
                    value={section.design.media?.overlayPosition || 'center'}
                    onChange={(e) => updateDesign('media', 'overlayPosition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="top-left">Haut gauche</option>
                    <option value="top-right">Haut droite</option>
                    <option value="bottom-left">Bas gauche</option>
                    <option value="bottom-right">Bas droite</option>
                    <option value="center">Centre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Taille overlay ({section.design.media?.overlaySize || 'auto'})</label>
                  <input
                    type="range"
                    min="32"
                    max="1500"
                    step="10"
                    value={parseInt((section.design.media?.overlaySize || '').replace('px', ''), 10) || 1500}
                    onChange={(e) => updateDesign('media', 'overlaySize', `${e.target.value}px`)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Couche overlay</label>
                  <select
                    value={section.design.media?.overlayZIndex ?? 'above-bg'}
                    onChange={(e) => updateDesign('media', 'overlayZIndex', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="behind-bg">Derrière l'arrière-plan</option>
                    <option value="above-bg">Au-dessus de l'arrière-plan</option>
                    <option value="above-content">Au-dessus du contenu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Opacité overlay ({Math.round((section.design.media?.overlayOpacity ?? 0.5) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((section.design.media?.overlayOpacity ?? 0.5) * 100)}
                    onChange={(e) => updateDesign('media', 'overlayOpacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Luminosité overlay ({Math.round((section.design.media?.overlayBrightness ?? 1) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    value={Math.round((section.design.media?.overlayBrightness ?? 1) * 100)}
                    onChange={(e) => updateDesign('media', 'overlayBrightness', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Contraste overlay ({Math.round((section.design.media?.overlayContrast ?? 1) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    value={Math.round((section.design.media?.overlayContrast ?? 1) * 100)}
                    onChange={(e) => updateDesign('media', 'overlayContrast', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Saturation overlay ({Math.round((section.design.media?.overlaySaturate ?? 1) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    value={Math.round((section.design.media?.overlaySaturate ?? 1) * 100)}
                    onChange={(e) => updateDesign('media', 'overlaySaturate', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {capabilities.supportsBackgroundVideo && (
              <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={section.design.media?.hideDecorationsOnVideoPlay === true}
                  onChange={(e) => updateDesign('media', 'hideDecorationsOnVideoPlay', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Masquer textes/icônes pendant lecture vidéo</span>
              </label>
            )}
          </CollapsibleSection>
        )}

        {capabilities.supportsBackground && (
          <CollapsibleSection title="Arrière-plan" defaultOpen={HEADER_WIDGET_TYPES.has(section.type)}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Type d'arrière-plan</label>
              <select
                value={section.design.background?.type || 'color'}
                onChange={(e) => {
                  const newType = e.target.value as 'color' | 'gradient' | 'image' | 'video' | 'transparent';
                  // Sync variant for header widgets: transparent background ↔ transparent variant
                  if (HEADER_WIDGET_TYPES.has(section.type)) {
                    if (newType === 'transparent' && section.variant !== 'transparent') {
                      onUpdateSection({
                        variant: 'transparent',
                        design: {
                          ...section.design,
                          background: { ...section.design.background, type: newType },
                        },
                      });
                      return;
                    }
                    if (newType !== 'transparent' && section.variant === 'transparent') {
                      onUpdateSection({
                        variant: 'default',
                        design: {
                          ...section.design,
                          background: { ...section.design.background, type: newType },
                        },
                      });
                      return;
                    }
                  }
                  onUpdateSection({
                    design: {
                      ...section.design,
                      background: { ...section.design.background, type: newType },
                    },
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {capabilities.supportsBackgroundColor && <option value="color">Couleur</option>}
                {capabilities.supportsBackgroundGradient && <option value="gradient">Dégradé</option>}
                {capabilities.supportsBackgroundImage && <option value="image">Image</option>}
                {capabilities.supportsBackgroundVideo && <option value="video">Vidéo</option>}
                {capabilities.supportsBackgroundTransparent && (
                  <option value="transparent">Transparent (backdrop blur)</option>
                )}
              </select>
            </div>

            {capabilities.supportsBackgroundTransparent && (section.design.background?.type === 'transparent' || (HEADER_WIDGET_TYPES.has(section.type) && section.variant === 'transparent')) && (
              <>
                <ColorOverrideField
                  label="Couleur du fond transparent"
                  value={section.design.background?.backdropColor || undefined}
                  fallback="#ffffff"
                  onChange={(v) => updateDesign('background', 'backdropColor', v)}
                  onClear={() => updateDesign('background', 'backdropColor', '')}
                />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacité du fond ({Math.round((section.design.background?.backdropOpacity ?? 0.75) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((section.design.background?.backdropOpacity ?? 0.75) * 100)}
                    onChange={(e) => updateDesign('background', 'backdropOpacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Intensité du flou ({section.design.background?.backdropBlur || '12px'})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={parseInt((section.design.background?.backdropBlur || '12px').replace('px', ''), 10) || 12}
                    onChange={(e) => updateDesign('background', 'backdropBlur', `${e.target.value}px`)}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 italic">
                  Le header se superposera au widget suivant avec un effet de transparence et de flou.
                </p>
              </>
            )}

            {capabilities.supportsBackgroundColor && section.design.background?.type === 'color' && (
              <ColorOverrideField
                label="Couleur de fond"
                value={section.design.background?.value || undefined}
                fallback="#ffffff"
                onChange={(v) => updateDesign('background', 'value', v)}
                onClear={() => updateDesign('background', 'value', '')}
              />
            )}

            {capabilities.supportsBackgroundGradient && section.design.background?.type === 'gradient' && (
              <GradientPicker
                value={section.design.background?.value || ''}
                onChange={(v) => updateDesign('background', 'value', v)}
              />
            )}

            {capabilities.supportsBackgroundImage && section.design.background?.type === 'image' && (
              <>
                <ImageUploadField
                  label="Image de fond"
                  value={section.design.background?.value || ''}
                  onChange={(url) => updateDesign('background', 'value', url)}
                  placeholder="URL de l'image de fond"
                  mediaType="image"
                />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacité de l'image ({Math.round((section.design.background?.opacity ?? 1) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((section.design.background?.opacity ?? 1) * 100)}
                    onChange={(e) => updateDesign('background', 'opacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
                <ColorOverrideField
                  label="Couleur de superposition"
                  value={section.design.background?.overlayColor || undefined}
                  fallback="#000000"
                  onChange={(v) => updateDesign('background', 'overlayColor', v)}
                  onClear={() => {
                    const bg = { ...(section.design.background || {}) };
                    delete (bg as any).overlayColor;
                    onUpdateSection({ design: { ...section.design, background: bg as any } });
                  }}
                />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacité superposition ({Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}
                    onChange={(e) => updateDesign('background', 'overlayOpacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {capabilities.supportsBackgroundVideo && section.design.background?.type === 'video' && (
              <>
                <ImageUploadField
                  label="Vidéo de fond"
                  value={section.design.background?.value || ''}
                  onChange={(url) => updateDesign('background', 'value', url)}
                  placeholder="https://youtube.com/embed/... ou vidéo mp4"
                  mediaType="video"
                />
                <ColorOverrideField
                  label="Couleur de superposition vidéo"
                  value={section.design.background?.overlayColor || undefined}
                  fallback="#000000"
                  onChange={(v) => updateDesign('background', 'overlayColor', v)}
                  onClear={() => {
                    const bg = { ...(section.design.background || {}) };
                    delete (bg as any).overlayColor;
                    onUpdateSection({ design: { ...section.design, background: bg as any } });
                  }}
                />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacité superposition ({Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((section.design.background?.overlayOpacity ?? 0.5) * 100)}
                    onChange={(e) => updateDesign('background', 'overlayOpacity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={section.design.background?.videoAutoplay !== false}
                    onChange={(e) => updateDesign('background', 'videoAutoplay', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Lecture automatique</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={section.design.background?.videoNoBranding === true}
                    onChange={(e) => updateDesign('background', 'videoNoBranding', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Sans branding YouTube</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={section.design.background?.videoFullWidth !== false}
                    onChange={(e) => updateDesign('background', 'videoFullWidth', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Pleine largeur</span>
                </label>
              </>
            )}
          </CollapsibleSection>
        )}

        {capabilities.supportsSectionBorders && (
          <CollapsibleSection title="Bordures de section" defaultOpen={false}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Arrondi de la section</label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="2"
                  value={parseInt((section.design.colors?.sectionRadius || '0px').replace('px', ''), 10) || 0}
                  onChange={(e) => updateDesign('colors', 'sectionRadius', `${e.target.value}px`)}
                  className="w-full"
                />
                <input
                  type="text"
                  value={section.design.colors?.sectionRadius || '0px'}
                  onChange={(e) => updateDesign('colors', 'sectionRadius', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </CollapsibleSection>
        )}

        {capabilities.supportsSpacing && (
          <CollapsibleSection title="Espacement" defaultOpen={false}>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding haut ({section.design.spacing.paddingTop})</label>
              <input
                type="range"
                min="0"
                max="320"
                step="4"
                value={parseInt((section.design.spacing.paddingTop || '0').replace('px', ''), 10) || 0}
                onChange={(e) => updateDesign('spacing', 'paddingTop', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Padding bas ({section.design.spacing.paddingBottom})</label>
              <input
                type="range"
                min="0"
                max="320"
                step="4"
                value={parseInt((section.design.spacing.paddingBottom || '0').replace('px', ''), 10) || 0}
                onChange={(e) => updateDesign('spacing', 'paddingBottom', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Marge haute ({section.design.spacing.marginTop})</label>
              <input
                type="range"
                min="0"
                max="200"
                step="4"
                value={parseInt((section.design.spacing.marginTop || '0').replace('px', ''), 10) || 0}
                onChange={(e) => updateDesign('spacing', 'marginTop', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Marge basse ({section.design.spacing.marginBottom})</label>
              <input
                type="range"
                min="0"
                max="200"
                step="4"
                value={parseInt((section.design.spacing.marginBottom || '0').replace('px', ''), 10) || 0}
                onChange={(e) => updateDesign('spacing', 'marginBottom', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
          </CollapsibleSection>
        )}

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
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Settings className="w-4 h-4" />
            <span>Contenu</span>
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'design'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Palette className="w-4 h-4" />
            <span>Design</span>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced'
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
