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

export { CANONICAL_WIDGET_FIELD_LABELS };