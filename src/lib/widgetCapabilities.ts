/**
 * Widget capabilities matrix — defines which design sections are relevant
 * for each widget type in the PropertiesPanel.
 *
 * Fields:
 *   supportsTypography – show "Typographie" section (fonts, colors, weights)
 *   supportsPalette    – show "Palette globale" section (accent color, presets)
 *   supportsButtons    – show "Boutons" section (button colors, radius, border…)
 *   supportsIcons      – show "Icônes" section (icon color, background, radius…)
 *   supportsMedia      – show "Images & vidéos" section (image radius, overlay…)
 *
 * Any widget type NOT listed falls back to DEFAULT_CAPABILITIES (all true),
 * so adding new widgets is safe without updating this file.
 */
export interface WidgetCapabilities {
  supportsTypography: boolean;
  supportsPalette: boolean;
  supportsButtons: boolean;
  supportsIcons: boolean;
  supportsMedia: boolean;
}

const DEFAULT_CAPABILITIES: WidgetCapabilities = {
  supportsTypography: true,
  supportsPalette: true,
  supportsButtons: true,
  supportsIcons: true,
  supportsMedia: true,
};

// prettier-ignore
const WIDGET_CAPABILITY_MAP: Record<string, WidgetCapabilities> = {
  // ── Navigation ──────────────────────────────────────────────────────────
  'header':                { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'simple-header-divider': { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'header-top-info':       { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'header-with-icons':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'header-account-bar':    { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'header-full-contact':   { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'header-clickfunnel':    { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },

  // ── Hero / Landing ───────────────────────────────────────────────────────
  'hero':                  { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'clickfunnels-hero':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'clickfunnel-center-card':{ supportsTypography: true, supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'brand-identity-hero':   { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'simple-centered-hero':  { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'creative-network-hero': { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'hero-with-services':    { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'hero-with-testimonials':{ supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'videohero':             { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: true  },
  'immersive-split-showcase':{ supportsTypography: true, supportsPalette: true, supportsButtons: true,  supportsIcons: false, supportsMedia: true  },

  // ── Features / Services ─────────────────────────────────────────────────
  'features':              { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: true,  supportsMedia: false },
  'services-grid':         { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'services-cards':        { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: true  },
  'services-carousel':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'bento-features':        { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'features-carousel':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'content-with-services': { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'dropcap-services':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'integrations-grid':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },

  // ── Process / Timeline ──────────────────────────────────────────────────
  'process':               { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: true,  supportsMedia: false },
  'process-alternating':   { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'process-steps-cards':   { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'timeline':              { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'timeline-grid':         { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },

  // ── Social proof ────────────────────────────────────────────────────────
  'testimonials':          { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'centered-testimonial':  { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'stats':                 { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'team':                  { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'logocloud':             { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'provider-masonry':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },

  // ── Content / Editorial ─────────────────────────────────────────────────
  'cta':                   { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'image-text-split':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'content-showcase':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'centered-content':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'text-columns':          { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'gallery':               { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'image-stats-faq':       { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'split-content-checklist':{ supportsTypography: true, supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'editorial-cards-row':   { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: true  },
  'content-video-services':{ supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: true  },

  // ── Contact / Forms ─────────────────────────────────────────────────────
  'contact':               { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'contact-split':         { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'feedback-contact':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'newsletter':            { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: true,  supportsMedia: false },
  'newsletter-signup':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },

  // ── Pricing ─────────────────────────────────────────────────────────────
  'pricing':               { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },
  'membership-pricing':    { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },

  // ── FAQ ─────────────────────────────────────────────────────────────────
  'faq':                   { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: true,  supportsMedia: false },
  'faq-two-columns':       { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },

  // ── Footer ──────────────────────────────────────────────────────────────
  'footer':                { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'cinematic-footer':      { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'minimal-final-cta':     { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },

  // ── Social ───────────────────────────────────────────────────────────────
  'social-follow':         { supportsTypography: true,  supportsPalette: true,  supportsButtons: true,  supportsIcons: false, supportsMedia: false },

  // ── ClickFunnel variants ─────────────────────────────────────────────────
  'click-funnel-testimonials':{ supportsTypography: true, supportsPalette: true, supportsButtons: false, supportsIcons: false, supportsMedia: true  },
  'clickfunnel-features':  { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'clickfunnel-footer':    { supportsTypography: true,  supportsPalette: true,  supportsButtons: false, supportsIcons: false, supportsMedia: false },

  // ── Developer / Embed ────────────────────────────────────────────────────
  'embed':                 { supportsTypography: false, supportsPalette: false, supportsButtons: false, supportsIcons: false, supportsMedia: false },
  'code-insert':           { supportsTypography: false, supportsPalette: false, supportsButtons: false, supportsIcons: false, supportsMedia: false },
};

/** Returns the capabilities for a given widget type. Falls back to all-true defaults. */
export function getWidgetCapabilities(type: string): WidgetCapabilities {
  return WIDGET_CAPABILITY_MAP[type] ?? DEFAULT_CAPABILITIES;
}
