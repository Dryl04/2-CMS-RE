import { Monitor, Shield, Lock, ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ServicesGridWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  monitor: Monitor,
  shield: Shield,
  lock: Lock,
};

export default function ServicesGridWidget({ section }: ServicesGridWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p
            className="text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 md:mb-4 text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {content.subtitle}
          </p>
        )}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {content.title}
        </h2>
        {content.description && (
          <p
            className="text-base md:text-lg mb-6 md:mb-8 lg:mb-12 text-base-content/70"
            style={{ ...(textColor ? { color: textColor } : {}), maxWidth: '800px' }}
          >
            {content.description}
          </p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8 lg:mt-12">
          {content.services?.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || Monitor;
            return (
              <div key={index} className="space-y-3 md:space-y-4">
                <h3
                  className="text-xl sm:text-2xl font-bold text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed text-base-content/70"
                  style={textColor ? { color: textColor } : undefined}
                >
                  {service.description}
                </p>
                <a
                  href={service.link || '#'}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold hover:underline transition text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  <span>{service.linkText || 'Learn More'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
