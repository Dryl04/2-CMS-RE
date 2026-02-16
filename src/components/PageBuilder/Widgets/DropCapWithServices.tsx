import { Check } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface DropCapWithServicesProps {
  section: PageBuilderSection;
}

export default function DropCapWithServices({ section }: DropCapWithServicesProps) {
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
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-6 text-base-content/70" style={{ color: textColor }}>
            {content.subtitle}
          </p>
        )}

        <h2 className="text-4xl md:text-5xl font-bold mb-12 leading-tight text-base-content" style={{ color: headingColor }}>
          {content.title || 'Quis autem veleum iure repreh enderit.'}
        </h2>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-6">
            {content.dropCap && (
              <div className="flex items-start space-x-4">
                <span className="text-7xl font-bold leading-none text-base-content" style={{ color: headingColor }}>
                  {content.dropCap}
                </span>
                <p className="text-base leading-relaxed pt-2 text-base-content/70" style={{ color: textColor }}>
                  {content.introText}
                </p>
              </div>
            )}

            {content.additionalText && (
              <p className="text-base leading-relaxed text-base-content/70" style={{ color: textColor }}>
                {content.additionalText}
              </p>
            )}

            {content.signature && (
              <div className="pt-6">
                <img src={content.signature} alt="Signature" className="h-16" />
              </div>
            )}
          </div>

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {content.serviceColumns?.map((column: any, index: number) => (
              <div key={index} className="space-y-6">
                <h3 className="text-2xl font-bold text-base-content" style={{ color: headingColor }}>
                  {column.title}
                </h3>
                <div className="space-y-3">
                  {column.items?.map((item: string, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 flex-shrink-0 text-base-content/70" style={{ color: textColor }} />
                      <span className="text-base text-base-content/70" style={{ color: textColor }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                {column.ctaText && (
                  <a href={column.ctaLink || '#'} className="inline-block text-base font-semibold underline text-base-content" style={{ color: headingColor }}>
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
