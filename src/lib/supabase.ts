import type {
  ApiSession,
  ApiAuthUser,
  QueryFilter,
  QueryOrder,
  QueryResult,
} from "./api.ts";
import {
  changePassword as changePasswordApi,
  getSession as getApiSession,
  getUploadedMediaPublicUrl,
  getUser as getApiUser,
  mutateRows,
  onAuthStateChange as onApiAuthStateChange,
  queryRows,
  signInWithPassword as signInWithPasswordApi,
  signOut as signOutApi,
  signUp as signUpApi,
  uploadMediaFile,
  updateProfile as updateProfileApi,
} from "./api.ts";

type MutationAction = "insert" | "update" | "delete" | "upsert";

class SupabaseQueryBuilder implements PromiseLike<QueryResult<any>> {
  private readonly table: string;
  private action: "select" | MutationAction = "select";
  private columns = "*";
  private countRequested = false;
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private rowLimit?: number;
  private payload: Record<string, any> | Record<string, any>[] | null = null;
  private expectsSingle = false;
  private expectsMaybeSingle = false;
  private mutationSelectColumns?: string;
  private storageRemoveRequested = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*", options?: { count?: "exact" }) {
    if (this.action === "select") {
      this.columns = columns;
      this.countRequested = options?.count === "exact";
      return this;
    }

    this.mutationSelectColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ type: "in", column, value });
    return this;
  }

  not(column: string, operator: "is", value: unknown) {
    this.filters.push({ type: "not", column, operator, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  maybeSingle() {
    this.expectsMaybeSingle = true;
    this.expectsSingle = false;
    return this;
  }

  single() {
    this.expectsSingle = true;
    this.expectsMaybeSingle = false;
    return this;
  }

  insert(payload: Record<string, any> | Record<string, any>[]) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Record<string, any>) {
    this.action = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = "delete";
    this.payload = null;
    return this;
  }

  upsert(
    payload: Record<string, any> | Record<string, any>[],
    _options?: { onConflict?: string },
  ) {
    this.action = "upsert";
    this.payload = payload;
    return this;
  }

  storageRemove() {
    this.storageRemoveRequested = true;
    return this;
  }

  async execute(): Promise<QueryResult<any>> {
    if (this.storageRemoveRequested) {
      return { data: [], error: null };
    }

    if (this.action === "select") {
      return queryRows(
        this.table,
        this.columns,
        {
          filters: this.filters,
          orders: this.orders,
          limit: this.rowLimit,
          maybeSingle: this.expectsMaybeSingle,
          single: this.expectsSingle,
        },
        this.countRequested,
      );
    }

    const result = await mutateRows(
      this.table,
      this.action,
      this.payload,
      this.filters,
    );
    if (result.error || !this.mutationSelectColumns) {
      return result;
    }

    if (!result.data) {
      return { data: null, error: result.error, count: result.count };
    }

    const rows = Array.isArray(result.data) ? result.data : [result.data];
    const selectedRows =
      this.mutationSelectColumns === "*"
        ? rows
        : rows.map((row) =>
            Object.fromEntries(
              this.mutationSelectColumns!.split(",")
                .map((column) => column.trim())
                .filter(Boolean)
                .map((column) => [column, row[column]]),
            ),
          );

    if (this.expectsSingle) {
      if (selectedRows.length !== 1) {
        return {
          data: null,
          error: new Error(`Expected a single row from ${this.table}`),
        };
      }
      return { data: selectedRows[0], error: null };
    }

    if (this.expectsMaybeSingle) {
      if (selectedRows.length > 1) {
        return {
          data: null,
          error: new Error(`Expected zero or one row from ${this.table}`),
        };
      }
      return { data: selectedRows[0] ?? null, error: null };
    }

    return {
      data: Array.isArray(result.data) ? selectedRows : selectedRows[0],
      error: null,
      count: result.count,
    };
  }

  then<TResult1 = QueryResult<any>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<any>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  auth: {
    getSession: getApiSession,
    getUser: getApiUser,
    signInWithPassword: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => signInWithPasswordApi(email, password),
    signUp: ({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string }; emailRedirectTo?: string };
    }) => signUpApi(email, password, options?.data?.full_name),
    changePassword: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePasswordApi(currentPassword, newPassword),
    updateUser: ({
      data,
      email,
    }: {
      data?: { full_name?: string };
      email?: string;
    }) => updateProfileApi(data?.full_name, email),
    signOut: signOutApi,
    onAuthStateChange: onApiAuthStateChange,
  },
  from(table: string) {
    return new SupabaseQueryBuilder(table);
  },
  storage: {
    from(bucket: string) {
      if (bucket !== "media") {
        throw new Error(
          `Unsupported storage bucket "${bucket}". Only "media" is available in the migration adapter.`,
        );
      }

      return {
        upload: (filePath: string, file: File) =>
          uploadMediaFile(filePath, file),
        getPublicUrl: (filePath: string) => ({
          data: {
            publicUrl: getUploadedMediaPublicUrl(filePath),
          },
        }),
        remove: (_paths: string[]) =>
          new SupabaseQueryBuilder("media_files").storageRemove(),
      };
    },
  },
};

export type User = ApiAuthUser;
export type Session = ApiSession;
export type UserRole = "admin" | "seo_manager" | "content_creator";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  must_change_password: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SEOMetadata {
  id: string;
  site_id?: string | null;
  page_key: string;
  title: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  language?: string;
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
  effective_canonical_url?: string | null;
  robots_directive?: string | null;
  public_base_url?: string | null;
  resolved_domain?: SiteDomain | null;
  site?: Site;
  created_at: string;
  updated_at: string;
}

export interface SEORedirect {
  id: string;
  site_id?: string | null;
  source_path: string;
  target_path: string;
  source_page_id?: string | null;
  target_page_id?: string | null;
  reason?: string | null;
  is_active: boolean;
  created_by?: string | null;
  site?: Site;
  created_at: string;
  updated_at: string;
}

export interface SiteDomain {
  id: string;
  site_id: string;
  host: string;
  scheme: "http" | "https" | string;
  is_primary: boolean;
  is_canonical: boolean;
  locale?: string | null;
  is_active: boolean;
  redirect_to_primary: boolean;
  business_owner?: string | null;
  technical_owner?: string | null;
  registrar?: string | null;
  dns_provider?: string | null;
  dns_target?: string | null;
  hosting_target?: string | null;
  verification_method?: "dns_txt" | "http_file" | "manual" | string;
  verification_status?: "pending" | "verified" | "failed" | string;
  verification_token?: string | null;
  verified_at?: string | null;
  ssl_status?: "pending" | "active" | "issue" | string;
  robots_txt_enabled?: boolean;
  sitemap_enabled?: boolean;
  allow_indexing?: boolean;
  notes?: string | null;
  go_live_at?: string | null;
  site?: Site;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  default_locale: string;
  homepage_page_key?: string;
  canonical_strategy?: "canonical_domain" | "served_domain" | string;
  is_active: boolean;
  domains?: SiteDomain[];
  _count?: {
    pages?: number;
    redirects?: number;
    domains?: number;
  };
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
