import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface ImmersiveSplitShowcaseWidgetProps {
  section: PageBuilderSection;
}

export default function ImmersiveSplitShowcaseWidget({ section }: ImmersiveSplitShowcaseWidgetProps) {
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

  const lines = content.leftLines || [
    'Visual Effects',
    'Fashion',
    'Advertising',
    'Photography',
    'Concepting',
  ];

  return (
    <section>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-base-content/10">
          {content.backgroundImage && (
            <img src={content.backgroundImage} alt="background" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-neutral/60" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-6 sm:p-10 lg:p-14 min-h-[520px]">
            <div>
              <p className="text-sm uppercase tracking-widest text-neutral-content/80" style={subtitleStyle}>
                {renderRichText(content.eyebrow, 'Generative workflows that scale')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-neutral-content" style={headingStyle}>
                {renderRichText(content.title, 'Create in every style your brand needs')}
              </h2>

              <div className="mt-6 sm:mt-8 space-y-1 sm:space-y-2">
                {lines.map((line: string, index: number) => (
                  <p key={index} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-neutral-content/80" style={textStyle}>
                    {renderRichText(line)}
                  </p>
                ))}
              </div>
            </div>

            <div className="self-start lg:self-center lg:justify-self-end bg-base-100/90 backdrop-blur rounded-2xl border border-base-content/10 p-4 w-full max-w-md">
              <img src={content.cardImage || ''} alt="card" className="w-full h-56 object-cover rounded-xl bg-base-300" />
              <h3 className="mt-4 text-xl font-semibold" style={headingStyle}>
                {renderRichText(content.cardTitle, 'Commercial Shoot')}
              </h3>
              <p className="mt-2 text-sm opacity-80" style={textStyle}>
                {renderRichText(content.cardDescription, 'Create branded visuals with consistent style and quality.')}
              </p>
              <a href={content.cardCtaLink || '#'} className="btn btn-primary btn-sm mt-4" style={linkStyle}>
                {content.cardCtaText || 'Try now'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
