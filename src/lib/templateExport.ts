import { PageBuilderSection } from './pageBuilderTypes';
import { PageTemplate } from './supabase';

export interface TemplateVariable {
  sectionId: string;
  sectionType: string;
  sectionVariant: string;
  fieldPath: string;
  fieldLabel: string;
  fieldType: 'text' | 'image' | 'array';
  currentValue: any;
}

export function extractTemplateVariables(sections: PageBuilderSection[]): TemplateVariable[] {
  const variables: TemplateVariable[] = [];

  sections.forEach((section) => {
    const baseInfo = {
      sectionId: section.id,
      sectionType: section.type,
      sectionVariant: section.variant,
    };

    switch (section.type) {
      case 'hero':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.headline',
            fieldLabel: 'Titre principal',
            fieldType: 'text',
            currentValue: section.content.headline,
          },
          {
            ...baseInfo,
            fieldPath: 'content.subheadline',
            fieldLabel: 'Sous-titre',
            fieldType: 'text',
            currentValue: section.content.subheadline,
          },
          {
            ...baseInfo,
            fieldPath: 'content.ctaText',
            fieldLabel: 'Texte du bouton',
            fieldType: 'text',
            currentValue: section.content.ctaText,
          },
          {
            ...baseInfo,
            fieldPath: 'content.ctaLink',
            fieldLabel: 'Lien du bouton',
            fieldType: 'text',
            currentValue: section.content.ctaLink,
          }
        );
        if (section.content.image) {
          variables.push({
            ...baseInfo,
            fieldPath: 'content.image',
            fieldLabel: 'Image',
            fieldType: 'image',
            currentValue: section.content.image,
          });
        }
        break;

      case 'features':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.title',
            fieldLabel: 'Titre de section',
            fieldType: 'text',
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: 'content.subtitle',
            fieldLabel: 'Sous-titre de section',
            fieldType: 'text',
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: 'content.features',
            fieldLabel: 'Liste des fonctionnalites',
            fieldType: 'array',
            currentValue: section.content.features,
          }
        );
        break;

      case 'cta':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.headline',
            fieldLabel: 'Titre CTA',
            fieldType: 'text',
            currentValue: section.content.headline,
          },
          {
            ...baseInfo,
            fieldPath: 'content.description',
            fieldLabel: 'Description CTA',
            fieldType: 'text',
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: 'content.primaryCta',
            fieldLabel: 'Bouton principal',
            fieldType: 'text',
            currentValue: section.content.primaryCta,
          },
          {
            ...baseInfo,
            fieldPath: 'content.primaryLink',
            fieldLabel: 'Lien bouton principal',
            fieldType: 'text',
            currentValue: section.content.primaryLink,
          }
        );
        if (section.content.secondaryCta) {
          variables.push(
            {
              ...baseInfo,
              fieldPath: 'content.secondaryCta',
              fieldLabel: 'Bouton secondaire',
              fieldType: 'text',
              currentValue: section.content.secondaryCta,
            },
            {
              ...baseInfo,
              fieldPath: 'content.secondaryLink',
              fieldLabel: 'Lien bouton secondaire',
              fieldType: 'text',
              currentValue: section.content.secondaryLink,
            }
          );
        }
        break;

      case 'header':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.logoText',
            fieldLabel: 'Nom de marque',
            fieldType: 'text',
            currentValue: section.content.logoText,
          },
          {
            ...baseInfo,
            fieldPath: 'content.navItems',
            fieldLabel: 'Elements de navigation',
            fieldType: 'array',
            currentValue: section.content.navItems,
          }
        );
        if (section.content.logo) {
          variables.push({
            ...baseInfo,
            fieldPath: 'content.logo',
            fieldLabel: 'Logo',
            fieldType: 'image',
            currentValue: section.content.logo,
          });
        }
        if (section.content.ctaText) {
          variables.push(
            {
              ...baseInfo,
              fieldPath: 'content.ctaText',
              fieldLabel: 'Texte CTA',
              fieldType: 'text',
              currentValue: section.content.ctaText,
            },
            {
              ...baseInfo,
              fieldPath: 'content.ctaLink',
              fieldLabel: 'Lien CTA',
              fieldType: 'text',
              currentValue: section.content.ctaLink,
            }
          );
        }
        break;

      case 'testimonials':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.title',
            fieldLabel: 'Titre',
            fieldType: 'text',
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: 'content.subtitle',
            fieldLabel: 'Sous-titre',
            fieldType: 'text',
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: 'content.testimonials',
            fieldLabel: 'Temoignages',
            fieldType: 'array',
            currentValue: section.content.testimonials,
          }
        );
        break;

      case 'contact':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.title',
            fieldLabel: 'Titre',
            fieldType: 'text',
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: 'content.subtitle',
            fieldLabel: 'Sous-titre',
            fieldType: 'text',
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: 'content.email',
            fieldLabel: 'Email',
            fieldType: 'text',
            currentValue: section.content.email,
          },
          {
            ...baseInfo,
            fieldPath: 'content.phone',
            fieldLabel: 'Telephone',
            fieldType: 'text',
            currentValue: section.content.phone,
          },
          {
            ...baseInfo,
            fieldPath: 'content.address',
            fieldLabel: 'Adresse',
            fieldType: 'text',
            currentValue: section.content.address,
          }
        );
        break;

      case 'footer':
        variables.push(
          {
            ...baseInfo,
            fieldPath: 'content.logoText',
            fieldLabel: 'Nom de marque',
            fieldType: 'text',
            currentValue: section.content.logoText,
          },
          {
            ...baseInfo,
            fieldPath: 'content.description',
            fieldLabel: 'Description',
            fieldType: 'text',
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: 'content.columns',
            fieldLabel: 'Colonnes de liens',
            fieldType: 'array',
            currentValue: section.content.columns,
          },
          {
            ...baseInfo,
            fieldPath: 'content.socialLinks',
            fieldLabel: 'Liens sociaux',
            fieldType: 'array',
            currentValue: section.content.socialLinks,
          },
          {
            ...baseInfo,
            fieldPath: 'content.copyright',
            fieldLabel: 'Copyright',
            fieldType: 'text',
            currentValue: section.content.copyright,
          }
        );
        if (section.content.logo) {
          variables.push({
            ...baseInfo,
            fieldPath: 'content.logo',
            fieldLabel: 'Logo',
            fieldType: 'image',
            currentValue: section.content.logo,
          });
        }
        break;
    }
  });

  return variables;
}

