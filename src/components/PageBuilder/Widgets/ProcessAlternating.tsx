import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ProcessAlternatingProps {
  section: PageBuilderSection;
}

export default function ProcessAlternating({ section }: ProcessAlternatingProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="flex items-start justify-between mb-16">
          <div className="max-w-xl">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70" style={{ color: textColor }}>
                {content.subtitle}
              </p>
            )}
            <h2 className="text-5xl md:text-6xl font-bold leading-tight text-base-content" style={{ color: headingColor }}>
              {content.title || 'See how processes go success.'}
            </h2>
          </div>
          <div className="flex-shrink-0 max-w-md">
            {content.headerDescription && (
              <p className="text-base leading-relaxed mb-6 text-base-content/70" style={{ color: textColor }}>
                {content.headerDescription}
              </p>
            )}
            {content.headerCta && (
              <button className="bg-primary text-primary-content px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                {content.headerCta}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {content.steps?.map((step: any, index: number) => (
            <div key={index} className="flex flex-col space-y-6">
              <div className="bg-base-300 rounded-lg" style={{ height: '300px' }}>
                {step.image && (
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover rounded-lg" />
                )}
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-bold text-base-content" style={{ color: headingColor }}>
                  {String(index + 1).padStart(2, '0')}.
                </div>
                <h3 className="text-2xl font-bold text-base-content" style={{ color: headingColor }}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-base leading-relaxed text-base-content/70" style={{ color: textColor }}>
                    {step.description}
                  </p>
                )}
                {step.ctaText && (
                  <a href={step.ctaLink || '#'} className="inline-block text-base font-semibold underline text-base-content" style={{ color: headingColor }}>
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
