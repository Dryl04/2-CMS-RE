export interface PageBuilderSection {
  id: string;
  type: WidgetType;
  variant: string;
  order: number;
  content: Record<string, any>;
  design: {
    background: {
      type: 'color' | 'gradient' | 'image' | 'video';
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
      fontSize?: string;
      lineHeight?: string;
      headingColor?: string;
      textColor?: string;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      buttonBackground?: string;
      buttonText?: string;
      buttonBackgroundHover?: string;
      iconBackground?: string;
      iconColor?: string;
    };
  };
  themeConfig?: {
    themeMode: 'inherit' | 'named' | 'custom';
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
  | 'header'
  | 'hero'
  | 'features'
  | 'cta'
  | 'content'
  | 'testimonials'
  | 'contact'
  | 'footer'
  | 'pricing'
  | 'stats'
  | 'team'
  | 'faq'
  | 'logocloud'
  | 'videohero'
  | 'gallery'
  | 'timeline'
  | 'newsletter'
  | 'process';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  category?: 'navigation' | 'content' | 'marketing';
  unique?: boolean;
  variants: WidgetVariant[];
  defaultContent: Record<string, any>;
  defaultDesign: PageBuilderSection['design'];
}

export interface WidgetVariant {
  id: string;
  label: string;
  thumbnail?: string;
}
