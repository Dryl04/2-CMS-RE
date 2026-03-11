const DEFAULT_API_URL = "http://localhost:3001";
const ACCESS_TOKEN_STORAGE_KEY = "cms_api_access_token";
const SESSION_USER_STORAGE_KEY = "cms_api_session_user";
const AUTH_STORAGE_EVENT = "cms-api-auth-change";

export type UserRole = "admin" | "seo_manager" | "content_creator";
export type AuthChangeEvent =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED";
export type QueryFilter =
  | { type: "eq"; column: string; value: unknown }
  | { type: "in"; column: string; value: unknown[] }
  | { type: "not"; column: string; operator: "is"; value: unknown };

export interface QueryOrder {
  column: string;
  ascending: boolean;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orders?: QueryOrder[];
  limit?: number;
  maybeSingle?: boolean;
  single?: boolean;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface ApiAuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_metadata: {
    full_name?: string;
  };
  app_metadata: {
    role?: UserRole;
  };
}

export interface ApiSession {
  access_token: string;
  token_type: "bearer";
  expires_in?: number;
  user: ApiAuthUser;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: BodyInit | string;
  auth?: boolean;
  headers?: Record<string, string>;
}

interface BackendAuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface BackendAuthResponse {
  access_token: string;
  user: BackendAuthUser;
}

interface ResourceDefinition {
  listPath?: string;
  createPath?: string;
  updatePath?: (id: string) => string;
  deletePath?: (id: string) => string;
  publicListPath?: string;
  publicGetPath?: (value: string) => string;
  normalize: (row: Record<string, any>) => Record<string, any>;
  serialize: (
    payload: Record<string, any>,
    mode: "create" | "update",
  ) => Record<string, any>;
}

const uploadedMediaByPath = new Map<string, Record<string, any>>();
const uploadedMediaByPublicUrl = new Map<string, Record<string, any>>();
const authListeners = new Set<
  (event: AuthChangeEvent, session: ApiSession | null) => void
>();
let storageListenerBound = false;

function getStorage(): Storage | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage;
}

function getApiBaseUrl(): string {
  const env = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env;
  const value = env?.VITE_API_URL?.trim();
  return value ? value.replace(/\/$/, "") : DEFAULT_API_URL;
}

function resolveMediaUrl(publicPath?: string, storagePath?: string): string {
  const candidate = (publicPath || storagePath || "").trim();
  if (!candidate) {
    return "";
  }

  if (
    /^(https?:)?\/\//i.test(candidate) ||
    candidate.startsWith("data:") ||
    candidate.startsWith("blob:")
  ) {
    return candidate;
  }

  const baseUrl = getApiBaseUrl();
  if (candidate.startsWith("/")) {
    return `${baseUrl}${candidate}`;
  }

  const normalizedPath = candidate.replace(/^uploads\//, "").replace(/^\//, "");
  return `${baseUrl}/uploads/${normalizedPath}`;
}

function ensureDateString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date().toISOString();
}

function stripUndefined<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function toBackendAuthUser(raw: BackendAuthUser | ApiAuthUser): ApiAuthUser {
  const frontendUser = raw as ApiAuthUser;
  const backendUser = raw as BackendAuthUser;
  const fullName =
    "full_name" in raw ? frontendUser.full_name : backendUser.fullName;
  const avatarUrl =
    "avatar_url" in raw ? frontendUser.avatar_url : backendUser.avatarUrl;
  const createdAt =
    "created_at" in raw ? frontendUser.created_at : backendUser.createdAt;
  const updatedAt =
    "updated_at" in raw ? frontendUser.updated_at : backendUser.updatedAt;
  const role = raw.role ?? "content_creator";

  return {
    id: raw.id,
    email: raw.email,
    role,
    full_name: fullName ?? undefined,
    avatar_url: avatarUrl ?? undefined,
    created_at: ensureDateString(createdAt),
    updated_at: ensureDateString(updatedAt),
    user_metadata: {
      full_name: fullName ?? undefined,
    },
    app_metadata: {
      role,
    },
  };
}

function createSession(
  accessToken: string,
  user: BackendAuthUser | ApiAuthUser,
): ApiSession {
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 60 * 60,
    user: toBackendAuthUser(user),
  };
}

function persistSession(session: ApiSession | null) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!session) {
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    storage.removeItem(SESSION_USER_STORAGE_KEY);
    return;
  }

  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.access_token);
  storage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(session.user));
}

