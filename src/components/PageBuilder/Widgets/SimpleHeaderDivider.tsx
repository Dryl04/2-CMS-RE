import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SimpleHeaderDividerProps {
  section: PageBuilderSection;
}

export default function SimpleHeaderDivider({ section }: SimpleHeaderDividerProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const dividerColor = design.colors?.dividerColor || undefined;

  return (
    <div className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content" style={{ color: headingColor }}>
          {content.title || 'Sample Header Text'}
        </h1>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-base-content" style={{ backgroundColor: dividerColor }} />
        </div>
      </div>
    </div>
  );
}
