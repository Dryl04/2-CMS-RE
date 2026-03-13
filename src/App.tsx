import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DaisyThemeProvider } from '@/contexts/DaisyThemeContext';
import { PageThemeProvider } from '@/contexts/PageThemeContext';
import { ModalProvider } from '@/contexts/ModalContext';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import SEOManager from '@/components/seo/SEOManager';
import LinkManager from '@/components/seo/LinkManager';
import SEOPageViewer from '@/components/seo/SEOPageViewer';
import MediaLibrary from '@/components/MediaLibrary';
import PageBuilder from '@/components/PageBuilder/PageBuilder';
import Analytics from '@/components/Analytics';
import DaisyThemeManager from '@/components/theme/DaisyThemeManager';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VisualPageBuilder from '@/components/VisualPageBuilder';
import BuilderPreviewPage from '@/components/PageBuilder/BuilderPreviewPage';
import GlobalHFManager from '@/components/GlobalHFManager';
import HFBuilderModal from '@/components/HFBuilderModal';
import ForcePasswordChange from '@/components/ForcePasswordChange';
import SiteSettings from '@/components/settings/SiteSettings';
import SettingsHub from '@/components/settings/SettingsHub';
import UserSettings from '@/components/settings/UserSettings';
import { supabase, SEOMetadata } from '@/lib/supabase';
import { ApiError, fetchPublicPageRoute, normalizeSeoMetadata } from '@/lib/api';
import { normalizeInternalPath } from '@/lib/linkRegistry';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';

type View = 'dashboard' | 'pages' | 'templates' | 'media' | 'links' | 'analytics' | 'themes' | 'settings' | 'site-settings' | 'user-settings' | 'settings-hub' | 'page-view' | 'visual-builder' | 'page-builder' | 'global-hf';

function AppContent() {
  const { user, loading, requiresPasswordChange } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [seoPage, setSeoPage] = useState<SEOMetadata | null>(null);
  const [builderPageId, setBuilderPageId] = useState<string | null>(null);
  const [builderInitialSections, setBuilderInitialSections] = useState<any[] | undefined>(undefined);
  const [builderInitialDaisyTheme, setBuilderInitialDaisyTheme] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [publicPageNotFound, setPublicPageNotFound] = useState<string | null>(null);
  const [showDaisyThemeManager, setShowDaisyThemeManager] = useState(false);
  const [hfBuilderModal, setHfBuilderModal] = useState<{
    type: 'header' | 'footer';
    initialSection: PageBuilderSection | null;
    onDone: (section: PageBuilderSection | null) => void;
  } | null>(null);

  const loadPublicSEOPage = useCallback(async (pageKey: string) => {
    setIsLoadingPage(true);
    setPublicPageNotFound(null);

    try {
      const normalizedPageKey = normalizeInternalPath(pageKey);
      const result = await fetchPublicPageRoute(normalizedPageKey);

      if (result.kind === 'redirect' && result.redirectUrl) {
        window.location.replace(result.redirectUrl);
        return;
      }

      if (result.kind === 'page' && result.page) {
        setSeoPage(normalizeSeoMetadata(result.page) as SEOMetadata);
        setCurrentView('page-view');
        return;
      }

      setSeoPage(null);
      setCurrentView('dashboard');
      setPublicPageNotFound(normalizedPageKey ? normalizedPageKey : null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSeoPage(null);
        setCurrentView('dashboard');
        setPublicPageNotFound(normalizeInternalPath(pageKey) || null);
      } else {
        console.error('Error loading SEO page:', error);
      }
    } finally {
      setIsLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      const slug = path === '/' ? '' : path.replace(/^\//, '');
      loadPublicSEOPage(slug);
    };

    handlePathChange();
    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSeoPage(null);
    setPublicPageNotFound(null);
    setBuilderPageId(null);
    setBuilderInitialSections(undefined);
    setBuilderInitialDaisyTheme(null);
    window.history.pushState({}, '', '/');
  };

  const handleOpenPageBuilder = (pageId: string, sections: any[], daisyThemeSlug?: string | null) => {
    setBuilderPageId(pageId);
    setBuilderInitialSections(sections);
    setBuilderInitialDaisyTheme(daisyThemeSlug ?? null);
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
            handleOpenPageBuilder(pageId, sections as any[], seoPage.daisy_theme_slug ?? null);
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
    if (publicPageNotFound) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-base-content/50 mb-4">404</p>
            <h1 className="text-4xl font-bold text-base-content mb-4">Page introuvable</h1>
            <p className="text-base-content/70 mb-8">
              Aucune page publiee ne correspond au chemin <code className="font-mono">{publicPageNotFound}</code> pour ce domaine.
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="btn btn-primary"
            >
              Revenir a l'accueil
            </button>
          </div>
        </div>
      );
    }

    return <Auth />;
  }

  if (requiresPasswordChange) {
    return <ForcePasswordChange />;
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
            initialDaisyThemeSlug={builderInitialDaisyTheme}
            mode="page"
            onSavePageSections={async (sections, daisyThemeSlug) => {
              try {
                const { error } = await supabase
                  .from('seo_metadata')
                  .update({
                    sections_data: sections,
                    daisy_theme_slug: daisyThemeSlug,
                    updated_at: new Date().toISOString(),
                  })
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

        {currentView === 'links' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <LinkManager onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <Analytics onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <SettingsHub onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'settings-hub' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <SettingsHub onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'site-settings' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <SiteSettings onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'user-settings' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <UserSettings onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'global-hf' && (
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
            <GlobalHFManager
              onNavigate={handleNavigate}
              onOpenHFBuilder={(type, initialSection, onDone) => {
                setHfBuilderModal({ type, initialSection, onDone });
              }}
            />
          </div>
        )}
      </div>

      {showFooter && <Footer />}

      {hfBuilderModal && (
        <HFBuilderModal
          type={hfBuilderModal.type}
          initialSection={hfBuilderModal.initialSection}
          onDone={hfBuilderModal.onDone}
          onClose={() => setHfBuilderModal(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PageThemeProvider>
        <DaisyThemeProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </DaisyThemeProvider>
      </PageThemeProvider>
    </AuthProvider>
  );
}

export default App;
