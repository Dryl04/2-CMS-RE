const CANONICAL_WIDGET_FIELD_LABELS: Record<string, string> = {
  headline: 'Titre principal',
  title: 'Titre principal',
  logoText: 'Nom de marque',
  formTitle: 'Titre du formulaire',
  tagline: 'Accroche',
  subheadline: 'Sous-titre',
  subtitle: 'Sous-titre',
  description: 'Description',
  additionalText: 'Texte additionnel',
  privacyNote: 'Note de confidentialité',
  content: 'Contenu',
  ctaText: 'Texte bouton principal',
  buttonText: 'Texte bouton principal',
  primaryCta: 'Texte bouton principal',
  secondaryCta: 'Texte bouton secondaire',
  primaryText: 'Texte bouton principal',
  secondaryText: 'Texte bouton secondaire',
  ctaLink: 'Lien bouton principal',
  buttonUrl: 'Lien bouton principal',
  primaryLink: 'Lien bouton principal',
  secondaryLink: 'Lien bouton secondaire',
  link: 'Lien',
};

// ---------------------------------------------------------------------------
// Widget-type-aware labels with HTML tag suffix (H1, H2, H3, etc.)
// ---------------------------------------------------------------------------

/** Widgets where `headline` or `title` renders as <h1> */
const H1_TITLE_WIDGETS = new Set([
  'hero',
  'clickfunnels-hero',
  'simple-centered-hero',
  'brand-identity-hero',
  'creative-network-hero',
  'hero-with-services',
  'hero-with-testimonials',
  'centered-testimonial',
]);

/** Widgets where `subtitle` or `subheadline` renders as <h2> */
const H2_SUBTITLE_WIDGETS = new Set([
  'hero',
  'clickfunnels-hero',
  'simple-centered-hero',
  'brand-identity-hero',
  'creative-network-hero',
  'hero-with-services',
  'hero-with-testimonials',
  'centered-testimonial',
]);

/** Per-widget-type + field → specific label with tag (overrides generic) */
const WIDGET_SPECIFIC_LABELS: Record<string, Record<string, string>> = {
  // Hero widgets (title = H1)
  'hero': {
    headline: 'Titre principal H1',
    subheadline: 'Sous-titre H2',
  },
  'clickfunnels-hero': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
    tagline: 'Accroche',
  },
  'simple-centered-hero': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
  },
  'brand-identity-hero': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
  },
  'creative-network-hero': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
  },
  'hero-with-services': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
    description: 'Description',
  },
  'hero-with-testimonials': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
    description: 'Description',
  },
  'centered-testimonial': {
    title: 'Titre principal H1',
    subtitle: 'Sous-titre H2',
  },
  // Section widgets (title = H2)
  'cta': {
    headline: 'Titre H2',
    description: 'Description',
  },
  'features': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'contact': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'testimonials': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'image-text-split': {
    headline: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'content-showcase': {
    headline: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'centered-content': {
    headline: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
  'text-columns': {
    title: 'Titre H2',
    introduction: 'Introduction',
  },
  'pricing': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'membership-pricing': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
  'stats': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'team': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'faq': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'faq-two-columns': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'logocloud': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'videohero': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'gallery': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'timeline': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'timeline-grid': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'newsletter': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'process': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'process-steps-cards': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'services-grid': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
  'contact-split': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
    formTitle: 'Titre du formulaire H3',
  },
  'feedback-contact': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
    formTitle: 'Titre du formulaire H3',
  },
  'services-cards': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
  'services-carousel': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
  'editorial-cards-row': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'minimal-final-cta': {
    title: 'Titre H2',
  },
  'social-follow': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'newsletter-signup': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'bento-features': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'features-carousel': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'clickfunnel-features': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
  },
  'content-with-services': {
    title: 'Titre H2',
    subtitle: 'Sous-titre',
    description: 'Description',
  },
};

const normalizeLabelKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const NORMALIZED_CANONICAL_WIDGET_FIELD_LABELS: Record<string, string> = Object.entries(
  CANONICAL_WIDGET_FIELD_LABELS,
).reduce((acc, [key, label]) => {
  acc[normalizeLabelKey(key)] = label;
  return acc;
}, {} as Record<string, string>);

export const getWidgetFieldLabel = (key: string) => CANONICAL_WIDGET_FIELD_LABELS[key];

export const getWidgetFieldLabelNormalized = (key: string) =>
  NORMALIZED_CANONICAL_WIDGET_FIELD_LABELS[normalizeLabelKey(key)];

/**
 * Get the field label for a specific widget type, with HTML tag suffix (e.g. "Titre principal H1").
 * Falls back to generic label if no widget-specific override exists.
 */
export const getWidgetFieldLabelForType = (widgetType: string, key: string): string => {
  const specific = WIDGET_SPECIFIC_LABELS[widgetType]?.[key];
  if (specific) return specific;
  return CANONICAL_WIDGET_FIELD_LABELS[key] || key;
};

export { CANONICAL_WIDGET_FIELD_LABELS, H1_TITLE_WIDGETS, H2_SUBTITLE_WIDGETS, WIDGET_SPECIFIC_LABELS };