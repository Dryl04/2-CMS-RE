import { Play, Umbrella, Layers, PaintBucket } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContentVideoServicesProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
};

export default function ContentVideoServices({ section }: ContentVideoServicesProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor;
  const textColor = design.typography?.textColor;

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-3 bg-base-100 rounded-2xl p-8 shadow-lg">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70" style={{ color: textColor }}>
                {content.subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-base-content" style={{ color: headingColor }}>
              {content.title || 'Digital Marketing and Strategy.'}
            </h2>
            {content.description && (
              <p className="text-base leading-relaxed mb-4 text-base-content/70" style={{ color: textColor }}>
                {content.description}
              </p>
            )}
            {content.additionalText && (
              <p className="text-base leading-relaxed mb-8 text-base-content/70" style={{ color: textColor }}>
                {content.additionalText}
              </p>
            )}
            {content.ctaText && (
              <button className="btn btn-primary px-8">
                {content.ctaText}
              </button>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="relative bg-base-300 rounded-2xl" style={{ height: '450px' }}>
              {content.videoUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <button className="btn btn-circle btn-outline w-20 h-20 border-4 border-base-100 hover:scale-110 transition">
                    <Play className="w-10 h-10 text-base-100 fill-base-100" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <button className="btn btn-circle btn-outline w-20 h-20 border-4 border-base-100 hover:scale-110 transition">
                    <Play className="w-10 h-10 text-base-100 fill-base-100" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {content.services?.map((service: any, index: number) => {
              const IconComponent = iconMap[service.icon] || Umbrella;
              return (
                <div key={index} className="text-center space-y-3">
                  <div className="flex justify-center">
                    <IconComponent className="w-12 h-12 text-base-content" style={{ color: headingColor }} />
                  </div>
                  <h3 className="text-lg font-bold leading-tight text-base-content" style={{ color: headingColor }}>
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-base-content/70" style={{ color: textColor }}>
                      {service.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
