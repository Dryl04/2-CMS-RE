import { widgetLibrary } from './widgetLibrary';

type WidgetQuickEditCapabilities = {
  titleKeys: string[];
  paragraphKeys: string[];
  buttonTextKeys: string[];
  buttonLinkKeys: string[];
};

export type WidgetCapabilities = {
  contentKeys: string[];
  quickEdit: WidgetQuickEditCapabilities;
  supportsBackground: boolean;
  supportsBackgroundColor: boolean;
  supportsBackgroundGradient: boolean;
  supportsBackgroundImage: boolean;
  supportsBackgroundTransparent: boolean;
  supportsPalette: boolean;
  supportsTypography: boolean;
  supportsH1: boolean;
  supportsH2: boolean;
  supportsSubtitleTypography: boolean;
  supportsBodyTypography: boolean;
  supportsLinkTypography: boolean;
  supportsButtons: boolean;
  supportsButtonStyle: boolean;
  supportsButtonColorOverrides: boolean;
  supportsButtonSizeControl: boolean;
  supportsButtonTypographyControl: boolean;
  supportsButtonRadiusControl: boolean;
  supportsButtonBorderControl: boolean;
  supportsButtonShadowControl: boolean;
  supportsIcons: boolean;
  supportsIconStyle: boolean;
  supportsIconColorOverrides: boolean;
  supportsIconBorderControl: boolean;
  supportsIconRadiusControl: boolean;
  supportsIconSizeControl: boolean;
  supportsMedia: boolean;
  supportsMediaOverlayOnSection: boolean;
  supportsMediaOverlayOnFrame: boolean;
  supportsBackgroundVideo: boolean;
  supportsSectionBorders: boolean;
  supportsSpacing: boolean;
};

const TITLE_KEYS = ['headline', 'title', 'logoText', 'formTitle', 'tagline'];
const PARAGRAPH_KEYS = ['subheadline', 'subtitle', 'description', 'additionalText', 'privacyNote', 'content'];
const BUTTON_TEXT_KEYS = ['ctaText', 'buttonText', 'primaryCta', 'secondaryCta', 'primaryText', 'secondaryText'];
const BUTTON_LINK_KEYS = ['ctaLink', 'buttonUrl', 'primaryLink', 'secondaryLink', 'link'];

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const collectKeys = (input: unknown, keySet: Set<string>) => {
  if (Array.isArray(input)) {
    input.forEach((item) => collectKeys(item, keySet));
    return;
  }

  if (!input || typeof input !== 'object') return;

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    keySet.add(key);
    collectKeys(value, keySet);
  });
};

const intersectByNormalized = (allKeys: string[], allowedKeys: string[]) => {
  const allowedNormalized = new Set(allowedKeys.map(normalizeKey));
  return allowedKeys.filter((allowedKey) =>
    allKeys.some((existing) => normalizeKey(existing) === normalizeKey(allowedKey) && allowedNormalized.has(normalizeKey(allowedKey))),
  );
};

const hasAnyNormalized = (allKeys: string[], keys: string[]) => {
  const normalized = new Set(allKeys.map(normalizeKey));
  return keys.some((key) => normalized.has(normalizeKey(key)));
};

type WidgetCapabilityFlags = Omit<
  WidgetCapabilities,
  | 'contentKeys'
  | 'quickEdit'
  | 'supportsH1'
  | 'supportsH2'
  | 'supportsSubtitleTypography'
  | 'supportsBodyTypography'
  | 'supportsLinkTypography'
>;

type CapabilityProfile =
  | 'layout'
  | 'text'
  | 'text-buttons'
  | 'media-text'
  | 'media-text-buttons'
  | 'icon-text'
  | 'icon-text-buttons'
  | 'media-icon-text'
  | 'media-icon-text-buttons';

