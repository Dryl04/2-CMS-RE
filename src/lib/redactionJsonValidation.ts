// ============================================================
// Validation du JSON généré par l'IA
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const PAGE_KEY_REGEX = /^[a-z0-9-]+$/;

/** Valider un JSON généré par l'IA avant publication */
export function validateGeneratedJson(json: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!json || typeof json !== 'object') {
    return { valid: false, errors: ['Le JSON doit être un objet.'], warnings: [] };
  }

  const payload = json as Record<string, unknown>;

  // Doit contenir pages (Array)
  if (!Array.isArray(payload.pages)) {
    errors.push('Le JSON doit contenir un tableau "pages".');
    return { valid: false, errors, warnings };
  }

  if (payload.pages.length === 0) {
    errors.push('Le tableau "pages" est vide.');
    return { valid: false, errors, warnings };
  }

  for (let i = 0; i < payload.pages.length; i++) {
    const page = payload.pages[i] as Record<string, unknown>;
    const prefix = `pages[${i}]`;

    // page_key obligatoire
    if (!page.page_key || typeof page.page_key !== 'string') {
      errors.push(`${prefix}.page_key est obligatoire (string).`);
    } else if (!PAGE_KEY_REGEX.test(page.page_key as string)) {
      errors.push(`${prefix}.page_key invalide (minuscules, chiffres, tirets uniquement).`);
    }

    // title obligatoire
    if (!page.title || typeof page.title !== 'string') {
      errors.push(`${prefix}.title est obligatoire (string).`);
    } else if ((page.title as string).length > 60) {
      warnings.push(`${prefix}.title dépasse 60 caractères (${(page.title as string).length}).`);
    }

    // description : max 160
    if (page.description && typeof page.description === 'string' && (page.description as string).length > 160) {
      warnings.push(`${prefix}.description dépasse 160 caractères.`);
    }

    // status valide
    if (page.status && !['draft', 'published', 'archived'].includes(page.status as string)) {
      errors.push(`${prefix}.status invalide. Valeurs acceptées : draft, published, archived.`);
    }

    // sections_data, s'il existe
    if (page.sections_data !== undefined && !Array.isArray(page.sections_data)) {
      errors.push(`${prefix}.sections_data doit être un tableau.`);
    }

    // content_overrides, s'il existe
    if (page.content_overrides !== undefined && (typeof page.content_overrides !== 'object' || Array.isArray(page.content_overrides))) {
      errors.push(`${prefix}.content_overrides doit être un objet.`);
    }

    // Avertir si ni sections_data ni content_overrides
    if (!page.sections_data && !page.content_overrides) {
      warnings.push(`${prefix} n'a ni sections_data ni content_overrides. La page sera créée sans contenu de section.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Essayer de parser du texte comme JSON (avec extraction automatique de blocs ```json) */
export function extractJsonFromText(text: string): { json: unknown; raw: string } | null {
  // Tenter d'extraire un bloc ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return { json: parsed, raw: jsonStr };
  } catch {
    return null;
  }
}
