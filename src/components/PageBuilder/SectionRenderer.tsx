import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Edit3 } from 'lucide-react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import { getWidgetThemeProps } from '../../lib/widgetThemeHelper';
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

interface SectionRendererProps {
  section: PageBuilderSection;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function SectionRenderer({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdate,
}: SectionRendererProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderWidget = () => {
    const props = {
      section,
      onUpdate,
    };

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
      className="relative group mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {(isHovered || isSelected) && (
        <div className="absolute -top-11 left-0 right-0 z-20 flex items-center justify-between bg-white rounded-t-lg shadow-lg border border-gray-200 px-3 py-2 mx-0.5">
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
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Supprimer cette section ?')) {
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
        className={`relative bg-white rounded-lg overflow-hidden transition-all ${
          isSelected
            ? 'ring-2 ring-black shadow-lg'
            : isHovered
            ? 'ring-2 ring-gray-300'
            : ''
        }`}
      >

        <div
          data-theme={getWidgetThemeProps(section).dataTheme}
          style={{
            backgroundColor: section.design.background.type === 'color' ? section.design.background.value : undefined,
            paddingTop: section.design.spacing.paddingTop,
            paddingBottom: section.design.spacing.paddingBottom,
            marginTop: section.design.spacing.marginTop,
            marginBottom: section.design.spacing.marginBottom,
            ...getWidgetThemeProps(section).customStyles,
          }}
        >
          {renderWidget()}
        </div>
      </div>
    </div>
  );
}