const SECURE_FALSE_FLAGS: WidgetCapabilityFlags = {
  supportsBackground: false,
  supportsBackgroundColor: false,
  supportsBackgroundGradient: false,
  supportsBackgroundImage: false,
  supportsBackgroundTransparent: false,
  supportsPalette: false,
  supportsTypography: false,
  supportsButtons: false,
  supportsButtonStyle: false,
  supportsButtonColorOverrides: false,
  supportsButtonSizeControl: false,
  supportsButtonTypographyControl: false,
  supportsButtonRadiusControl: false,
  supportsButtonBorderControl: false,
  supportsButtonShadowControl: false,
  supportsIcons: false,
  supportsIconStyle: false,
  supportsIconColorOverrides: false,
  supportsIconBorderControl: false,
  supportsIconRadiusControl: false,
  supportsIconSizeControl: false,
  supportsMedia: false,
  supportsMediaOverlayOnSection: false,
  supportsMediaOverlayOnFrame: false,
  supportsBackgroundVideo: false,
  supportsSectionBorders: false,
  supportsSpacing: false,
};

const BASE_LAYOUT_FLAGS: WidgetCapabilityFlags = {
  ...SECURE_FALSE_FLAGS,
  supportsBackground: true,
  supportsBackgroundColor: true,
  supportsBackgroundGradient: true,
  supportsBackgroundImage: true,
  supportsSectionBorders: true,
  supportsSpacing: true,
};

const FLAGS_BY_PROFILE: Record<CapabilityProfile, WidgetCapabilityFlags> = {
  layout: {
    ...BASE_LAYOUT_FLAGS,
  },
  text: {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
  },
  'text-buttons': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsButtons: true,
    supportsButtonStyle: true,
  },
  'media-text': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsMedia: true,
    supportsMediaOverlayOnSection: true,
    supportsMediaOverlayOnFrame: true,
  },
  'media-text-buttons': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsButtons: true,
    supportsButtonStyle: true,
    supportsMedia: true,
    supportsMediaOverlayOnSection: true,
    supportsMediaOverlayOnFrame: true,
  },
  'icon-text': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsIcons: true,
    supportsIconStyle: true,
  },
  'icon-text-buttons': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsButtons: true,
    supportsButtonStyle: true,
    supportsIcons: true,
    supportsIconStyle: true,
  },
  'media-icon-text': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsIcons: true,
    supportsIconStyle: true,
    supportsMedia: true,
    supportsMediaOverlayOnSection: true,
    supportsMediaOverlayOnFrame: true,
  },
  'media-icon-text-buttons': {
    ...BASE_LAYOUT_FLAGS,
    supportsPalette: true,
    supportsTypography: true,
    supportsButtons: true,
    supportsButtonStyle: true,
    supportsIcons: true,
    supportsIconStyle: true,
    supportsMedia: true,
    supportsMediaOverlayOnSection: true,
    supportsMediaOverlayOnFrame: true,
  },
};

