import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SimpleCenteredHeroProps {
  section: PageBuilderSection;
}

export default function SimpleCenteredHero({ section }: SimpleCenteredHeroProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const typo = design.typography || {};
  const h1Style = {
    ...(typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h1FontWeight || typo.headingFontWeight ? { fontWeight: typo.h1FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h1FontSize || typo.headingFontSize ? { fontSize: typo.h1FontSize || typo.headingFontSize } : {}),
    ...(typo.h1Color || typo.headingColor ? { color: typo.h1Color || typo.headingColor } : {}),
  };
  const h2Style = {
    ...(typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h2FontWeight || typo.headingFontWeight ? { fontWeight: typo.h2FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h2FontSize || typo.headingFontSize ? { fontSize: typo.h2FontSize || typo.headingFontSize } : {}),
    ...(typo.h2Color || typo.subtitleColor || typo.headingColor ? { color: typo.h2Color || typo.subtitleColor || typo.headingColor } : {}),
  };
  const headingStyle = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const linkStyle = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const badgeBg = design.colors?.badgeBg;
  const badgeText = design.colors?.badgeText;

  return (
    <div className="bg-base-200" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="inline-block mb-8">
          <h2 className="px-6 py-2 rounded-full text-sm font-medium bg-primary text-primary-content" style={badgeBg || badgeText ? { backgroundColor: badgeBg, color: badgeText, ...h2Style } : h2Style}>
            {content.subtitle || 'Crafted for high-converting landing pages'}
          </h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-base-content" style={h1Style}>
          {content.title || 'Quis autem veleum iure repreh enderit.'}
        </h1>
      </div>
    </div>
  );
}
