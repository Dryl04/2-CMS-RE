import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Settings, X, ChevronUp } from 'lucide-react';
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
import ImageTextSplitWidget from './PageBuilder/Widgets/ImageTextSplitWidget';
import ContentShowcaseWidget from './PageBuilder/Widgets/ContentShowcaseWidget';
import CenteredContentWidget from './PageBuilder/Widgets/CenteredContentWidget';
import TextColumnsWidget from './PageBuilder/Widgets/TextColumnsWidget';
import ServicesGridWidget from './PageBuilder/Widgets/ServicesGridWidget';
import ContactSplitWidget from './PageBuilder/Widgets/ContactSplitWidget';
import FeedbackContactWidget from './PageBuilder/Widgets/FeedbackContactWidget';
import ServicesCardsWidget from './PageBuilder/Widgets/ServicesCardsWidget';
import MembershipPricingWidget from './PageBuilder/Widgets/MembershipPricingWidget';
import FAQTwoColumnsWidget from './PageBuilder/Widgets/FAQTwoColumnsWidget';
import IntegrationsGridWidget from './PageBuilder/Widgets/IntegrationsGridWidget';
import HeroWithServicesWidget from './PageBuilder/Widgets/HeroWithServicesWidget';
import ImageStatsFAQWidget from './PageBuilder/Widgets/ImageStatsFAQWidget';
import TimelineGridWidget from './PageBuilder/Widgets/TimelineGridWidget';
import NewsletterSignupWidget from './PageBuilder/Widgets/NewsletterSignupWidget';
import SocialFollowWidget from './PageBuilder/Widgets/SocialFollowWidget';
import ServicesCarouselWidget from './PageBuilder/Widgets/ServicesCarouselWidget';
import BentoFeaturesWidget from './PageBuilder/Widgets/BentoFeaturesWidget';
import FeaturesCarouselWidget from './PageBuilder/Widgets/FeaturesCarouselWidget';
import ContentWithServicesWidget from './PageBuilder/Widgets/ContentWithServicesWidget';
import SplitContentWithChecklist from './PageBuilder/Widgets/SplitContentWithChecklist';
import DropCapWithServices from './PageBuilder/Widgets/DropCapWithServices';
import CenteredTestimonial from './PageBuilder/Widgets/CenteredTestimonial';
import ContentVideoServices from './PageBuilder/Widgets/ContentVideoServices';
import ProcessAlternating from './PageBuilder/Widgets/ProcessAlternating';
import HeroWithTestimonials from './PageBuilder/Widgets/HeroWithTestimonials';
import BrandIdentityHero from './PageBuilder/Widgets/BrandIdentityHero';
import SimpleCenteredHero from './PageBuilder/Widgets/SimpleCenteredHero';
import SimpleHeaderDivider from './PageBuilder/Widgets/SimpleHeaderDivider';
import HeaderTopInfo from './PageBuilder/Widgets/HeaderTopInfo';
import HeaderWithIcons from './PageBuilder/Widgets/HeaderWithIcons';
import HeaderAccountBar from './PageBuilder/Widgets/HeaderAccountBar';
import HeaderFullContact from './PageBuilder/Widgets/HeaderFullContact';
import HeaderClickFunnel from './PageBuilder/Widgets/HeaderClickFunnel';
import ClickFunnelsHero from './PageBuilder/Widgets/ClickFunnelsHero';
import ClickFunnelCenterCard from './PageBuilder/Widgets/ClickFunnelCenterCard';
import ClickFunnelTestimonials from './PageBuilder/Widgets/ClickFunnelTestimonials';
import ClickFunnelFeatures from './PageBuilder/Widgets/ClickFunnelFeatures';
import ClickFunnelFooter from './PageBuilder/Widgets/ClickFunnelFooter';
import CreativeNetworkHeroWidget from './PageBuilder/Widgets/CreativeNetworkHeroWidget';
import ImmersiveSplitShowcaseWidget from './PageBuilder/Widgets/ImmersiveSplitShowcaseWidget';
import ProviderMasonryWidget from './PageBuilder/Widgets/ProviderMasonryWidget';
import ProcessStepsCardsWidget from './PageBuilder/Widgets/ProcessStepsCardsWidget';
import EditorialCardsRowWidget from './PageBuilder/Widgets/EditorialCardsRowWidget';
import MinimalFinalCTAWidget from './PageBuilder/Widgets/MinimalFinalCTAWidget';
import CinematicFooterWidget from './PageBuilder/Widgets/CinematicFooterWidget';
import EmbedWidget from './PageBuilder/Widgets/EmbedWidget';
import CodeInsertWidget from './PageBuilder/Widgets/CodeInsertWidget';
import { getWidgetWrapperProps, normalizeSectionForTheme } from '../lib/widgetThemeHelper';
import { sanitizeSectionUrls } from '../lib/contentSanitizer';

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

