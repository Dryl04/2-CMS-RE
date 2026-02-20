/**
 * Content Sanitizer
 * 
 * Utilitaires pour nettoyer les données de contenu importées,
 * notamment les URLs formatées en markdown par les agents AI.
 * 
 * Problème typique : un agent AI génère des URLs au format markdown
 * "[https://example.com/image.jpg](https://example.com/image.jpg)"
 * au lieu de simples URLs "https://example.com/image.jpg".
 * 
 * Ce module fournit des fonctions pour détecter et corriger ces formats
 * dans l'ensemble du contenu d'une section (content, design, etc.).
 */

/**
 * Regex pour détecter une URL markdown complète :
 * [texte](url) où le texte entier de la chaîne est un lien markdown.
 * Capture le contenu entre parenthèses (l'URL réelle).
 */
const MARKDOWN_LINK_FULL = /^\[([^\]]*)\]\(([^)]+)\)$/;

/**
 * Liste des clés de contenu connues pour contenir des URLs d'images/médias.
 * Utilisée pour cibler le nettoyage sur les bons champs sans toucher au texte brut.
 */
const IMAGE_URL_FIELDS = new Set([
  'image',
  'avatar',
  'backgroundImage',
  'thumbnail',
  'logo',
  'videoUrl',
  'thumbnailUrl',
  'og_image',
  'src',
  'url',
  'imageUrl',
  'iconUrl',
  'coverImage',
  'profileImage',
  'heroImage',
  'bannerImage',
]);

/**
 * Extrait l'URL brute d'une chaîne qui pourrait être au format markdown link.
 * 
 * Exemples :
 * - "[https://example.com](https://example.com)" → "https://example.com"
 * - "https://example.com" → "https://example.com" (inchangé)
 * - "Un texte normal" → "Un texte normal" (inchangé)
 * - "[Texte](https://example.com)" → "https://example.com"
 */
export function extractPlainUrl(value: string): string {
  if (!value || typeof value !== 'string') return value;
  
  const trimmed = value.trim();
  const match = trimmed.match(MARKDOWN_LINK_FULL);
  
  if (match) {
    // match[2] est l'URL entre parenthèses
    return match[2];
  }
  
  return value;
}

/**
 * Vérifie si un nom de champ est susceptible de contenir une URL d'image/média.
 */
function isImageField(key: string): boolean {
  return IMAGE_URL_FIELDS.has(key) || 
    /image|avatar|thumbnail|logo|url|src|photo|picture|cover|banner/i.test(key);
}

/**
 * Nettoie récursivement toutes les URLs au format markdown dans un objet de contenu.
 * 
 * - Pour les champs identifiés comme URL d'image/média : extrait l'URL du format markdown
 * - Pour les tableaux : nettoie chaque élément récursivement
 * - Pour les objets imbriqués : nettoie récursivement
 * - Pour les chaînes non-URL : laisse inchangé
 * 
 * @param obj - L'objet à nettoyer (généralement section.content ou section.design)
 * @param parentKey - Clé parente (pour le contexte de détection)
 * @returns L'objet nettoyé (nouvelle référence si modifié)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeContentUrls(obj: unknown, parentKey?: string): any {
  if (obj === null || obj === undefined) return obj;

  // Chaîne de caractères : nettoyer si c'est un champ URL
  if (typeof obj === 'string') {
    if (parentKey && isImageField(parentKey)) {
      return extractPlainUrl(obj);
    }
    // Même si le champ n'est pas identifié comme URL, vérifier si c'est un lien markdown complet
    // qui ressemble à une URL (commence par http)
    const match = obj.trim().match(MARKDOWN_LINK_FULL);
    if (match && match[2] && /^https?:\/\//.test(match[2])) {
      return match[2];
    }
    return obj;
  }

  // Types primitifs : retourner tel quel
  if (typeof obj !== 'object') return obj;

  // Tableau : nettoyer chaque élément
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeContentUrls(item, parentKey));
  }

  // Objet : nettoyer chaque propriété
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    result[key] = sanitizeContentUrls(value, key);
  }
  return result;
}

/**
 * Nettoie les URLs d'une section de page complète (content + design).
 * Utilisée dans le pipeline d'import et optionnellement au rendu.
 * 
 * @param section - Section de page avec content, design, etc.
 * @returns La section avec les URLs nettoyées
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeSectionUrls(section: any): any {
  if (!section || typeof section !== 'object') return section;

  return {
    ...section,
    content: section.content ? sanitizeContentUrls(section.content) : section.content,
    design: section.design ? sanitizeContentUrls(section.design) : section.design,
  };
}

/**
 * Nettoie les URLs de toutes les sections d'une page.
 * 
 * @param sections - Tableau de sections de page
 * @returns Tableau de sections avec URLs nettoyées
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeAllSectionsUrls(sections: any[]): any[] {
  if (!Array.isArray(sections)) return sections;
  return sections.map(sanitizeSectionUrls);
}
