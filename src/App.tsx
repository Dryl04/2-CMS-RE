import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageThemeProvider } from './contexts/PageThemeContext';
import { DaisyThemeProvider } from './contexts/DaisyThemeContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SEOManager from './components/SEOManager';
import SEOPageViewer from './components/SEOPageViewer';
import MediaLibrary from './components/MediaLibrary';
import PageBuilder from './components/PageBuilder/PageBuilder';
import Analytics from './components/Analytics';
import DaisyThemeManager from './components/DaisyThemeManager';
import { ThemeStyleInjector } from './components/ThemeStyleInjector';
import Header from './components/Header';
import Footer from './components/Footer';
import VisualPageBuilder from './components/VisualPageBuilder';
import { supabase, SEOMetadata } from './lib/supabase';

type View = 'dashboard' | 'pages' | 'templates' | 'media' | 'analytics' | 'themes' | 'settings' | 'page-view' | 'visual-builder';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [seoPage, setSeoPage] = useState<SEOMetadata | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [showDaisyThemeManager, setShowDaisyThemeManager] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;

    if (path && path !== '/') {
      const slug = path.replace(/^\//, '');
      loadPublicSEOPage(slug);
    }
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
    window.history.pushState({}, '', '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de la page...</p>
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
          setSeoPage(null);
          setCurrentView('pages');
          window.history.pushState({}, '', '/');
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

  const showFooter = currentView !== 'templates' && currentView !== 'visual-builder';

  return (
   <div className={`bg-gray-50 flex flex-col overflow-hidden ${currentView === 'templates' || currentView === 'visual-builder' ? 'h-screen' : 'min-h-screen'}`}>
      <ThemeStyleInjector />
      {currentView !== 'visual-builder' && <Header onNavigate={handleNavigate} currentView={currentView} />}

      <div className={currentView === 'visual-builder' ? 'flex-1 flex flex-col overflow-hidden' : currentView === 'templates' ? 'pt-16 flex-1 flex flex-col overflow-hidden' : 'pt-16 flex-1'}>
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

        {currentView === 'pages' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <SEOManager onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'visual-builder' && (
          <VisualPageBuilder onClose={() => handleNavigate('dashboard')} />
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
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Retour</span>
                  </button>
                  <h1 className="text-3xl font-bold">Thèmes</h1>
                  <p className="text-gray-500 mt-1">Gérez vos thèmes DaisyUI et personnalisés</p>
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
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour au tableau de bord</span>
            </button>
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                Parametres
              </h2>
              <p className="text-gray-600 text-lg mb-8">
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
      <ThemeProvider>
        <PageThemeProvider>
          <DaisyThemeProvider>
            <AppContent />
          </DaisyThemeProvider>
        </PageThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
