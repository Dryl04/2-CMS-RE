import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface ProcessAlternatingProps {
  section: PageBuilderSection;
}

export default function ProcessAlternating({ section }: ProcessAlternatingProps) {
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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 sm:mb-16">
          <div className="max-w-xl">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4 text-base-content/70" style={subtitleStyle}>
                {renderRichText(content.subtitle)}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-base-content" style={headingStyle}>
              {renderRichText(content.title, 'See how processes go success.')}
            </h2>
          </div>
          <div className="lg:flex-shrink-0 lg:max-w-md">
            {content.headerDescription && (
              <p className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 text-base-content/70" style={textStyle}>
                {renderRichText(content.headerDescription)}
              </p>
            )}
            {content.headerCta && (
              <button className="btn btn-primary px-6 sm:px-8">
                {content.headerCta}
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {content.steps?.map((step: any, index: number) => (
            <div key={index} className="flex flex-col space-y-4 sm:space-y-6">
              <div className="bg-base-300 rounded-lg overflow-hidden h-48 sm:h-56 lg:h-[300px]">
                {step.image && (
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover rounded-lg" />
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content" style={headingStyle}>
                  {String(index + 1).padStart(2, '0')}.
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-base-content" style={headingStyle}>
                  {renderRichText(step.title)}
                </h3>
                {step.description && (
                  <p className="text-sm sm:text-base leading-relaxed text-base-content/70" style={textStyle}>
                    {renderRichText(step.description)}
                  </p>
                )}
                {step.ctaText && (
                  <a href={step.ctaLink || '#'} className="inline-block text-sm sm:text-base font-semibold underline text-base-content" style={linkStyle}>
                    {step.ctaText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
