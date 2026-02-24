import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface CenteredTestimonialProps {
  section: PageBuilderSection;
}

export default function CenteredTestimonial({ section }: CenteredTestimonialProps) {
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
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-6 text-base-content/70" style={subtitleStyle}>
            {renderRichText(content.subtitle)}
          </p>
        )}

        <h2 className="text-5xl md:text-6xl font-bold mb-12 leading-tight text-base-content" style={headingStyle}>
          {renderRichText(content.title, 'Why Choose Us')}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 text-left mb-12">
          {content.textBlocks?.map((block: string, index: number) => (
            <p key={index} className="text-lg leading-relaxed text-base-content/70" style={textStyle}>
              {renderRichText(block)}
            </p>
          ))}
        </div>

        {content.signature && (
          <div className="flex justify-end">
            <img src={content.signature} alt="Signature" className="h-20" />
          </div>
        )}
      </div>
    </div>
  );
}
