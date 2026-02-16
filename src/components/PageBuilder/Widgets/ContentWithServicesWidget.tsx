import { Umbrella, Layers, PaintBucket, Clock, AlarmClock } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContentWithServicesWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
  clock: Clock,
  alarmclock: AlarmClock,
};

export default function ContentWithServicesWidget({ section }: ContentWithServicesWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;
  const servicesBg = design.colors?.servicesBackground || undefined;

  const gridCols = content.services?.length === 2 ? 'grid-cols-2' : 'grid-cols-2';

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase text-base-content/70" style={{ color: textColor }}>
                {content.subtitle}
              </p>
            )}
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-base-content" style={{ color: headingColor }}>
              {content.title || 'Website Performance and Speed Optimization Techniques'}
            </h2>
            {content.description && (
              <p className="text-base leading-relaxed text-base-content/70" style={{ color: textColor }}>
                {content.description}
              </p>
            )}
            {content.additionalText && (
              <p className="text-base leading-relaxed text-base-content/70" style={{ color: textColor }}>
                {content.additionalText}
              </p>
            )}
            {content.ctaText && (
              <button className="bg-primary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition">
                {content.ctaText}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {content.image && (
              <div className="w-full mb-8">
                <div className="bg-base-300 rounded-lg" style={{ height: '300px' }}>
                  {content.imageLabel && (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-sm text-neutral-content">{content.imageLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`grid ${gridCols} gap-6`}>
              {content.services?.map((service: any, index: number) => {
                const IconComponent = iconMap[service.icon] || Umbrella;
                return (
                  <div key={index} className="p-6 rounded-lg bg-base-200" style={{ backgroundColor: servicesBg }}>
                    <IconComponent className="w-12 h-12 mb-4 text-base-content" style={{ color: headingColor }} />
                    <h3 className="text-lg font-bold leading-tight text-base-content" style={{ color: headingColor }}>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-sm mt-2 text-base-content/70" style={{ color: textColor }}>
                        {service.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {content.showDots && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                {[0, 1].map((dot, index) => (
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
      </div>
    </div>
  );
}
