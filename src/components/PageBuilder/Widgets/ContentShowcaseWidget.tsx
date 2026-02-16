import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContentShowcaseWidgetProps {
  section: PageBuilderSection;
}

export default function ContentShowcaseWidget({ section }: ContentShowcaseWidgetProps) {
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
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
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
              {content.title || 'Quis autem veleum iure repreh enderit.'}
            </h2>
            {content.description && (
              <p
                className="text-lg leading-relaxed text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.description}
              </p>
            )}
          </div>
        </div>

        {content.image && (
          <div className="w-full">
            <img
              src={content.image}
              alt={content.title}
              className="w-full h-auto object-cover rounded-lg"
              style={{ maxHeight: '500px' }}
            />
            {content.imageCaption && (
              <p
                className="text-center mt-4 text-sm text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.imageCaption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
