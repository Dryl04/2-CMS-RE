import { ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { renderIcon } from '@/lib/iconLibrary';

interface ServicesCarouselWidgetProps {
  section: PageBuilderSection;
}

export default function ServicesCarouselWidget({ section }: ServicesCarouselWidgetProps) {
  const { content, design } = section;
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const _subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid md:grid-cols-4 gap-6">
          {content.services?.map((service: any, index: number) => {
            return (
              <div
                key={index}
                className="bg-base-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-base-content/10"
              >
                <div className="mb-6" data-widget-icon-frame>
                  {renderIcon(service.icon, 'text-base-content', service.iconSize || 48)}
                </div>

                <h3 className="text-xl font-bold mb-4 text-base-content" style={headingStyle}>
                  {renderRichText(service.title)}
                </h3>

                {service.description && (
                  <p className="text-sm mb-6 text-base-content/70" style={textStyle}>
                    {renderRichText(service.description)}
                  </p>
                )}

                <a
                  href={service.link || '#'}
                  className="inline-flex items-center space-x-2 text-sm font-semibold hover:underline text-base-content"
                  style={linkStyle}
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
                className={`w-2 h-2 rounded-full transition ${index === 0 ? 'bg-base-content w-3 h-3' : 'bg-base-content/40'
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
