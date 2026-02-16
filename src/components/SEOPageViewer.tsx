import { useState } from 'react';
import { ArrowLeft, Edit, Settings, X } from 'lucide-react';
import { SEOMetadata } from '../lib/supabase';
import { PageBuilderSection } from '../lib/pageBuilderTypes';
import PageThemeInjector from './PageThemeInjector';
import HeaderWidget from './PageBuilder/Widgets/HeaderWidget';
import HeroWidget from './PageBuilder/Widgets/HeroWidget';
import FeaturesWidget from './PageBuilder/Widgets/FeaturesWidget';
import CTAWidget from './PageBuilder/Widgets/CTAWidget';
import TestimonialsWidget from './PageBuilder/Widgets/TestimonialsWidget';
import ContactWidget from './PageBuilder/Widgets/ContactWidget';
import FooterWidget from './PageBuilder/Widgets/FooterWidget';
import PricingWidget from './PageBuilder/Widgets/PricingWidget';
import StatsWidget from './PageBuilder/Widgets/StatsWidget';
import TeamWidget from './PageBuilder/Widgets/TeamWidget';
import FAQWidget from './PageBuilder/Widgets/FAQWidget';
import LogoCloudWidget from './PageBuilder/Widgets/LogoCloudWidget';
import VideoHeroWidget from './PageBuilder/Widgets/VideoHeroWidget';
import GalleryWidget from './PageBuilder/Widgets/GalleryWidget';
import TimelineWidget from './PageBuilder/Widgets/TimelineWidget';
import NewsletterWidget from './PageBuilder/Widgets/NewsletterWidget';
import ProcessWidget from './PageBuilder/Widgets/ProcessWidget';

interface SEOPageViewerProps {
  page: SEOMetadata;
  onEdit: () => void;
  onBack: () => void;
  // SECURITY: isPublic doit être true pour les accès publics (visiteurs non authentifiés)
  // et false pour les accès admin (utilisateurs connectés depuis le dashboard).
  // Quand isPublic=true, aucun contrôle admin ne sera affiché.
  isPublic?: boolean;
  pageThemeId?: string | null;
}

function SectionRenderer({ section }: { section: PageBuilderSection }) {
  const noop = () => {};
  const props = { section, onUpdate: noop };

  switch (section.type) {
    case 'header':
      return <HeaderWidget {...props} />;
    case 'hero':
      return <HeroWidget {...props} />;
    case 'features':
      return <FeaturesWidget {...props} />;
    case 'cta':
      return <CTAWidget {...props} />;
    case 'testimonials':
      return <TestimonialsWidget {...props} />;
    case 'contact':
      return <ContactWidget {...props} />;
    case 'footer':
      return <FooterWidget {...props} />;
    case 'pricing':
      return <PricingWidget {...props} />;
    case 'stats':
      return <StatsWidget {...props} />;
    case 'team':
      return <TeamWidget {...props} />;
    case 'faq':
      return <FAQWidget {...props} />;
    case 'logocloud':
      return <LogoCloudWidget {...props} />;
    case 'videohero':
      return <VideoHeroWidget {...props} />;
    case 'gallery':
      return <GalleryWidget {...props} />;
    case 'timeline':
      return <TimelineWidget {...props} />;
    case 'newsletter':
      return <NewsletterWidget {...props} />;
    case 'process':
      return <ProcessWidget {...props} />;
    default:
      return null;
  }
}

function RenderSections({ sections }: { sections: PageBuilderSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <div
          key={section.id}
          style={{
            backgroundColor: section.design.background.type === 'color' ? section.design.background.value : undefined,
            paddingTop: section.design.spacing.paddingTop,
            paddingBottom: section.design.spacing.paddingBottom,
          }}
        >
          <SectionRenderer section={section} />
        </div>
      ))}
    </>
  );
}

function FallbackPage({ page }: { page: SEOMetadata }) {
  return (
    <div>
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {page.description}
            </p>
          )}
        </div>
      </section>

      {page.content && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </section>
      )}

      {page.keywords && page.keywords.length > 0 && (
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {page.keywords.map((keyword, i) => (
                <span key={i} className="px-4 py-2 bg-white text-gray-600 text-sm rounded-full border border-gray-200">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function SEOPageViewer({ page, onEdit, onBack, isPublic, pageThemeId }: SEOPageViewerProps) {
  const sections = (page.sections_data || []) as PageBuilderSection[];
  const hasSections = sections.length > 0;
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <div className="min-h-screen bg-white page-themed">
      <PageThemeInjector themeId={pageThemeId} />
      {/* Bouton flottant admin - uniquement visible quand l'utilisateur est connecté */}
      {!isPublic && (
        <>
          {/* Bouton flottant */}
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="fixed bottom-6 right-6 z-50 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
            title="Menu admin"
          >
            {showAdminPanel ? (
              <X className="w-6 h-6" />
            ) : (
              <Settings className="w-6 h-6" />
            )}
          </button>

          {/* Panneau admin déroulant */}
          {showAdminPanel && (
            <div className="fixed bottom-24 right-6 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
              <div className="p-3 space-y-2 min-w-[240px]">
                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                    onBack();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Retour</span>
                </button>

                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Page</span>
                  <p className="text-sm font-mono text-gray-900 mt-1">/{page.page_key}</p>
                </div>

                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                    onEdit();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-left"
                >
                  <Edit className="w-5 h-5" />
                  <span className="font-medium">Modifier la page</span>
                </button>
              </div>
            </div>
          )}

          {/* Overlay pour fermer le panneau */}
          {showAdminPanel && (
            <div
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowAdminPanel(false)}
            />
          )}
        </>
      )}

      <div>
        {hasSections ? (
          <RenderSections sections={sections} />
        ) : (
          <FallbackPage page={page} />
        )}
      </div>
    </div>
  );
}
