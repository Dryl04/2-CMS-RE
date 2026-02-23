import { PageBuilderSection } from "./pageBuilderTypes";
import { PageTemplate } from "./supabase";
import { normalizeSectionForTheme } from "./widgetThemeHelper";

export interface TemplateVariable {
  sectionId: string;
  sectionType: string;
  sectionVariant: string;
  fieldPath: string;
  fieldLabel: string;
  fieldType: "text" | "image" | "array";
  currentValue: any;
}

function normalizeSectionsData(raw: unknown): PageBuilderSection[] {
  if (Array.isArray(raw)) {
    return raw as PageBuilderSection[];
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeSectionsData(parsed);
    } catch {
      return [];
    }
  }

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.sections))
      return obj.sections as PageBuilderSection[];
    if (Array.isArray(obj.sections_data))
      return obj.sections_data as PageBuilderSection[];
  }

  return [];
}

function buildContentSkeleton(value: unknown): unknown {
  if (Array.isArray(value)) {
    return {
      __count: value.length,
      __item: value.length > 0 ? buildContentSkeleton(value[0]) : null,
    };
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const skeleton: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      skeleton[key] = buildContentSkeleton(obj[key]);
    });
    return skeleton;
  }

  if (typeof value === "string") {
    return "";
  }

  if (typeof value === "number") {
    return 0;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return null;
}

