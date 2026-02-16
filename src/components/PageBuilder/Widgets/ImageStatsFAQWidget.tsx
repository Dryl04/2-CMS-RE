import { Plus } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ImageStatsFAQWidgetProps {
  section: PageBuilderSection;
}

export default function ImageStatsFAQWidget({ section }: ImageStatsFAQWidgetProps) {
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative">
              {content.image && (
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-auto rounded-lg"
                />
              )}

              {content.badge && (
                <div className="absolute top-12 right-0 w-32 h-32">
                  <div className="relative w-full h-full">
                    <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                      <path
                        id="circlePath"
                        d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                        fill="none"
                      />
                      <text className="text-xs font-medium fill-base-content" style={headingColor ? { fill: headingColor } : undefined}>
                        <textPath href="#circlePath" startOffset="0%">
                          {content.badge}
                        </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}

              {content.stats && content.stats.length > 0 && (
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-4">
                  {content.stats.map((stat: any, index: number) => (
                    <div
                      key={index}
                      className="bg-neutral text-neutral-content p-6 rounded-lg min-w-[200px]"
                    >
                      <p className="text-sm font-medium mb-2">{stat.label}</p>
                      <p className="text-4xl font-bold">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs mt-2 uppercase tracking-wider">{stat.subtitle}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {content.subtitle && (
              <p
                className="text-sm font-medium tracking-wider uppercase text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.subtitle}
              </p>
            )}
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {content.title || 'Unique sites give users smooth journeys.'}
            </h2>

            <div className="space-y-6">
              {content.faqs?.map((faq: any, index: number) => (
                <div key={index} className="border-b pb-4 border-base-content/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-bold mb-2 flex items-start text-base-content"
                        style={headingColor ? { color: headingColor } : undefined}
                      >
                        <span className="mr-2">{faq.prefix || '\u2014'}</span>
                        <span>{faq.question}</span>
                      </h3>
                      {faq.answer && (
                        <p
                          className="text-base ml-6 text-base-content/70"
                          style={textColor ? { color: textColor } : undefined}
                        >
                          {faq.answer}
                        </p>
                      )}
                    </div>
                    {faq.expandable !== false && (
                      <button
                        className="ml-4 w-6 h-6 flex items-center justify-center text-base-content"
                        style={headingColor ? { color: headingColor } : undefined}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
