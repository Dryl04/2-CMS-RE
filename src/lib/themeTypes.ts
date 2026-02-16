export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeSpacing {
  scale: string[];
}

export interface ThemeComponents {
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  components: ThemeComponents;
  custom_css: string | null;
  user_id: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemePreview {
  id: string;
  name: string;
  description: string | null;
  colors: ThemeColors;
  is_default: boolean;
}
