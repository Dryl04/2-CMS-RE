import { useState, useEffect } from 'react';
import { FileText, Layout, Image, Settings, TrendingUp, Clock, CheckCircle, Paintbrush, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Stats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  templates: number;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    templates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('[Dashboard] Loading stats...');

      const [pagesResult, templatesResult] = await Promise.all([
        supabase.from('seo_metadata').select('status', { count: 'exact' }),
        supabase.from('page_templates').select('id', { count: 'exact' }),
      ]);

      console.log('[Dashboard] Pages result:', pagesResult);
      console.log('[Dashboard] Templates result:', templatesResult);

      if (pagesResult.error) {
        console.error('[Dashboard] Error loading pages:', pagesResult.error);
        console.error('[Dashboard] Error details:', JSON.stringify(pagesResult.error, null, 2));
      }

      if (templatesResult.error) {
        console.error('[Dashboard] Error loading templates:', templatesResult.error);
        console.error('[Dashboard] Error details:', JSON.stringify(templatesResult.error, null, 2));
      }

      const pages = pagesResult.data || [];
      const totalPages = pages.length;
      const publishedPages = pages.filter((p) => p.status === 'published').length;
      const draftPages = pages.filter((p) => p.status === 'draft').length;
      const templates = templatesResult.count || 0;

      console.log('[Dashboard] Stats:', { totalPages, publishedPages, draftPages, templates });
      setStats({ totalPages, publishedPages, draftPages, templates });
    } catch (error) {
      console.error('[Dashboard] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <div className="mb-4">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">
              Tableau de bord
            </h1>
            <p className="text-xl text-gray-600">
              Bienvenue {profile?.full_name || profile?.email}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-3xl font-serif font-bold text-gray-900">
                {loading ? '...' : stats.totalPages}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total des pages</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
              <span className="text-3xl font-serif font-bold text-green-700">
                {loading ? '...' : stats.publishedPages}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pages publiées</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-700" />
              </div>
              <span className="text-3xl font-serif font-bold text-gray-700">
                {loading ? '...' : stats.draftPages}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Brouillons</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-3xl font-serif font-bold text-gray-900">
                {loading ? '...' : stats.templates}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Modèles</h3>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Actions rapides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => onNavigate('pages')}
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Gérer les pages
              </h3>
              <p className="text-gray-600">
                Créer, modifier et publier vos pages SEO
              </p>
            </button>

            <button
              onClick={() => onNavigate('visual-builder')}
              className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl border-2 border-blue-500 hover:border-blue-400 transition-all text-left group shadow-lg"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Créateur Visuel
              </h3>
              <p className="text-blue-100">
                Créer des pages rapidement avec l'interface visuelle
              </p>
            </button>

            <button
              onClick={() => onNavigate('templates')}
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Paintbrush className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Éditeur Avancé
              </h3>
              <p className="text-gray-600">
                Éditer des pages avec drag & drop et propriétés avancées
              </p>
            </button>

            <button
              onClick={() => onNavigate('themes')}
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thèmes visuels
              </h3>
              <p className="text-gray-600">
                Gérer les thèmes de vos pages
              </p>
            </button>

            <button
              onClick={() => onNavigate('media')}
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bibliothèque média
              </h3>
              <p className="text-gray-600">
                Gérer vos images et vidéos
              </p>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Statistiques
              </h3>
              <p className="text-gray-600">
                Analyser les performances de vos pages
              </p>
            </button>

            {(profile?.role === 'admin' || profile?.role === 'seo_manager') && (
              <button
                onClick={() => onNavigate('settings')}
                className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
              >
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Paramètres
                </h3>
                <p className="text-gray-600">
                  Configurer votre application
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
