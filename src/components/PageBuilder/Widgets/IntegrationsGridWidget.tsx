import { ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface IntegrationsGridWidgetProps {
  section: PageBuilderSection;
}

export default function IntegrationsGridWidget({ section }: IntegrationsGridWidgetProps) {
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
        <div className="text-center mb-6 md:mb-10 lg:mb-16">
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
            {content.title || 'Integrations'}
          </h2>
          {content.description && (
            <p
              className="text-base md:text-lg max-w-3xl mx-auto text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {content.description}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {content.integrations?.map((integration: any, index: number) => (
            <div
              key={index}
              className="bg-base-100 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-center space-y-4 md:space-y-6">
                {integration.logo ? (
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="h-10 sm:h-12 mx-auto object-contain grayscale hover:grayscale-0 transition"
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl font-bold text-base-content/30">
                    {integration.name}
                  </div>
                )}

                <div className="pt-4 md:pt-6 border-t border-base-content/10">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-base-content"
                    style={headingColor ? { color: headingColor } : undefined}
                  >
                    {integration.name}
                  </h3>
                  <p
                    className="text-xs sm:text-sm mb-3 sm:mb-4 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    {integration.description}
                  </p>
                  <a
                    href={integration.link || '#'}
                    className="inline-flex items-center space-x-2 font-bold text-xs sm:text-sm hover:underline transition text-base-content"
                    style={headingColor ? { color: headingColor } : undefined}
                  >
                    <span>{integration.linkText || 'MORE'}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
