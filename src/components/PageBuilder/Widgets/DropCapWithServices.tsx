import { Check } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface DropCapWithServicesProps {
  section: PageBuilderSection;
}

export default function DropCapWithServices({ section }: DropCapWithServicesProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;

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

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-4 sm:mb-6 text-base-content/70" style={subtitleStyle}>
            {content.subtitle}
          </p>
        )}

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 leading-tight text-base-content" style={headingStyle}>
          {content.title || 'Quis autem veleum iure repreh enderit.'}
        </h2>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1 space-y-6">
            {content.dropCap && (
              <div className="flex items-start space-x-3 sm:space-x-4">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none text-base-content flex-shrink-0" style={headingStyle}>
                  {content.dropCap}
                </span>
                <p className="text-sm sm:text-base leading-relaxed pt-1 sm:pt-2 text-base-content/70" style={textStyle}>
                  {content.introText}
                </p>
              </div>
            )}

            {content.additionalText && (
              <p className="text-sm sm:text-base leading-relaxed text-base-content/70" style={textStyle}>
                {content.additionalText}
              </p>
            )}

            {content.signature && (
              <div className="pt-4 sm:pt-6">
                <img src={content.signature} alt="Signature" className="h-12 sm:h-16" />
              </div>
            )}
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 sm:gap-8">
            {content.serviceColumns?.map((column: any, index: number) => (
              <div key={index} className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-base-content" style={headingStyle}>
                  {column.title}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {column.items?.map((item: string, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-base-content/70" style={textStyle} />
                      <span className="text-sm sm:text-base text-base-content/70" style={textStyle}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                {column.ctaText && (
                  <a href={column.ctaLink || '#'} className="inline-block text-sm sm:text-base font-semibold underline text-base-content" style={{ ...headingStyle, ...linkStyle }}>
                    {column.ctaText}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