const PROFILE_BY_WIDGET_TYPE: Record<string, CapabilityProfile> = {
  header: 'text-buttons',
  hero: 'media-text-buttons',
  'clickfunnels-hero': 'text-buttons',
  'clickfunnel-center-card': 'media-text-buttons',
  features: 'icon-text',
  cta: 'media-text-buttons',
  testimonials: 'media-text',
  contact: 'text-buttons',
  footer: 'text-buttons',
  pricing: 'text-buttons',
  stats: 'text',
  team: 'media-text',
  faq: 'text',
  logocloud: 'media-text',
  videohero: 'media-text-buttons',
  gallery: 'media-text',
  timeline: 'media-text',
  newsletter: 'media-text-buttons',
  process: 'icon-text',
  'image-text-split': 'media-text-buttons',
  'content-showcase': 'media-text',
  'centered-content': 'media-text-buttons',
  'text-columns': 'text-buttons',
  'services-grid': 'icon-text-buttons',
  'contact-split': 'text-buttons',
  'feedback-contact': 'text-buttons',
  'services-cards': 'media-icon-text-buttons',
  'membership-pricing': 'text-buttons',
  'faq-two-columns': 'text',
  'integrations-grid': 'icon-text',
  'hero-with-services': 'media-icon-text-buttons',
  'image-stats-faq': 'media-icon-text',
  'timeline-grid': 'media-text',
  'newsletter-signup': 'text-buttons',
  'social-follow': 'icon-text',
  'services-carousel': 'media-icon-text-buttons',
  'bento-features': 'media-icon-text',
  'features-carousel': 'icon-text-buttons',
  'content-with-services': 'media-icon-text-buttons',
  'split-content-checklist': 'text-buttons',
  'dropcap-services': 'text-buttons',
  'centered-testimonial': 'media-text',
  'content-video-services': 'media-text-buttons',
  'process-alternating': 'media-icon-text',
  'hero-with-testimonials': 'media-text-buttons',
  'brand-identity-hero': 'media-text-buttons',
  'simple-centered-hero': 'text-buttons',
  'simple-header-divider': 'text',
  'header-top-info': 'text-buttons',
  'header-with-icons': 'icon-text-buttons',
  'header-account-bar': 'text-buttons',
  'header-full-contact': 'text-buttons',
  'header-clickfunnel': 'text-buttons',
  'creative-network-hero': 'media-text-buttons',
  'immersive-split-showcase': 'media-text-buttons',
  'provider-masonry': 'media-text',
  'process-steps-cards': 'icon-text',
  'editorial-cards-row': 'media-text-buttons',
  'minimal-final-cta': 'text-buttons',
  'cinematic-footer': 'text-buttons',
  'click-funnel-testimonials': 'media-text',
  'clickfunnel-features': 'media-text-buttons',
  'clickfunnel-footer': 'text-buttons',
  embed: 'layout',
  'code-insert': 'layout',
};

const WIDGET_TYPES_WITH_TRANSPARENT_BACKGROUND = new Set([
  'header',
  'header-top-info',
  'header-with-icons',
  'header-account-bar',
  'header-full-contact',
  'header-clickfunnel',
]);

const WIDGET_TYPES_WITH_BACKGROUND_VIDEO = new Set([
  'hero',
  'videohero',
  'clickfunnels-hero',
  'hero-with-services',
  'hero-with-testimonials',
  'brand-identity-hero',
  'simple-centered-hero',
  'creative-network-hero',
  'immersive-split-showcase',
  'content-video-services',
  'embed',
  'code-insert',
]);

const WIDGET_CONTENT_KEYS: Record<string, string[]> = widgetLibrary.reduce(
  (acc, widget) => {
    const keySet = new Set<string>();
    collectKeys(widget.defaultContent || {}, keySet);
    acc[widget.type] = Array.from(keySet).sort((a, b) => a.localeCompare(b));
    return acc;
  },
  {} as Record<string, string[]>,
);

const buildQuickEditCapabilities = (contentKeys: string[]): WidgetQuickEditCapabilities => ({
  titleKeys: intersectByNormalized(contentKeys, TITLE_KEYS),
  paragraphKeys: intersectByNormalized(contentKeys, PARAGRAPH_KEYS),
  buttonTextKeys: intersectByNormalized(contentKeys, BUTTON_TEXT_KEYS),
  buttonLinkKeys: intersectByNormalized(contentKeys, BUTTON_LINK_KEYS),
});

