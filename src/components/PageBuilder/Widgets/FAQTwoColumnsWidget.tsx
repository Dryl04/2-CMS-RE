import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface FAQTwoColumnsWidgetProps {
  section: PageBuilderSection;
}

export default function FAQTwoColumnsWidget({ section }: FAQTwoColumnsWidgetProps) {
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

  const faqs = content.faqs || [];
  const leftColumn = faqs.filter((_: any, index: number) => index % 2 === 0);
  const rightColumn = faqs.filter((_: any, index: number) => index % 2 === 1);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="text-center mb-16">
          {content.subtitle && (
            <p
              className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(content.subtitle)}
            </p>
          )}
          <h2
            className="text-4xl md:text-5xl font-bold text-base-content"
            style={headingStyle}
          >
            {renderRichText(content.title, 'Frequently Asked Questions')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          <div className="space-y-12">
            {leftColumn.map((faq: any, index: number) => (
              <div key={`left-${index}`}>
                <h3
                  className="text-xl font-bold mb-4 text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(faq.question)}
                </h3>
                <p
                  className="text-base leading-relaxed text-base-content/70"
                  style={textStyle}
                >
                  {renderRichText(faq.answer)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-12">
            {rightColumn.map((faq: any, index: number) => (
              <div key={`right-${index}`}>
                <h3
                  className="text-xl font-bold mb-4 text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(faq.question)}
                </h3>
                <p
                  className="text-base leading-relaxed text-base-content/70"
                  style={textStyle}
                >
                  {renderRichText(faq.answer)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
