import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface TextColumnsWidgetProps {
  section: PageBuilderSection;
}

export default function TextColumnsWidget({ section }: TextColumnsWidgetProps) {
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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const bg = design.background.type === 'color' ? design.background.value : undefined;

  const intro = content.introduction || content.title || 'Maximize your website\'s impact with premium content sections.';
  const ctaText = content.ctaText || 'Learn More';
  const ctaLink = content.ctaLink || '#';

  const columnsFromFlat = [content.column1, content.column2, content.column3].filter(Boolean);
  const columnsFromLegacy = Array.isArray(content.columns)
    ? content.columns
      .map((column: unknown) => {
        if (typeof column === 'string') return column;
        if (typeof column === 'object' && column !== null && 'paragraphs' in column && Array.isArray((column as { paragraphs?: unknown[] }).paragraphs)) {
          return ((column as { paragraphs: unknown[] }).paragraphs as string[]).join(' ');
        }
        if (typeof column === 'object' && column !== null && 'description' in column && typeof (column as { description?: unknown }).description === 'string') {
          return (column as { description: string }).description;
        }
        if (typeof column === 'object' && column !== null && 'content' in column && typeof (column as { content?: unknown }).content === 'string') {
          return (column as { content: string }).content;
        }
        return '';
      })
      .filter(Boolean)
    : [];

  const columns = columnsFromFlat.length > 0 ? columnsFromFlat : columnsFromLegacy;

  const renderThreeColumns = () => (
    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
      <div className="md:col-span-1 space-y-6">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-base-content"
          style={headingStyle}
        >
          {intro}
        </h2>
        <a href={ctaLink} className="btn btn-primary btn-sm rounded-full" style={linkStyle}>
          {ctaText}
        </a>
      </div>

      <div className="md:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {columns.map((column: string, index: number) => (
          <p
            key={index}
            className="text-sm sm:text-base leading-relaxed text-base-content/70"
            style={textStyle}
          >
            {renderRichText(column)}
          </p>
        ))}
      </div>
    </div>
  );

  const renderTwoColumns = () => (
    <div className="space-y-8">
      <div className="max-w-4xl">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-base-content"
          style={headingStyle}
        >
          {intro}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {columns.slice(0, 2).map((column: string, index: number) => (
          <p
            key={index}
            className="text-sm sm:text-base leading-relaxed text-base-content/70"
            style={textStyle}
          >
            {renderRichText(column)}
          </p>
        ))}
      </div>

      <a href={ctaLink} className="btn btn-primary btn-sm rounded-full" style={linkStyle}>
        {ctaText}
      </a>
    </div>
  );

  const renderCentered = () => (
    <div className="max-w-5xl mx-auto text-center space-y-8">
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-base-content"
        style={headingStyle}
      >
        {intro}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column: string, index: number) => (
          <p
            key={index}
            className="text-sm sm:text-base leading-relaxed text-base-content/70"
            style={textStyle}
          >
            {renderRichText(column)}
          </p>
        ))}
      </div>

      <a href={ctaLink} className="btn btn-primary btn-sm rounded-full" style={linkStyle}>
        {ctaText}
      </a>
    </div>
  );

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {section.variant === 'two-column'
          ? renderTwoColumns()
          : section.variant === 'centered'
            ? renderCentered()
            : renderThreeColumns()}
      </div>
    </div>
  );
}
