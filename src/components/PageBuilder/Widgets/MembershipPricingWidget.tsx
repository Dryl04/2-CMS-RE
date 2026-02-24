import { Check, Minus, Umbrella, Layers, PaintBucket } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface MembershipPricingWidgetProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
};

export default function MembershipPricingWidget({ section }: MembershipPricingWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;

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

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="text-center mb-16">
          {content.subtitle && (
            <p
              className="text-sm font-medium tracking-wider uppercase mb-4 text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(content.subtitle)}
            </p>
          )}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-base-content"
            style={headingStyle}
          >
            {renderRichText(content.title)}
          </h2>
          {content.description && (
            <p
              className="text-lg max-w-3xl mx-auto text-base-content/70"
              style={textStyle}
            >
              {renderRichText(content.description)}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {content.plans?.map((plan: any, index: number) => {
            const IconComponent = iconMap[plan.icon] || Layers;
            const isFeatured = plan.featured || false;

            return (
              <div
                key={index}
                className={`rounded-2xl p-6 sm:p-8 shadow-lg transition-transform hover:scale-105 ${isFeatured ? 'bg-neutral text-neutral-content' : 'bg-base-100'
                  }`}
              >
                <div className="mb-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${isFeatured ? 'bg-neutral-content/20' : 'bg-primary'
                    }`}>
                    <IconComponent className={`w-8 h-8 ${isFeatured ? 'text-neutral-content' : 'text-primary-content'}`} />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-2 text-center ${isFeatured ? '' : 'text-base-content'}`}
                    style={!isFeatured ? headingStyle : undefined}
                  >
                    {renderRichText(plan.name)}
                  </h3>
                  <p
                    className={`text-sm text-center ${isFeatured ? 'opacity-70' : 'text-base-content/70'}`}
                    style={!isFeatured ? subtitleStyle : undefined}
                  >
                    {renderRichText(plan.subtitle, 'Suitable for Beginners')}
                  </p>
                </div>

                <div className={`space-y-3 mb-8 py-8 border-t border-b ${isFeatured ? 'border-neutral-content/20' : 'border-base-content/10'
                  }`}>
                  {plan.features?.map((feature: any, fIndex: number) => {
                    const isIncluded = feature.included !== false;
                    return (
                      <div key={fIndex} className="flex items-center space-x-3">
                        {isIncluded ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${isFeatured ? '' : 'text-base-content'}`}
                            style={!isFeatured ? headingStyle : undefined}
                          />
                        ) : (
                          <Minus className={`w-5 h-5 flex-shrink-0 ${isFeatured ? 'opacity-70' : 'text-base-content/70'}`}
                            style={!isFeatured ? textStyle : undefined}
                          />
                        )}
                        <span
                          className={`text-sm ${isFeatured ? 'opacity-70' : 'text-base-content/70'}`}
                          style={!isFeatured ? textStyle : undefined}
                        >
                          {renderRichText(typeof feature === 'string' ? feature : feature.text)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span
                      className={`text-5xl font-bold ${isFeatured ? '' : 'text-base-content'}`}
                      style={!isFeatured ? headingStyle : undefined}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ml-2 ${isFeatured ? 'opacity-70' : 'text-base-content/70'}`}
                      style={!isFeatured ? textStyle : undefined}
                    >
                      {plan.period || '/PER MONTH'}
                    </span>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition hover:opacity-90 ${isFeatured
                      ? 'bg-neutral-content text-neutral'
                      : 'bg-base-100 text-base-content border border-base-content/10'
                    }`}
                >
                  {plan.ctaText || 'Get Started'}
                </button>

                {plan.guarantee && (
                  <p className={`text-xs text-center mt-4 ${isFeatured ? 'opacity-70' : 'text-base-content/70'}`}
                    style={!isFeatured ? textStyle : undefined}
                  >
                    {renderRichText(plan.guarantee)}
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
