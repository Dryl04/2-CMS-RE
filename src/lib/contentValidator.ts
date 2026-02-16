import { TemplateSection } from './supabase';

export interface ValidationError {
  sectionId: string;
  sectionLabel: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function countWords(text: string): number {
  if (!text) return 0;
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return cleanText ? cleanText.split(/\s+/).length : 0;
}

export function validateSectionContent(
  section: TemplateSection,
  content: Record<string, any>,
  sectionLabel?: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const label = sectionLabel || section.label || `Section ${section.order_index + 1}`;

  if (section.required) {
    const hasContent = Object.keys(content).some((key) => {
      const value = content[key];
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value != null;
    });

    if (!hasContent) {
      errors.push({
        sectionId: section.id,
        sectionLabel: label,
        field: 'content',
        message: 'Cette section est obligatoire et ne peut pas être vide',
        severity: 'error',
      });
    }
  }

  for (const [field, value] of Object.entries(content)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      const wordCount = countWords(value);

      if (section.min_words && wordCount < section.min_words) {
        errors.push({
          sectionId: section.id,
          sectionLabel: label,
          field,
          message: `Le champ "${field}" doit contenir au moins ${section.min_words} mots (actuellement ${wordCount})`,
          severity: 'error',
        });
      }

      if (section.max_words && wordCount > section.max_words) {
        errors.push({
          sectionId: section.id,
          sectionLabel: label,
          field,
          message: `Le champ "${field}" ne peut pas dépasser ${section.max_words} mots (actuellement ${wordCount})`,
          severity: 'warning',
        });
      }
    }
  }

  return errors;
}

export function validatePageContent(
  sections: TemplateSection[],
  pageContentSections: Array<{ section_id: string; content: Record<string, any> }>
): ValidationResult {
  const allErrors: ValidationError[] = [];

  for (const section of sections) {
    const contentSection = pageContentSections.find((cs) => cs.section_id === section.id);

    if (!contentSection && section.required) {
      allErrors.push({
        sectionId: section.id,
        sectionLabel: section.label || `Section ${section.order_index + 1}`,
        field: 'content',
        message: 'Cette section obligatoire est manquante',
        severity: 'error',
      });
      continue;
    }

    if (contentSection) {
      const errors = validateSectionContent(
        section,
        contentSection.content,
        section.label || `Section ${section.order_index + 1}`
      );
      allErrors.push(...errors);
    }
  }

  const errors = allErrors.filter((e) => e.severity === 'error');
  const warnings = allErrors.filter((e) => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateValidationReport(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'Toutes les validations sont passées avec succès.';
  }

  let report = '';

  if (result.errors.length > 0) {
    report += `❌ Erreurs bloquantes (${result.errors.length}):\n\n`;
    result.errors.forEach((error, index) => {
      report += `${index + 1}. ${error.sectionLabel} - ${error.field}\n`;
      report += `   ${error.message}\n\n`;
    });
  }

  if (result.warnings.length > 0) {
    report += `⚠️ Avertissements (${result.warnings.length}):\n\n`;
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning.sectionLabel} - ${warning.field}\n`;
      report += `   ${warning.message}\n\n`;
    });
  }

  return report;
}

export function validateMetadata(metadata: {
  title?: string;
  description?: string;
  keywords?: string[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push({
      sectionId: 'metadata',
      sectionLabel: 'Métadonnées',
      field: 'title',
      message: 'Le titre de la page est obligatoire',
      severity: 'error',
    });
  } else if (metadata.title.length > 60) {
    errors.push({
      sectionId: 'metadata',
      sectionLabel: 'Métadonnées',
      field: 'title',
      message: `Le titre est trop long (${metadata.title.length} caractères, recommandé: 50-60)`,
      severity: 'warning',
    });
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push({
      sectionId: 'metadata',
      sectionLabel: 'Métadonnées',
      field: 'description',
      message: 'La description est obligatoire',
      severity: 'error',
    });
  } else if (metadata.description.length > 160) {
    errors.push({
      sectionId: 'metadata',
      sectionLabel: 'Métadonnées',
      field: 'description',
      message: `La description est trop longue (${metadata.description.length} caractères, recommandé: 150-160)`,
      severity: 'warning',
    });
  }

  if (!metadata.keywords || metadata.keywords.length === 0) {
    errors.push({
      sectionId: 'metadata',
      sectionLabel: 'Métadonnées',
      field: 'keywords',
      message: 'Au moins un mot-clé est recommandé',
      severity: 'warning',
    });
  }

  return errors;
}