function canRenderSectionType(type?: string): boolean {
  if (!type) return false;

  switch (type) {
    case 'header':
    case 'hero':
    case 'features':
    case 'cta':
    case 'testimonials':
    case 'contact':
    case 'footer':
    case 'pricing':
    case 'stats':
    case 'team':
    case 'faq':
    case 'logocloud':
    case 'videohero':
    case 'gallery':
    case 'timeline':
    case 'newsletter':
    case 'process':
    case 'image-text-split':
    case 'content-showcase':
    case 'centered-content':
    case 'text-columns':
    case 'services-grid':
    case 'contact-split':
    case 'feedback-contact':
    case 'services-cards':
    case 'membership-pricing':
    case 'faq-two-columns':
    case 'integrations-grid':
    case 'hero-with-services':
    case 'image-stats-faq':
    case 'timeline-grid':
    case 'newsletter-signup':
    case 'social-follow':
    case 'services-carousel':
    case 'bento-features':
    case 'features-carousel':
    case 'content-with-services':
    case 'split-content-checklist':
    case 'dropcap-services':
    case 'centered-testimonial':
    case 'content-video-services':
    case 'process-alternating':
    case 'hero-with-testimonials':
    case 'brand-identity-hero':
    case 'simple-centered-hero':
    case 'simple-header-divider':
    case 'header-top-info':
    case 'header-with-icons':
    case 'header-account-bar':
    case 'header-full-contact':
    case 'header-clickfunnel':
    case 'clickfunnels-hero':
    case 'clickfunnel-center-card':
    case 'click-funnel-testimonials':
    case 'clickfunnel-features':
    case 'clickfunnel-footer':
    case 'creative-network-hero':
    case 'immersive-split-showcase':
    case 'provider-masonry':
    case 'process-steps-cards':
    case 'editorial-cards-row':
    case 'minimal-final-cta':
    case 'cinematic-footer':
    case 'embed':
    case 'code-insert':
      return true;
    default:
      return false;
  }
}

function normalizeSectionsData(raw: unknown): PageBuilderSection[] {
  if (Array.isArray(raw)) {
    return raw as PageBuilderSection[];
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizeSectionsData(parsed);
    } catch {
      return [];
    }
  }

  if (raw && typeof raw === 'object') {
    const maybeRecord = raw as Record<string, unknown>;
    if (Array.isArray(maybeRecord.sections)) {
      return maybeRecord.sections as PageBuilderSection[];
    }
    if (Array.isArray(maybeRecord.sections_data)) {
      return maybeRecord.sections_data as PageBuilderSection[];
    }
  }

  return [];
}

