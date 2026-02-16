import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SimpleCenteredHeroProps {
  section: PageBuilderSection;
}

export default function SimpleCenteredHero({ section }: SimpleCenteredHeroProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const badgeBg = design.colors?.badgeBg || undefined;
  const badgeText = design.colors?.badgeText || undefined;

  return (
    <div className="bg-base-200" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <div className="inline-block mb-8">
            <span className="px-6 py-2 rounded-full text-sm font-medium bg-primary text-primary-content" style={{ backgroundColor: badgeBg, color: badgeText }}>
              {content.subtitle}
            </span>
          </div>
        )}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight text-base-content" style={{ color: headingColor }}>
          {content.title || 'Quis autem veleum iure repreh enderit.'}
        </h1>
      </div>
    </div>
  );
}
