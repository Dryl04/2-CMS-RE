import { Umbrella, Layers, CreditCard, ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ServicesCardsWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  creditcard: CreditCard,
};

export default function ServicesCardsWidget({ section }: ServicesCardsWidgetProps) {
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
        <div className="text-center mb-12">
          {content.subtitle && (
            <p
              className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {content.subtitle}
            </p>
          )}
          <h2
            className="text-4xl md:text-5xl font-bold mb-6 text-base-content"
            style={headingColor ? { color: headingColor } : undefined}
          >
            {content.title || 'Registration and Management Assistance'}
          </h2>
          {content.description && (
            <p
              className="text-lg max-w-3xl mx-auto text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {content.description}
            </p>
          )}
          {content.ctaText && (
            <button className="mt-6 bg-primary text-primary-content px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              {content.ctaText}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {content.services?.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || Layers;
            return (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 bg-base-100"
              >
                <div className="relative h-64 bg-base-300">
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-primary">
                      <IconComponent className="w-8 h-8 text-primary-content" />
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-12 text-center">
                  <h3
                    className="text-2xl font-bold mb-4 text-base-content"
                    style={headingColor ? { color: headingColor } : undefined}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-6 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    {service.description}
                  </p>
                  <a
                    href={service.link || '#'}
                    className="inline-flex items-center space-x-2 font-bold uppercase tracking-wider hover:underline transition text-sm text-base-content"
                    style={headingColor ? { color: headingColor } : undefined}
                  >
                    <span>{service.linkText || 'LEARN MORE'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
