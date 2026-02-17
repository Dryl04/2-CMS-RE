import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface CTAWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function CTAWidget({ section }: CTAWidgetProps) {
  const { headline, description, primaryCta, primaryLink, secondaryCta, secondaryLink } = section.content;

  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;

  const headingStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;

  const renderBanner = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2 text-base-content"
            style={headingStyle}
          >
            {headline || 'Ready to Get Started?'}
          </h2>
          <h2
            className="text-base sm:text-lg font-normal text-base-content/80"
            style={textStyle}
          >
            {description || 'Join thousands of satisfied customers today'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <a
            href={primaryLink || '#'}
            className="btn btn-primary px-6 sm:px-8 rounded-xl font-semibold whitespace-nowrap"
          >
            {primaryCta || 'Start Free Trial'}
          </a>
          {secondaryCta && (
            <a
              href={secondaryLink || '#'}
              className="btn btn-ghost font-semibold whitespace-nowrap text-base-content"
              style={headingStyle}
            >
              {secondaryCta}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const renderCentered = () => (
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h2
        className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
        style={headingStyle}
      >
        {headline || 'Ready to Get Started?'}
      </h2>
      <h2
        className="text-lg sm:text-xl mb-8 font-normal text-base-content/80"
        style={textStyle}
      >
        {description || 'Join thousands of satisfied customers today'}
      </h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a
          href={primaryLink || '#'}
          className="btn btn-primary px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
        >
          {primaryCta || 'Start Free Trial'}
        </a>
        {secondaryCta && (
          <a
            href={secondaryLink || '#'}
            className="btn btn-outline px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
          >
            {secondaryCta}
          </a>
        )}
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {headline || 'Ready to Get Started?'}
        </h2>
        <h2
          className="text-lg sm:text-xl mb-8 font-normal text-base-content/80"
          style={textStyle}
        >
          {description || 'Join thousands of satisfied customers today'}
        </h2>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <a
            href={primaryLink || '#'}
            className="btn btn-primary px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
          >
            {primaryCta || 'Start Free Trial'}
          </a>
          {secondaryCta && (
            <a
              href={secondaryLink || '#'}
              className="btn btn-ghost font-semibold flex items-center py-3 sm:py-4 text-base-content"
              style={headingStyle}
            >
              {secondaryCta} &rarr;
            </a>
          )}
        </div>
      </div>
      <div className="bg-base-300 rounded-2xl h-48 sm:h-64" />
    </div>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'split':
      return renderSplit();
    default:
      return renderBanner();
  }
}
