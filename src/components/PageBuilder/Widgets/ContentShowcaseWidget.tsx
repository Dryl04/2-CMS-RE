import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface ContentShowcaseWidgetProps {
  section: PageBuilderSection;
}

export default function ContentShowcaseWidget({ section }: ContentShowcaseWidgetProps) {
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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const bg = design.background.type === 'color' ? design.background.value : undefined;

  const subtitle = content.subtitle || '';
  const headline = content.headline || content.title || 'Quis autem veleum iure repreh enderit.';
  const column1 = content.column1 || content.description || '';
  const column2 = content.column2 || '';
  const column3 = content.column3 || '';
  const image = content.image || '';

  const renderTextBlock = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[column1, column2, column3].filter(Boolean).map((text: string, index: number) => (
        <p
          key={index}
          className="text-base leading-relaxed text-base-content/70"
          style={textStyle}
        >
          {renderRichText(text)}
        </p>
      ))}
    </div>
  );

  const renderImageLeft = () => (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {image && (
        <img
          src={image}
          alt={headline}
          className="w-full h-auto object-cover rounded-lg"
          style={{ maxHeight: '500px' }}
        />
      )}
      <div className="space-y-6">
        {renderTextBlock()}
      </div>
    </div>
  );

  const renderImageRight = () => (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div className="space-y-6 order-2 lg:order-1">
        {renderTextBlock()}
      </div>
      {image && (
        <img
          src={image}
          alt={headline}
          className="w-full h-auto object-cover rounded-lg order-1 lg:order-2"
          style={{ maxHeight: '500px' }}
        />
      )}
    </div>
  );

  const renderTwoColumnText = () => (
    <div className="max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        {[column1, column2 || column3].filter(Boolean).map((text: string, index: number) => (
          <p
            key={index}
            className="text-base leading-relaxed text-base-content/70"
            style={textStyle}
          >
            {renderRichText(text)}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="space-y-8 mb-12">
          {subtitle && (
            <p
              className="text-sm font-medium tracking-wider uppercase text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(subtitle)}
            </p>
          )}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-base-content"
            style={headingStyle}
          >
            {renderRichText(headline)}
          </h2>
        </div>

        {section.variant === 'two-column'
          ? renderTwoColumnText()
          : section.variant === 'image-right'
            ? renderImageRight()
            : renderImageLeft()}
      </div>
    </div>
  );
}
