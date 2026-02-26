import { Facebook, Twitter, Youtube } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

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
  const typo = design.typography || {};
  const h1Style = {
    ...(typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h1FontWeight || typo.headingFontWeight ? { fontWeight: typo.h1FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h1FontSize || typo.headingFontSize ? { fontSize: typo.h1FontSize || typo.headingFontSize } : {}),
    ...(typo.h1Color || typo.headingColor ? { color: typo.h1Color || typo.headingColor } : {}),
  };
  const h2Style = {
    ...(typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h2FontWeight || typo.headingFontWeight ? { fontWeight: typo.h2FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h2FontSize || typo.headingFontSize ? { fontSize: typo.h2FontSize || typo.headingFontSize } : {}),
    ...(typo.h2Color || typo.subtitleColor || typo.headingColor ? { color: typo.h2Color || typo.subtitleColor || typo.headingColor } : {}),
  };
  const headingStyle = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const linkStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const circleBg = design.colors?.circleBg;
  const circleText = design.colors?.circleText;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8 mb-8 md:mb-16">
          <div className="space-y-2 sm:space-y-4">
            {content.badge1 && (
              <p className="text-sm sm:text-base md:text-lg font-bold text-base-content" style={textStyle}>
                {renderRichText(content.badge1)}
              </p>
            )}
          </div>

          {content.circleText && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center flex-shrink-0 bg-primary" style={circleBg ? { backgroundColor: circleBg } : undefined}>
              <span className="text-sm sm:text-base md:text-xl font-bold text-center px-3 sm:px-4 text-primary-content" style={circleText ? { color: circleText } : undefined}>
                {renderRichText(content.circleText)}
              </span>
            </div>
          )}

          {content.badge2 && (
            <div className="space-y-2 sm:space-y-4">
              <p className="text-sm sm:text-base md:text-lg font-bold text-base-content" style={textStyle}>
                {renderRichText(content.badge2)}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-light leading-tight mb-2 sm:mb-4 text-base-content" style={h1Style}>
            {renderRichText(content.title1, 'CORPORATE BRAND')}
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight text-base-content" style={h2Style}>
            {content.title2 && content.accent && (
              <span>{renderRichText(content.accent)} </span>
            )}
            {renderRichText(content.title2, 'IDENTITY SERVICES')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {content.ctaLinks?.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url || '#'}
                className={`text-sm sm:text-base font-semibold text-base-content ${index === 1 ? 'border-2 border-base-content px-6 py-3 rounded' : ''}`}
                style={linkStyle}
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
                  <a key={index} href={social.url || '#'} className="hover:opacity-70 transition" style={linkStyle}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-base-content" style={headingStyle} />
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
