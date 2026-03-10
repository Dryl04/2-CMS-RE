// ──────────────────────────────────────────────
// src/lib/api.ts  –  Frontend API client
// Drop-in replacement for the old Supabase client.
// All interfaces keep their original snake_case fields.
// ──────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL as string;
if (!API_URL) {
  throw new Error('Missing VITE_API_URL environment variable');
}

const TOKEN_KEY = 'cms_token';

// ─── helpers ──────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Build headers sent with every request. */
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generic fetch wrapper.
 * Returns `{ data, error }` to keep the same shape as the old Supabase calls.
 * Automatically clears the token on 401 and notifies listeners.
 */
async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: any }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers as Record<string, string> ?? {}) },
    });

    if (res.status === 401) {
      clearToken();
      notifyAuthListeners('SIGNED_OUT', null);
      return { data: null, error: { message: 'Unauthorized', status: 401 } };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: { message: body.message || body.error || res.statusText, status: res.status, ...body } };
    }

    // 204 No Content
    if (res.status === 204) {
      return { data: null as unknown as T, error: null };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || 'Network error' } };
  }
}

/**
 * Upload a file via multipart/form-data.
 * Does NOT set Content-Type so the browser auto-sets the boundary.
 */
async function uploadRequest<T = any>(
  path: string,
  formData: FormData,
): Promise<{ data: T | null; error: any }> {
  try {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      clearToken();
      notifyAuthListeners('SIGNED_OUT', null);
      return { data: null, error: { message: 'Unauthorized', status: 401 } };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: { message: body.message || body.error || res.statusText, status: res.status, ...body } };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || 'Network error' } };
  }
}

// ─── Auth state change event system ───────────

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

interface AuthSession {
  access_token: string;
  user: UserProfile;
}

type AuthCallback = (event: AuthEvent, session: AuthSession | null) => void;

const authListeners = new Set<AuthCallback>();

function notifyAuthListeners(event: AuthEvent, session: AuthSession | null) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('[api] auth listener error', e);
    }
  });
}

// ──────────────────────────────────────────────
// Re-exported interfaces (exact copies from the old supabase.ts)
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// api object
// ──────────────────────────────────────────────

