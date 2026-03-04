type VariantFieldMap = Record<string, string[]>;

const VARIANT_FIELD_RULES: Record<string, VariantFieldMap> = {
  header: {
    secondaryCtaText: ['creative-premium'],
    secondaryCtaLink: ['creative-premium'],
  },

  hero: {
    image: ['default', 'split', 'full-background'],
  },

  cta: {
    image: ['split'],
  },

  testimonials: {
    subtitle: ['grid', 'minimal'],
    'testimonials.rating': ['grid', 'carousel'],
    'testimonials.avatar': ['grid', 'carousel'],
  },

  footer: {
    description: ['default', 'centered'],
  },

  pricing: {
    'plans.popular': ['cards'],
    'plans.features': ['cards', 'toggle'],
    'plans.buttonText': ['cards', 'toggle', 'minimal'],
    'plans.buttonLink': ['cards', 'toggle', 'minimal'],
  },

  videohero: {
    textPosition: ['background'],
    ctaText: ['embedded', 'split'],
    ctaLink: ['embedded', 'split'],
  },

  newsletter: {
    image: ['split'],
    privacyNote: ['centered', 'split', 'card'],
  },

  timeline: {
    'events.image': ['vertical', 'cards'],
  },

  contact: {
    subtitle: ['default', 'centered'],
    showForm: ['default', 'centered'],
  },
};

export function isFieldVisibleForVariant(
  widgetType: string,
  fieldKey: string,
  currentVariant: string
): boolean {
  const rules = VARIANT_FIELD_RULES[widgetType];
  if (!rules) return true;

  const allowedVariants = rules[fieldKey];
  if (!allowedVariants) return true;

  return allowedVariants.includes(currentVariant);
}
