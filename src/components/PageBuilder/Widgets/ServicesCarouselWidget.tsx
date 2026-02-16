import { Umbrella, Layers, PaintBucket, Clock, ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ServicesCarouselWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
  clock: Clock,
};

export default function ServicesCarouselWidget({ section }: ServicesCarouselWidgetProps) {
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
        <div className="grid md:grid-cols-4 gap-6">
          {content.services?.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || Layers;
            return (
              <div
                key={index}
                className="bg-base-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-base-content/10"
              >
                <div className="mb-6">
                  <IconComponent className="w-12 h-12 text-base-content" style={{ color: headingColor }} />
                </div>

                <h3 className="text-xl font-bold mb-4 text-base-content" style={{ color: headingColor }}>
                  {service.title}
                </h3>

                {service.description && (
                  <p className="text-sm mb-6 text-base-content/70" style={{ color: textColor }}>
                    {service.description}
                  </p>
                )}

                <a
                  href={service.link || '#'}
                  className="inline-flex items-center space-x-2 text-sm font-semibold hover:underline text-base-content"
                  style={{ color: headingColor }}
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {content.showDots && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            {[0, 1, 2, 3, 4].map((dot, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition ${
                  index === 0 ? 'bg-base-content w-3 h-3' : 'bg-base-content/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