function readStoredSession(): ApiSession | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const accessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const userRaw = storage.getItem(SESSION_USER_STORAGE_KEY);

  if (!accessToken || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as ApiAuthUser;
    return createSession(accessToken, user);
  } catch {
    persistSession(null);
    return null;
  }
}

function emitAuthChange(event: AuthChangeEvent, session: ApiSession | null) {
  persistSession(session);
  authListeners.forEach((listener) => listener(event, session));

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ApiSession | null>(AUTH_STORAGE_EVENT, {
        detail: session,
      }),
    );
  }
}

function ensureStorageListener() {
  if (storageListenerBound || typeof window === "undefined") {
    return;
  }

  storageListenerBound = true;

  window.addEventListener("storage", (event) => {
    if (
      event.key !== ACCESS_TOKEN_STORAGE_KEY &&
      event.key !== SESSION_USER_STORAGE_KEY
    ) {
      return;
    }

    const session = readStoredSession();
    authListeners.forEach((listener) =>
      listener(session ? "TOKEN_REFRESHED" : "SIGNED_OUT", session),
    );
  });

  window.addEventListener(AUTH_STORAGE_EVENT, (event) => {
    const customEvent = event as CustomEvent<ApiSession | null>;
    const session = customEvent.detail ?? null;
    authListeners.forEach((listener) =>
      listener(session ? "TOKEN_REFRESHED" : "SIGNED_OUT", session),
    );
  });
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function toApiError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }

  return new ApiError(fallback);
}

function getAccessToken(): string | null {
  return readStoredSession()?.access_token ?? null;
}

function isAuthError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  );
}

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const token = auth ? getAccessToken() : null;
  const requestHeaders = new Headers(headers);

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (typeof body === "string" && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: requestHeaders,
    body,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : undefined) ||
      (typeof payload === "string" && payload) ||
      response.statusText ||
      "API request failed";

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

function encodePublicPath(value: string): string {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getColumnValue(row: Record<string, any>, column: string): unknown {
  if (column.includes("->>")) {
    const [root, key] = column.split("->>");
    const container = row[root];
    if (container && typeof container === "object") {
      return container[key];
    }
    return undefined;
  }

  return row[column];
}

function applyFilters(
  rows: Record<string, any>[],
  filters: QueryFilter[] = [],
): Record<string, any>[] {
  return rows.filter((row) =>
    filters.every((filter) => {
      const currentValue = getColumnValue(row, filter.column);

      if (filter.type === "eq") {
        return currentValue === filter.value;
      }

      if (filter.type === "not") {
        return !(currentValue === filter.value);
      }

      return filter.value.includes(currentValue);
    }),
  );
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  const leftDate = Date.parse(String(left));
  const rightDate = Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: "base",
  });
}

function applyOrders(
  rows: Record<string, any>[],
  orders: QueryOrder[] = [],
): Record<string, any>[] {
  if (orders.length === 0) {
    return rows;
  }

  const nextRows = [...rows];
  nextRows.sort((a, b) => {
    for (const order of orders) {
      const comparison = compareValues(
        getColumnValue(a, order.column),
        getColumnValue(b, order.column),
      );
      if (comparison !== 0) {
        return order.ascending ? comparison : -comparison;
      }
    }

    return 0;
  });

  return nextRows;
}

function selectColumns(
  rows: Record<string, any>[],
  columns: string,
): Record<string, any>[] {
  const normalizedColumns = columns.trim();
  if (!normalizedColumns || normalizedColumns === "*") {
    return rows;
  }

  const keys = normalizedColumns
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return rows.map((row) =>
    Object.fromEntries(keys.map((key) => [key, row[key]])),
  );
}

function normalizePageTheme(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    css: row.css ?? null,
    user_id: row.user_id ?? row.userId ?? null,
    is_default: row.is_default ?? row.isDefault ?? false,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  };
}

