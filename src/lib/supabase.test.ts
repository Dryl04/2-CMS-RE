import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { supabase } from './supabase.ts';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const storage = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
});

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, 'fetch', {
    value: async () => {
      throw new Error('Unexpected fetch call');
    },
    configurable: true,
    writable: true,
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

test('auth helpers persist and restore a session against the Nest auth routes', async () => {
  const calls: Array<{ url: string; method?: string; auth?: string | null }> = [];

  Object.defineProperty(globalThis, 'fetch', {
    value: async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      calls.push({
        url,
        method: init?.method,
        auth: init?.headers instanceof Headers
          ? init.headers.get('Authorization')
          : (init?.headers as Record<string, string> | undefined)?.Authorization ?? null,
      });

      if (url.endsWith('/auth/login')) {
        return jsonResponse({
          access_token: 'token-123',
          user: {
            id: 'user-1',
            email: 'landry@example.com',
            fullName: 'Landry',
            role: 'admin',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        });
      }

      if (url.endsWith('/auth/me')) {
        return jsonResponse({
          id: 'user-1',
          email: 'landry@example.com',
          fullName: 'Landry',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        });
      }

      if (url.endsWith('/auth/logout')) {
        return jsonResponse({ success: true });
      }

      throw new Error(`Unhandled URL: ${url}`);
    },
    configurable: true,
    writable: true,
  });

  const signInResult = await supabase.auth.signInWithPassword({
    email: 'landry@example.com',
    password: 'password-123',
  });

  assert.equal(signInResult.error, null);
  assert.equal(signInResult.data.user?.user_metadata.full_name, 'Landry');
  assert.equal(storage.getItem('cms_api_access_token'), 'token-123');

  const sessionResult = await supabase.auth.getSession();
  assert.equal(sessionResult.error, null);
  assert.equal(sessionResult.data.session?.user.email, 'landry@example.com');
  assert.equal(sessionResult.data.session?.user.app_metadata.role, 'admin');

  const userResult = await supabase.auth.getUser();
  assert.equal(userResult.error, null);
  assert.equal(userResult.data.user?.id, 'user-1');

  const signOutResult = await supabase.auth.signOut();
  assert.equal(signOutResult.error, null);
  assert.equal(storage.getItem('cms_api_access_token'), null);

  assert.deepEqual(
    calls.map((entry) => `${entry.method ?? 'GET'} ${entry.url.replace('http://localhost:3001', '')}`),
    [
      'POST /auth/login',
      'GET /auth/me',
      'GET /auth/me',
      'POST /auth/logout',
    ],
  );
});

test('public seo page queries map Nest payloads back to the legacy snake_case shape', async () => {
  Object.defineProperty(globalThis, 'fetch', {
    value: async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      assert.equal(url, 'http://localhost:3001/api/pages/public/landing-home');

      return jsonResponse({
        id: 'page-1',
        pageKey: 'landing-home',
        title: 'Landing Home',
        status: 'published',
        daisyThemeSlug: 'light',
        sectionsData: [{ id: 'section-1', type: 'hero' }],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      });
    },
    configurable: true,
    writable: true,
  });

  const result = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('page_key', 'landing-home')
    .eq('status', 'published')
    .maybeSingle();

  assert.equal(result.error, null);
  assert.equal(result.data?.page_key, 'landing-home');
  assert.equal(result.data?.slug, 'landing-home');
  assert.equal(result.data?.daisy_theme_slug, 'light');
  assert.deepEqual(result.data?.sections_data, [{ id: 'section-1', type: 'hero' }]);
});

test('media upload compatibility bridges storage upload and legacy media_files inserts', async () => {
  storage.setItem('cms_api_access_token', 'token-123');
  storage.setItem(
    'cms_api_session_user',
    JSON.stringify({
      id: 'user-1',
      email: 'landry@example.com',
      role: 'admin',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
      user_metadata: {},
      app_metadata: { role: 'admin' },
    }),
  );

  let uploadCalls = 0;

  Object.defineProperty(globalThis, 'fetch', {
    value: async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      assert.equal(url, 'http://localhost:3001/api/media/upload');
      assert.equal(init?.method, 'POST');
      uploadCalls += 1;

      return jsonResponse({
        id: 'media-1',
        filename: 'file.png',
        originalFilename: 'file.png',
        filePath: 'user-1/file.png',
        fileSize: '512',
        mimeType: 'image/png',
        uploadedBy: 'user-1',
        createdAt: '2024-01-03T00:00:00.000Z',
        publicUrl: 'https://cdn.example.com/user-1/file.png',
      });
    },
    configurable: true,
    writable: true,
  });

  const file = new File(['hello'], 'file.png', { type: 'image/png' });
  const uploadResult = await supabase.storage.from('media').upload('user-1/file.png', file);
  assert.equal(uploadResult.error, null);

  const publicUrlResult = supabase.storage.from('media').getPublicUrl('user-1/file.png');
  assert.equal(publicUrlResult.data.publicUrl, 'https://cdn.example.com/user-1/file.png');

  const insertResult = await supabase
    .from('media_files')
    .insert({
      filename: 'file.png',
      file_path: 'https://cdn.example.com/user-1/file.png',
    })
    .select('*')
    .single();

  assert.equal(insertResult.error, null);
  assert.equal(insertResult.data?.id, 'media-1');
  assert.equal(insertResult.data?.file_path, 'https://cdn.example.com/user-1/file.png');
  assert.equal(uploadCalls, 1);
});
