import type { SEODocumentWithAuthor } from './redactionTypes';
import type { PageTemplate } from './supabase';
import { normalizeToAISource } from './redactionEditorTransforms';

// ============================================================
// Construction du prompt pour la génération JSON
// ============================================================

/** Construire le prompt utilisateur pour la génération JSON */
export function buildGenerationPrompt(
  document: SEODocumentWithAuthor,
  template: PageTemplate | null,
  templateExport: Record<string, unknown> | null,
): string {
  const parts: string[] = [];

  // 1. Texte source normalisé
  const sourceText = normalizeToAISource(
    document.editor_mode,
    document.plain_content,
    document.rich_content,
    document.structured_content,
  );

  parts.push('## Texte source du document rédactionnel\n');
  parts.push(sourceText || '(aucun contenu)');

  // 2. Infos métier
  parts.push('\n\n## Informations du document');
  parts.push(`- Nom : ${document.name}`);
  parts.push(`- Mode éditeur : ${document.editor_mode}`);
  parts.push(`- Statut : ${document.status}`);

  // 3. Template cible
  if (template) {
    parts.push('\n\n## Modèle CMS cible');
    parts.push(`- Nom : ${template.name}`);
    parts.push(`- ID : ${template.id}`);
    if (template.daisy_theme_slug) {
      parts.push(`- Thème DaisyUI : ${template.daisy_theme_slug}`);
    }
    if (template.seo_h1) parts.push(`- SEO H1 : ${template.seo_h1}`);
    if (template.seo_h2) parts.push(`- SEO H2 : ${template.seo_h2}`);
  }

  // 4. Export du template (pour content_overrides)
  if (templateExport) {
    parts.push('\n\n## Export du modèle (structure technique)');
    parts.push('```json');
    parts.push(JSON.stringify(templateExport, null, 2));
    parts.push('```');
  }

  // 5. Instructions de format de sortie
  parts.push('\n\n## Format de sortie attendu');
  parts.push('Génère un JSON valide au format suivant (Format C — content_overrides) :');
  parts.push('```json');
  parts.push(JSON.stringify({
    pages: [{
      page_key: 'slug-de-la-page',
      title: 'Titre SEO (max 60 car.)',
      description: 'Meta description (max 160 car.)',
      keywords: ['mot-cle-1', 'mot-cle-2'],
      status: 'draft',
      template_id: template?.id ?? 'uuid-du-template',
      daisy_theme_slug: template?.daisy_theme_slug ?? 'light',
      seo_h1: 'Titre H1',
      seo_h2: 'Sous-titre H2',
      content_overrides: {
        'section-id': { 'content.field': 'valeur' },
      },
    }],
  }, null, 2));
  parts.push('```');
  parts.push('\nRègles impératives :');
  parts.push('- Ne modifie JAMAIS les blocs design, les URLs d\'images, les icônes.');
  parts.push('- Utilise content_overrides pour ne cibler que le contenu éditorial.');
  parts.push('- Le page_key doit être en minuscules, chiffres et tirets uniquement.');
  parts.push('- Retourne UNIQUEMENT le JSON, sans texte avant/après.');

  return parts.join('\n');
}