function normalizePageTemplate(row: Record<string, any>) {
  const normalized = {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    thumbnail: row.thumbnail ?? null,
    sections_data: row.sections_data ?? row.sectionsData ?? null,
    seo_h1: row.seo_h1 ?? row.seoH1 ?? null,
    seo_h2: row.seo_h2 ?? row.seoH2 ?? null,
    daisy_theme_slug: row.daisy_theme_slug ?? row.daisyThemeSlug ?? null,
    folder: row.folder ?? null,
    is_public: row.is_public ?? row.isPublic ?? false,
    is_system: row.is_system ?? row.isSystem ?? false,
    created_by: row.created_by ?? row.createdBy ?? null,
    page_theme_id: row.page_theme_id ?? row.pageThemeId ?? null,
    theme_id: row.theme_id ?? row.page_theme_id ?? row.pageThemeId ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  } as Record<string, any>;

  if (row.pageTheme) {
    normalized.page_theme = normalizePageTheme(row.pageTheme);
  }

  if (row.templateSections) {
    normalized.template_sections = row.templateSections;
  }

  return normalized;
}

function normalizeSeoMetadata(row: Record<string, any>) {
  const pageKey = row.page_key ?? row.pageKey ?? row.slug ?? "";

  const normalized = {
    id: row.id,
    page_key: pageKey,
    slug: pageKey,
    title: row.title ?? "",
    description: row.description ?? null,
    keywords: row.keywords ?? [],
    og_title: row.og_title ?? row.ogTitle ?? null,
    og_description: row.og_description ?? row.ogDescription ?? null,
    og_image: row.og_image ?? row.ogImage ?? null,
    canonical_url: row.canonical_url ?? row.canonicalUrl ?? null,
    language: row.language ?? "fr",
    status: row.status ?? "draft",
    content: row.content ?? null,
    sections_data: row.sections_data ?? row.sectionsData ?? null,
    seo_h1: row.seo_h1 ?? row.seoH1 ?? null,
    seo_h2: row.seo_h2 ?? row.seoH2 ?? null,
    imported_at: row.imported_at ?? row.importedAt ?? null,
    created_by: row.created_by ?? row.createdBy ?? null,
    user_id: row.user_id ?? row.userId ?? null,
    template_id: row.template_id ?? row.templateId ?? null,
    daisy_theme_slug: row.daisy_theme_slug ?? row.daisyThemeSlug ?? null,
    folder: row.folder ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  } as Record<string, any>;

  if (row.template) {
    normalized.template = normalizePageTemplate(row.template);
  }

  return normalized;
}

function normalizeRedirect(row: Record<string, any>) {
  return {
    id: row.id,
    source_path: row.source_path ?? row.sourcePath ?? "",
    target_path: row.target_path ?? row.targetPath ?? "",
    source_page_id: row.source_page_id ?? row.sourcePageId ?? null,
    target_page_id: row.target_page_id ?? row.targetPageId ?? null,
    reason: row.reason ?? null,
    is_active: row.is_active ?? row.isActive ?? false,
    created_by: row.created_by ?? row.createdBy ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  };
}

function normalizeDaisyTheme(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    source: row.source,
    tokens: row.tokens ?? {},
    font_config: row.font_config ?? row.fontConfig ?? null,
    is_active: row.is_active ?? row.isActive ?? false,
    user_id: row.user_id ?? row.userId ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  };
}

function normalizeFont(row: Record<string, any>) {
  return {
    id: row.id,
    font_name: row.font_name ?? row.fontName ?? "",
    font_family: row.font_family ?? row.fontFamily ?? "",
    font_url: row.font_url ?? row.fontUrl ?? null,
    font_weights: row.font_weights ?? row.fontWeights ?? [],
    is_google_font: row.is_google_font ?? row.isGoogleFont ?? false,
    imported_by: row.imported_by ?? row.importedBy ?? null,
    is_system: row.is_system ?? row.isSystem ?? false,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
  };
}

function normalizeGlobalHFSetting(row: Record<string, any>) {
  return {
    id: row.id,
    label: row.label,
    header_section: row.header_section ?? row.headerSection ?? null,
    footer_section: row.footer_section ?? row.footerSection ?? null,
    apply_on_import: row.apply_on_import ?? row.applyOnImport ?? false,
    apply_on_create: row.apply_on_create ?? row.applyOnCreate ?? false,
    is_active: row.is_active ?? row.isActive ?? false,
    target_page_ids: row.target_page_ids ?? row.targetPageIds ?? [],
    created_by: row.created_by ?? row.createdBy ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  };
}

