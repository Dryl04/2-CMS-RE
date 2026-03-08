import { describe, it, expect } from 'vitest';
import {
  normalizeToAISource,
  plainToStructured,
  structuredToPlain,
  plainToRich,
  richToPlain,
} from '@/lib/redactionEditorTransforms';

// ===================================================================
// Tests unitaires : redactionEditorTransforms
// ===================================================================

describe('normalizeToAISource', () => {
  it('retourne le plain content en mode plain', () => {
    expect(normalizeToAISource('plain', '  Hello world  ', null, null)).toBe('Hello world');
  });

  it("retourne une chaîne vide si plain content est null", () => {
    expect(normalizeToAISource('plain', null, null, null)).toBe('');
  });

  it('extrait le texte HTML en mode riche (html)', () => {
    const rich = { type: 'doc', html: '<p>Bonjour <strong>monde</strong></p>' };
    const result = normalizeToAISource('rich', null, rich, null);
    expect(result).toContain('Bonjour');
    expect(result).toContain('monde');
    expect(result).not.toContain('<p>');
  });

  it('extrait le texte des noeuds ProseMirror en mode riche', () => {
    const rich = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Premier paragraphe' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Deuxième paragraphe' }],
        },
      ],
    };
    const result = normalizeToAISource('rich', null, rich, null);
    expect(result).toContain('Premier paragraphe');
    expect(result).toContain('Deuxième paragraphe');
  });

  it('aplatit le contenu structuré en mode structured', () => {
    const structured = {
      seo_title: 'Mon titre',
      meta_description: 'Ma description',
      body: 'Le corps du texte',
    };
    const result = normalizeToAISource('structured', null, null, structured);
    expect(result).toContain('Titre SEO : Mon titre');
    expect(result).toContain('Meta description : Ma description');
    expect(result).toContain('Le corps du texte');
  });

  it('fallback sur plainContent pour un mode inconnu', () => {
    expect(normalizeToAISource('plain' as never, 'fallback', null, null)).toBe('fallback');
  });
});

describe('plainToStructured', () => {
  it('place le texte dans le champ body', () => {
    const result = plainToStructured('Mon contenu');
    expect(result.body).toBe('Mon contenu');
  });

  it('trim les espaces', () => {
    const result = plainToStructured('  espaces  ');
    expect(result.body).toBe('espaces');
  });
});

describe('structuredToPlain', () => {
  it('concatène les champs structurés en texte lisible', () => {
    const result = structuredToPlain({ seo_title: 'Titre', h1: 'H1 ici', body: 'Corps' });
    expect(result).toContain('Titre SEO : Titre');
    expect(result).toContain('H1 : H1 ici');
    expect(result).toContain('Corps');
  });

  it("retourne une chaîne vide si null", () => {
    expect(structuredToPlain(null)).toBe('');
  });

  it('ignore les champs vides', () => {
    const result = structuredToPlain({ body: 'Texte seul' });
    expect(result).not.toContain('Titre SEO');
    expect(result).toContain('Texte seul');
  });
});

describe('plainToRich', () => {
  it('crée un doc avec des paragraphes', () => {
    const result = plainToRich('Premier\n\nDeuxième');
    expect(result.type).toBe('doc');
    expect(Array.isArray(result.content)).toBe(true);
    const content = result.content as Array<{ type: string; content: Array<{ text: string }> }>;
    expect(content).toHaveLength(2);
    expect(content[0].type).toBe('paragraph');
    expect(content[0].content[0].text).toBe('Premier');
    expect(content[1].content[0].text).toBe('Deuxième');
  });

  it('gère un texte sans double saut de ligne', () => {
    const result = plainToRich('Ligne unique');
    const content = result.content as Array<{ type: string }>;
    expect(content).toHaveLength(1);
  });
});

describe('richToPlain', () => {
  it("extrait le texte d'un contenu riche avec noeuds", () => {
    const rich = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    };
    expect(richToPlain(rich)).toContain('Hello');
  });

  it('extrait le texte depuis un champ html', () => {
    const rich = { html: '<p>Bonjour</p>' };
    expect(richToPlain(rich)).toContain('Bonjour');
  });

  it("retourne une chaîne vide pour null", () => {
    expect(richToPlain(null)).toBe('');
  });
});
