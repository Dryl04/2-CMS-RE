import { Umbrella, Layers, PaintBucket, Clock, AlarmClock, Image as ImageIcon } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { renderIcon } from '@/lib/iconLibrary';

interface ContentWithServicesWidgetProps {
  section: PageBuilderSection;
}

const _iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
  clock: Clock,
  alarmclock: AlarmClock,
};

export default function ContentWithServicesWidget({ section }: ContentWithServicesWidgetProps) {
  const { content, design } = section;
  const servicesBg = design.colors?.servicesBackground;

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
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const gridCols = content.services?.length === 2 ? 'grid-cols-2' : content.services?.length >= 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1';

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase text-base-content/70" style={subtitleStyle}>
                {renderRichText(content.subtitle)}
              </p>
            )}
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-base-content" style={headingStyle}>
              {renderRichText(content.title, 'Website Performance and Speed Optimization Techniques')}
            </h2>
            {content.description && (
              <p className="text-base leading-relaxed text-base-content/70" style={textStyle}>
                {renderRichText(content.description)}
              </p>
            )}
            {content.additionalText && (
              <p className="text-base leading-relaxed text-base-content/70" style={textStyle}>
                {renderRichText(content.additionalText)}
              </p>
            )}
            {content.ctaText && (
              <button className="btn btn-primary px-8">
                {content.ctaText}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {content.image && (
              <div className="w-full mb-8">
                {typeof content.image === 'string' && content.image.startsWith('http') ? (
                  <img
                    src={content.image}
                    alt={content.imageLabel || content.title || 'Content image'}
                    className="w-full rounded-lg object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                ) : (
                  <div className="bg-base-300 rounded-lg flex flex-col items-center justify-center text-base-content/30" style={{ height: '300px' }}>
                    {content.imageLabel ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-neutral-content">{content.imageLabel}</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium">Image</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={`grid ${gridCols} gap-6`}>
              {content.services?.map((service: any, index: number) => {
                return (
                  <div key={index} className="p-6 rounded-lg bg-base-200" style={servicesBg ? { backgroundColor: servicesBg } : undefined}>
                    <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl" data-widget-icon-frame>
                      {renderIcon(service.icon, 'w-6 h-6 text-base-content', 24) || <Umbrella className="w-6 h-6 text-base-content" />}
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-base-content" style={headingStyle}>
                      {renderRichText(service.title)}
                    </h3>
                    {service.description && (
                      <p className="text-sm mt-2 text-base-content/70" style={textStyle}>
                        {renderRichText(service.description)}
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
                    className={`w-2 h-2 rounded-full transition ${index === 0 ? 'bg-base-content' : 'bg-base-content/40'
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
