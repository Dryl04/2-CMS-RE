import { Umbrella, Layers, PaintBucket, Clock } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeroWithServicesWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
  clock: Clock,
};

export default function HeroWithServicesWidget({ section }: HeroWithServicesWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {content.subtitle && (
              <p
                className="text-sm font-medium tracking-wider uppercase text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.subtitle}
              </p>
            )}
            <h1
              className="text-5xl md:text-6xl font-bold leading-tight text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {content.title || 'Website Performance and Speed Optimization Techniques'}
            </h1>
            {content.description && (
              <p
                className="text-lg leading-relaxed text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.description}
              </p>
            )}

            <div className="flex items-center space-x-6">
              {content.ctaText && (
                <button className="bg-primary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition">
                  {content.ctaText}
                </button>
              )}
              {content.phone && (
                <span
                  className="text-2xl font-bold text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  {content.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-16 border-t border-base-content/10">
          {content.services?.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || Layers;
            return (
              <div key={index} className="space-y-4">
                <IconComponent
                  className="w-12 h-12 text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                />
                <h3
                  className="text-xl font-bold text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  {service.title}
                </h3>
                {service.description && (
                  <p
                    className="text-sm text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    {service.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
