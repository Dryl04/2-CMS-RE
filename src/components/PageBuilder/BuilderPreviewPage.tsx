import React, { useEffect, useState } from 'react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import { getWidgetWrapperProps } from '../../lib/widgetThemeHelper';
import { getThemeInlineVars, type DaisyThemeTokens } from '../../lib/daisyThemes';
import HeaderWidget from './Widgets/HeaderWidget';
import HeroWidget from './Widgets/HeroWidget';
import FeaturesWidget from './Widgets/FeaturesWidget';
import CTAWidget from './Widgets/CTAWidget';
import TestimonialsWidget from './Widgets/TestimonialsWidget';
import ContactWidget from './Widgets/ContactWidget';
import FooterWidget from './Widgets/FooterWidget';
import PricingWidget from './Widgets/PricingWidget';
import StatsWidget from './Widgets/StatsWidget';
import TeamWidget from './Widgets/TeamWidget';
import FAQWidget from './Widgets/FAQWidget';
import LogoCloudWidget from './Widgets/LogoCloudWidget';
import VideoHeroWidget from './Widgets/VideoHeroWidget';
import GalleryWidget from './Widgets/GalleryWidget';
import TimelineWidget from './Widgets/TimelineWidget';
import NewsletterWidget from './Widgets/NewsletterWidget';
import ProcessWidget from './Widgets/ProcessWidget';
import ImageTextSplitWidget from './Widgets/ImageTextSplitWidget';
import ContentShowcaseWidget from './Widgets/ContentShowcaseWidget';
import CenteredContentWidget from './Widgets/CenteredContentWidget';
import TextColumnsWidget from './Widgets/TextColumnsWidget';
import ServicesGridWidget from './Widgets/ServicesGridWidget';
import ContactSplitWidget from './Widgets/ContactSplitWidget';
import FeedbackContactWidget from './Widgets/FeedbackContactWidget';
import ServicesCardsWidget from './Widgets/ServicesCardsWidget';
import MembershipPricingWidget from './Widgets/MembershipPricingWidget';
import FAQTwoColumnsWidget from './Widgets/FAQTwoColumnsWidget';
import IntegrationsGridWidget from './Widgets/IntegrationsGridWidget';
import HeroWithServicesWidget from './Widgets/HeroWithServicesWidget';
import ImageStatsFAQWidget from './Widgets/ImageStatsFAQWidget';
import TimelineGridWidget from './Widgets/TimelineGridWidget';
import NewsletterSignupWidget from './Widgets/NewsletterSignupWidget';
import SocialFollowWidget from './Widgets/SocialFollowWidget';
import ServicesCarouselWidget from './Widgets/ServicesCarouselWidget';
import BentoFeaturesWidget from './Widgets/BentoFeaturesWidget';
import FeaturesCarouselWidget from './Widgets/FeaturesCarouselWidget';
import ContentWithServicesWidget from './Widgets/ContentWithServicesWidget';
import SplitContentWithChecklist from './Widgets/SplitContentWithChecklist';
import DropCapWithServices from './Widgets/DropCapWithServices';
import CenteredTestimonial from './Widgets/CenteredTestimonial';
import ContentVideoServices from './Widgets/ContentVideoServices';
import ProcessAlternating from './Widgets/ProcessAlternating';
import HeroWithTestimonials from './Widgets/HeroWithTestimonials';
import BrandIdentityHero from './Widgets/BrandIdentityHero';
import SimpleCenteredHero from './Widgets/SimpleCenteredHero';
import SimpleHeaderDivider from './Widgets/SimpleHeaderDivider';
import HeaderTopInfo from './Widgets/HeaderTopInfo';
import HeaderWithIcons from './Widgets/HeaderWithIcons';
import HeaderAccountBar from './Widgets/HeaderAccountBar';
import HeaderFullContact from './Widgets/HeaderFullContact';
import HeaderClickFunnel from './Widgets/HeaderClickFunnel';
import ClickFunnelsHero from './Widgets/ClickFunnelsHero';
import ClickFunnelCenterCard from './Widgets/ClickFunnelCenterCard';
import ClickFunnelTestimonials from './Widgets/ClickFunnelTestimonials';
import ClickFunnelFeatures from './Widgets/ClickFunnelFeatures';
import ClickFunnelFooter from './Widgets/ClickFunnelFooter';
import CreativeNetworkHeroWidget from './Widgets/CreativeNetworkHeroWidget';
import ImmersiveSplitShowcaseWidget from './Widgets/ImmersiveSplitShowcaseWidget';
import ProviderMasonryWidget from './Widgets/ProviderMasonryWidget';
import ProcessStepsCardsWidget from './Widgets/ProcessStepsCardsWidget';
import EditorialCardsRowWidget from './Widgets/EditorialCardsRowWidget';
import MinimalFinalCTAWidget from './Widgets/MinimalFinalCTAWidget';
import CinematicFooterWidget from './Widgets/CinematicFooterWidget';
import EmbedWidget from './Widgets/EmbedWidget';
import CodeInsertWidget from './Widgets/CodeInsertWidget';