function SectionRenderer({ section }: { section: PageBuilderSection }) {
  const noop = () => { };
  const sanitizedSection = sanitizeSectionUrls(section);
  const normalizedSection = normalizeSectionForTheme(sanitizedSection);
  const props = { section: normalizedSection, onUpdate: noop };

  switch (normalizedSection.type) {
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
    case 'image-text-split':
      return <ImageTextSplitWidget {...props} />;
    case 'content-showcase':
      return <ContentShowcaseWidget {...props} />;
    case 'centered-content':
      return <CenteredContentWidget {...props} />;
    case 'text-columns':
      return <TextColumnsWidget {...props} />;
    case 'services-grid':
      return <ServicesGridWidget {...props} />;
    case 'contact-split':
      return <ContactSplitWidget {...props} />;
    case 'feedback-contact':
      return <FeedbackContactWidget {...props} />;
    case 'services-cards':
      return <ServicesCardsWidget {...props} />;
    case 'membership-pricing':
      return <MembershipPricingWidget {...props} />;
    case 'faq-two-columns':
      return <FAQTwoColumnsWidget {...props} />;
    case 'integrations-grid':
      return <IntegrationsGridWidget {...props} />;
    case 'hero-with-services':
      return <HeroWithServicesWidget {...props} />;
    case 'image-stats-faq':
      return <ImageStatsFAQWidget {...props} />;
    case 'timeline-grid':
      return <TimelineGridWidget {...props} />;
    case 'newsletter-signup':
      return <NewsletterSignupWidget {...props} />;
    case 'social-follow':
      return <SocialFollowWidget {...props} />;
    case 'services-carousel':
      return <ServicesCarouselWidget {...props} />;
    case 'bento-features':
      return <BentoFeaturesWidget {...props} />;
    case 'features-carousel':
      return <FeaturesCarouselWidget {...props} />;
    case 'content-with-services':
      return <ContentWithServicesWidget {...props} />;
    case 'split-content-checklist':
      return <SplitContentWithChecklist {...props} />;
    case 'dropcap-services':
      return <DropCapWithServices {...props} />;
    case 'centered-testimonial':
      return <CenteredTestimonial {...props} />;
    case 'content-video-services':
      return <ContentVideoServices {...props} />;
    case 'process-alternating':
      return <ProcessAlternating {...props} />;
    case 'hero-with-testimonials':
      return <HeroWithTestimonials {...props} />;
    case 'brand-identity-hero':
      return <BrandIdentityHero {...props} />;
    case 'simple-centered-hero':
      return <SimpleCenteredHero {...props} />;
    case 'simple-header-divider':
      return <SimpleHeaderDivider {...props} />;
    case 'header-top-info':
      return <HeaderTopInfo {...props} />;
    case 'header-with-icons':
      return <HeaderWithIcons {...props} />;
    case 'header-account-bar':
      return <HeaderAccountBar {...props} />;
    case 'header-full-contact':
      return <HeaderFullContact {...props} />;
    case 'header-clickfunnel':
      return <HeaderClickFunnel {...props} />;
    case 'clickfunnels-hero':
      return <ClickFunnelsHero {...props} />;
    case 'clickfunnel-center-card':
      return <ClickFunnelCenterCard {...props} />;
    case 'click-funnel-testimonials':
      return <ClickFunnelTestimonials {...props} />;
    case 'clickfunnel-features':
      return <ClickFunnelFeatures {...props} />;
    case 'clickfunnel-footer':
      return <ClickFunnelFooter {...props} />;
    case 'creative-network-hero':
      return <CreativeNetworkHeroWidget {...props} />;
    case 'immersive-split-showcase':
      return <ImmersiveSplitShowcaseWidget {...props} />;
    case 'provider-masonry':
      return <ProviderMasonryWidget {...props} />;
    case 'process-steps-cards':
      return <ProcessStepsCardsWidget {...props} />;
    case 'editorial-cards-row':
      return <EditorialCardsRowWidget {...props} />;
    case 'minimal-final-cta':
      return <MinimalFinalCTAWidget {...props} />;
    case 'cinematic-footer':
      return <CinematicFooterWidget {...props} />;
    case 'embed':
      return <EmbedWidget {...props} />;
    case 'code-insert':
      return <CodeInsertWidget {...props} />;
    default:
      return null;
  }
}

