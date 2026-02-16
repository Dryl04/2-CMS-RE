export interface PageTheme {
  id: string;
  name: string;
  description: string;
  css: {
    // Polices
    bodyFont: string;
    headingFont: string;

    // Couleurs générales
    backgroundColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;

    // Couleurs texte
    textColor: string;
    headingColor: string;

    // Couleurs individuelles des titres (avec héritage)
    h1Color?: string;
    h2Color?: string;
    h3Color?: string;

    // Tailles texte
    textBase: string;
    textSm: string;
    textLg: string;

    // Tailles titres
    h1Size: string;
    h2Size: string;
    h3Size: string;
    h4Size: string;

    // Font weights
    textWeight: string;
    headingWeight: string;
  };
}

export const PAGE_THEMES: PageTheme[] = [
  {
    id: 'default',
    name: 'Par défaut',
    description: 'Thème par défaut avec Inter',
    css: {
      bodyFont: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      backgroundColor: '#ffffff',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      textColor: '#1f2937',
      headingColor: '#111827',
      textBase: '16px',
      textSm: '14px',
      textLg: '18px',
      h1Size: '48px',
      h2Size: '36px',
      h3Size: '30px',
      h4Size: '24px',
      textWeight: '400',
      headingWeight: '700',
    },
  },
  {
    id: 'elegant',
    name: 'Élégant',
    description: 'Typographie élégante avec Playfair Display',
    css: {
      bodyFont: 'Georgia, serif',
      headingFont: '"Playfair Display", Georgia, serif',
      backgroundColor: '#fafaf9',
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      accentColor: '#f59e0b',
      textColor: '#374151',
      headingColor: '#1f2937',
      textBase: '17px',
      textSm: '15px',
      textLg: '19px',
      h1Size: '56px',
      h2Size: '40px',
      h3Size: '32px',
      h4Size: '26px',
      textWeight: '400',
      headingWeight: '700',
    },
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design moderne avec Poppins',
    css: {
      bodyFont: '"Poppins", system-ui, sans-serif',
      headingFont: '"Poppins", system-ui, sans-serif',
      backgroundColor: '#ffffff',
      primaryColor: '#06b6d4',
      secondaryColor: '#8b5cf6',
      accentColor: '#f43f5e',
      textColor: '#4b5563',
      headingColor: '#111827',
      textBase: '15px',
      textSm: '13px',
      textLg: '17px',
      h1Size: '44px',
      h2Size: '34px',
      h3Size: '28px',
      h4Size: '22px',
      textWeight: '400',
      headingWeight: '600',
    },
  },
  {
    id: 'bold',
    name: 'Audacieux',
    description: 'Typographie forte et audacieuse',
    css: {
      bodyFont: '"Roboto", system-ui, sans-serif',
      headingFont: '"Montserrat", system-ui, sans-serif',
      backgroundColor: '#ffffff',
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#eab308',
      textColor: '#374151',
      headingColor: '#000000',
      textBase: '16px',
      textSm: '14px',
      textLg: '18px',
      h1Size: '52px',
      h2Size: '38px',
      h3Size: '30px',
      h4Size: '24px',
      textWeight: '400',
      headingWeight: '800',
    },
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Design épuré et minimaliste',
    css: {
      bodyFont: '"Work Sans", system-ui, sans-serif',
      headingFont: '"Work Sans", system-ui, sans-serif',
      backgroundColor: '#fafafa',
      primaryColor: '#64748b',
      secondaryColor: '#94a3b8',
      accentColor: '#0ea5e9',
      textColor: '#6b7280',
      headingColor: '#374151',
      textBase: '15px',
      textSm: '13px',
      textLg: '17px',
      h1Size: '40px',
      h2Size: '32px',
      h3Size: '26px',
      h4Size: '20px',
      textWeight: '300',
      headingWeight: '500',
    },
  },
  {
    id: 'classic',
    name: 'Classique',
    description: 'Typographie classique avec Times',
    css: {
      bodyFont: '"Lora", Georgia, serif',
      headingFont: '"Merriweather", Georgia, serif',
      backgroundColor: '#fffef7',
      primaryColor: '#92400e',
      secondaryColor: '#78350f',
      accentColor: '#b45309',
      textColor: '#1f2937',
      headingColor: '#111827',
      textBase: '18px',
      textSm: '16px',
      textLg: '20px',
      h1Size: '48px',
      h2Size: '36px',
      h3Size: '30px',
      h4Size: '24px',
      textWeight: '400',
      headingWeight: '700',
    },
  },
];

export function getPageThemeById(id: string | null | undefined): PageTheme {
  if (!id) return PAGE_THEMES[0];
  return PAGE_THEMES.find(t => t.id === id) || PAGE_THEMES[0];
}

