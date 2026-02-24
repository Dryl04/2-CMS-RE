import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface TimelineGridWidgetProps {
  section: PageBuilderSection;
}

export default function TimelineGridWidget({ section }: TimelineGridWidgetProps) {
  const { content, design } = section;
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const bg = design.background.type === 'color' ? design.background.value : undefined;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70" style={subtitleStyle}>
            {renderRichText(content.subtitle)}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 lg:mb-16 text-base-content" style={headingStyle}>
          {renderRichText(content.title, "Find out about our company's background.")}
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {content.events?.map((event: any, index: number) => (
            <div key={index} className="relative">
              <div className="absolute left-0 top-0 w-0.5 bg-base-content/20 h-full"></div>

              <div className="relative pl-8 pb-12">
                <div className="absolute left-0 top-0 w-3 h-3 bg-base-content rounded-full transform -translate-x-[5px]"></div>

                <p className="text-sm mb-4 text-base-content/70" style={textStyle}>
                  {event.period || '1985 - 2013'}
                </p>

                <h3 className="text-2xl font-bold mb-4 text-base-content" style={headingStyle}>
                  {renderRichText(event.title, 'This is heading')}
                </h3>

                <p className="text-base leading-relaxed text-base-content/70" style={textStyle}>
                  {renderRichText(event.description, 'Lorem ipsum dolor sit amet consec tetur adipis cing elit sed do eiusmod tempor ut labore et aliqua exceur sante.')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
