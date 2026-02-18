export interface PageBuilderSection {
  id: string;
  type: WidgetType;
  variant: string;
  order: number;
  content: Record<string, any>;
  design: {
    background: {
      type: "color" | "gradient" | "image" | "video";
      value: string;
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
      iconBackground?: string;
      iconColor?: string;
    };
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
  | "hero"
  | "features"
  | "cta"
  | "content"
  | "testimonials"
  | "contact"
  | "footer"
  | "pricing"
  | "stats"
  | "team"
  | "faq"
  | "logocloud"
  | "videohero"
  | "gallery"
  | "timeline"
  | "newsletter"
  | "process"
  | "creative-network-hero"
  | "immersive-split-showcase"
  | "provider-masonry"
  | "process-steps-cards"
  | "editorial-cards-row"
  | "minimal-final-cta"
  | "cinematic-footer";

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
