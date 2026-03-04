import { useState } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Pencil as Edit3 } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import {
  getBackgroundContentClassName,
  renderBackgroundLayers,
} from '@/lib/backgroundLayers';
import { getWidgetWrapperProps } from '@/lib/widgetThemeHelper';
import HeaderWidget from './Widgets/HeaderWidget';
import HeroWidget from './Widgets/HeroWidget';
import ClickFunnelsHero from './Widgets/ClickFunnelsHero';
import ClickFunnelCenterCard from './Widgets/ClickFunnelCenterCard';
import ClickFunnelTestimonials from './Widgets/ClickFunnelTestimonials';
import ClickFunnelFeatures from './Widgets/ClickFunnelFeatures';
import ClickFunnelFooter from './Widgets/ClickFunnelFooter';
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
import CreativeNetworkHeroWidget from './Widgets/CreativeNetworkHeroWidget';
import ImmersiveSplitShowcaseWidget from './Widgets/ImmersiveSplitShowcaseWidget';
import ProviderMasonryWidget from './Widgets/ProviderMasonryWidget';
import ProcessStepsCardsWidget from './Widgets/ProcessStepsCardsWidget';
import EditorialCardsRowWidget from './Widgets/EditorialCardsRowWidget';
import MinimalFinalCTAWidget from './Widgets/MinimalFinalCTAWidget';
import CinematicFooterWidget from './Widgets/CinematicFooterWidget';
import EmbedWidget from './Widgets/EmbedWidget';
import CodeInsertWidget from './Widgets/CodeInsertWidget';

interface SectionRendererProps {
  section: PageBuilderSection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
  previewMode?: boolean;
  canvasThemeSlug?: string | null;
}

export default function SectionRenderer({
  section,
  isSelected,
  onSelect,
  onDelete = () => { },
  onDuplicate = () => { },
  onUpdate = () => { },
  previewMode = false,
  canvasThemeSlug,
}: SectionRendererProps) {
  const modal = useModal();
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { normalizedSection, className: wrapperClassName, dataTheme, style: wrapperStyle, isOverlayHeader } = getWidgetWrapperProps(section);

  const renderWidget = () => {
    const props = {
      section: normalizedSection,
      onUpdate,
    };

    switch (normalizedSection.type) {
      case 'header':
        return <HeaderWidget {...props} />;
      case 'hero':
        return <HeroWidget {...props} />;
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
        return (
          <div className="p-12 text-center text-gray-500">
            Widget type "{section.type}" not implemented
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={previewMode ? 'relative' : 'relative group'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {!previewMode && (isHovered || isSelected) && (
        <div className={`absolute -top-11 left-0 right-0 ${isHovered ? 'z-[51]' : 'z-[45]'} flex items-center justify-between bg-white rounded-t-lg shadow-lg border border-gray-200 px-3 py-2 mx-0.5`}>
          <div className="flex items-center space-x-2">
            {isSelected && (
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded font-medium">
                {section.type} - {section.variant}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              {...attributes}
              {...listeners}
              className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
              title="Déplacer"
            >
              <GripVertical className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Éditer"
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (await modal.confirm('Supprimer cette section ?', 'Supprimer la section')) {
                  onDelete();
                }
              }}
              className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`relative ${isOverlayHeader ? 'overflow-visible' : 'overflow-hidden'} transition-all ${!previewMode && isSelected
          ? 'ring-2 ring-black shadow-lg'
          : !previewMode && isHovered
            ? 'ring-2 ring-gray-300'
            : ''
          }`}
      >

        <div
          className={wrapperClassName}
          data-theme={dataTheme || canvasThemeSlug || undefined}
          data-widget-type={normalizedSection.type}
          data-widget-overlay={(normalizedSection.design?.media?.overlayImage && normalizedSection.design?.media?.overlayTarget !== 'media') ? 'on' : undefined}
          data-widget-overlay-mode={
            normalizedSection.design?.media?.overlayImage
              ? (normalizedSection.design?.media?.overlayTarget === 'media' ? 'media' : 'section')
              : undefined
          }
          data-widget-overlay-position={normalizedSection.design?.media?.overlayPosition || 'center'}
          data-widget-overlay-z={normalizedSection.design?.media?.overlayZIndex || 'above-bg'}
          style={wrapperStyle as React.CSSProperties}
        >
          {renderBackgroundLayers(normalizedSection.design?.background)}
          <div className={getBackgroundContentClassName(normalizedSection.design?.background)}>
            {renderWidget()}
          </div>
        </div>
      </div>
    </div>
  );
}
