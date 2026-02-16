import { useState, useEffect } from 'react';
import { FileText, Globe, Archive, Clock, TrendingUp, BarChart3, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  recentPages: { page_key: string; title: string; status: string; updated_at: string }[];
  languageBreakdown: Record<string, number>;
}

interface AnalyticsProps {
  onNavigate?: (view: string) => void;
}

export default function Analytics({ onNavigate }: AnalyticsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const pages = data || [];
      const languageBreakdown: Record<string, number> = {};
      pages.forEach(p => {
        const lang = p.language || 'fr';
        languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
      });

      setStats({
        total: pages.length,
        published: pages.filter(p => p.status === 'published').length,
        draft: pages.filter(p => p.status === 'draft').length,
        archived: pages.filter(p => p.status === 'archived').length,
        recentPages: pages.slice(0, 10).map(p => ({
          page_key: p.page_key,
          title: p.title,
          status: p.status,
          updated_at: p.updated_at,
        })),
        languageBreakdown,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-emerald-100 text-emerald-700',
      archived: 'bg-orange-100 text-orange-700',
    };
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publie',
      archived: 'Archive',
    };
    return { className: styles[status] || styles.draft, label: labels[status] || status };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxStatusCount = Math.max(stats.published, stats.draft, stats.archived, 1);

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au tableau de bord</span>
        </button>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Statistiques</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble de vos pages SEO</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total pages</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Publiees</span>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{stats.published}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Brouillons</span>
          </div>
          <p className="text-3xl font-bold text-gray-700">{stats.draft}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Archive className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Archivees</span>
          </div>
          <p className="text-3xl font-bold text-orange-700">{stats.archived}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Repartition par statut</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Publiees</span>
                <span className="font-medium text-gray-900">{stats.published}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.published / maxStatusCount) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Brouillons</span>
                <span className="font-medium text-gray-900">{stats.draft}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.draft / maxStatusCount) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Archivees</span>
                <span className="font-medium text-gray-900">{stats.archived}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.archived / maxStatusCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {Object.keys(stats.languageBreakdown).length > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Par langue</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.languageBreakdown).map(([lang, count]) => (
                  <span key={lang} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                    {lang.toUpperCase()}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Pages recentes</h3>
          </div>

          {stats.recentPages.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune page</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPages.map((page) => {
                const badge = getStatusBadge(page.status);
                return (
                  <div key={page.page_key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                      <p className="text-xs text-gray-500 font-mono">{page.page_key}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
