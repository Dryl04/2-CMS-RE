import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt } from '../redactionPromptPolicy';
import type { SEODocumentWithAuthor } from '../redactionTypes';

// Minimal mock document
function mockDoc(overrides?: Partial<SEODocumentWithAuthor>): SEODocumentWithAuthor {
  return {
    id: 'doc-1',
    name: 'Test Document',
    editor_mode: 'plain',
    plain_content: 'Contenu de rédaction pour tester.',
    rich_content: null,
    structured_content: null,
    status: 'ready_for_ai',
    folder_id: null,
    author_user_id: 'user-1',
    owner_user_id: 'user-1',
    linked_template_id: null,
    linked_template_snapshot: null,
    last_generated_json: null,
    last_generated_at: null,
    last_generated_by: null,
    last_edited_by: null,
    edit_lock_user_id: null,
    edit_lock_at: null,
    published_page_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    archived_at: null,
    trashed_at: null,
    trashed_by: null,
    ...overrides,
  };
}

describe('redactionPromptPolicy', () => {
  describe('buildGenerationPrompt', () => {
    it('includes source text from plain content', () => {
      const doc = mockDoc({ plain_content: 'Mon texte marketing' });
      const prompt = buildGenerationPrompt(doc, null, null);
      expect(prompt).toContain('Mon texte marketing');
    });

    it('includes document metadata', () => {
      const doc = mockDoc({ name: 'Page Produit' });
      const prompt = buildGenerationPrompt(doc, null, null);
      expect(prompt).toContain('Page Produit');
      expect(prompt).toContain('plain');
      expect(prompt).toContain('ready_for_ai');
    });

    it('includes template info when provided', () => {
      const doc = mockDoc();
      const template = {
        id: 'tpl-1',
        name: 'Landing Premium',
        is_public: true,
        is_system: false,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        daisy_theme_slug: 'emerald',
      };
      const prompt = buildGenerationPrompt(doc, template, null);
      expect(prompt).toContain('Landing Premium');
      expect(prompt).toContain('tpl-1');
      expect(prompt).toContain('emerald');
    });

    it('includes template export as JSON', () => {
      const doc = mockDoc();
      const templateExport = { sections_data: [{ type: 'hero' }] };
      const prompt = buildGenerationPrompt(doc, null, templateExport);
      expect(prompt).toContain('"sections_data"');
      expect(prompt).toContain('"hero"');
    });

    it('includes Format C instructions', () => {
      const prompt = buildGenerationPrompt(mockDoc(), null, null);
      expect(prompt).toContain('content_overrides');
      expect(prompt).toContain('page_key');
      expect(prompt).toContain('Format C');
    });

    it('includes fidelity rules', () => {
      const prompt = buildGenerationPrompt(mockDoc(), null, null);
      expect(prompt).toContain('Ne modifie JAMAIS');
      expect(prompt).toContain('images');
    });

    it('handles empty content gracefully', () => {
      const doc = mockDoc({ plain_content: '' });
      const prompt = buildGenerationPrompt(doc, null, null);
      expect(prompt).toContain('(aucun contenu)');
    });
  });
});