export interface BuilderPreviewData {
  sections: PageBuilderSection[];
  daisyThemeSlug: string | null;
  customThemesCSS: string;
  themeTokens?: DaisyThemeTokens;
}

const STORAGE_KEY = '__builder_preview_data__';

export function savePreviewData(data: BuilderPreviewData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}

function loadPreviewData(): BuilderPreviewData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderPreviewData;
  } catch {
    return null;
  }
}

function renderWidget(section: PageBuilderSection) {
  const noop = () => { };
  const props = { section, onUpdate: noop };
  switch (section.type) {
    case 'header': return <HeaderWidget {...props} />;
    case 'hero': return <HeroWidget {...props} />;
    case 'features': return <FeaturesWidget {...props} />;
    case 'cta': return <CTAWidget {...props} />;
    case 'testimonials': return <TestimonialsWidget {...props} />;
    case 'contact': return <ContactWidget {...props} />;
    case 'footer': return <FooterWidget {...props} />;
    case 'pricing': return <PricingWidget {...props} />;
    case 'stats': return <StatsWidget {...props} />;
    case 'team': return <TeamWidget {...props} />;
    case 'faq': return <FAQWidget {...props} />;
    case 'logocloud': return <LogoCloudWidget {...props} />;
    case 'videohero': return <VideoHeroWidget {...props} />;
    case 'gallery': return <GalleryWidget {...props} />;
    case 'timeline': return <TimelineWidget {...props} />;
    case 'newsletter': return <NewsletterWidget {...props} />;
    case 'process': return <ProcessWidget {...props} />;
    case 'image-text-split': return <ImageTextSplitWidget {...props} />;
    case 'content-showcase': return <ContentShowcaseWidget {...props} />;
    case 'centered-content': return <CenteredContentWidget {...props} />;
    case 'text-columns': return <TextColumnsWidget {...props} />;
    case 'services-grid': return <ServicesGridWidget {...props} />;
    case 'contact-split': return <ContactSplitWidget {...props} />;
    case 'feedback-contact': return <FeedbackContactWidget {...props} />;
    case 'services-cards': return <ServicesCardsWidget {...props} />;
    case 'membership-pricing': return <MembershipPricingWidget {...props} />;
    case 'faq-two-columns': return <FAQTwoColumnsWidget {...props} />;
    case 'integrations-grid': return <IntegrationsGridWidget {...props} />;
    case 'hero-with-services': return <HeroWithServicesWidget {...props} />;
    case 'image-stats-faq': return <ImageStatsFAQWidget {...props} />;
    case 'timeline-grid': return <TimelineGridWidget {...props} />;
    case 'newsletter-signup': return <NewsletterSignupWidget {...props} />;
    case 'social-follow': return <SocialFollowWidget {...props} />;
    case 'services-carousel': return <ServicesCarouselWidget {...props} />;
    case 'bento-features': return <BentoFeaturesWidget {...props} />;
    case 'features-carousel': return <FeaturesCarouselWidget {...props} />;
    case 'content-with-services': return <ContentWithServicesWidget {...props} />;
    case 'split-content-checklist': return <SplitContentWithChecklist {...props} />;
    case 'dropcap-services': return <DropCapWithServices {...props} />;
    case 'centered-testimonial': return <CenteredTestimonial {...props} />;
    case 'content-video-services': return <ContentVideoServices {...props} />;
    case 'process-alternating': return <ProcessAlternating {...props} />;
    case 'hero-with-testimonials': return <HeroWithTestimonials {...props} />;
    case 'brand-identity-hero': return <BrandIdentityHero {...props} />;
    case 'simple-centered-hero': return <SimpleCenteredHero {...props} />;
    case 'simple-header-divider': return <SimpleHeaderDivider {...props} />;
    case 'header-top-info': return <HeaderTopInfo {...props} />;
    case 'header-with-icons': return <HeaderWithIcons {...props} />;
    case 'header-account-bar': return <HeaderAccountBar {...props} />;
    case 'header-full-contact': return <HeaderFullContact {...props} />;
    case 'header-clickfunnel': return <HeaderClickFunnel {...props} />;
    case 'clickfunnels-hero': return <ClickFunnelsHero {...props} />;
    case 'clickfunnel-center-card': return <ClickFunnelCenterCard {...props} />;
    case 'click-funnel-testimonials': return <ClickFunnelTestimonials {...props} />;
    case 'clickfunnel-features': return <ClickFunnelFeatures {...props} />;
    case 'clickfunnel-footer': return <ClickFunnelFooter {...props} />;
    case 'creative-network-hero': return <CreativeNetworkHeroWidget {...props} />;
    case 'immersive-split-showcase': return <ImmersiveSplitShowcaseWidget {...props} />;
    case 'provider-masonry': return <ProviderMasonryWidget {...props} />;
    case 'process-steps-cards': return <ProcessStepsCardsWidget {...props} />;
    case 'editorial-cards-row': return <EditorialCardsRowWidget {...props} />;
    case 'minimal-final-cta': return <MinimalFinalCTAWidget {...props} />;
    case 'cinematic-footer': return <CinematicFooterWidget {...props} />;
    case 'embed': return <EmbedWidget {...props} />;
    case 'code-insert': return <CodeInsertWidget {...props} />;
    default: return null;
  }
}

