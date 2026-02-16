import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'seo_manager' | 'content_creator';

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
  status: 'draft' | 'published' | 'archived';
  content?: string;
  sections_data?: any[];
  seo_h1?: string;
  seo_h2?: string;
  imported_at?: string;
  created_by?: string;
  user_id?: string;
  template_id?: string;
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
