import { Facebook, Twitter, Youtube } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface BrandIdentityHeroProps {
  section: PageBuilderSection;
}

const socialIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export default function BrandIdentityHero({ section }: BrandIdentityHeroProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;
  const circleBg = design.colors?.circleBg || undefined;
  const circleText = design.colors?.circleText || undefined;

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8 mb-8 md:mb-16">
          <div className="space-y-2 sm:space-y-4">
            {content.badge1 && (
              <p className="text-sm sm:text-base md:text-lg font-bold text-base-content" style={{ color: headingColor }}>
                {content.badge1}
              </p>
            )}
          </div>

          {content.circleText && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center flex-shrink-0 bg-primary" style={{ backgroundColor: circleBg }}>
              <span className="text-sm sm:text-base md:text-xl font-bold text-center px-3 sm:px-4 text-primary-content" style={{ color: circleText }}>
                {content.circleText}
              </span>
            </div>
          )}

          {content.badge2 && (
            <div className="space-y-2 sm:space-y-4">
              <p className="text-sm sm:text-base md:text-lg font-bold text-base-content" style={{ color: headingColor }}>
                {content.badge2}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-light leading-tight mb-2 sm:mb-4 text-base-content" style={{ color: headingColor }}>
            {content.title1 || 'CORPORATE BRAND'}
          </h1>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight text-base-content" style={{ color: headingColor }}>
            {content.title2 && content.accent && (
              <span>{content.accent} </span>
            )}
            {content.title2 || 'IDENTITY SERVICES'}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {content.ctaLinks?.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url || '#'}
                className={`text-sm sm:text-base font-semibold text-base-content ${index === 1 ? 'border-2 border-base-content px-6 py-3 rounded' : ''}`}
                style={{ color: headingColor }}
              >
                {link.text}
              </a>
            ))}
          </div>

          {content.socialLinks && content.socialLinks.length > 0 && (
            <div className="flex items-center gap-4 sm:gap-6">
              {content.socialLinks.map((social: any, index: number) => {
                const IconComponent = socialIconMap[social.icon] || Facebook;
                return (
                  <a key={index} href={social.url || '#'} className="hover:opacity-70 transition">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-base-content" style={{ color: headingColor }} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
