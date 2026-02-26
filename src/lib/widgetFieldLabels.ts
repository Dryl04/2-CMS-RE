/**
 * Canonical registry of widget field labels.
 *
 * Maps storage keys to their canonical French UI labels so that every editor
 * (PropertiesPanel quick-edit, ContentEditors, ContentEditors2) uses the same
 * wording for the same concept.
 *
 * Rule: storage keys are never renamed here – only the display labels are
 * standardised.
 */
export const WIDGET_FIELD_LABELS: Record<string, string> = {
  // ── Titres ──────────────────────────────────────────────────────────────────
  headline: 'Titre principal',
  title: 'Titre',
  logoText: 'Nom de marque',
  formTitle: 'Titre du formulaire',
  tagline: 'Accroche',

  // ── Sous-titres & paragraphes ────────────────────────────────────────────────
  subheadline: 'Sous-titre',
  subtitle: 'Sous-titre',
  description: 'Description',
  additionalText: 'Texte additionnel',
  privacyNote: 'Note de confidentialité',
  content: 'Contenu texte',

  // ── Textes de boutons ────────────────────────────────────────────────────────
  ctaText: 'Texte bouton principal',
  buttonText: 'Texte bouton',
  primaryCta: 'Texte bouton principal',
  secondaryCta: 'Texte bouton secondaire',
  primaryText: 'Texte bouton principal',
  secondaryText: 'Texte bouton secondaire',
  secondaryCtaText: 'Texte bouton secondaire',

  // ── Liens de boutons ─────────────────────────────────────────────────────────
  ctaLink: 'Lien bouton principal',
  buttonUrl: 'Lien bouton',
  primaryLink: 'Lien bouton principal',
  secondaryLink: 'Lien bouton secondaire',
  secondaryCtaLink: 'Lien bouton secondaire',
  link: 'Lien',
};

/** Returns the canonical label for a field key, or the key itself as fallback. */
export function fieldLabel(key: string): string {
  return WIDGET_FIELD_LABELS[key] ?? key;
}

/**
 * Field keys grouped by semantic category – used by PropertiesPanel for its
 * uniform quick-edit panel.
 */
export const TITLE_FIELD_KEYS = [
  'headline',
  'title',
  'logoText',
  'formTitle',
  'tagline',
] as const;

export const PARAGRAPH_FIELD_KEYS = [
  'subheadline',
  'subtitle',
  'description',
  'additionalText',
  'privacyNote',
  'content',
] as const;

export const BUTTON_TEXT_FIELD_KEYS = [
  'ctaText',
  'buttonText',
  'primaryCta',
  'secondaryCta',
  'primaryText',
  'secondaryText',
  'secondaryCtaText',
] as const;

export const BUTTON_LINK_FIELD_KEYS = [
  'ctaLink',
  'buttonUrl',
  'primaryLink',
  'secondaryLink',
  'secondaryCtaLink',
  'link',
] as const;
