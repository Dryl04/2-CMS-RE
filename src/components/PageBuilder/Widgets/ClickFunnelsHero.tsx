import { ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ClickFunnelsHeroProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function ClickFunnelsHero({ section }: ClickFunnelsHeroProps) {
  const { content, design } = section;

  const bgColor = design?.background?.type === 'color' ? design.background.value : '#1B2A4E';
  const titleColor = design?.typography?.headingColor || '#FFFFFF';
  const subtitleColor = design?.typography?.subtitleColor || '#93C5FD';
  const textColor = design?.typography?.textColor || '#FFFFFF';
  const linkColor = design?.typography?.linkColor || '#9CA3AF';
  const buttonBg = design?.colors?.buttonBg || '#F59E0B';
  const buttonText = design?.colors?.buttonText || '#000000';
  const inputBg = design?.colors?.inputBg || '#FFFFFF';
  const inputText = design?.colors?.inputText || '#374151';
  const decorLeftColor = design?.colors?.decorLeftColor || '#DC2626';
  const decorRightColor = design?.colors?.decorRightColor || '#3B82F6';

  return (
    <div
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {content.showLeftDecor !== false && (
        <>
          <div
            className="absolute left-0 bottom-0 w-0 h-0"
            style={{
              borderLeft: '120px solid transparent',
              borderRight: '120px solid transparent',
              borderBottom: `200px solid ${decorLeftColor}`,
              transform: 'rotate(-90deg) translateX(-50%)',
              transformOrigin: 'left center',
              opacity: 0.7,
            }}
          />
          <div
            className="absolute left-0 bottom-20 w-32 h-32"
            style={{
              background: `radial-gradient(circle, ${decorLeftColor}40 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {content.showRightDecor !== false && (
        <>
          <div
            className="absolute right-0 top-0 w-0 h-0"
            style={{
              borderLeft: '100px solid transparent',
              borderRight: '100px solid transparent',
              borderTop: `180px solid ${decorRightColor}`,
              transform: 'rotate(90deg) translateX(50%)',
              transformOrigin: 'right center',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute right-0 top-20 w-40 h-40"
            style={{
              background: `radial-gradient(circle, ${decorRightColor}30 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
          style={{ color: titleColor }}
        >
          {content.title || "You're one funnel away from"}
        </h1>

        <h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight"
          style={{ color: subtitleColor }}
        >
          {content.subtitle || 'building recurring revenue'}
        </h2>

        {content.tagline && (
          <p
            className="text-xl md:text-2xl mb-8 font-medium"
            style={{ color: textColor }}
          >
            {content.tagline}
          </p>
        )}

        <div className="max-w-3xl mx-auto">
          <style>
            {`
              .clickfunnels-hero-input::placeholder {
                color: ${design?.colors?.inputPlaceholder || '#9CA3AF'};
                opacity: 1;
              }
            `}
          </style>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="email"
              placeholder={content.inputPlaceholder || 'Enter your Email Address'}
              className="clickfunnels-hero-input flex-1 px-6 py-4 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{
                backgroundColor: inputBg,
                color: inputText,
                borderColor: 'transparent',
              }}
            />
            <button
              className="inline-flex items-center justify-center px-8 py-4 rounded-md text-base font-bold transition-all hover:opacity-90 shadow-lg whitespace-nowrap"
              style={{
                backgroundColor: buttonBg,
                color: buttonText,
              }}
            >
              {content.buttonText || 'Get Started'}
              {content.showButtonArrow !== false && (
                <ArrowRight className="ml-2 w-5 h-5" />
              )}
            </button>
          </div>

          {content.showSecondaryLink !== false && (
            <div className="text-sm md:text-base">
              <span style={{ color: textColor }}>
                {content.secondaryLinkPrefix || 'Not ready to get started?'}
              </span>{' '}
              <a
                href={content.secondaryLink || '#'}
                className="underline hover:no-underline transition-all"
                style={{ color: linkColor }}
              >
                {content.secondaryLinkText || 'Learn More'}
              </a>
            </div>
          )}
        </div>

        {content.showTrustBadges && content.trustBadges && content.trustBadges.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-70">
            {content.trustBadges.map((badge: any, index: number) => (
              <div key={index} className="text-sm" style={{ color: textColor }}>
                {badge.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