function RenderSections({ sections }: { sections: PageBuilderSection[] }) {
  // Pre-compute overlay header indices so the next section knows to add padding
  const overlayHeaderIndices = new Set<number>();
  sections.forEach((section, i) => {
    const { isOverlayHeader } = getWidgetWrapperProps(section);
    if (isOverlayHeader) overlayHeaderIndices.add(i);
  });

  return (
    <>
      {sections.map((section, index) => {
        if (!section?.type) return null;
        const { normalizedSection, className, dataTheme, style, isOverlayHeader } = getWidgetWrapperProps(section);

        // If previous section was an overlay header, wrap this section in relative container with the header
        const isAfterOverlayHeader = overlayHeaderIndices.has(index - 1);

        const sectionEl = (
          <div
            className={className}
            key={normalizedSection.id || `section-${index}`}
            data-theme={dataTheme}
            data-widget-type={normalizedSection.type}
            data-widget-overlay={normalizedSection.design?.media?.overlayImage ? 'on' : undefined}
            data-widget-overlay-position={normalizedSection.design?.media?.overlayPosition || 'bottom-right'}
            style={style as React.CSSProperties}
          >
            {/* Background image layer with opacity */}
            {normalizedSection.design?.background?.type === 'image' && normalizedSection.design.background.value && (
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${normalizedSection.design.background.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: normalizedSection.design.background.opacity ?? 1,
                }}
              />
            )}
            {/* Background overlay for images/videos */}
            {normalizedSection.design?.background?.overlayColor && ['image', 'video'].includes(normalizedSection.design.background.type) && (
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  backgroundColor: normalizedSection.design.background.overlayColor,
                  opacity: normalizedSection.design.background.overlayOpacity ?? 0.5,
                }}
              />
            )}
            {/* Video background */}
            {normalizedSection.design?.background?.type === 'video' && normalizedSection.design.background.value && (
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {normalizedSection.design.background.value.includes('youtube') || normalizedSection.design.background.value.includes('youtu.be') ? (
                  <iframe
                    src={`${normalizedSection.design.background.value.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&showinfo=0&rel=0&playlist=${normalizedSection.design.background.value.split(/[=/]/).pop()}`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: normalizedSection.design.background.videoFullWidth ? '100vw' : '177.78vh',
                      height: normalizedSection.design.background.videoFullWidth ? '56.25vw' : '100vh',
                      minWidth: '100%',
                      minHeight: '100%',
                      border: 'none',
                    }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={normalizedSection.design.background.value}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className={['image', 'video'].includes(normalizedSection.design?.background?.type) ? 'relative z-10' : ''}>
              <SectionRenderer section={normalizedSection} />
            </div>
          </div>
        );

        // Skip rendering overlay headers here — they render inside the next section's wrapper
        if (isOverlayHeader) return null;

        // Wrap section with the preceding overlay header
        if (isAfterOverlayHeader) {
          const headerSection = sections[index - 1];
          const headerProps = getWidgetWrapperProps(headerSection);
          return (
            <div key={`overlay-group-${index}`} className="relative">
              <div
                className={headerProps.className}
                data-theme={headerProps.dataTheme}
                data-widget-type={headerProps.normalizedSection.type}
                style={headerProps.style as React.CSSProperties}
              >
                <SectionRenderer section={headerProps.normalizedSection} />
              </div>
              {sectionEl}
            </div>
          );
        }

        return sectionEl;
      })}
    </>
  );
}

/** Floating scroll-to-top button, shows after scrolling down 400px */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-40 bg-base-300 hover:bg-base-content hover:text-base-100 text-base-content/70 p-3 rounded-full shadow-lg transition-all hover:scale-110"
      title="Retour en haut"
      aria-label="Retour en haut"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

function FallbackPage({ page }: { page: SEOMetadata }) {
  return (
    <div>
      <section className="bg-base-100 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-base-content mb-6 leading-tight">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-xl text-base-content/70 leading-relaxed max-w-2xl mx-auto">
              {page.description}
            </p>
          )}
        </div>
      </section>

      {page.content && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </section>
      )}

      {page.keywords && page.keywords.length > 0 && (
        <section className="py-12 px-6 bg-base-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {page.keywords.map((keyword, i) => (
                <span key={i} className="px-4 py-2 bg-base-100 text-base-content/70 text-sm rounded-full border border-base-content/10">
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
  const sections = normalizeSectionsData(page.sections_data ?? page.template?.sections_data);
  const hasSections = sections.length > 0;
  const hasRenderableSections = sections.some((section) => canRenderSectionType(section?.type));
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Get the DaisyUI theme to apply to this page
  const daisyThemeSlug = page.daisy_theme_slug || undefined;

  return (
    <div
      className="min-h-screen bg-base-100 text-base-content page-themed"
      data-theme={daisyThemeSlug || 'light'}
    >
      <PageThemeInjector themeId={pageThemeId} />
      <ScrollToTopButton />
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
        {hasSections && hasRenderableSections ? (
          <RenderSections sections={sections} />
        ) : (
          <FallbackPage page={page} />
        )}
      </div>
    </div>
  );
}
