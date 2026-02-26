import React from 'react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface SimpleHeaderDividerProps {
  section: PageBuilderSection;
}

export default function SimpleHeaderDivider({ section }: SimpleHeaderDividerProps) {
  const { content, design } = section;
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };

  const _bg = design.background.type === 'color' ? design.background.value : undefined;
  const dividerColor = design.colors?.dividerColor;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content" style={headingStyle}>
          {renderRichText(content.title, 'Sample Header Text')}
        </h2>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-base-content" style={dividerColor ? { backgroundColor: dividerColor } : undefined} />
        </div>
      </div>
    </div>
  );
}