export function extractTemplateVariables(
  sections: PageBuilderSection[],
): TemplateVariable[] {
  const variables: TemplateVariable[] = [];

  sections.forEach((section) => {
    const baseInfo = {
      sectionId: section.id,
      sectionType: section.type,
      sectionVariant: section.variant,
    };

    switch (section.type) {
      case "hero":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.headline",
            fieldLabel: "Titre principal",
            fieldType: "text",
            currentValue: section.content.headline,
          },
          {
            ...baseInfo,
            fieldPath: "content.subheadline",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subheadline,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaText",
            fieldLabel: "Texte du bouton",
            fieldType: "text",
            currentValue: section.content.ctaText,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaLink",
            fieldLabel: "Lien du bouton",
            fieldType: "text",
            currentValue: section.content.ctaLink,
          },
        );
        if (section.content.image) {
          variables.push({
            ...baseInfo,
            fieldPath: "content.image",
            fieldLabel: "Image",
            fieldType: "image",
            currentValue: section.content.image,
          });
        }
        break;

      case "features":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre de section",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre de section",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.features",
            fieldLabel: "Liste des fonctionnalites",
            fieldType: "array",
            currentValue: section.content.features,
          },
        );
        break;

      case "cta":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.headline",
            fieldLabel: "Titre CTA",
            fieldType: "text",
            currentValue: section.content.headline,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description CTA",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.primaryCta",
            fieldLabel: "Bouton principal",
            fieldType: "text",
            currentValue: section.content.primaryCta,
          },
          {
            ...baseInfo,
            fieldPath: "content.primaryLink",
            fieldLabel: "Lien bouton principal",
            fieldType: "text",
            currentValue: section.content.primaryLink,
          },
        );
        if (section.content.secondaryCta) {
          variables.push(
            {
              ...baseInfo,
              fieldPath: "content.secondaryCta",
              fieldLabel: "Bouton secondaire",
              fieldType: "text",
              currentValue: section.content.secondaryCta,
            },
            {
              ...baseInfo,
              fieldPath: "content.secondaryLink",
              fieldLabel: "Lien bouton secondaire",
              fieldType: "text",
              currentValue: section.content.secondaryLink,
            },
          );
        }
        break;

      case "header":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.logoText",
            fieldLabel: "Nom de marque",
            fieldType: "text",
            currentValue: section.content.logoText,
          },
          {
            ...baseInfo,
            fieldPath: "content.navItems",
            fieldLabel: "Elements de navigation",
            fieldType: "array",
            currentValue: section.content.navItems,
          },
        );
        if (section.content.logo) {
          variables.push({
            ...baseInfo,
            fieldPath: "content.logo",
            fieldLabel: "Logo",
            fieldType: "image",
            currentValue: section.content.logo,
          });
        }
        if (section.content.ctaText) {
          variables.push(
            {
              ...baseInfo,
              fieldPath: "content.ctaText",
              fieldLabel: "Texte CTA",
              fieldType: "text",
              currentValue: section.content.ctaText,
            },
            {
              ...baseInfo,
              fieldPath: "content.ctaLink",
              fieldLabel: "Lien CTA",
              fieldType: "text",
              currentValue: section.content.ctaLink,
            },
          );
        }
        break;

      case "testimonials":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.testimonials",
            fieldLabel: "Temoignages",
            fieldType: "array",
            currentValue: section.content.testimonials,
          },
        );
        break;

      case "contact":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.email",
            fieldLabel: "Email",
            fieldType: "text",
            currentValue: section.content.email,
          },
          {
            ...baseInfo,
            fieldPath: "content.phone",
            fieldLabel: "Telephone",
            fieldType: "text",
            currentValue: section.content.phone,
          },
          {
            ...baseInfo,
            fieldPath: "content.address",
            fieldLabel: "Adresse",
            fieldType: "text",
            currentValue: section.content.address,
          },
        );
        break;

      case "footer":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.logoText",
            fieldLabel: "Nom de marque",
            fieldType: "text",
            currentValue: section.content.logoText,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.columns",
            fieldLabel: "Colonnes de liens",
            fieldType: "array",
            currentValue: section.content.columns,
          },
          {
            ...baseInfo,
            fieldPath: "content.socialLinks",
            fieldLabel: "Liens sociaux",
            fieldType: "array",
            currentValue: section.content.socialLinks,
          },
          {
            ...baseInfo,
            fieldPath: "content.copyright",
            fieldLabel: "Copyright",
            fieldType: "text",
            currentValue: section.content.copyright,
          },
        );
        if (section.content.logo) {
          variables.push({
            ...baseInfo,
            fieldPath: "content.logo",
            fieldLabel: "Logo",
            fieldType: "image",
            currentValue: section.content.logo,
          });
        }
        break;

      case "pricing":
      case "membership-pricing":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.plans",
            fieldLabel: "Plans tarifaires",
            fieldType: "array",
            currentValue: section.content.plans,
          },
        );
        break;

      case "stats":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.stats",
            fieldLabel: "Statistiques",
            fieldType: "array",
            currentValue: section.content.stats,
          },
        );
        break;

      case "team":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.members",
            fieldLabel: "Membres de l equipe",
            fieldType: "array",
            currentValue: section.content.members,
          },
        );
        break;

      case "faq":
      case "faq-two-columns":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.faqs",
            fieldLabel: "Questions / Reponses",
            fieldType: "array",
            currentValue: section.content.faqs,
          },
        );
        break;

      case "logocloud":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.logos",
            fieldLabel: "Logos partenaires",
            fieldType: "array",
            currentValue: section.content.logos,
          },
        );
        break;

      case "videohero":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.videoUrl",
            fieldLabel: "URL de la video",
            fieldType: "text",
            currentValue: section.content.videoUrl,
          },
          {
            ...baseInfo,
            fieldPath: "content.thumbnail",
            fieldLabel: "Vignette",
            fieldType: "image",
            currentValue: section.content.thumbnail,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaText",
            fieldLabel: "Texte bouton",
            fieldType: "text",
            currentValue: section.content.ctaText,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaLink",
            fieldLabel: "Lien bouton",
            fieldType: "text",
            currentValue: section.content.ctaLink,
          },
        );
        break;

      case "gallery":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.items",
            fieldLabel: "Images",
            fieldType: "array",
            currentValue: section.content.items,
          },
        );
        break;

      case "timeline":
      case "timeline-grid":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.events",
            fieldLabel: "Evenements",
            fieldType: "array",
            currentValue: section.content.events,
          },
        );
        break;

      case "newsletter":
      case "newsletter-signup":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.placeholder",
            fieldLabel: "Placeholder email",
            fieldType: "text",
            currentValue: section.content.placeholder,
          },
          {
            ...baseInfo,
            fieldPath: "content.buttonText",
            fieldLabel: "Texte du bouton",
            fieldType: "text",
            currentValue: section.content.buttonText,
          },
          {
            ...baseInfo,
            fieldPath: "content.privacyNote",
            fieldLabel: "Note confidentialite",
            fieldType: "text",
            currentValue: section.content.privacyNote,
          },
        );
        break;

      case "process":
      case "process-steps-cards":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.steps",
            fieldLabel: "Etapes",
            fieldType: "array",
            currentValue: section.content.steps,
          },
        );
        break;

      case "services-grid":
      case "services-cards":
      case "services-carousel":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.services",
            fieldLabel: "Services",
            fieldType: "array",
            currentValue: section.content.services,
          },
        );
        break;

      case "contact-split":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.phone",
            fieldLabel: "Telephone",
            fieldType: "text",
            currentValue: section.content.phone,
          },
          {
            ...baseInfo,
            fieldPath: "content.address",
            fieldLabel: "Adresse",
            fieldType: "text",
            currentValue: section.content.address,
          },
          {
            ...baseInfo,
            fieldPath: "content.email",
            fieldLabel: "Email",
            fieldType: "text",
            currentValue: section.content.email,
          },
          {
            ...baseInfo,
            fieldPath: "content.formTitle",
            fieldLabel: "Titre du formulaire",
            fieldType: "text",
            currentValue: section.content.formTitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.buttonText",
            fieldLabel: "Texte du bouton",
            fieldType: "text",
            currentValue: section.content.buttonText,
          },
        );
        break;

      case "feedback-contact":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.formTitle",
            fieldLabel: "Titre du formulaire",
            fieldType: "text",
            currentValue: section.content.formTitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.buttonText",
            fieldLabel: "Texte du bouton",
            fieldType: "text",
            currentValue: section.content.buttonText,
          },
        );
        break;

      case "editorial-cards-row":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaText",
            fieldLabel: "Texte voir tout",
            fieldType: "text",
            currentValue: section.content.ctaText,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaLink",
            fieldLabel: "Lien voir tout",
            fieldType: "text",
            currentValue: section.content.ctaLink,
          },
          {
            ...baseInfo,
            fieldPath: "content.cards",
            fieldLabel: "Cartes editoriales",
            fieldType: "array",
            currentValue: section.content.cards,
          },
        );
        break;

      case "minimal-final-cta":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.primaryText",
            fieldLabel: "Texte bouton principal",
            fieldType: "text",
            currentValue: section.content.primaryText,
          },
          {
            ...baseInfo,
            fieldPath: "content.primaryLink",
            fieldLabel: "Lien bouton principal",
            fieldType: "text",
            currentValue: section.content.primaryLink,
          },
          {
            ...baseInfo,
            fieldPath: "content.secondaryText",
            fieldLabel: "Texte bouton secondaire",
            fieldType: "text",
            currentValue: section.content.secondaryText,
          },
          {
            ...baseInfo,
            fieldPath: "content.secondaryLink",
            fieldLabel: "Lien bouton secondaire",
            fieldType: "text",
            currentValue: section.content.secondaryLink,
          },
        );
        break;

      case "cinematic-footer":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.brand",
            fieldLabel: "Nom de marque",
            fieldType: "text",
            currentValue: section.content.brand,
          },
          {
            ...baseInfo,
            fieldPath: "content.copyright",
            fieldLabel: "Copyright",
            fieldType: "text",
            currentValue: section.content.copyright,
          },
          {
            ...baseInfo,
            fieldPath: "content.socials",
            fieldLabel: "Reseaux sociaux",
            fieldType: "array",
            currentValue: section.content.socials,
          },
          {
            ...baseInfo,
            fieldPath: "content.columns",
            fieldLabel: "Colonnes de liens",
            fieldType: "array",
            currentValue: section.content.columns,
          },
        );
        break;

      case "simple-centered-hero":
      case "brand-identity-hero":
      case "hero-with-services":
      case "hero-with-testimonials":
      case "creative-network-hero":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre principal",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.description",
            fieldLabel: "Description",
            fieldType: "text",
            currentValue: section.content.description,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaText",
            fieldLabel: "Texte bouton",
            fieldType: "text",
            currentValue: section.content.ctaText,
          },
          {
            ...baseInfo,
            fieldPath: "content.ctaLink",
            fieldLabel: "Lien bouton",
            fieldType: "text",
            currentValue: section.content.ctaLink,
          },
        );
        break;

      case "clickfunnels-hero":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre ligne 1",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Titre ligne 2",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.tagline",
            fieldLabel: "Tagline",
            fieldType: "text",
            currentValue: section.content.tagline,
          },
          {
            ...baseInfo,
            fieldPath: "content.buttonText",
            fieldLabel: "Texte du bouton",
            fieldType: "text",
            currentValue: section.content.buttonText,
          },
          {
            ...baseInfo,
            fieldPath: "content.inputPlaceholder",
            fieldLabel: "Placeholder email",
            fieldType: "text",
            currentValue: section.content.inputPlaceholder,
          },
        );
        break;

      case "bento-features":
      case "features-carousel":
        variables.push(
          {
            ...baseInfo,
            fieldPath: "content.subtitle",
            fieldLabel: "Sous-titre",
            fieldType: "text",
            currentValue: section.content.subtitle,
          },
          {
            ...baseInfo,
            fieldPath: "content.title",
            fieldLabel: "Titre",
            fieldType: "text",
            currentValue: section.content.title,
          },
          {
            ...baseInfo,
            fieldPath: "content.features",
            fieldLabel: "Fonctionnalites",
            fieldType: "array",
            currentValue: section.content.features,
          },
        );
        break;

      default:
        Object.keys(section.content).forEach((key) => {
          const value = section.content[key];
          if (typeof value === "string") {
            variables.push({
              ...baseInfo,
              fieldPath: `content.${key}`,
              fieldLabel: key,
              fieldType: "text",
              currentValue: value,
            });
          } else if (Array.isArray(value)) {
            variables.push({
              ...baseInfo,
              fieldPath: `content.${key}`,
              fieldLabel: key,
              fieldType: "array",
              currentValue: value,
            });
          }
        });
        break;
    }
  });

  return variables;
}

