import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SimpleCenteredHeroProps {
  section: PageBuilderSection;
}

export default function SimpleCenteredHero({ section }: SimpleCenteredHeroProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor;
  const badgeBg = design.colors?.badgeBg;
  const badgeText = design.colors?.badgeText;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <div className="inline-block mb-8">
            <span className="px-6 py-2 rounded-full text-sm font-medium bg-primary text-primary-content" style={badgeBg || badgeText ? { backgroundColor: badgeBg, color: badgeText } : undefined}>
              {content.subtitle}
            </span>
          </div>
        )}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight text-base-content" style={headingColor ? { color: headingColor } : undefined}>
          {content.title || 'Quis autem veleum iure repreh enderit.'}
        </h1>
      </div>
    </div>
  );
}
