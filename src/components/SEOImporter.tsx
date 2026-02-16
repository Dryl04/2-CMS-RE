import { useState, useRef } from 'react';
import {
  Upload, FileJson, FileText, CheckCircle, AlertCircle,
  Sparkles, FileUp, Eye, ChevronDown, ChevronUp, Rocket,
  X, Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  sections_data?: any[];
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
      });
    }

    return errors;
  };

  const parseInput = (raw: string): ImportedPage[] => {
    const parsed = JSON.parse(raw);

    if (parsed.pages && Array.isArray(parsed.pages)) {
      return parsed.pages;
    }

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed.page_key) {
      return [parsed];
    }

    throw new Error('Format non reconnu. Attendu : { "pages": [...] } ou un tableau de pages.');
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
      const dataToImport = previewData.map(page => {
        const row: Record<string, any> = {
          page_key: page.page_key,
          title: page.title,
          description: page.description || null,
          keywords: Array.isArray(page.keywords) ? page.keywords : [],
          og_title: page.og_title || null,
          og_description: page.og_description || null,
          og_image: page.og_image || null,
          canonical_url: page.canonical_url || null,
          language: page.language || 'fr',
          status: page.status || 'draft',
          content: page.content || null,
          seo_h1: page.seo_h1 || null,
          seo_h2: page.seo_h2 || null,
          template_id: page.template_id || null,
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            importMode === 'template'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pages avec modele</span>
        </button>
        <button
          onClick={() => setImportMode('simple')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            importMode === 'simple'
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
                <li>Exportez un modele depuis l'onglet <strong>Modeles</strong> (bouton JSON)</li>
                <li>Envoyez le JSON du modele + la documentation a votre IA ou redacteur</li>
                <li>Recevez le JSON de retour au format <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">{"{ \"pages\": [...] }"}</code></li>
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
          {importMode === 'template' ? 'JSON des pages (avec sections_data)' : 'JSON des metadonnees SEO'}
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
          ? '{\n  "pages": [\n    {\n      "page_key": "ma-page",\n      "title": "Titre SEO",\n      "description": "...",\n      "status": "published",\n      "template_id": "...",\n      "sections_data": [...]\n    }\n  ]\n}'
          : '[{"page_key": "home", "title": "Titre SEO", "description": "Description"}]'
        }
        className="w-full h-72 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 font-mono text-sm bg-gray-50 resize-none transition-colors"
      />

      <div className="flex items-center justify-between mt-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => setAutoPublish(!autoPublish)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              autoPublish ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                autoPublish ? 'translate-x-[18px]' : 'translate-x-0.5'
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
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          page.status === 'published'
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
