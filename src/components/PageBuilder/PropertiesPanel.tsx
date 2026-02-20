import { useState } from 'react';
import { Settings, Palette, Code, ChevronDown, ChevronRight } from 'lucide-react';
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

const UNIFORM_FIELD_LABELS: Record<string, string> = {
  headline: 'Titre principal',
  title: 'Titre',
  logoText: 'Nom de marque',
  formTitle: 'Titre du formulaire',
  tagline: 'Accroche',
  subheadline: 'Sous-titre',
  subtitle: 'Sous-titre',
  description: 'Description',
  additionalText: 'Texte additionnel',
  privacyNote: 'Note de confidentialité',
  content: 'Contenu texte',
  ctaText: 'Texte bouton principal',
  buttonText: 'Texte bouton',
  primaryCta: 'Texte bouton principal',
  secondaryCta: 'Texte bouton secondaire',
  primaryText: 'Texte bouton principal',
  secondaryText: 'Texte bouton secondaire',
  ctaLink: 'Lien bouton principal',
  buttonUrl: 'Lien bouton',
  primaryLink: 'Lien bouton principal',
  secondaryLink: 'Lien bouton secondaire',
  link: 'Lien',
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

  const updateVariant = (newVariant: string) => {
    onUpdateSection({ variant: newVariant });
  };

  const renderUniformQuickEdit = () => {
    const content = section.content || {};

    const titleFields = TITLE_FIELD_KEYS.filter((key) => typeof content[key] === 'string');
    const paragraphFields = PARAGRAPH_FIELD_KEYS.filter((key) => typeof content[key] === 'string');
    const buttonTextFields = BUTTON_TEXT_FIELD_KEYS.filter((key) => typeof content[key] === 'string');
    const buttonLinkFields = BUTTON_LINK_FIELD_KEYS.filter((key) => typeof content[key] === 'string');

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
            {titleFields.map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{UNIFORM_FIELD_LABELS[key] || key}</label>
                <input
                  type="text"
                  value={section.content[key] || ''}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {paragraphFields.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Paragraphes</h4>
            {paragraphFields.map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{UNIFORM_FIELD_LABELS[key] || key}</label>
                <textarea
                  value={section.content[key] || ''}
                  onChange={(e) => updateContent(key, e.target.value)}
                  rows={key === 'description' || key === 'content' ? 3 : 2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {(buttonTextFields.length > 0 || buttonLinkFields.length > 0) && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Boutons & liens</h4>
            {buttonTextFields.map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{UNIFORM_FIELD_LABELS[key] || key}</label>
                <input
                  type="text"
                  value={section.content[key] || ''}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            {buttonLinkFields.map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{UNIFORM_FIELD_LABELS[key] || key}</label>
                <input
                  type="text"
                  value={section.content[key] || ''}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
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
        return <HeroWithServicesContentEditor {...editorProps} />;
      case 'clickfunnels-hero':
        return <div className="space-y-5">{quickEdit}<ClickFunnelsHeroContentEditor {...editorProps} /></div>;
      case 'membership-pricing':
        return <MembershipPricingContentEditor {...editorProps} />;
      case 'bento-features':
        return <BentoFeaturesContentEditor {...editorProps} />;
      case 'features-carousel':
        return <FeaturesCarouselContentEditor {...editorProps} />;
      default:
        return (
          <div className="space-y-4">
            {quickEdit}
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
    if (HERO_SEO_WIDGET_TYPES.has(section.type)) {
      return (
        <div className="space-y-2">
          <WidgetThemeSelector section={section} onUpdateSection={onUpdateSection} />

          <CollapsibleSection title="Palette globale" defaultOpen={false}>
            <ColorOverrideField
              label="Couleur Dominante"
              value={section.design.colors?.accent}
              fallback="#111827"
              onChange={(v) => updateDesign('colors', 'accent', v)}
              onClear={() => clearDesign('colors', 'accent')}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Typographie des titres" defaultOpen={false}>
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
          </CollapsibleSection>

          <CollapsibleSection title="Boutons" defaultOpen={false}>
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
              <label className="block text-xs text-gray-600 mb-1">Épaisseur bordure bouton</label>
              <input
                type="text"
                value={section.design.colors?.buttonBorderWidth || '0px'}
                onChange={(e) => updateDesign('colors', 'buttonBorderWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="ex: 0px, 1px"
              />
            </div>

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

            <ColorOverrideField
              label="Couleur bordure bouton"
              value={section.design.colors?.buttonBorderColor}
              fallback="#111827"
              onChange={(v) => updateDesign('colors', 'buttonBorderColor', v)}
              onClear={() => clearDesign('colors', 'buttonBorderColor')}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Icônes" defaultOpen={false}>
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
            <div>
              <label className="block text-xs text-gray-600 mb-1">Épaisseur contour icône</label>
              <input
                type="text"
                value={section.design.colors?.iconBorderWidth || '0px'}
                onChange={(e) => updateDesign('colors', 'iconBorderWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="ex: 1px"
              />
            </div>
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
          </CollapsibleSection>

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
            <div>
              <label className="block text-xs text-gray-600 mb-1">Position overlay</label>
              <select
                value={section.design.media?.overlayPosition || 'bottom-right'}
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
              <label className="block text-xs text-gray-600 mb-1">Taille overlay</label>
              <input
                type="text"
                value={section.design.media?.overlaySize || '84px'}
                onChange={(e) => updateDesign('media', 'overlaySize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="ex: 84px"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={section.design.media?.hideDecorationsOnVideoPlay === true}
                onChange={(e) => updateDesign('media', 'hideDecorationsOnVideoPlay', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>Masquer textes/icônes pendant lecture vidéo</span>
            </label>
          </CollapsibleSection>

          {section.type === 'hero' && (
            <CollapsibleSection title="Paramètres Hero avancés" defaultOpen={false}>
              <HeroAdvancedEditor section={section} updateDesign={updateDesign} />
            </CollapsibleSection>
          )}
        </div>
      );
    }

    const hasAnyColorOverride = !!(
      section.design.typography?.headingColor ||
      section.design.typography?.h1Color ||
      section.design.typography?.h2Color ||
      section.design.typography?.subtitleColor ||
      section.design.typography?.textColor ||
      section.design.typography?.linkColor ||
      section.design.colors?.accent ||
      section.design.colors?.buttonBackground ||
      section.design.colors?.buttonText ||
      section.design.colors?.buttonBackgroundHover ||
      section.design.colors?.buttonBorderColor ||
      section.design.colors?.iconBackground ||
      section.design.colors?.iconColor ||
      section.design.colors?.iconBorderColor ||
      (section.design.background?.value && section.design.background.value !== '')
    );

    const resetAllColors = () => {
      const typo = { ...(section.design.typography || {}) };
      delete typo.headingColor;
      delete typo.h1Color;
      delete typo.h2Color;
      delete typo.subtitleColor;
      delete typo.textColor;
      delete typo.linkColor;
      const colors = { ...(section.design.colors || {}) };
      delete colors.accent;
      delete colors.buttonBackground;
      delete colors.buttonText;
      delete colors.buttonBackgroundHover;
      delete colors.buttonBorderColor;
      delete colors.iconBackground;
      delete colors.iconColor;
      delete colors.iconBorderColor;
      onUpdateSection({
        design: {
          ...section.design,
          typography: typo,
          colors,
          background: { ...section.design.background, value: '' },
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

        <CollapsibleSection title="Palette globale" defaultOpen={false}>
          <ColorOverrideField
            label="Couleur Dominante"
            value={section.design.colors?.accent}
            fallback="#111827"
            onChange={(v) => updateDesign('colors', 'accent', v)}
            onClear={() => clearDesign('colors', 'accent')}
          />
        </CollapsibleSection>

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

          <ColorOverrideField
            label="Couleur H1 (spécifique)"
            value={section.design.typography?.h1Color}
            fallback="#111827"
            onChange={(v) => updateDesign('typography', 'h1Color', v)}
            onClear={() => clearDesign('typography', 'h1Color')}
          />

          <ColorOverrideField
            label="Couleur H2 (spécifique)"
            value={section.design.typography?.h2Color}
            fallback="#1F2937"
            onChange={(v) => updateDesign('typography', 'h2Color', v)}
            onClear={() => clearDesign('typography', 'h2Color')}
          />

          <ColorOverrideField
            label="Couleur sous-titre"
            value={section.design.typography?.subtitleColor}
            fallback="#6B7280"
            onChange={(v) => updateDesign('typography', 'subtitleColor', v)}
            onClear={() => clearDesign('typography', 'subtitleColor')}
          />

          <ColorOverrideField
            label="Couleur texte corps"
            value={section.design.typography?.textColor}
            fallback="#4B5563"
            onChange={(v) => updateDesign('typography', 'textColor', v)}
            onClear={() => clearDesign('typography', 'textColor')}
          />

          <ColorOverrideField
            label="Couleur liens / menu navigation"
            value={section.design.typography?.linkColor}
            fallback="#111827"
            onChange={(v) => updateDesign('typography', 'linkColor', v)}
            onClear={() => clearDesign('typography', 'linkColor')}
          />

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

        <CollapsibleSection title="Boutons" defaultOpen={false}>
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
            <label className="block text-xs text-gray-600 mb-1">Épaisseur bordure bouton</label>
            <input
              type="text"
              value={section.design.colors?.buttonBorderWidth || '0px'}
              onChange={(e) => updateDesign('colors', 'buttonBorderWidth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="ex: 0px, 1px"
            />
          </div>

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

          <ColorOverrideField
            label="Couleur bordure bouton"
            value={section.design.colors?.buttonBorderColor}
            fallback="#111827"
            onChange={(v) => updateDesign('colors', 'buttonBorderColor', v)}
            onClear={() => clearDesign('colors', 'buttonBorderColor')}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Icônes" defaultOpen={false}>
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

          <div>
            <label className="block text-xs text-gray-600 mb-1">Épaisseur contour icône</label>
            <input
              type="text"
              value={section.design.colors?.iconBorderWidth || '0px'}
              onChange={(e) => updateDesign('colors', 'iconBorderWidth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="ex: 1px"
            />
          </div>

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
        </CollapsibleSection>

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

          <div>
            <label className="block text-xs text-gray-600 mb-1">Position overlay</label>
            <select
              value={section.design.media?.overlayPosition || 'bottom-right'}
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
            <label className="block text-xs text-gray-600 mb-1">Taille overlay</label>
            <input
              type="text"
              value={section.design.media?.overlaySize || '84px'}
              onChange={(e) => updateDesign('media', 'overlaySize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="ex: 84px"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={section.design.media?.hideDecorationsOnVideoPlay === true}
              onChange={(e) => updateDesign('media', 'hideDecorationsOnVideoPlay', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span>Masquer textes/icônes pendant lecture vidéo</span>
          </label>
        </CollapsibleSection>

        <CollapsibleSection title="Arrière-plan" defaultOpen={false}>
          <ColorOverrideField
            label="Couleur de fond"
            value={section.design.background?.value || undefined}
            fallback="#ffffff"
            onChange={(v) => updateDesign('background', 'value', v)}
            onClear={() => updateDesign('background', 'value', '')}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Espacement" defaultOpen={false}>
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
          <div>
            <label className="block text-xs text-gray-600 mb-1">Marge haute</label>
            <input
              type="text"
              value={section.design.spacing.marginTop}
              onChange={(e) => updateDesign('spacing', 'marginTop', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="ex: 0px"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Marge basse</label>
            <input
              type="text"
              value={section.design.spacing.marginBottom}
              onChange={(e) => updateDesign('spacing', 'marginBottom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="ex: 0px"
            />
          </div>
        </CollapsibleSection>

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
