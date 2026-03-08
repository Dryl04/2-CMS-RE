import type { EditorMode, StructuredContent } from './redactionTypes';

// ============================================================
// Transformations éditeur → texte source IA unifié
// ============================================================

/** Normalise le contenu d'un document (quel que soit le mode) vers un texte source unique */
export function normalizeToAISource(
  editorMode: EditorMode,
  plainContent: string | null,
  richContent: Record<string, unknown> | null,
  structuredContent: Record<string, unknown> | null
): string {
  switch (editorMode) {
    case 'plain':
      return plainContent?.trim() ?? '';

    case 'rich':
      return extractTextFromRichContent(richContent);

    case 'structured':
      return flattenStructuredContent(structuredContent as StructuredContent | null);

    default:
      return plainContent?.trim() ?? '';
  }
}

/** Extrait le texte brut depuis un contenu riche (jsonb) */
function extractTextFromRichContent(content: Record<string, unknown> | null): string {
  if (!content) return '';

  // Si c'est du format TipTap/ProseMirror avec des noeuds
  if (content.type === 'doc' && Array.isArray(content.content)) {
    return extractNodesText(content.content as RichNode[]);
  }

  // Fallback: si c'est un objet avec une propriété text/html
  if (typeof content.text === 'string') return content.text;
  if (typeof content.html === 'string') return stripHtml(content.html);

  return JSON.stringify(content);
}

interface RichNode {
  type: string;
  text?: string;
  content?: RichNode[];
}

/** Parcours récursif des noeuds d'un document riche */
function extractNodesText(nodes: RichNode[]): string {
  const parts: string[] = [];

  for (const node of nodes) {
    if (node.text) {
      parts.push(node.text);
    }
    if (node.content) {
      parts.push(extractNodesText(node.content));
    }
    // Ajouter un saut de ligne entre les blocs
    if (['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote'].includes(node.type)) {
      parts.push('\n');
    }
  }

  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

/** Strip les balises HTML simples */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Aplatit un contenu structuré en texte linéaire */
function flattenStructuredContent(content: StructuredContent | null): string {
  if (!content) return '';

  const sections: string[] = [];

  if (content.seo_title) sections.push(`Titre SEO : ${content.seo_title}`);
  if (content.meta_description) sections.push(`Meta description : ${content.meta_description}`);
  if (content.h1) sections.push(`H1 : ${content.h1}`);
  if (content.h2) sections.push(`H2 : ${content.h2}`);
  if (content.body) sections.push(`Corps :\n${content.body}`);
  if (content.cta_label) sections.push(`CTA : ${content.cta_label}${content.cta_target ? ` → ${content.cta_target}` : ''}`);
  if (content.keywords) sections.push(`Mots-clés : ${content.keywords}`);
  if (content.notes) sections.push(`Notes : ${content.notes}`);

  return sections.join('\n\n');
}

/** Convertit un contenu plain vers le format structuré (extraction basique) */
export function plainToStructured(plainContent: string): StructuredContent {
  return {
    body: plainContent.trim(),
  };
}

/** Convertit un contenu structuré vers plain */
export function structuredToPlain(structured: StructuredContent | null): string {
  return flattenStructuredContent(structured);
}

/** Convertit un contenu plain vers le format riche (bloc paragraphe simple) */
export function plainToRich(plainContent: string): Record<string, unknown> {
  const paragraphs = plainContent.split(/\n{2,}/).filter(Boolean);
  return {
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: text.trim() }],
    })),
  };
}

/** Convertit un contenu riche vers plain */
export function richToPlain(richContent: Record<string, unknown> | null): string {
  return extractTextFromRichContent(richContent);
}
