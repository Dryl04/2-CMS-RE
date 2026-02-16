import { Check } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SplitContentWithChecklistProps {
  section: PageBuilderSection;
}

export default function SplitContentWithChecklist({ section }: SplitContentWithChecklistProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-base-content" style={{ color: headingColor }}>
                {content.title || 'Quis autem veleum repreh enderit.'}
              </h2>
              {content.description && (
                <p className="text-lg leading-relaxed text-base-content/70" style={{ color: textColor }}>
                  {content.description}
                </p>
              )}
            </div>

            {content.divider && (
              <hr className="border-t border-base-content/10" />
            )}

            {content.checklist && (
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {content.checklist.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-base-content/70" style={{ color: textColor }} />
                    <span className="text-base text-base-content/70" style={{ color: textColor }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {content.image ? (
              <div className="bg-base-300 rounded-lg" style={{ height: '500px' }}>
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="bg-base-300 rounded-lg" style={{ height: '500px' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