export const api = {
  // ─── auth ─────────────────────────────────
  auth: {
    /** Sign in with email & password. Returns token + profile. */
    async signIn(email: string, password: string) {
      const { data, error } = await request<{ token: string; user: UserProfile }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      if (data?.token) {
        setToken(data.token);
        notifyAuthListeners('SIGNED_IN', { access_token: data.token, user: data.user });
      }
      return { data, error };
    },

    /** Register a new account. */
    async signUp(email: string, password: string, fullName?: string) {
      const { data, error } = await request<{ token: string; user: UserProfile }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password, full_name: fullName }) },
      );
      if (data?.token) {
        setToken(data.token);
        notifyAuthListeners('SIGNED_IN', { access_token: data.token, user: data.user });
      }
      return { data, error };
    },

    /** Sign out (clears token). */
    async signOut() {
      // Fire-and-forget call to the backend to invalidate the token
      await request('/auth/logout', { method: 'POST' }).catch(() => {});
      clearToken();
      notifyAuthListeners('SIGNED_OUT', null);
    },

    /** Get the currently-authenticated user's profile. */
    async getUser() {
      return request<UserProfile>('/auth/me');
    },

    /** Check whether a token exists locally. */
    hasToken(): boolean {
      return !!getToken();
    },

    /** Subscribe to auth-state changes. Returns an unsubscribe function. */
    onAuthStateChange(callback: AuthCallback): { unsubscribe: () => void } {
      authListeners.add(callback);
      return {
        unsubscribe: () => {
          authListeners.delete(callback);
        },
      };
    },
  },

  // ─── pages (seo_metadata) ─────────────────
  pages: {
    async list(params?: { status?: string; order?: string; limit?: number }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.order) qs.set('order', params.order);
      if (params?.limit) qs.set('limit', String(params.limit));
      const query = qs.toString() ? `?${qs}` : '';
      return request<SEOMetadata[]>(`/api/pages${query}`);
    },

    async getByPageKey(pageKey: string, opts?: { status?: string }) {
      const qs = new URLSearchParams();
      qs.set('page_key', pageKey);
      if (opts?.status) qs.set('status', opts.status);
      return request<SEOMetadata | null>(`/api/pages/by-key?${qs}`);
    },

    async getPublic(pageKey: string) {
      return request<SEOMetadata | null>(`/api/pages/public/${encodeURIComponent(pageKey)}`);
    },

    async getPublicRedirect(sourcePath: string) {
      return request<{ target_path: string } | null>(
        `/api/pages/public/redirects?source_path=${encodeURIComponent(sourcePath)}`,
      );
    },

    async getById(id: string) {
      return request<SEOMetadata>(`/api/pages/${id}`);
    },

    async create(page: Partial<SEOMetadata>) {
      return request<SEOMetadata>('/api/pages', {
        method: 'POST',
        body: JSON.stringify(page),
      });
    },

    async update(id: string, updates: Partial<SEOMetadata>) {
      return request<SEOMetadata>(`/api/pages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string) {
      return request(`/api/pages/${id}`, { method: 'DELETE' });
    },

    async upsert(pages: Partial<SEOMetadata>[], onConflict?: string) {
      const qs = onConflict ? `?on_conflict=${onConflict}` : '';
      return request<SEOMetadata[]>(`/api/pages/upsert${qs}`, {
        method: 'POST',
        body: JSON.stringify(pages),
      });
    },
  },

  // ─── templates (page_templates) ───────────
  templates: {
    async list(params?: { ids?: string[] }) {
      let qs = '';
      if (params?.ids && params.ids.length > 0) {
        qs = `?ids=${params.ids.join(',')}`;
      }
      return request<PageTemplate[]>(`/api/templates${qs}`);
    },

    async getById(id: string) {
      return request<PageTemplate>(`/api/templates/${id}`);
    },

    async create(template: Partial<PageTemplate>) {
      return request<PageTemplate>('/api/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
    },

    async update(id: string, updates: Partial<PageTemplate>) {
      return request<PageTemplate>(`/api/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string) {
      return request(`/api/templates/${id}`, { method: 'DELETE' });
    },

    async count() {
      return request<{ count: number }>('/api/templates/count');
    },
  },

  // ─── media ────────────────────────────────
  media: {
    async list() {
      return request<MediaFile[]>('/api/media');
    },

    async upload(file: File, metadata?: { alt_text?: string }) {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata?.alt_text) {
        formData.append('alt_text', metadata.alt_text);
      }
      return uploadRequest<MediaFile>('/api/media/upload', formData);
    },

    async delete(id: string) {
      return request(`/api/media/${id}`, { method: 'DELETE' });
    },

    async deleteMany(ids: string[]) {
      return request('/api/media/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
  },

  // ─── themes ───────────────────────────────
  themes: {
    // DaisyUI themes (daisyui_themes table)
    daisy: {
      async list() {
        return request<any[]>('/api/themes/daisy');
      },

      async getActive() {
        return request<any | null>('/api/themes/daisy/active');
      },

      async setActive(themeId: string) {
        return request('/api/themes/daisy/active', {
          method: 'PUT',
          body: JSON.stringify({ theme_id: themeId }),
        });
      },

      async create(theme: any) {
        return request('/api/themes/daisy', {
          method: 'POST',
          body: JSON.stringify(theme),
        });
      },

      async update(id: string, updates: any) {
        return request(`/api/themes/daisy/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
      },

      async delete(id: string) {
        return request(`/api/themes/daisy/${id}`, { method: 'DELETE' });
      },

      async getUsage(slug: string) {
        return request<{ pageThemes: number; pageTemplates: number; totalUsages: number }>(`/api/themes/daisy/usage/${slug}`);
      },
    },

    // Page themes (page_themes table)
    page: {
      async list() {
        return request<any[]>('/api/themes/page');
      },

      async getById(id: string) {
        return request<any>(`/api/themes/page/${id}`);
      },

      async save(theme: any) {
        return request('/api/themes/page', {
          method: 'POST',
          body: JSON.stringify(theme),
        });
      },

      async delete(id: string) {
        return request(`/api/themes/page/${id}`, { method: 'DELETE' });
      },

      async isCustom(id: string) {
        return request<{ is_custom: boolean }>(`/api/themes/page/${id}/is-custom`);
      },

      async migrate() {
        return request<{ success: boolean; count: number; message: string }>(
          '/api/themes/page/migrate',
          { method: 'POST' },
        );
      },
    },

    // Classic themes (themes table) - used by ThemeContext
    classic: {
      async list() {
        return request<any[]>('/api/themes/classic');
      },

      async create(theme: any) {
        return request('/api/themes/classic', {
          method: 'POST',
          body: JSON.stringify(theme),
        });
      },

      async update(id: string, updates: any) {
        return request(`/api/themes/classic/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });
      },

      async delete(id: string) {
        return request(`/api/themes/classic/${id}`, { method: 'DELETE' });
      },

      async initialize() {
        return request('/api/themes/classic/initialize', { method: 'POST' });
      },

      async applyToPage(pageId: string, themeId: string) {
        return request(`/api/themes/classic/apply`, {
          method: 'POST',
          body: JSON.stringify({ page_id: pageId, theme_id: themeId }),
        });
      },
    },
  },

  // ─── fonts ────────────────────────────────
  fonts: {
    async list(params?: { select?: string }) {
      const qs = params?.select ? `?select=${params.select}` : '';
      return request<any[]>(`/api/themes/fonts${qs}`);
    },

    async create(font: any) {
      return request('/api/themes/fonts', {
        method: 'POST',
        body: JSON.stringify(font),
      });
    },

    async delete(id: string) {
      return request(`/api/themes/fonts/${id}`, { method: 'DELETE' });
    },
  },

  // ─── redirects (seo_redirects) ────────────
  redirects: {
    async list() {
      return request<SEORedirect[]>('/api/redirects');
    },

    async getBySourcePath(sourcePath: string) {
      return request<SEORedirect | null>(`/api/redirects/by-source?source_path=${encodeURIComponent(sourcePath)}`);
    },

    async create(redirect: Partial<SEORedirect>) {
      return request<SEORedirect>('/api/redirects', {
        method: 'POST',
        body: JSON.stringify(redirect),
      });
    },

    async update(id: string, updates: Partial<SEORedirect>) {
      return request<SEORedirect>(`/api/redirects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string) {
      return request(`/api/redirects/${id}`, { method: 'DELETE' });
    },
  },

  // ─── global header/footer (global_hf_settings) ──
  globalHf: {
    async list() {
      return request<any[]>('/api/global-hf');
    },

    async getActive() {
      return request<any | null>('/api/global-hf/public');
    },

    async activate(settingId: string) {
      return request(`/api/global-hf/${settingId}/activate`, { method: 'POST' });
    },

    async create(setting: any) {
      return request('/api/global-hf', {
        method: 'POST',
        body: JSON.stringify(setting),
      });
    },

    async update(id: string, updates: any) {
      return request(`/api/global-hf/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string) {
      return request(`/api/global-hf/${id}`, { method: 'DELETE' });
    },
  },

  // ─── user profiles ────────────────────────
  profiles: {
    async getById(id: string) {
      return request<UserProfile>(`/api/profiles/${id}`);
    },

    async create(profile: Partial<UserProfile>) {
      return request<UserProfile>('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    },

    async update(id: string, updates: Partial<UserProfile>) {
      return request<UserProfile>(`/api/profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
  },

  // ─── link registry helpers ────────────────
  links: {
    /** Fetch page keys + titles for link autosuggestion */
    async listPageLinks(limit = 500) {
      return request<{ page_key: string; title: string }[]>(`/api/pages?limit=${limit}&select=page_key,title`);
    },

    /** Fetch template names + sections for link autosuggestion */
    async listTemplateLinks(limit = 200) {
      return request<{ name: string; sections_data: any }[]>(`/api/templates?limit=${limit}&select=name,sections_data`);
    },
  },
};

export default api;
