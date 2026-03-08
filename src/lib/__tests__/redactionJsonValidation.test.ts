import { describe, it, expect } from 'vitest';
import { validateGeneratedJson, extractJsonFromText } from '../redactionJsonValidation';

describe('redactionJsonValidation', () => {
  describe('validateGeneratedJson', () => {
    it('rejects non-object input', () => {
      const result = validateGeneratedJson(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Le JSON doit être un objet.');
    });

    it('rejects missing pages array', () => {
      const result = validateGeneratedJson({ data: [] });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('tableau "pages"');
    });

    it('rejects empty pages array', () => {
      const result = validateGeneratedJson({ pages: [] });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('pages" est vide');
    });

    it('validates a correct minimal page', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'ma-page',
          title: 'Mon titre',
          status: 'draft',
          content_overrides: {},
        }],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid page_key format', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'Ma Page Invalid!',
          title: 'Titre',
        }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('page_key invalide'))).toBe(true);
    });

    it('rejects missing title', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
        }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('title est obligatoire'))).toBe(true);
    });

    it('warns on title over 60 chars', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'A'.repeat(61),
          content_overrides: {},
        }],
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('60 caractères'))).toBe(true);
    });

    it('warns on description over 160 chars', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'Titre',
          description: 'D'.repeat(161),
          content_overrides: {},
        }],
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('160 caractères'))).toBe(true);
    });

    it('rejects invalid status values', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'Titre',
          status: 'invalid_status',
          content_overrides: {},
        }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('status invalide'))).toBe(true);
    });

    it('rejects non-array sections_data', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'Titre',
          sections_data: 'not an array',
        }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('sections_data doit être un tableau'))).toBe(true);
    });

    it('rejects array content_overrides', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'Titre',
          content_overrides: [],
        }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('content_overrides doit être un objet'))).toBe(true);
    });

    it('warns when neither sections_data nor content_overrides', () => {
      const result = validateGeneratedJson({
        pages: [{
          page_key: 'test',
          title: 'Titre',
        }],
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('ni sections_data ni content_overrides'))).toBe(true);
    });

    it('validates multiple pages', () => {
      const result = validateGeneratedJson({
        pages: [
          { page_key: 'page-1', title: 'Page 1', content_overrides: {} },
          { page_key: 'page-2', title: 'Page 2', sections_data: [] },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('extractJsonFromText', () => {
    it('extracts from code block', () => {
      const text = 'Voici le JSON :\n```json\n{"pages":[{"page_key":"test","title":"Hello"}]}\n```\nBye';
      const result = extractJsonFromText(text);
      expect(result).not.toBeNull();
      expect((result!.json as any).pages[0].page_key).toBe('test');
    });

    it('extracts from raw JSON', () => {
      const text = '{"pages":[{"page_key":"raw","title":"Raw"}]}';
      const result = extractJsonFromText(text);
      expect(result).not.toBeNull();
      expect((result!.json as any).pages[0].page_key).toBe('raw');
    });

    it('returns null for invalid JSON', () => {
      const result = extractJsonFromText('This is not JSON at all');
      expect(result).toBeNull();
    });

    it('extracts from ``` block without json tag', () => {
      const text = '```\n{"pages":[{"page_key":"no-tag","title":"No Tag"}]}\n```';
      const result = extractJsonFromText(text);
      expect(result).not.toBeNull();
      expect((result!.json as any).pages[0].page_key).toBe('no-tag');
    });
  });
});
