import { Umbrella, Layers, PaintBucket, Clock, MessageCircle } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface FeaturesCarouselWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
  clock: Clock,
  messagecircle: MessageCircle,
};

export default function FeaturesCarouselWidget({ section }: FeaturesCarouselWidgetProps) {
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
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {content.features?.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.icon] || Layers;
            const isFeatured = feature.featured || false;
            const borderClass = isFeatured ? 'border-2 border-base-content' : 'border border-base-content/10';

            return (
              <div
                key={index}
                className={`bg-base-100 rounded-2xl p-8 text-center space-y-6 transition-all hover:shadow-lg ${borderClass}`}
              >
                <div className="flex justify-center">
                  <IconComponent className="w-16 h-16 text-base-content" style={{ color: headingColor }} />
                </div>

                <h3 className="text-2xl font-bold text-base-content" style={{ color: headingColor }}>
                  {feature.title}
                </h3>

                {feature.description && (
                  <p className="text-base leading-relaxed text-base-content/70" style={{ color: textColor }}>
                    {feature.description}
                  </p>
                )}

                {feature.ctaText && (
                  <button className="bg-primary text-primary-content px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
                    {feature.ctaText}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {content.showDots && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            {[0, 1, 2, 3].map((dot, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition ${
                  index === 0 ? 'bg-base-content' : 'bg-base-content/40'
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