function normalizeMediaFile(row: Record<string, any>) {
  const storagePath = row.filePath ?? row.file_path ?? "";
  const publicUrl = resolveMediaUrl(
    row.publicUrl ?? row.public_url,
    storagePath,
  );

  return {
    id: row.id,
    filename: row.filename,
    original_filename: row.original_filename ?? row.originalFilename ?? "",
    file_path: publicUrl,
    file_size: Number(row.file_size ?? row.fileSize ?? 0),
    mime_type: row.mime_type ?? row.mimeType ?? "",
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    alt_text: row.alt_text ?? row.altText ?? undefined,
    uploaded_by: row.uploaded_by ?? row.uploadedBy ?? null,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    public_url: publicUrl,
    _storage_path: storagePath,
  };
}

function normalizeUserProfileRow(row: Record<string, any>) {
  return {
    id: row.id,
    email: row.email,
    full_name:
      row.full_name ?? row.fullName ?? row.user_metadata?.full_name ?? "",
    role: row.role ?? row.app_metadata?.role ?? "content_creator",
    avatar_url: row.avatar_url ?? row.avatarUrl ?? undefined,
    created_at: ensureDateString(row.created_at ?? row.createdAt),
    updated_at: ensureDateString(row.updated_at ?? row.updatedAt),
  };
}

function pickAllowed(payload: Record<string, any>, keys: string[]) {
  const selected: Record<string, any> = {};

  for (const key of keys) {
    if (key in payload) {
      selected[key] = payload[key];
    }
  }

  return selected;
}

function serializeSeoMetadata(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "page_key",
    "title",
    "description",
    "keywords",
    "og_title",
    "og_description",
    "og_image",
    "canonical_url",
    "language",
    "status",
    "content",
    "sections_data",
    "seo_h1",
    "seo_h2",
    "template_id",
    "daisy_theme_slug",
    "folder",
  ]);

  return stripUndefined({
    pageKey: allowed.page_key,
    title: allowed.title,
    description: allowed.description,
    keywords: allowed.keywords,
    ogTitle: allowed.og_title,
    ogDescription: allowed.og_description,
    ogImage: allowed.og_image,
    canonicalUrl: allowed.canonical_url,
    language: allowed.language,
    status: allowed.status,
    content: allowed.content,
    sectionsData: allowed.sections_data,
    seoH1: allowed.seo_h1,
    seoH2: allowed.seo_h2,
    templateId: allowed.template_id,
    daisyThemeSlug: allowed.daisy_theme_slug,
    folder: allowed.folder,
  });
}

function serializePageTemplate(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "name",
    "description",
    "thumbnail",
    "sections_data",
    "seo_h1",
    "seo_h2",
    "daisy_theme_slug",
    "folder",
    "is_public",
    "is_system",
    "page_theme_id",
    "theme_id",
  ]);

  return stripUndefined({
    name: allowed.name,
    description: allowed.description,
    thumbnail: allowed.thumbnail,
    sectionsData: allowed.sections_data,
    seoH1: allowed.seo_h1,
    seoH2: allowed.seo_h2,
    daisyThemeSlug: allowed.daisy_theme_slug,
    folder: allowed.folder,
    isPublic: allowed.is_public,
    isSystem: allowed.is_system,
    pageThemeId: allowed.page_theme_id ?? allowed.theme_id,
  });
}

function serializeRedirect(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "source_path",
    "target_path",
    "source_page_id",
    "target_page_id",
    "reason",
    "is_active",
  ]);

  return stripUndefined({
    sourcePath: allowed.source_path,
    targetPath: allowed.target_path,
    sourcePageId: allowed.source_page_id,
    targetPageId: allowed.target_page_id,
    reason: allowed.reason,
    isActive: allowed.is_active,
  });
}

function serializePageTheme(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "name",
    "description",
    "css",
    "is_default",
  ]);

  return stripUndefined({
    name: allowed.name,
    description: allowed.description,
    css: allowed.css,
    isDefault: allowed.is_default,
  });
}

function serializeDaisyTheme(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "name",
    "slug",
    "source",
    "tokens",
    "font_config",
    "is_active",
  ]);

  return stripUndefined({
    name: allowed.name,
    slug: allowed.slug,
    source: allowed.source,
    tokens: allowed.tokens,
    fontConfig: allowed.font_config,
    isActive: allowed.is_active,
  });
}

function serializeFont(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "font_name",
    "font_family",
    "font_url",
    "font_weights",
    "is_google_font",
    "is_system",
  ]);

  return stripUndefined({
    fontName: allowed.font_name,
    fontFamily: allowed.font_family,
    fontUrl: allowed.font_url,
    fontWeights: allowed.font_weights,
    isGoogleFont: allowed.is_google_font,
    isSystem: allowed.is_system,
  });
}

