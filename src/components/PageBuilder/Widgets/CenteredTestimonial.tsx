import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface CenteredTestimonialProps {
  section: PageBuilderSection;
}

export default function CenteredTestimonial({ section }: CenteredTestimonialProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-6 text-base-content/70" style={{ color: textColor }}>
            {content.subtitle}
          </p>
        )}

        <h2 className="text-5xl md:text-6xl font-bold mb-12 leading-tight text-base-content" style={{ color: headingColor }}>
          {content.title || 'Why Choose Us'}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 text-left mb-12">
          {content.textBlocks?.map((block: string, index: number) => (
            <p key={index} className="text-lg leading-relaxed text-base-content/70" style={{ color: textColor }}>
              {block}
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
