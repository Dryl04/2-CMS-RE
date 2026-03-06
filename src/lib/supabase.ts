import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "admin" | "seo_manager" | "content_creator";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SEOMetadata {
  id: string;
  page_key: string;
  title: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  language?: string;
  meta_robots?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  social_image_alt?: string;
  schema_type?: string;
  schema_jsonld?: string;
  noindex?: boolean;
  nofollow?: boolean;
  exclude_from_sitemap?: boolean;
  primary_keyword?: string;
  secondary_keywords?: string[];
  breadcrumb_title?: string;
  published_at?: string;
  last_reviewed_at?: string;
  status: "draft" | "published" | "archived";
  content?: string;
  sections_data?: any[];
  seo_h1?: string;
  seo_h2?: string;
  imported_at?: string;
  created_by?: string;
  user_id?: string;
  template_id?: string;
  daisy_theme_slug?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SEORedirect {
  id: string;
  source_path: string;
  target_path: string;
  source_page_id?: string | null;
  target_page_id?: string | null;
  reason?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type TrackingScope = 'site' | 'page';
export type TrackingPlacement = 'head' | 'body_start' | 'body_end';
export type TrackingMode = 'preset' | 'custom';
export type TrackingLoadStrategy = 'immediate' | 'after_consent' | 'lazy' | 'route_change';
export type ConsentCategory = 'necessary' | 'analytics' | 'ads' | 'social';

export interface SiteSettings {
  id: string;
  site_name: string;
  base_url: string;
  default_locale: string;
  default_title_suffix?: string | null;
  default_meta_description?: string | null;
  default_og_image?: string | null;
  default_twitter_card: string;
  default_meta_robots: string;
  favicon_url?: string | null;
  apple_touch_icon_url?: string | null;
  site_webmanifest_url?: string | null;
  organization_name?: string | null;
  organization_logo_url?: string | null;
  organization_same_as?: string[] | null;
  google_site_verification?: string | null;
  bing_site_verification?: string | null;
  default_schema_type?: string | null;
  robots_txt_overrides?: string | null;
  enable_cookie_banner: boolean;
  cookie_banner_message?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingIntegration {
  id: string;
  scope: TrackingScope;
  page_id?: string | null;
  provider: string;
  label: string;
  placement: TrackingPlacement;
  mode: TrackingMode;
  config_json?: Record<string, any> | null;
  custom_code?: string | null;
  requires_consent: boolean;
  consent_category: ConsentCategory;
  is_active: boolean;
  load_strategy: TrackingLoadStrategy;
  disable_inherited: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectionType {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  schema: Record<string, any>;
  preview_image?: string;
  is_system: boolean;
  created_at: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  sections_data?: any[];
  seo_h1?: string;
  seo_h2?: string;
  daisy_theme_slug?: string | null;
  folder?: string | null;
  is_public: boolean;
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  section_type_id: string;
  order_index: number;
  label?: string;
  min_words: number;
  max_words?: number;
  required: boolean;
  settings: Record<string, any>;
  created_at: string;
}

export interface PageContentSection {
  id: string;
  page_id: string;
  template_section_id?: string;
  section_type_id: string;
  order_index: number;
  content: Record<string, any>;
  background_image?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  uploaded_by?: string;
  created_at: string;
}
