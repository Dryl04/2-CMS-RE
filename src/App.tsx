import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DaisyThemeProvider } from '@/contexts/DaisyThemeContext';
import { PageThemeProvider } from '@/contexts/PageThemeContext';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import SEOManager from '@/components/seo/SEOManager';
import SEOPageViewer from '@/components/seo/SEOPageViewer';
import MediaLibrary from '@/components/MediaLibrary';
import PageBuilder from '@/components/PageBuilder/PageBuilder';
import Analytics from '@/components/Analytics';
import DaisyThemeManager from '@/components/theme/DaisyThemeManager';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VisualPageBuilder from '@/components/VisualPageBuilder';
import BuilderPreviewPage from '@/components/PageBuilder/BuilderPreviewPage';
import { supabase, SEOMetadata } from '@/lib/supabase';

type View = 'dashboard' | 'pages' | 'templates' | 'media' | 'analytics' | 'themes' | 'settings' | 'page-view' | 'visual-builder' | 'page-builder';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [seoPage, setSeoPage] = useState<SEOMetadata | null>(null);
  const [builderPageId, setBuilderPageId] = useState<string | null>(null);
  const [builderInitialSections, setBuilderInitialSections] = useState<any[] | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [showDaisyThemeManager, setShowDaisyThemeManager] = useState(false);

  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path && path !== '/') {
        const slug = path.replace(/^\//, '');
        loadPublicSEOPage(slug);
      }
    };

    handlePathChange();
    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const loadPublicSEOPage = async (pageKey: string) => {
    setIsLoadingPage(true);
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .eq('page_key', pageKey)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSeoPage(data);
        setCurrentView('page-view');
      }
    } catch (error) {
      console.error('Error loading SEO page:', error);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSeoPage(null);
    setBuilderPageId(null);
    setBuilderInitialSections(undefined);
    window.history.pushState({}, '', '/');
  };

  const handleOpenPageBuilder = (pageId: string, sections: any[]) => {
    setBuilderPageId(pageId);
    setBuilderInitialSections(sections);
    setCurrentView('page-builder');
  };

  if (window.location.pathname === '/__preview') {
    return <BuilderPreviewPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-base-300 border-t-base-content rounded-full mx-auto"></div>
          <p className="text-base-content/60 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-base-300 border-t-base-content rounded-full mx-auto"></div>
          <p className="text-base-content/60 mt-4">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'page-view' && seoPage) {
    return (
      <SEOPageViewer
        page={seoPage}
        isPublic={!user}
        onEdit={() => {
          if (seoPage) {
            const sections = Array.isArray(seoPage.sections_data)
              ? seoPage.sections_data
              : (typeof seoPage.sections_data === 'string'
                ? (() => { try { return JSON.parse(seoPage.sections_data as string); } catch { return []; } })()
                : []);
            const pageId = seoPage.id;
            setSeoPage(null);
            window.history.pushState({}, '', '/');
            handleOpenPageBuilder(pageId, sections as any[]);
          }
        }}
        onBack={() => {
          setSeoPage(null);
          setCurrentView('dashboard');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (!user) {
    return <Auth />;
  }

  const showFooter = currentView !== 'templates' && currentView !== 'visual-builder' && currentView !== 'page-builder';

  return (
    <div className={`bg-base-100 flex flex-col overflow-hidden ${currentView === 'templates' || currentView === 'visual-builder' || currentView === 'page-builder' ? 'h-screen' : 'min-h-screen'}`}>
      {currentView !== 'visual-builder' && currentView !== 'page-builder' && <Header onNavigate={handleNavigate} currentView={currentView} />}

      <div className={currentView === 'visual-builder' || currentView === 'page-builder' ? 'flex-1 flex flex-col overflow-hidden' : currentView === 'templates' ? 'pt-16 flex-1 flex flex-col overflow-hidden' : 'pt-16 flex-1'}>
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

        {currentView === 'pages' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <SEOManager onNavigate={handleNavigate} onOpenPageBuilder={handleOpenPageBuilder} />
          </div>
        )}

        {currentView === 'visual-builder' && (
          <VisualPageBuilder onClose={() => handleNavigate('dashboard')} />
        )}

        {currentView === 'page-builder' && builderPageId && (
          <PageBuilder
            onNavigate={handleNavigate}
            editingPageId={builderPageId}
            initialSections={builderInitialSections as any}
            mode="page"
            onSavePageSections={async (sections) => {
              try {
                const { error } = await supabase
                  .from('seo_metadata')
                  .update({ sections_data: sections, updated_at: new Date().toISOString() })
                  .eq('id', builderPageId);
                if (error) throw error;
                handleNavigate('pages');
              } catch (err) {
                console.error('Error saving page sections:', err);
              }
            }}
          />
        )}

        {currentView === 'templates' && (
          <PageBuilder onNavigate={handleNavigate} />
        )}

        {currentView === 'themes' && (
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="flex items-center space-x-2 text-base-content/60 hover:text-base-content mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Retour</span>
                  </button>
                  <h1 className="text-3xl font-bold text-base-content">Thèmes</h1>
                  <p className="text-base-content/50 mt-1">Gérez vos thèmes DaisyUI et personnalisés</p>
                </div>
                <button
                  onClick={() => setShowDaisyThemeManager(true)}
                  className="btn btn-primary"
                >
                  Ouvrir le gestionnaire de thèmes
                </button>
              </div>
            </div>
            {showDaisyThemeManager && (
              <DaisyThemeManager onClose={() => setShowDaisyThemeManager(false)} />
            )}
          </div>
        )}

        {currentView === 'media' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <MediaLibrary onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <Analytics onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center space-x-2 text-base-content/60 hover:text-base-content mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour au tableau de bord</span>
            </button>
            <div className="bg-base-100 rounded-2xl border border-base-300 p-12 text-center">
              <h2 className="text-3xl font-serif font-bold text-base-content mb-4">
                Parametres
              </h2>
              <p className="text-base-content/60 text-lg mb-8">
                Cette fonctionnalite sera disponible prochainement
              </p>
            </div>
          </div>
        )}
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PageThemeProvider>
        <DaisyThemeProvider>
          <AppContent />
        </DaisyThemeProvider>
      </PageThemeProvider>
    </AuthProvider>
  );
}

export default App;
