import { useState, useEffect } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PageTemplate } from '@/lib/supabase';

interface PublishTargetSelectorProps {
  templateId: string | null;
  targetPageId: string | null;
  mode: 'create_page' | 'update_page';
  onTemplateChange: (templateId: string | null) => void;
  onTargetPageChange: (pageId: string | null) => void;
  onModeChange: (mode: 'create_page' | 'update_page') => void;
}

interface PageOption {
  id: string;
  page_key: string;
  title: string;
}

export default function PublishTargetSelector({
  templateId,
  targetPageId,
  mode,
  onTemplateChange,
  onTargetPageChange,
  onModeChange,
}: PublishTargetSelectorProps) {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tplRes, pagesRes] = await Promise.all([
          supabase
            .from('page_templates')
            .select('*')
            .order('name'),
          supabase
            .from('seo_metadata')
            .select('id, page_key, title')
            .order('title'),
        ]);
        setTemplates(tplRes.data ?? []);
        setPages((pagesRes.data ?? []) as PageOption[]);
      } catch (err) {
        console.error('[PublishTarget] Error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mode */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Mode de publication
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onModeChange('create_page');
              onTargetPageChange(null);
            }}
            className={`flex-1 text-xs py-2 px-3 rounded-lg border font-medium transition-colors
              ${mode === 'create_page'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
          >
            Nouvelle page
          </button>
          <button
            onClick={() => onModeChange('update_page')}
            className={`flex-1 text-xs py-2 px-3 rounded-lg border font-medium transition-colors
              ${mode === 'update_page'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
          >
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Template */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Modèle de page assigné
        </label>
        <select
          value={templateId ?? ''}
          onChange={(e) => onTemplateChange(e.target.value || null)}
          className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
        >
          <option value="">— Sans template —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-gray-500">
          Ce modèle est utilisé comme cible par l'IA pour produire un JSON immédiatement exploitable.
        </p>
      </div>

      {/* Page cible (mode update) */}
      {mode === 'update_page' && (
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Page cible
          </label>
          {pages.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Aucune page existante.</p>
          ) : (
            <select
              value={targetPageId ?? ''}
              onChange={(e) => onTargetPageChange(e.target.value || null)}
              className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
            >
              <option value="">— Sélectionner une page —</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.page_key} ({p.page_key})
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
