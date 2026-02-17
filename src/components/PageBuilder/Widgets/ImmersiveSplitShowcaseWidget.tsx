import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ImmersiveSplitShowcaseWidgetProps {
  section: PageBuilderSection;
}

export default function ImmersiveSplitShowcaseWidget({ section }: ImmersiveSplitShowcaseWidgetProps) {
  const { content, design } = section;
  const headingColor = design.typography?.headingColor;
  const textColor = design.typography?.textColor;

  const lines = content.leftLines || [
    'Visual Effects',
    'Fashion',
    'Advertising',
    'Photography',
    'Concepting',
  ];

  return (
    <section className="bg-base-100">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-base-content/10">
          <img src={content.backgroundImage || ''} alt="background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral/60" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-6 sm:p-10 lg:p-14 min-h-[520px]">
            <div>
              <p className="text-sm uppercase tracking-widest text-neutral-content/80">
                {content.eyebrow || 'Generative workflows that scale'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-neutral-content" style={headingColor ? { color: headingColor } : undefined}>
                {content.title || 'Create in every style your brand needs'}
              </h2>

              <div className="mt-8 space-y-2">
                {lines.map((line: string, index: number) => (
                  <p key={index} className="text-4xl sm:text-5xl font-light text-neutral-content/80">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="self-start lg:self-center lg:justify-self-end bg-base-100/90 backdrop-blur rounded-2xl border border-base-content/10 p-4 w-full max-w-md">
              <img src={content.cardImage || ''} alt="card" className="w-full h-56 object-cover rounded-xl bg-base-300" />
              <h3 className="mt-4 text-xl font-semibold" style={headingColor ? { color: headingColor } : undefined}>
                {content.cardTitle || 'Commercial Shoot'}
              </h3>
              <p className="mt-2 text-sm opacity-80" style={textColor ? { color: textColor } : undefined}>
                {content.cardDescription || 'Create branded visuals with consistent style and quality.'}
              </p>
              <a href={content.cardCtaLink || '#'} className="btn btn-primary btn-sm mt-4">
                {content.cardCtaText || 'Try now'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