const deriveWidgetCapabilities = (widgetType: string): WidgetCapabilities => {
  const profile = PROFILE_BY_WIDGET_TYPE[widgetType];
  const profileFlags = profile ? FLAGS_BY_PROFILE[profile] : SECURE_FALSE_FLAGS;
  const contentKeys = WIDGET_CONTENT_KEYS[widgetType] || [];
  const quickEdit = buildQuickEditCapabilities(contentKeys);

  const hasButtonContent =
    quickEdit.buttonTextKeys.length > 0 ||
    quickEdit.buttonLinkKeys.length > 0 ||
    hasAnyNormalized(contentKeys, [
      'cta',
      'button',
      'primarycta',
      'secondarycta',
      'primarytext',
      'secondarytext',
      'submit',
    ]);
  const hasButtonTextContent =
    quickEdit.buttonTextKeys.length > 0 ||
    hasAnyNormalized(contentKeys, ['ctaText', 'buttonText', 'primaryText', 'secondaryText']);
  const hasIconContent = hasAnyNormalized(contentKeys, ['icon', 'icons']);

  const supportsButtons = profileFlags.supportsButtons && hasButtonContent;
  const supportsButtonStyle = profileFlags.supportsButtonStyle && supportsButtons;
  const supportsIcons = profileFlags.supportsIcons && hasIconContent;
  const supportsIconStyle = profileFlags.supportsIconStyle && supportsIcons;

  const supportsH1 = profileFlags.supportsTypography && hasAnyNormalized(contentKeys, ['headline', 'title']);
  const supportsH2 =
    profileFlags.supportsTypography &&
    hasAnyNormalized(contentKeys, ['subheadline', 'subtitle']);
  const supportsSubtitleTypography =
    profileFlags.supportsTypography &&
    hasAnyNormalized(contentKeys, ['subheadline', 'subtitle', 'tagline']);
  const supportsBodyTypography =
    profileFlags.supportsTypography &&
    hasAnyNormalized(contentKeys, ['description', 'content', 'additionalText', 'privacyNote', 'quote', 'bio']);
  const supportsLinkTypography =
    profileFlags.supportsTypography &&
    hasAnyNormalized(contentKeys, [
      'link',
      'ctalink',
      'buttonurl',
      'primarylink',
      'secondarylink',
      'navitems',
      'accountlink',
      'searchlink',
      'cartlink',
    ]);

  return {
    contentKeys,
    quickEdit,
    ...profileFlags,
    supportsButtons,
    supportsButtonStyle,
    supportsButtonColorOverrides: supportsButtonStyle,
    supportsButtonSizeControl: supportsButtonStyle && hasButtonTextContent,
    supportsButtonTypographyControl: supportsButtonStyle && hasButtonTextContent,
    supportsButtonRadiusControl: supportsButtonStyle && hasButtonTextContent,
    supportsButtonBorderControl: supportsButtonStyle && hasButtonTextContent,
    supportsButtonShadowControl: supportsButtonStyle && hasButtonTextContent,
    supportsIcons,
    supportsIconStyle,
    supportsIconColorOverrides: supportsIconStyle,
    supportsIconBorderControl: supportsIconStyle,
    supportsIconRadiusControl: supportsIconStyle,
    supportsIconSizeControl: supportsIconStyle,
    supportsH1,
    supportsH2,
    supportsSubtitleTypography,
    supportsBodyTypography,
    supportsLinkTypography,
    supportsBackgroundTransparent:
      profileFlags.supportsBackground && WIDGET_TYPES_WITH_TRANSPARENT_BACKGROUND.has(widgetType),
    supportsBackgroundVideo:
      profileFlags.supportsBackground && WIDGET_TYPES_WITH_BACKGROUND_VIDEO.has(widgetType),
  };
};

export const WIDGET_CAPABILITIES: Record<string, WidgetCapabilities> = Object.keys(
  PROFILE_BY_WIDGET_TYPE,
).reduce((acc, widgetType) => {
  acc[widgetType] = deriveWidgetCapabilities(widgetType);
  return acc;
}, {} as Record<string, WidgetCapabilities>);

const FALLBACK_CAPABILITIES: WidgetCapabilities = {
  contentKeys: [],
  quickEdit: {
    titleKeys: [],
    paragraphKeys: [],
    buttonTextKeys: [],
    buttonLinkKeys: [],
  },
  ...SECURE_FALSE_FLAGS,
  supportsH1: false,
  supportsH2: false,
  supportsSubtitleTypography: false,
  supportsBodyTypography: false,
  supportsLinkTypography: false,
};

export const getWidgetCapabilities = (widgetType: string): WidgetCapabilities =>
  WIDGET_CAPABILITIES[widgetType] || FALLBACK_CAPABILITIES;
