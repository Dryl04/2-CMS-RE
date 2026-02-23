import { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, Palette, Code, ChevronDown, ChevronRight, Bold, Italic, Link2, Underline } from 'lucide-react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import { widgetLibrary } from '../../lib/widgetLibrary';
import { supabase } from '../../lib/supabase';
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

/** Mini rich-text textarea with Bold / Italic / Underline / Link toolbar */
function RichTextArea({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end);

      // Toggle OFF: check if selection is already wrapped with the tag
      if (selected.startsWith(before) && selected.endsWith(after)) {
        // Remove outer tags from selection
        const inner = selected.slice(before.length, selected.length - after.length);
        const newValue = value.substring(0, start) + inner + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.selectionStart = start;
          ta.selectionEnd = start + inner.length;
        });
        return;
      }

      // Toggle OFF: check if surrounding text wraps the selection
      const beforeStart = start - before.length;
      const afterEnd = end + after.length;
      if (
        beforeStart >= 0 &&
        afterEnd <= value.length &&
        value.substring(beforeStart, start) === before &&
        value.substring(end, afterEnd) === after
      ) {
        const newValue = value.substring(0, beforeStart) + selected + value.substring(afterEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.selectionStart = beforeStart;
          ta.selectionEnd = beforeStart + selected.length;
        });
        return;
      }

      // Toggle ON: wrap selection
      const newValue =
        value.substring(0, start) + before + selected + after + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = end + before.length;
      });
    },
    [value, onChange],
  );

  const handleBold = () => wrapSelection('<b>', '</b>');
  const handleItalic = () => wrapSelection('<i>', '</i>');
  const handleUnderline = () => wrapSelection('<u>', '</u>');
  const handleLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const url = prompt('URL du lien :', 'https://');
    if (!url) return;
    const linkHTML = `<a href="${url}">${selected || url}</a>`;
    const newValue = value.substring(0, start) + linkHTML + value.substring(end);
    onChange(newValue);
  };

  const btnClass =
    'p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors';

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="flex gap-0.5 mb-1">
        <button type="button" className={btnClass} onClick={handleBold} title="Gras (HTML)">
          <Bold size={13} />
        </button>
        <button type="button" className={btnClass} onClick={handleItalic} title="Italique (HTML)">
          <Italic size={13} />
        </button>
        <button type="button" className={btnClass} onClick={handleUnderline} title="Souligné (HTML)">
          <Underline size={13} />
        </button>
        <button type="button" className={btnClass} onClick={handleLink} title="Lien (HTML)">
          <Link2 size={13} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
      />
    </div>
  );
}

