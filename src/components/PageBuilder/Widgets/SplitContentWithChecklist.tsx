import React from 'react';
import { Check } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SplitContentWithChecklistProps {
  section: PageBuilderSection;
}

export default function SplitContentWithChecklist({ section }: SplitContentWithChecklistProps) {
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

  const bg = design.background.type === 'color' ? design.background.value : undefined;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-base-content" style={headingStyle}>
                {content.title || 'Quis autem veleum repreh enderit.'}
              </h2>
              {content.description && (
                <p className="text-base sm:text-lg leading-relaxed text-base-content/70" style={textStyle}>
                  {content.description}
                </p>
              )}
            </div>

            {content.divider && (
              <hr className="border-t border-base-content/10" />
            )}

            {content.checklist && (
              <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8 sm:gap-y-4">
                {content.checklist.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70 flex-shrink-0" style={textStyle} />
                    <span className="text-sm sm:text-base text-base-content/70" style={textStyle}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {content.image ? (
              <div className="bg-base-300 rounded-lg overflow-hidden h-64 sm:h-80 lg:h-[500px]">
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="bg-base-300 rounded-lg h-64 sm:h-80 lg:h-[500px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
