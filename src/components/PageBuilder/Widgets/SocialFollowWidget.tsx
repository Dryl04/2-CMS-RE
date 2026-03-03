import React from 'react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { renderIcon } from '@/lib/iconLibrary';

interface SocialFollowWidgetProps {
  section: PageBuilderSection;
}

export default function SocialFollowWidget({ section }: SocialFollowWidgetProps) {
  const { content, design } = section;
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const buttonBg = design.colors?.buttonBackground;
  const buttonText = design.colors?.buttonText;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-content" style={headingStyle}>
            {renderRichText(content.title, 'Follow Us')}
          </h2>

          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 sm:space-x-0">
            {content.socials?.map((social: any, index: number) => (
                <a
                  key={index}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-base-100 flex items-center justify-center hover:bg-base-200 transition"
                  aria-label={social.platform}
                  style={linkStyle}
                >
                  {renderIcon(social.platform, 'text-base-content', social.iconSize || 20)}
                </a>
              ))}

            {content.ctaText && (
              <button
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-semibold transition hover:opacity-90 bg-primary text-primary-content text-sm sm:text-base"
                style={buttonBg || buttonText ? { backgroundColor: buttonBg, color: buttonText } : undefined}
              >
                {content.ctaText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
