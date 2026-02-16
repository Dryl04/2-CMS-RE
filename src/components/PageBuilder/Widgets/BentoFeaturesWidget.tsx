import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface BentoFeaturesWidgetProps {
  section: PageBuilderSection;
}

export default function BentoFeaturesWidget({ section }: BentoFeaturesWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;
  const cardBg = design.colors?.cardBackground || undefined;

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div>
            {content.subtitle && (
              <p className="text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4 text-base-content/70" style={{ color: textColor }}>
                {content.subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-base-content" style={{ color: headingColor }}>
              {content.title || 'Discover the benefits of unique features.'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-[150px] sm:auto-rows-[200px] lg:auto-rows-[250px]">
          {content.features?.map((feature: any, index: number) => {
            const sizeMap = {
              'small': 'lg:col-span-4',
              'medium': 'lg:col-span-6',
              'large': 'lg:col-span-8',
            };
            const colSpan = sizeMap[feature.size as keyof typeof sizeMap] || 'lg:col-span-4';
            const rowSpan = feature.height === 'tall' ? 'lg:row-span-2' : 'lg:row-span-1';

            return (
              <div
                key={index}
                className={`${colSpan} ${rowSpan} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-end transition-transform hover:scale-[1.02] bg-neutral`}
                style={{ backgroundColor: cardBg }}
              >
                {feature.label && (
                  <p className="text-xs font-medium tracking-wider uppercase mb-2 sm:mb-3 text-neutral-content/80">
                    {feature.label}
                  </p>
                )}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-content">
                  {feature.title}
                </h3>
                {feature.description && (
                  <p className="text-xs sm:text-sm text-neutral-content/80 mt-1 sm:mt-2">
                    {feature.description}
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
