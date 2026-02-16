import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface CenteredContentWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function CenteredContentWidget({ section }: CenteredContentWidgetProps) {
  const {
    subtitle,
    headline,
    description,
    ctaText,
    ctaLink,
    image
  } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const subtitleColor = section.design?.typography?.subtitleColor || undefined;
  const buttonBg = section.design?.colors?.buttonBackground || undefined;
  const buttonText = section.design?.colors?.buttonText || undefined;
  const buttonBorder = section.design?.colors?.buttonBorder || undefined;

  const buttonStyle =
    buttonBg || buttonText || buttonBorder
      ? {
          backgroundColor: buttonBg,
          color: buttonText,
          border: buttonBorder ? `2px solid ${buttonBorder}` : undefined,
        }
      : undefined;

  const renderDefault = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
      <div className="space-y-6">
        <p
          className="text-xs lg:text-sm tracking-widest uppercase font-medium text-base-content/70"
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitle || 'SAMPLE SUBTITLE'}
        </p>
        <h2
          className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Development of Multimedia Interactive Content'}
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <img
          src={image || 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-64 lg:h-96 object-cover rounded-2xl"
        />
      </div>

      <div className="space-y-8">
        <p
          className="text-sm lg:text-lg leading-relaxed max-w-3xl mx-auto text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {description || 'Lorem ipsum dolor sit amet consec tetur adipis cing elit sed do eiusmod tempor ut labore et magna aliqua minim veniam nostrud exercitation ullamco laboris velit esse cillum nulla pariatur.'}
        </p>

        <a
          href={ctaLink || '#'}
          className="inline-block px-12 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:opacity-80 transform hover:scale-105 bg-primary text-primary-content border-2 border-primary"
          style={buttonStyle}
        >
          {ctaText || 'Learn More'}
        </a>
      </div>
    </div>
  );

  const renderCompact = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
      <div className="space-y-4">
        <p
          className="text-xs lg:text-sm tracking-widest uppercase font-medium text-base-content/70"
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitle || 'SAMPLE SUBTITLE'}
        </p>
        <h2
          className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Development of Multimedia Interactive Content'}
        </h2>
      </div>

      <div className="relative">
        <img
          src={image || 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-56 lg:h-80 object-cover rounded-2xl"
        />
      </div>

      <div className="space-y-6">
        <p
          className="text-sm lg:text-base leading-relaxed text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {description || 'Lorem ipsum dolor sit amet consec tetur adipis cing elit sed do eiusmod tempor ut labore et magna aliqua minim veniam.'}
        </p>

        <a
          href={ctaLink || '#'}
          className="inline-block px-10 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:opacity-80 bg-primary text-primary-content border-2 border-primary"
          style={buttonStyle}
        >
          {ctaText || 'Learn More'}
        </a>
      </div>
    </div>
  );

  const renderWide = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
      <div className="space-y-6">
        <p
          className="text-xs lg:text-sm tracking-widest uppercase font-medium text-base-content/70"
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitle || 'SAMPLE SUBTITLE'}
        </p>
        <h2
          className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Development of Multimedia Interactive Content'}
        </h2>
      </div>

      <div className="relative">
        <img
          src={image || 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-72 lg:h-[500px] object-cover rounded-3xl"
        />
      </div>

      <div className="space-y-8">
        <p
          className="text-base lg:text-xl leading-relaxed max-w-4xl mx-auto text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {description || 'Lorem ipsum dolor sit amet consec tetur adipis cing elit sed do eiusmod tempor ut labore et magna aliqua minim veniam nostrud exercitation ullamco laboris velit esse cillum nulla pariatur.'}
        </p>

        <a
          href={ctaLink || '#'}
          className="inline-block px-14 py-5 rounded-full font-semibold text-lg transition-all duration-300 hover:opacity-80 transform hover:scale-105 bg-primary text-primary-content border-2 border-primary"
          style={buttonStyle}
        >
          {ctaText || 'Learn More'}
        </a>
      </div>
    </div>
  );

  switch (section.variant) {
    case 'compact':
      return renderCompact();
    case 'wide':
      return renderWide();
    default:
      return renderDefault();
  }
}