export function exportTemplateAsJSON(template: PageTemplate): string {
  const variables = extractTemplateVariables((template.sections_data || []) as PageBuilderSection[]);

  const exportData = {
    template: {
      id: template.id,
      name: template.name,
      description: template.description,
      created_at: template.created_at,
    },
    sections: template.sections_data,
    variables: variables.map(v => ({
      sectionId: v.sectionId,
      sectionType: v.sectionType,
      fieldPath: v.fieldPath,
      fieldLabel: v.fieldLabel,
      fieldType: v.fieldType,
      currentValue: v.currentValue,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportTemplateAsCSV(template: PageTemplate): string {
  const variables = extractTemplateVariables((template.sections_data || []) as PageBuilderSection[]);

  const headers = ['Section ID', 'Section Type', 'Field Path', 'Field Label', 'Field Type', 'Current Value'];
  const rows = variables.map(v => [
    v.sectionId,
    v.sectionType,
    v.fieldPath,
    v.fieldLabel,
    v.fieldType,
    typeof v.currentValue === 'object' ? JSON.stringify(v.currentValue) : String(v.currentValue || ''),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function applyDataToTemplate(
  sections: PageBuilderSection[],
  data: Record<string, any>
): PageBuilderSection[] {
  return sections.map((section) => {
    const updatedSection = { ...section };
    const sectionData = data[section.id];

    if (!sectionData) return updatedSection;

    Object.keys(sectionData).forEach((key) => {
      const value = sectionData[key];
      const pathParts = key.split('.');

      if (pathParts[0] === 'content') {
        updatedSection.content = {
          ...updatedSection.content,
          [pathParts[1]]: value,
        };
      }
    });

    return updatedSection;
  });
}

export function parseCSVToData(csvContent: string): Record<string, Record<string, any>> {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return {};

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const data: Record<string, Record<string, any>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(v =>
      v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
    ) || [];

    if (values.length < headers.length) continue;

    const sectionId = values[0];
    const fieldPath = values[2];
    const value = values[5];

    if (!data[sectionId]) {
      data[sectionId] = {};
    }

    try {
      data[sectionId][fieldPath] = value.startsWith('[') || value.startsWith('{')
        ? JSON.parse(value)
        : value;
    } catch {
      data[sectionId][fieldPath] = value;
    }
  }

  return data;
}