function serializeGlobalHF(payload: Record<string, any>) {
  const allowed = pickAllowed(payload, [
    "label",
    "header_section",
    "footer_section",
    "apply_on_import",
    "apply_on_create",
    "is_active",
    "target_page_ids",
  ]);

  return stripUndefined({
    label: allowed.label,
    headerSection: allowed.header_section,
    footerSection: allowed.footer_section,
    applyOnImport: allowed.apply_on_import,
    applyOnCreate: allowed.apply_on_create,
    isActive: allowed.is_active,
    targetPageIds: Array.isArray(allowed.target_page_ids)
      ? allowed.target_page_ids
      : [],
  });
}

const resourceDefinitions: Record<string, ResourceDefinition> = {
  seo_metadata: {
    listPath: "/api/pages",
    createPath: "/api/pages",
    updatePath: (id) => `/api/pages/${id}`,
    deletePath: (id) => `/api/pages/${id}`,
    publicGetPath: (value) => `/api/pages/public/${encodePublicPath(value)}`,
    normalize: normalizeSeoMetadata,
    serialize: serializeSeoMetadata,
  },
  seo_redirects: {
    listPath: "/api/redirects",
    createPath: "/api/redirects",
    updatePath: (id) => `/api/redirects/${id}`,
    deletePath: (id) => `/api/redirects/${id}`,
    publicListPath: "/api/pages/public/redirects",
    normalize: normalizeRedirect,
    serialize: serializeRedirect,
  },
  page_templates: {
    listPath: "/api/templates",
    createPath: "/api/templates",
    updatePath: (id) => `/api/templates/${id}`,
    deletePath: (id) => `/api/templates/${id}`,
    normalize: normalizePageTemplate,
    serialize: serializePageTemplate,
  },
  page_themes: {
    listPath: "/api/themes/page",
    createPath: "/api/themes/page",
    updatePath: (id) => `/api/themes/page/${id}`,
    deletePath: (id) => `/api/themes/page/${id}`,
    normalize: normalizePageTheme,
    serialize: serializePageTheme,
  },
  daisyui_themes: {
    listPath: "/api/themes/daisy",
    createPath: "/api/themes/daisy",
    updatePath: (id) => `/api/themes/daisy/${id}`,
    deletePath: (id) => `/api/themes/daisy/${id}`,
    normalize: normalizeDaisyTheme,
    serialize: serializeDaisyTheme,
  },
  fonts_library: {
    listPath: "/api/fonts",
    createPath: "/api/fonts",
    deletePath: (id) => `/api/fonts/${id}`,
    normalize: normalizeFont,
    serialize: serializeFont,
  },
  global_hf_settings: {
    listPath: "/api/global-hf",
    createPath: "/api/global-hf",
    updatePath: (id) => `/api/global-hf/${id}`,
    deletePath: (id) => `/api/global-hf/${id}`,
    normalize: normalizeGlobalHFSetting,
    serialize: serializeGlobalHF,
  },
  media_files: {
    listPath: "/api/media",
    deletePath: (id) => `/api/media/${id}`,
    normalize: normalizeMediaFile,
    serialize: () => {
      throw new ApiError(
        'Direct media_files writes are unsupported. Use supabase.storage.from("media").upload() first.',
      );
    },
  },
  user_profiles: {
    normalize: normalizeUserProfileRow,
    serialize: () => ({}),
  },
};

function getResource(table: string): ResourceDefinition {
  const resource = resourceDefinitions[table];
  if (!resource) {
    throw new ApiError(
      `Unsupported Supabase table "${table}". Add an explicit mapping before using it.`,
    );
  }

  return resource;
}

async function listPrivateRows(table: string): Promise<Record<string, any>[]> {
  const resource = getResource(table);

  if (!resource.listPath) {
    throw new ApiError(
      `Table "${table}" does not support list/select operations.`,
    );
  }

  const payload = await apiRequest<any[]>(resource.listPath, { auth: true });
  return payload.map((row) => resource.normalize(row));
}

async function listPublicRows(table: string): Promise<Record<string, any>[]> {
  const resource = getResource(table);

  if (!resource.publicListPath) {
    throw new ApiError(`Table "${table}" does not expose a public list route.`);
  }

  const payload = await apiRequest<any[]>(resource.publicListPath, {
    auth: false,
  });
  return payload.map((row) => resource.normalize(row));
}

