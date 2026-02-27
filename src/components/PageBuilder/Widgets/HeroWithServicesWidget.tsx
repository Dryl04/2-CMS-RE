import { Umbrella, Layers, PaintBucket, Clock } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

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
  const typo = design.typography || {};
  const h1Style = {
    ...(typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h1FontWeight || typo.headingFontWeight ? { fontWeight: typo.h1FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h1FontSize || typo.headingFontSize ? { fontSize: typo.h1FontSize || typo.headingFontSize } : {}),
    ...(typo.h1Color || typo.headingColor ? { color: typo.h1Color || typo.headingColor } : {}),
  };
  const h2Style = {
    ...(typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h2FontWeight || typo.headingFontWeight ? { fontWeight: typo.h2FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h2FontSize || typo.headingFontSize ? { fontSize: typo.h2FontSize || typo.headingFontSize } : {}),
    ...(typo.h2Color || typo.subtitleColor || typo.headingColor ? { color: typo.h2Color || typo.subtitleColor || typo.headingColor } : {}),
  };
  const headingStyle = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const _subtitleStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const _linkStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <h2
              className="text-sm font-medium tracking-wider uppercase text-base-content/70"
              style={h2Style}
            >
              {renderRichText(content.subtitle, 'Service excellence for growth-focused teams')}
            </h2>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-base-content"
              style={h1Style}
            >
              {renderRichText(content.title, 'Website Performance and Speed Optimization Techniques')}
            </h1>
            {content.description && (
              <p
                className="text-base sm:text-lg leading-relaxed text-base-content/70"
                style={textStyle}
              >
                {renderRichText(content.description)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {content.ctaText && (
                <button className="btn btn-primary px-6 sm:px-8">
                  {content.ctaText}
                </button>
              )}
              {content.phone && (
                <span
                  className="text-lg sm:text-2xl font-bold text-base-content"
                  style={headingStyle}
                >
                  {content.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-base-content/10">
          {content.services?.map((service: any, index: number) => {
            const IconComponent = iconMap[service.icon] || Layers;
            return (
              <div key={index} className="space-y-3 sm:space-y-4">
                <IconComponent
                  className="w-10 h-10 sm:w-12 sm:h-12 text-base-content"
                  style={headingStyle}
                />
                <h3
                  className="text-lg sm:text-xl font-bold text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(service.title)}
                </h3>
                {service.description && (
                  <p
                    className="text-sm text-base-content/70"
                    style={textStyle}
                  >
                    {renderRichText(service.description)}
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