/** Cached list of existing page slugs for link autosuggestion */
let _cachedPageSlugs: { slug: string; title: string }[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 min

async function fetchPageSlugs(): Promise<{ slug: string; title: string }[]> {
  const now = Date.now();
  if (_cachedPageSlugs && now - _cacheTimestamp < CACHE_TTL) return _cachedPageSlugs;
  try {
    const { data } = await supabase
      .from('seo_metadata')
      .select('slug, title')
      .order('title', { ascending: true })
      .limit(500);
    _cachedPageSlugs = (data || []).map((p) => ({
      slug: `/${p.slug}`,
      title: p.title || p.slug,
    }));
    _cacheTimestamp = now;
  } catch {
    _cachedPageSlugs = [];
  }
  return _cachedPageSlugs!;
}

/** Input with autocomplete dropdown suggesting existing page slugs */
function LinkAutosuggestInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<{ slug: string; title: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPages, setAllPages] = useState<{ slug: string; title: string }[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPageSlugs().then(setAllPages);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    onChange(val);
    if (val.startsWith('/') || val === '') {
      const q = val.toLowerCase();
      const filtered = allPages
        .filter((p) => p.slug.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (value.startsWith('/') || value === '') {
            handleInputChange(value);
          }
        }}
        placeholder="https://... ou / pour pages internes"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((page) => (
            <button
              key={page.slug}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex flex-col border-b border-gray-50 last:border-0"
              onClick={() => {
                onChange(page.slug);
                setShowSuggestions(false);
              }}
            >
              <span className="font-medium text-gray-800 truncate">{page.title}</span>
              <span className="text-gray-400 truncate">{page.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
            <p className="text-[10px] text-gray-400">Supporte le HTML : &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;a&gt;</p>
            {paragraphFields.map((key) => (
              <RichTextArea
                key={key}
                label={UNIFORM_FIELD_LABELS[key] || key}
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
              <LinkAutosuggestInput
                key={key}
                label={UNIFORM_FIELD_LABELS[key] || key}
                value={section.content[key] || ''}
                onChange={(val) => updateContent(key, val)}
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
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-2">Palettes prédéfinies</label>
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => {
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
                    }}
                    className="flex flex-col items-center p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                    title={palette.name}
                  >
                    <div className="flex gap-0.5 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.buttonBg }} />
                    </div>
                    <span className="text-[9px] text-gray-500">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>
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
            <div>
              <label className="block text-xs text-gray-600 mb-1">Taille des icônes</label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <input
                  type="range"
                  min="12"
                  max="64"
                  step="2"
                  value={parseInt((section.design.colors?.iconSize || '24px').replace('px', ''), 10) || 24}
                  onChange={(e) => updateDesign('colors', 'iconSize', `${e.target.value}px`)}
                  className="w-full"
                />
                <input
                  type="text"
                  value={section.design.colors?.iconSize || '24px'}
                  onChange={(e) => updateDesign('colors', 'iconSize', e.target.value)}
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
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-2">Palettes prédéfinies</label>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => {
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
                  }}
                  className="flex flex-col items-center p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                  title={palette.name}
                >
                  <div className="flex gap-0.5 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accent }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.buttonBg }} />
                  </div>
                  <span className="text-[9px] text-gray-500">{palette.name}</span>
                </button>
              ))}
            </div>
          </div>
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
          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille des icônes</label>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <input
                type="range"
                min="12"
                max="64"
                step="2"
                value={parseInt((section.design.colors?.iconSize || '24px').replace('px', ''), 10) || 24}
                onChange={(e) => updateDesign('colors', 'iconSize', `${e.target.value}px`)}
                className="w-full"
              />
              <input
                type="text"
                value={section.design.colors?.iconSize || '24px'}
                onChange={(e) => updateDesign('colors', 'iconSize', e.target.value)}
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
          <div>
            <label className="block text-xs text-gray-600 mb-1">Type d'arrière-plan</label>
            <select
              value={section.design.background?.type || 'color'}
              onChange={(e) => {
                const newType = e.target.value as 'color' | 'gradient' | 'image' | 'video';
                onUpdateSection({
                  design: {
                    ...section.design,
                    background: { ...section.design.background, type: newType },
                  },
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="color">Couleur</option>
              <option value="gradient">Dégradé</option>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
            </select>
          </div>

          {section.design.background?.type === 'color' && (
            <ColorOverrideField
              label="Couleur de fond"
              value={section.design.background?.value || undefined}
              fallback="#ffffff"
              onChange={(v) => updateDesign('background', 'value', v)}
              onClear={() => updateDesign('background', 'value', '')}
            />
          )}

          {section.design.background?.type === 'gradient' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dégradé CSS</label>
              <input
                type="text"
                value={section.design.background?.value || ''}
                onChange={(e) => updateDesign('background', 'value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </div>
          )}

          {section.design.background?.type === 'image' && (
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

          {section.design.background?.type === 'video' && (
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
                  checked={section.design.background?.videoFullWidth === true}
                  onChange={(e) => updateDesign('background', 'videoFullWidth', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Pleine largeur</span>
              </label>
            </>
          )}
        </CollapsibleSection>

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