export function exportTemplateAsJSON(template: PageTemplate): string {
  const normalizedSections = normalizeSectionsData(template.sections_data).map(
    (section) => normalizeSectionForTheme(section),
  );
  const variables = extractTemplateVariables(normalizedSections);
  const variablesBySection = variables.reduce(
    (acc, variable) => {
      if (!acc[variable.sectionId]) {
        acc[variable.sectionId] = [];
      }
      acc[variable.sectionId].push([variable.fieldPath, variable.fieldType]);
      return acc;
    },
    {} as Record<string, Array<[string, TemplateVariable["fieldType"]]>>,
  );

  const editable_sections = normalizedSections.map((section) => ({
    id: section.id,
    type: section.type,
    variant: section.variant,
    order: section.order,
    fields: variablesBySection[section.id] || [],
    content_shape: buildContentSkeleton(section.content),
  }));

  const array_cardinality = variables.reduce(
    (acc, variable) => {
      if (variable.fieldType !== "array") {
        return acc;
      }

      const currentArray = Array.isArray(variable.currentValue)
        ? variable.currentValue
        : [];

      if (!acc[variable.sectionId]) {
        acc[variable.sectionId] = {};
      }

      acc[variable.sectionId][variable.fieldPath] = currentArray.length;
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  const exportData = {
    export_version: 4,
    export_mode: "maximum-compact",
    template: {
      id: template.id,
      daisy_theme_slug: template.daisy_theme_slug || null,
      exported_at: new Date().toISOString(),
    },
    editable_sections,
    array_cardinality,
    stats: {
      section_count: normalizedSections.length,
      variable_count: variables.length,
    },
  };

  return JSON.stringify(exportData);
}

export function exportTemplateAsCSV(template: PageTemplate): string {
  const normalizedSections = normalizeSectionsData(template.sections_data).map(
    (section) => normalizeSectionForTheme(section),
  );
  const variables = extractTemplateVariables(normalizedSections);

  const headers = [
    "Section ID",
    "Section Type",
    "Field Path",
    "Field Label",
    "Field Type",
    "Current Value",
  ];
  const rows = variables.map((v) => [
    v.sectionId,
    v.sectionType,
    v.fieldPath,
    v.fieldLabel,
    v.fieldType,
    typeof v.currentValue === "object"
      ? JSON.stringify(v.currentValue)
      : String(v.currentValue || ""),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  return csvContent;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function applyDataToTemplate(
  sections: PageBuilderSection[],
  data: Record<string, any>,
): PageBuilderSection[] {
  return sections.map((section) => {
    const updatedSection = { ...section };
    const sectionData = data[section.id];

    if (!sectionData) return updatedSection;

    Object.keys(sectionData).forEach((key) => {
      const value = sectionData[key];
      const pathParts = key.split(".");

      if (pathParts[0] === "content" && pathParts.length >= 2) {
        if (pathParts.length === 2) {
          updatedSection.content = {
            ...updatedSection.content,
            [pathParts[1]]: value,
          };
        } else if (pathParts.length === 3) {
          updatedSection.content = {
            ...updatedSection.content,
            [pathParts[1]]: {
              ...(updatedSection.content[pathParts[1]] || {}),
              [pathParts[2]]: value,
            },
          };
        }
      } else if (pathParts[0] === "design" && pathParts.length === 3) {
        updatedSection.design = {
          ...updatedSection.design,
          [pathParts[1]]: {
            ...((updatedSection.design[
              pathParts[1] as keyof typeof updatedSection.design
            ] as Record<string, any>) || {}),
            [pathParts[2]]: value,
          },
        };
      }
    });

    return updatedSection;
  });
}

export function parseCSVToData(
  csvContent: string,
): Record<string, Record<string, any>> {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return {};

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());
  const data: Record<string, Record<string, any>> = {};

  for (let i = 1; i < lines.length; i++) {
    const values =
      lines[i]
        .match(/("(?:[^"]|"")*"|[^,]*)/g)
        ?.map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) || [];

    if (values.length < headers.length) continue;

    const sectionId = values[0];
    const fieldPath = values[2];
    const value = values[5];

    if (!data[sectionId]) {
      data[sectionId] = {};
    }

    try {
      data[sectionId][fieldPath] =
        value.startsWith("[") || value.startsWith("{")
          ? JSON.parse(value)
          : value;
    } catch {
      data[sectionId][fieldPath] = value;
    }
  }

  return data;
}