async function getPublicSeoRow(
  filters: QueryFilter[],
): Promise<Record<string, any>[]> {
  const pageKeyFilter = filters.find(
    (filter) => filter.type === "eq" && filter.column === "page_key",
  );
  if (
    !pageKeyFilter ||
    typeof pageKeyFilter.value !== "string" ||
    !pageKeyFilter.value
  ) {
    return [];
  }

  const resource = getResource("seo_metadata");

  try {
    const payload = await apiRequest<Record<string, any>>(
      resource.publicGetPath!(pageKeyFilter.value),
      { auth: false },
    );
    return [resource.normalize(payload)];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

function shouldUsePublicSeoRoute(filters: QueryFilter[]): boolean {
  const hasPublishedStatus = filters.some(
    (filter) =>
      filter.type === "eq" &&
      filter.column === "status" &&
      filter.value === "published",
  );
  const hasPageKey = filters.some(
    (filter) => filter.type === "eq" && filter.column === "page_key",
  );
  return !getAccessToken() && hasPublishedStatus && hasPageKey;
}

async function getCurrentUserProfile(): Promise<Record<string, any>> {
  const currentUser = await apiRequest<BackendAuthUser>("/auth/me", {
    auth: true,
  });
  return normalizeUserProfileRow(currentUser as Record<string, any>);
}

export async function queryRows(
  table: string,
  columns: string,
  options: QueryOptions = {},
  includeCount = false,
): Promise<QueryResult<Record<string, any>[] | Record<string, any>>> {
  try {
    if (table === "user_profiles") {
      const row = await getCurrentUserProfile();
      let rows = applyFilters([row], options.filters);
      const count = rows.length;
      rows = applyOrders(rows, options.orders);
      rows = options.limit ? rows.slice(0, options.limit) : rows;
      const selected = selectColumns(rows, columns);

      if (options.single) {
        if (selected.length !== 1) {
          return {
            data: null,
            error: new ApiError("Expected a single row from user_profiles"),
            count,
          };
        }
        return {
          data: selected[0],
          error: null,
          count: includeCount ? count : undefined,
        };
      }

      if (options.maybeSingle) {
        if (selected.length > 1) {
          return {
            data: null,
            error: new ApiError("Expected zero or one row from user_profiles"),
            count,
          };
        }
        return {
          data: selected[0] ?? null,
          error: null,
          count: includeCount ? count : undefined,
        };
      }

      return {
        data: selected,
        error: null,
        count: includeCount ? count : undefined,
      };
    }

    let rows: Record<string, any>[];
    if (
      table === "seo_metadata" &&
      shouldUsePublicSeoRoute(options.filters ?? [])
    ) {
      rows = await getPublicSeoRow(options.filters ?? []);
    } else if (table === "seo_redirects" && !getAccessToken()) {
      rows = await listPublicRows(table);
    } else {
      rows = await listPrivateRows(table);
    }

    rows = applyFilters(rows, options.filters);
    const count = rows.length;
    rows = applyOrders(rows, options.orders);
    rows = options.limit ? rows.slice(0, options.limit) : rows;
    const selected = selectColumns(rows, columns);

    if (options.single) {
      if (selected.length !== 1) {
        return {
          data: null,
          error: new ApiError(`Expected a single row from ${table}`),
          count,
        };
      }
      return {
        data: selected[0],
        error: null,
        count: includeCount ? count : undefined,
      };
    }

    if (options.maybeSingle) {
      if (selected.length > 1) {
        return {
          data: null,
          error: new ApiError(`Expected zero or one row from ${table}`),
          count,
        };
      }
      return {
        data: selected[0] ?? null,
        error: null,
        count: includeCount ? count : undefined,
      };
    }

    return {
      data: selected,
      error: null,
      count: includeCount ? count : undefined,
    };
  } catch (error) {
    return { data: null, error: toApiError(error, `Failed to query ${table}`) };
  }
}

function getIdFromFilters(
  table: string,
  filters: QueryFilter[],
): string | null {
  const idFilter = filters.find(
    (filter) => filter.type === "eq" && filter.column === "id",
  );
  if (idFilter && typeof idFilter.value === "string") {
    return idFilter.value;
  }

  if (table === "media_files") {
    const filePathFilter = filters.find(
      (filter) => filter.type === "eq" && filter.column === "file_path",
    );
    if (filePathFilter && typeof filePathFilter.value === "string") {
      const uploaded =
        uploadedMediaByPath.get(filePathFilter.value) ||
        uploadedMediaByPublicUrl.get(filePathFilter.value);
      return typeof uploaded?.id === "string" ? uploaded.id : null;
    }
  }

  return null;
}

async function updateRowsByFilters(
  table: string,
  payload: Record<string, any>,
  filters: QueryFilter[],
): Promise<Record<string, any>[]> {
  const resource = getResource(table);
  const id = getIdFromFilters(table, filters);

  if (id && resource.updatePath) {
    const response = await apiRequest<Record<string, any>>(
      resource.updatePath(id),
      {
        method: "PATCH",
        body: JSON.stringify(resource.serialize(payload, "update")),
        auth: true,
      },
    );
    return [resource.normalize(response)];
  }

  const existing = await queryRows(table, "*", { filters }, false);
  if (existing.error) {
    throw existing.error;
  }

  const rows = Array.isArray(existing.data)
    ? existing.data
    : existing.data
      ? [existing.data]
      : [];

  if (!resource.updatePath) {
    throw new ApiError(`Table "${table}" does not support update operations.`);
  }

  return Promise.all(
    rows.map(async (row) => {
      const response = await apiRequest<Record<string, any>>(
        resource.updatePath!(row.id),
        {
          method: "PATCH",
          body: JSON.stringify(resource.serialize(payload, "update")),
          auth: true,
        },
      );
      return resource.normalize(response);
    }),
  );
}

async function insertRows(
  table: string,
  payload: Record<string, any> | Record<string, any>[],
): Promise<Record<string, any>[]> {
  const resource = getResource(table);
  const rows = Array.isArray(payload) ? payload : [payload];

  if (table === "user_profiles") {
    const current = await getCurrentUserProfile();
    return rows.map(() => current);
  }

  if (table === "media_files") {
    return rows.map((row) => {
      const uploaded =
        uploadedMediaByPublicUrl.get(row.file_path) ||
        uploadedMediaByPath.get(row.file_path);
      if (!uploaded) {
        throw new ApiError(
          "Direct media_files inserts are unsupported. Upload via storage first.",
        );
      }
      return uploaded;
    });
  }

  if (!resource.createPath) {
    throw new ApiError(`Table "${table}" does not support insert operations.`);
  }

  return Promise.all(
    rows.map(async (row) => {
      const response = await apiRequest<Record<string, any>>(
        resource.createPath!,
        {
          method: "POST",
          body: JSON.stringify(resource.serialize(row, "create")),
          auth: true,
        },
      );
      return resource.normalize(response);
    }),
  );
}

async function deleteRows(
  table: string,
  filters: QueryFilter[],
): Promise<void> {
  const resource = getResource(table);
  const id = getIdFromFilters(table, filters);

  if (!id || !resource.deletePath) {
    throw new ApiError(`Delete on "${table}" requires an explicit id filter.`);
  }

  await apiRequest(resource.deletePath(id), {
    method: "DELETE",
    auth: true,
  });
}

async function upsertSeoMetadataRows(
  payload: Record<string, any> | Record<string, any>[],
): Promise<Record<string, any>[]> {
  const rows = Array.isArray(payload) ? payload : [payload];
  const existingRows = await listPrivateRows("seo_metadata");
  const existingByPageKey = new Map(
    existingRows.map((row) => [row.page_key, row]),
  );
  const resource = getResource("seo_metadata");

  return Promise.all(
    rows.map(async (row) => {
      const current =
        typeof row.page_key === "string"
          ? existingByPageKey.get(row.page_key)
          : undefined;
      if (current?.id) {
        const response = await apiRequest<Record<string, any>>(
          resource.updatePath!(current.id),
          {
            method: "PATCH",
            body: JSON.stringify(resource.serialize(row, "update")),
            auth: true,
          },
        );
        return resource.normalize(response);
      }

      const response = await apiRequest<Record<string, any>>(
        resource.createPath!,
        {
          method: "POST",
          body: JSON.stringify(resource.serialize(row, "create")),
          auth: true,
        },
      );
      return resource.normalize(response);
    }),
  );
}

export async function mutateRows(
  table: string,
  action: "insert" | "update" | "delete" | "upsert",
  payload: Record<string, any> | Record<string, any>[] | null,
  filters: QueryFilter[] = [],
): Promise<QueryResult<Record<string, any>[] | Record<string, any>>> {
  try {
    if (action === "delete") {
      await deleteRows(table, filters);
      return { data: null, error: null };
    }

    if (!payload) {
      throw new ApiError(
        `Mutation "${action}" on "${table}" requires a payload.`,
      );
    }

    const rows =
      action === "insert"
        ? await insertRows(table, payload)
        : action === "update"
          ? await updateRowsByFilters(
              table,
              payload as Record<string, any>,
              filters,
            )
          : table === "seo_metadata"
            ? await upsertSeoMetadataRows(payload)
            : (() => {
                throw new ApiError(
                  "Upsert is only supported for seo_metadata in the compatibility adapter.",
                );
              })();

    if (Array.isArray(payload) || rows.length !== 1) {
      return { data: rows, error: null };
    }

    return { data: rows[0], error: null };
  } catch (error) {
    return {
      data: null,
      error: toApiError(error, `Failed to ${action} rows for ${table}`),
    };
  }
}

export function getUploadedMediaPublicUrl(filePath: string): string {
  const uploaded = uploadedMediaByPath.get(filePath);
  if (uploaded?.file_path) {
    return uploaded.file_path;
  }

  return resolveMediaUrl(filePath, filePath);
}

export async function uploadMediaFile(
  filePath: string,
  file: File,
): Promise<QueryResult<Record<string, any>>> {
  try {
    const formData = new FormData();

    const segments = filePath.split("/").filter(Boolean);
    const folder =
      segments.length > 1 ? segments.slice(0, -1).join("/") : segments[0] || "";
    const uploadFileName =
      file.name && file.name !== "blob"
        ? file.name
        : segments[segments.length - 1] || "upload";

    formData.append("file", file, uploadFileName);

    if (folder) {
      formData.append("folder", folder);
    }

    const uploaded = await apiRequest<Record<string, any>>(
      "/api/media/upload",
      {
        method: "POST",
        body: formData,
        auth: true,
      },
    );

    const normalized = normalizeMediaFile(uploaded);
    uploadedMediaByPath.set(filePath, normalized);
    uploadedMediaByPublicUrl.set(normalized.file_path, normalized);
    return { data: normalized, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error, "Failed to upload media") };
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
    const response = await apiRequest<BackendAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
      headers: { "Content-Type": "application/json" },
    });

    const session = createSession(response.access_token, response.user);
    emitAuthChange("SIGNED_IN", session);
    return { data: { session, user: session.user }, error: null };
  } catch (error) {
    return {
      data: { session: null, user: null },
      error: toApiError(error, "Sign in failed"),
    };
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName?: string,
) {
  try {
    const response = await apiRequest<BackendAuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
      auth: false,
      headers: { "Content-Type": "application/json" },
    });

    const session = createSession(response.access_token, response.user);
    emitAuthChange("SIGNED_IN", session);
    return { data: { session, user: session.user }, error: null };
  } catch (error) {
    return {
      data: { session: null, user: null },
      error: toApiError(error, "Sign up failed"),
    };
  }
}

