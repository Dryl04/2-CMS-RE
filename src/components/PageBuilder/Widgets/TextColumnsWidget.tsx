import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface TextColumnsWidgetProps {
  section: PageBuilderSection;
}

export default function TextColumnsWidget({ section }: TextColumnsWidgetProps) {
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
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {content.title || 'Maximize your website\'s impact with premium content sections.'}
            </h2>
          </div>

          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6 md:gap-8">
            {content.columns?.map((column: any, index: number) => (
              <div key={index} className="space-y-3 sm:space-y-4">
                {column.heading && (
                  <h3
                    className="text-lg sm:text-xl font-bold text-base-content"
                    style={headingColor ? { color: headingColor } : undefined}
                  >
                    {column.heading}
                  </h3>
                )}
                <div
                  className="space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed text-base-content/70"
                  style={textColor ? { color: textColor } : undefined}
                >
                  {column.paragraphs?.map((paragraph: string, pIndex: number) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
