export interface PageBuilderSection {
  id: string;
  type: WidgetType;
  variant: string;
  order: number;
  content: Record<string, any>;
  design: {
    background: {
      type: "color" | "gradient" | "image" | "video" | "transparent";
      value: string;
      opacity?: number;
      overlayColor?: string;
      overlayOpacity?: number;
      videoAutoplay?: boolean;
      videoNoBranding?: boolean;
      videoFullWidth?: boolean;
      backdropBlur?: string;
      backdropColor?: string;
      backdropOpacity?: number;
      [key: string]: any;
    };
    spacing: {
      paddingTop: string;
      paddingBottom: string;
      marginTop: string;
      marginBottom: string;
    };
    typography?: {
      fontFamily?: string;
      headingFontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
      buttonFontFamily?: string;
      buttonFontSize?: string;
      headingColor?: string;
      headingFontSize?: string;
      headingFontWeight?: string;
      h1Color?: string;
      h1FontFamily?: string;
      h1FontWeight?: string;
      h1FontSize?: string;
      h2Color?: string;
      h2FontFamily?: string;
      h2FontWeight?: string;
      h2FontSize?: string;
      subtitleColor?: string;
      textColor?: string;
      textFontSize?: string;
      linkColor?: string;
      [key: string]: any;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      buttonBackground?: string;
      buttonText?: string;
      buttonBackgroundHover?: string;
      buttonRadius?: string;
      buttonSize?: "sm" | "md" | "lg" | "xl";
      buttonBorderWidth?: string;
      buttonBorderStyle?: "none" | "solid" | "dashed" | "dotted";
      buttonBorderColor?: string;
      buttonShadow?: string;
      iconBackground?: string;
      iconColor?: string;
      iconBorderColor?: string;
      iconBorderWidth?: string;
      iconRadius?: string;
      iconSize?: string;
      sectionRadius?: string;
      buttonBg?: string;
      topBarBg?: string;
      cardBackground?: string;
      badgeBg?: string;
      badgeText?: string;
      inputBg?: string;
      inputText?: string;
      inputPlaceholder?: string;
      decorLeftColor?: string;
      decorRightColor?: string;
      [key: string]: any;
    };
    media?: {
      imageRadius?: string;
      overlayImage?: string;
      overlayPosition?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center";
      overlaySize?: string;
      hideDecorationsOnVideoPlay?: boolean;
      [key: string]: any;
    };
    overlay?: {
      enabled?: boolean;
      color?: string;
      opacity?: number;
      gradient?: string;
      gradientDirection?: string;
      [key: string]: any;
    };
    effects?: {
      blur?: number;
      brightness?: number;
      contrast?: number;
      saturate?: number;
      grayscale?: number;
      sepia?: number;
      hueRotate?: number;
      parallax?: boolean;
      animation?: boolean;
      animationType?: string;
      [key: string]: any;
    };
    layout?: {
      contentPosition?: string;
      contentAlignment?: string;
      minHeight?: string;
      maxWidth?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  themeConfig?: {
    themeMode: "inherit" | "named" | "custom";
    themeRef?: string;
    customTokens?: Record<string, string>;
  };
  advanced: {
    cssClasses?: string[];
    customCSS?: string;
    animations?: {
      entrance?: string;
      hover?: string;
    };
    visibility?: {
      desktop: boolean;
      tablet: boolean;
      mobile: boolean;
    };
  };
}

export type WidgetType =
  | "header"
  | "header-top-info"
  | "header-with-icons"
  | "header-account-bar"
  | "header-full-contact"
  | "header-clickfunnel"
  | "hero"
  | "clickfunnels-hero"
  | "clickfunnel-center-card"
  | "features"
  | "services-grid"
  | "cta"
  | "image-text-split"
  | "content-showcase"
  | "centered-content"
  | "text-columns"
  | "content-with-services"
  | "split-content-checklist"
  | "dropcap-services"
  | "content-video-services"
  | "testimonials"
  | "click-funnel-testimonials"
  | "centered-testimonial"
  | "contact"
  | "contact-split"
  | "feedback-contact"
  | "footer"
  | "clickfunnel-footer"
  | "simple-header-divider"
  | "pricing"
  | "membership-pricing"
  | "stats"
  | "image-stats-faq"
  | "team"
  | "faq"
  | "faq-two-columns"
  | "logocloud"
  | "videohero"
  | "gallery"
  | "timeline"
  | "timeline-grid"
  | "newsletter"
  | "newsletter-signup"
  | "process"
  | "process-alternating"
  | "creative-network-hero"
  | "brand-identity-hero"
  | "simple-centered-hero"
  | "hero-with-services"
  | "hero-with-testimonials"
  | "immersive-split-showcase"
  | "provider-masonry"
  | "integrations-grid"
  | "services-cards"
  | "services-carousel"
  | "social-follow"
  | "bento-features"
  | "features-carousel"
  | "clickfunnel-features"
  | "process-steps-cards"
  | "editorial-cards-row"
  | "minimal-final-cta"
  | "cinematic-footer"
  | "embed"
  | "code-insert";

export type DeviceType = "desktop" | "tablet" | "mobile";

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  category?: "navigation" | "content" | "marketing";
  unique?: boolean;
  variants: WidgetVariant[];
  defaultContent: Record<string, any>;
  defaultDesign: PageBuilderSection["design"];
}

export interface WidgetVariant {
  id: string;
  label: string;
  thumbnail?: string;
}