export async function signOut() {
  try {
    await apiRequest("/auth/logout", { method: "POST", auth: true });
  } catch (error) {
    if (!isAuthError(error)) {
      return { error: toApiError(error, "Sign out failed") };
    }
  }

  emitAuthChange("SIGNED_OUT", null);
  return { error: null };
}

export async function getSession() {
  const stored = readStoredSession();
  if (!stored) {
    return { data: { session: null }, error: null };
  }

  try {
    const me = await apiRequest<BackendAuthUser>("/auth/me", { auth: true });
    const session = createSession(stored.access_token, me);
    persistSession(session);
    return { data: { session }, error: null };
  } catch (error) {
    if (isAuthError(error)) {
      emitAuthChange("SIGNED_OUT", null);
      return { data: { session: null }, error: null };
    }

    return {
      data: { session: null },
      error: toApiError(error, "Unable to load session"),
    };
  }
}

export async function getUser() {
  const sessionResult = await getSession();
  return {
    data: {
      user: sessionResult.data.session?.user ?? null,
    },
    error: sessionResult.error,
  };
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: ApiSession | null) => void,
) {
  ensureStorageListener();
  authListeners.add(callback);

  const subscription = {
    unsubscribe: () => {
      authListeners.delete(callback);
    },
  };

  return {
    data: {
      subscription,
    },
  };
}