export default function BuilderPreviewPage() {
  const [data, setData] = useState<BuilderPreviewData | null>(null);

  useEffect(() => {
    const loaded = loadPreviewData();
    setData(loaded);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'BUILDER_PREVIEW_UPDATE') {
        setData(e.data.payload as BuilderPreviewData);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!data?.customThemesCSS) return;
    let styleEl = document.getElementById('builder-preview-themes') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'builder-preview-themes';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = data.customThemesCSS;
  }, [data?.customThemesCSS]);

  if (!data) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <p className="text-base-content/50">Chargement de l'aperçu...</p>
      </div>
    );
  }

  const themeVars = data.themeTokens ? getThemeInlineVars(data.themeTokens) : {};

  // Pre-compute overlay header indices for grouping with next section
  const overlayHeaderIndices = new Set<number>();
  data.sections.forEach((section, i) => {
    const { isOverlayHeader } = getWidgetWrapperProps(section);
    if (isOverlayHeader) overlayHeaderIndices.add(i);
  });

  return (
    <div
      className="min-h-screen bg-base-100 text-base-content page-themed"
      data-theme={data.daisyThemeSlug || 'light'}
      style={themeVars}
    >
      {data.sections.map((section, index) => {
        if (!section?.type) return null;
        const { normalizedSection, className, dataTheme, style, isOverlayHeader } = getWidgetWrapperProps(section);

        // Skip rendering overlay headers standalone — they render inside the next section's wrapper
        if (isOverlayHeader) return null;

        const isAfterOverlayHeader = overlayHeaderIndices.has(index - 1);

        const sectionEl = (
          <div
            key={normalizedSection.id || `section-${index}`}
            className={className}
            data-theme={dataTheme || data.daisyThemeSlug || 'light'}
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
              {renderWidget(normalizedSection)}
            </div>
          </div>
        );

        // Wrap section with the preceding overlay header
        if (isAfterOverlayHeader) {
          const headerSection = data.sections[index - 1];
          const headerProps = getWidgetWrapperProps(headerSection);
          return (
            <div key={`overlay-group-${index}`} className="relative">
              <div
                className={headerProps.className}
                data-theme={headerProps.dataTheme || data.daisyThemeSlug || 'light'}
                data-widget-type={headerProps.normalizedSection.type}
                style={headerProps.style as React.CSSProperties}
              >
                {renderWidget(headerProps.normalizedSection)}
              </div>
              {sectionEl}
            </div>
          );
        }

        return sectionEl;
      })}
    </div>
  );
}