export function generateThemeCSS(theme: PageTheme): string {
  const { css } = theme;

  // Système d'héritage des couleurs de titres
  // h1Color utilise h1Color ou headingColor
  // h2Color utilise h2Color ou h1Color ou headingColor
  // h3Color utilise h3Color ou h2Color ou h1Color ou headingColor
  const h1Color = css.h1Color || css.headingColor;
  const h2Color = css.h2Color || css.h1Color || css.headingColor;
  const h3Color = css.h3Color || css.h2Color || css.h1Color || css.headingColor;

  return `
    /* Theme: ${theme.name} */
    :root {
      --page-body-font: ${css.bodyFont};
      --page-heading-font: ${css.headingFont};

      /* Couleurs générales */
      --page-background-color: ${css.backgroundColor || '#ffffff'};
      --page-primary-color: ${css.primaryColor || '#3b82f6'};
      --page-secondary-color: ${css.secondaryColor || '#8b5cf6'};
      --page-accent-color: ${css.accentColor || '#10b981'};

      /* Couleurs texte */
      --page-text-color: ${css.textColor};
      --page-heading-color: ${css.headingColor};

      /* Couleurs individuelles des titres */
      --page-h1-color: ${h1Color};
      --page-h2-color: ${h2Color};
      --page-h3-color: ${h3Color};

      /* Tailles */
      --page-text-base: ${css.textBase};
      --page-text-sm: ${css.textSm};
      --page-text-lg: ${css.textLg};
      --page-h1-size: ${css.h1Size};
      --page-h2-size: ${css.h2Size};
      --page-h3-size: ${css.h3Size};
      --page-h4-size: ${css.h4Size};

      /* Poids */
      --page-text-weight: ${css.textWeight};
      --page-heading-weight: ${css.headingWeight};
    }

    /* Global application to page builder canvas and preview */
    .page-themed,
    .page-builder-canvas,
    .preview-mode {
      font-family: var(--page-body-font) !important;
      color: var(--page-text-color) !important;
      font-weight: var(--page-text-weight) !important;
      background-color: var(--page-background-color);
    }

    /* Headings with default color */
    .page-themed h1, .page-themed h2, .page-themed h3, .page-themed h4, .page-themed h5, .page-themed h6,
    .page-builder-canvas h1, .page-builder-canvas h2, .page-builder-canvas h3, .page-builder-canvas h4, .page-builder-canvas h5, .page-builder-canvas h6,
    .preview-mode h1, .preview-mode h2, .preview-mode h3, .preview-mode h4, .preview-mode h5, .preview-mode h6 {
      font-family: var(--page-heading-font) !important;
      font-weight: var(--page-heading-weight) !important;
    }

    /* H1 with specific color */
    .page-themed h1, .page-builder-canvas h1, .preview-mode h1 {
      font-size: var(--page-h1-size) !important;
      line-height: 1.1 !important;
      color: var(--page-h1-color) !important;
    }

    /* H2 with specific color */
    .page-themed h2, .page-builder-canvas h2, .preview-mode h2 {
      font-size: var(--page-h2-size) !important;
      line-height: 1.2 !important;
      color: var(--page-h2-color) !important;
    }

    /* H3 with specific color */
    .page-themed h3, .page-builder-canvas h3, .preview-mode h3 {
      font-size: var(--page-h3-size) !important;
      line-height: 1.3 !important;
      color: var(--page-h3-color) !important;
    }

    /* H4+ use default heading color */
    .page-themed h4, .page-builder-canvas h4, .preview-mode h4 {
      font-size: var(--page-h4-size) !important;
      line-height: 1.4 !important;
      color: var(--page-heading-color) !important;
    }

    .page-themed h5, .page-builder-canvas h5, .preview-mode h5,
    .page-themed h6, .page-builder-canvas h6, .preview-mode h6 {
      color: var(--page-heading-color) !important;
    }

    /* Text elements */
    .page-themed p, .page-themed li, .page-themed span, .page-themed div,
    .page-builder-canvas p, .page-builder-canvas li, .page-builder-canvas span,
    .preview-mode p, .preview-mode li, .preview-mode span {
      font-size: var(--page-text-base) !important;
      line-height: 1.6 !important;
    }

    .page-themed .text-sm, .page-themed small,
    .page-builder-canvas .text-sm, .page-builder-canvas small,
    .preview-mode .text-sm, .preview-mode small {
      font-size: var(--page-text-sm) !important;
    }

    .page-themed .text-lg,
    .page-builder-canvas .text-lg,
    .preview-mode .text-lg {
      font-size: var(--page-text-lg) !important;
    }

    /* Button text inheritance */
    .page-themed button, .page-themed a,
    .page-builder-canvas button, .page-builder-canvas a,
    .preview-mode button, .preview-mode a {
      font-family: var(--page-body-font) !important;
    }
  `;
}
