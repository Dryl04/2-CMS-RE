import { useState, useRef } from 'react';
import {
  Upload, FileJson, CheckCircle, AlertCircle,
  Sparkles, FileUp, Eye, ChevronDown, ChevronUp, Rocket,
  X, Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { normalizeSectionForTheme } from '@/lib/widgetThemeHelper';
import { sanitizeSectionUrls, extractPlainUrl } from '@/lib/contentSanitizer';

interface ImportedPage {
  page_key: string;
  title: string;
  description?: string;
  keywords?: string | string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  content?: string;
  seo_h1?: string;
  seo_h2?: string;
  template_id?: string;
  daisy_theme_slug?: string | null;
  sections_data?: any[];
  content_overrides?: Record<string, Record<string, any>>;
}

interface CombinedImportPayload {
  template?: {
    id?: string;
    daisy_theme_slug?: string | null;
  };
  sections?: any[];
  sections_data?: any[];
  pages?: ImportedPage[];
}

interface TemplateSectionsRow {
  id: string;
  sections_data: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface SEOImporterProps {
  onImportComplete: () => void;
  userId?: string;
}

const SIMPLE_TEMPLATE = `[
  {
    "page_key": "nouvelle-page",
    "title": "Titre SEO de la page (max 60 car.)",
    "description": "Meta description pour Google (max 160 caracteres).",
    "keywords": ["mot-cle 1", "mot-cle 2", "mot-cle 3"],
    "og_title": "Titre pour les reseaux sociaux",
    "og_description": "Description pour Facebook, LinkedIn, etc.",
    "language": "fr",
    "status": "draft"
  }
]`;

function normalizeSectionsData(raw: unknown): any[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    try {
      return normalizeSectionsData(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.sections)) {
      return obj.sections;
    }
    if (Array.isArray(obj.sections_data)) {
      return obj.sections_data;
    }
  }

  return [];
}

function setNestedValue(target: Record<string, any>, path: string[], value: any) {
  if (path.length === 0) return;

  let current: Record<string, any> = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    const existing = current[key];
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[path[path.length - 1]] = value;
}

function getNestedValue(target: Record<string, any>, path: string[]) {
  let current: any = target;

  for (const key of path) {
    if (current === null || current === undefined) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeWithTemplateDefaults(templateValue: any, importedValue: any): any {
  if (importedValue === undefined || importedValue === null) {
    return cloneValue(templateValue);
  }

  if (
    typeof importedValue === 'string' &&
    importedValue.trim() === '' &&
    typeof templateValue === 'string' &&
    templateValue.trim() !== ''
  ) {
    return templateValue;
  }

  if (Array.isArray(templateValue) && Array.isArray(importedValue)) {
    if (importedValue.length === 0 && templateValue.length > 0) {
      return cloneValue(templateValue);
    }

    const maxLength = Math.max(templateValue.length, importedValue.length);

    return Array.from({ length: maxLength }, (_, index) =>
      mergeWithTemplateDefaults(templateValue[index], importedValue[index]),
    );
  }

  if (isPlainObject(templateValue) && isPlainObject(importedValue)) {
    const merged: Record<string, any> = {};
    const keys = new Set([
      ...Object.keys(templateValue),
      ...Object.keys(importedValue),
    ]);

    keys.forEach((key) => {
      merged[key] = mergeWithTemplateDefaults(templateValue[key], importedValue[key]);
    });

    return merged;
  }

  return importedValue;
}

function mergeSectionsWithTemplateDefaults(baseSections: any[], importedSections: any[]) {
  const baseSectionsById = new Map(
    baseSections
      .filter((section) => section && typeof section === 'object' && section.id)
      .map((section) => [section.id, section]),
  );

  return importedSections.map((section) => {
    const baseSection = section?.id ? baseSectionsById.get(section.id) : undefined;
    const mergedSection = baseSection
      ? mergeWithTemplateDefaults(baseSection, section)
      : section;

    return normalizeSectionForTheme(sanitizeSectionUrls(mergedSection));
  });
}

function applyContentOverrides(baseSections: any[], overrides: Record<string, Record<string, any>>) {
  return baseSections.map((rawSection) => {
    const section = JSON.parse(JSON.stringify(rawSection));
    const sectionOverrides = overrides?.[section.id];

    if (sectionOverrides && typeof sectionOverrides === 'object') {
      Object.entries(sectionOverrides).forEach(([fieldPath, value]) => {
        const pathParts = fieldPath.split('.').filter(Boolean);
        if (pathParts[0] !== 'content') return;

        const currentValue = getNestedValue(section, pathParts);
        const mergedValue = mergeWithTemplateDefaults(currentValue, value);
        setNestedValue(section, pathParts, mergedValue);
      });
    }

    return normalizeSectionForTheme(sanitizeSectionUrls(section));
  });
}

export default function SEOImporter({ onImportComplete, userId }: SEOImporterProps) {
  const [importMode, setImportMode] = useState<'simple' | 'template'>('template');
  const [inputData, setInputData] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ImportedPage[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState<{ total: number; published: number; draft: number } | null>(null);
  const [expandedPreview, setExpandedPreview] = useState<number | null>(null);
  const [autoPublish, setAutoPublish] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePage = (page: ImportedPage, index: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    const row = index + 1;

    if (!page.page_key || page.page_key.trim() === '') {
      errors.push({ row, field: 'page_key', message: 'page_key est obligatoire' });
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(page.page_key)) {
      errors.push({ row, field: 'page_key', message: 'page_key doit etre un slug URL valide (minuscules, chiffres, tirets uniquement)' });
    }

    if (!page.title || page.title.trim() === '') {
      errors.push({ row, field: 'title', message: 'title est obligatoire' });
    } else if (page.title.length > 60) {
      errors.push({ row, field: 'title', message: `title fait ${page.title.length} caracteres (max 60)` });
    }

    if (page.description && page.description.length > 160) {
      errors.push({ row, field: 'description', message: `description fait ${page.description.length} caracteres (max 160)` });
    }

    if (page.status && !['draft', 'published', 'archived'].includes(page.status)) {
      errors.push({ row, field: 'status', message: 'status doit etre draft, published ou archived' });
    }

    if (page.content_overrides && typeof page.content_overrides !== 'object') {
      errors.push({ row, field: 'content_overrides', message: 'content_overrides doit etre un objet' });
    }

    if (page.content_overrides && !page.template_id && (!page.sections_data || page.sections_data.length === 0)) {
      errors.push({ row, field: 'template_id', message: 'template_id est obligatoire quand content_overrides est utilise sans sections_data' });
    }

    if (page.sections_data && !Array.isArray(page.sections_data)) {
      errors.push({ row, field: 'sections_data', message: 'sections_data doit etre un tableau' });
    }

    if (page.sections_data && Array.isArray(page.sections_data)) {
      page.sections_data.forEach((section: any, sIdx: number) => {
        if (!section.id) {
          errors.push({ row, field: `sections_data[${sIdx}].id`, message: 'Chaque section doit avoir un id' });
        }
        if (!section.type) {
          errors.push({ row, field: `sections_data[${sIdx}].type`, message: 'Chaque section doit avoir un type' });
        }
        if (!section.content || typeof section.content !== 'object') {
          errors.push({ row, field: `sections_data[${sIdx}].content`, message: 'Chaque section doit avoir un objet content' });
        }
        if (!section.design || typeof section.design !== 'object') {
          errors.push({ row, field: `sections_data[${sIdx}].design`, message: 'Chaque section doit avoir un objet design' });
        }
        if (!section.variant) {
          errors.push({ row, field: `sections_data[${sIdx}].variant`, message: 'Section sans variant — la variante par défaut sera utilisée' });
        }
      });
    }

    return errors;
  };

  const normalizeSectionsForImport = (sections: any[] = []) =>
    sections.map((section) => normalizeSectionForTheme(sanitizeSectionUrls(section)));

  const parseInput = (raw: string): ImportedPage[] => {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed?.page_key) {
      return [parsed as ImportedPage];
    }

    if (parsed && typeof parsed === 'object') {
      const payload = parsed as CombinedImportPayload;
      const baseSections = Array.isArray(payload.sections)
        ? payload.sections
        : Array.isArray(payload.sections_data)
          ? payload.sections_data
          : [];
      const baseTemplateId = payload.template?.id;
      const baseThemeSlug = payload.template?.daisy_theme_slug ?? null;

      if (Array.isArray(payload.pages)) {
        return payload.pages.map((page) => {
          const pageSections = Array.isArray(page.sections_data) && page.sections_data.length > 0
            ? page.sections_data
            : Array.isArray((page as any).sections) && (page as any).sections.length > 0
              ? (page as any).sections
              : baseSections;
          return {
            ...page,
            template_id: page.template_id || baseTemplateId,
            daisy_theme_slug: page.daisy_theme_slug ?? baseThemeSlug,
            sections_data: normalizeSectionsForImport(pageSections),
            content_overrides: page.content_overrides,
          };
        });
      }
    }

    throw new Error('Format non reconnu. Attendu : { "pages": [...] }, un tableau de pages, ou un objet combine avec template/sections/pages.');
  };

  const handleValidate = () => {
    setValidationErrors([]);
    setPreviewData([]);
    setImportStats(null);

    try {
      const pages = parseInput(inputData);

      const normalized = pages.map(page => ({
        ...page,
        keywords: typeof page.keywords === 'string'
          ? page.keywords.split(',').map(k => k.trim())
          : page.keywords || [],
        daisy_theme_slug: page.daisy_theme_slug ?? null,
        sections_data: Array.isArray(page.sections_data)
          ? normalizeSectionsForImport(page.sections_data)
          : [],
        content_overrides: page.content_overrides,
        status: autoPublish ? 'published' as const : (page.status || 'draft' as const),
      }));

      const allErrors: ValidationError[] = [];
      normalized.forEach((page, idx) => {
        allErrors.push(...validatePage(page, idx));
      });

      const keys = normalized.map(p => p.page_key);
      const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
      duplicates.forEach(dup => {
        allErrors.push({ row: 0, field: 'page_key', message: `page_key "${dup}" est utilise plusieurs fois` });
      });

      setValidationErrors(allErrors);
      setPreviewData(normalized);
    } catch (error: any) {
      setValidationErrors([{ row: 0, field: 'format', message: `Erreur de format JSON : ${error.message}` }]);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const templateIds = Array.from(
        new Set(previewData.map((page) => page.template_id).filter(Boolean) as string[]),
      );

      const templateSectionsById: Record<string, any[]> = {};
      if (templateIds.length > 0) {
        const { data: templatesData, error: templatesError } = await supabase
          .from('page_templates')
          .select('id, sections_data')
          .in('id', templateIds);

        if (templatesError) throw templatesError;

        (templatesData as TemplateSectionsRow[] | null)?.forEach((template) => {
          templateSectionsById[template.id] = normalizeSectionsForImport(normalizeSectionsData(template.sections_data));
        });
      }

      const resolvedPreviewData = previewData.map((page) => {
        const hasSections = Array.isArray(page.sections_data) && page.sections_data.length > 0;
        if (hasSections) {
          const normalizedSections = normalizeSectionsForImport(page.sections_data || []);
          const baseSections = page.template_id ? (templateSectionsById[page.template_id] || []) : [];

          return {
            ...page,
            sections_data: baseSections.length > 0
              ? mergeSectionsWithTemplateDefaults(baseSections, normalizedSections)
              : normalizedSections,
          };
        }

        if (page.content_overrides && page.template_id) {
          const baseSections = templateSectionsById[page.template_id] || [];
          return {
            ...page,
            sections_data: applyContentOverrides(baseSections, page.content_overrides),
          };
        }

        return {
          ...page,
          sections_data: [],
        };
      });

      const unresolvedPages = resolvedPreviewData
        .map((page, index) => ({ page, index }))
        .filter(({ page }) =>
          !!page.content_overrides &&
          (!Array.isArray(page.sections_data) || page.sections_data.length === 0),
        );

      if (unresolvedPages.length > 0) {
        const details = unresolvedPages
          .map(({ page, index }) => `page ${index + 1} (${page.page_key || 'sans page_key'})`)
          .join(', ');
        throw new Error(`Impossible de reconstruire sections_data pour: ${details}. Verifiez template_id.`);
      }

      const dataToImport = resolvedPreviewData.map(page => {
        const row: Record<string, any> = {
          page_key: page.page_key,
          title: page.title,
          description: page.description || null,
          keywords: Array.isArray(page.keywords) ? page.keywords : [],
          og_title: page.og_title || null,
          og_description: page.og_description || null,
          og_image: page.og_image ? extractPlainUrl(page.og_image) : null,
          canonical_url: page.canonical_url || null,
          language: page.language || 'fr',
          status: page.status || 'draft',
          content: page.content || null,
          seo_h1: page.seo_h1 || null,
          seo_h2: page.seo_h2 || null,
          template_id: page.template_id || null,
          daisy_theme_slug: page.daisy_theme_slug ?? null,
          sections_data: page.sections_data || [],
          imported_at: new Date().toISOString(),
        };
        if (userId) {
          row.user_id = userId;
        }
        return row;
      });

      const { error } = await supabase
        .from('seo_metadata')
        .upsert(dataToImport, { onConflict: 'page_key' });

      if (error) throw error;

      const published = dataToImport.filter(d => d.status === 'published').length;
      const draft = dataToImport.filter(d => d.status !== 'published').length;

      setImportSuccess(true);
      setImportStats({ total: dataToImport.length, published, draft });
      setInputData('');
      setPreviewData([]);
      setTimeout(() => {
        setImportSuccess(false);
        setImportStats(null);
        onImportComplete();
      }, 4000);
    } catch (error: any) {
      setValidationErrors([{ row: 0, field: 'import', message: `Erreur d'import : ${error.message || error}` }]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputData(text);
      setValidationErrors([]);
      setPreviewData([]);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSectionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      header: 'bg-sky-100 text-sky-700',
      hero: 'bg-amber-100 text-amber-700',
      features: 'bg-emerald-100 text-emerald-700',
      cta: 'bg-rose-100 text-rose-700',
      testimonials: 'bg-cyan-100 text-cyan-700',
      contact: 'bg-teal-100 text-teal-700',
      footer: 'bg-gray-200 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Importer des pages</h3>
          <p className="text-sm text-gray-500 mt-1">
            Importez des pages completes avec contenu SEO optimise
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setImportMode('template')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${importMode === 'template'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pages avec modele</span>
        </button>
        <button
          onClick={() => setImportMode('simple')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${importMode === 'simple'
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          <FileJson className="w-4 h-4" />
          <span>SEO simple</span>
        </button>
      </div>

      {importMode === 'template' ? (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-gray-900 mb-2">Workflow import en masse</p>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                <li>Exportez un modele depuis l'onglet <strong>Modeles</strong> (bouton JSON ultra-compact)</li>
                <li>Envoyez le JSON du modele + la documentation a votre IA ou redacteur</li>
                <li>Recevez le JSON de retour au format <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">{"{ \"pages\": [...] }"}</code> avec <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">content_overrides</code> (ou format classique avec <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">sections_data</code>)</li>
                <li>Collez-le ci-dessous ou importez le fichier</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-1">Import SEO simple</p>
              <p>Importez des metadonnees SEO sans contenu visuel. Format : tableau JSON de pages.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-900">
          {importMode === 'template' ? 'JSON des pages (content_overrides ou sections_data)' : 'JSON des metadonnees SEO'}
        </label>
        <div className="flex items-center gap-2">
          {importMode === 'simple' && (
            <button
              onClick={() => setInputData(SIMPLE_TEMPLATE)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Template exemple</span>
            </button>
          )}
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
            <FileUp className="w-3.5 h-3.5" />
            <span>Importer un fichier</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <textarea
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder={importMode === 'template'
          ? '{\n  "template": { "id": "...", "daisy_theme_slug": "light" },\n  "pages": [\n    {\n      "page_key": "ma-page",\n      "title": "Titre SEO",\n      "description": "...",\n      "status": "published",\n      "template_id": "...",\n      "content_overrides": {\n        "section-hero-xxx": {\n          "content.headline": "Nouveau titre",\n          "content.subheadline": "Nouveau sous-titre"\n        }\n      }\n    }\n  ]\n}'
          : '[{"page_key": "home", "title": "Titre SEO", "description": "Description"}]'
        }
        className="w-full h-72 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-mono text-sm bg-gray-50 resize-none transition-colors"
      />

      <div className="flex items-center justify-between mt-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => setAutoPublish(!autoPublish)}
            className={`w-10 h-6 rounded-full transition-colors relative ${autoPublish ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoPublish ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
            />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            Publication automatique
          </span>
        </label>

        <button
          onClick={handleValidate}
          disabled={!inputData.trim()}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-medium transition-all text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>Valider et previsualiser</span>
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">
                {validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''} detectee{validationErrors.length > 1 ? 's' : ''}
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      {error.row > 0 && <strong>Page {error.row}</strong>}
                      {error.row > 0 && ' - '}
                      <span className="font-mono text-xs bg-red-100 px-1 rounded">{error.field}</span>
                      {' : '}{error.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {previewData.length > 0 && validationErrors.length === 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-gray-900">
                {previewData.length} page{previewData.length > 1 ? 's' : ''} prete{previewData.length > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {previewData.filter(p => p.status === 'published').length} seront publiee(s) automatiquement
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-auto pr-1">
            {previewData.map((page, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPreview(expandedPreview === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{page.page_key}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${page.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {page.status === 'published' ? 'Publication auto' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{page.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {page.sections_data && page.sections_data.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {page.sections_data.length} section{page.sections_data.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {expandedPreview === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedPreview === index && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title SEO</span>
                        <p className="text-sm text-gray-900 mt-0.5">{page.title}</p>
                        <span className={`text-xs ${page.title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                          {page.title.length}/60
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</span>
                        <p className="text-sm text-gray-600 mt-0.5">{page.description || '-'}</p>
                        {page.description && (
                          <span className={`text-xs ${page.description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                            {page.description.length}/160
                          </span>
                        )}
                      </div>
                    </div>

                    {page.keywords && (page.keywords as string[]).length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mots-cles</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(page.keywords as string[]).map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {page.seo_h1 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">H1</span>
                        <p className="text-sm text-gray-900 mt-0.5">{page.seo_h1}</p>
                      </div>
                    )}

                    {page.sections_data && page.sections_data.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sections</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {page.sections_data.map((section: any, sIdx: number) => (
                            <span
                              key={sIdx}
                              className={`px-2 py-0.5 text-xs font-medium rounded-md ${getSectionTypeBadge(section.type)}`}
                            >
                              {section.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {page.template_id && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Modele</span>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{page.template_id}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                <span>Import en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  Importer {previewData.length} page{previewData.length > 1 ? 's' : ''}
                  {previewData.filter(p => p.status === 'published').length > 0 &&
                    ` (${previewData.filter(p => p.status === 'published').length} publication${previewData.filter(p => p.status === 'published').length > 1 ? 's' : ''} auto)`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {importSuccess && importStats && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900">Import reussi !</h4>
              <p className="text-sm text-emerald-700 mt-1">
                {importStats.total} page{importStats.total > 1 ? 's' : ''} importee{importStats.total > 1 ? 's' : ''}.
                {importStats.published > 0 && (
                  <> <strong>{importStats.published}</strong> publiee{importStats.published > 1 ? 's' : ''} automatiquement.</>
                )}
                {importStats.draft > 0 && (
                  <> <strong>{importStats.draft}</strong> en brouillon.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
