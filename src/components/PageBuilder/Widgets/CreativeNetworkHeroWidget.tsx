import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface CreativeNetworkHeroWidgetProps {
  section: PageBuilderSection;
}

export default function CreativeNetworkHeroWidget({ section }: CreativeNetworkHeroWidgetProps) {
  const { content, design } = section;
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

  const navItems = content.navItems || ['Overview', 'Services', 'Pricing', 'Resources'];
  const logos = content.logos || ['HF', 'runway', 'dentsu', 'wayfair', 'xfinity'];

  return (
    <section className="bg-base-100 text-base-content">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl border border-base-content/10 overflow-hidden"
        style={{
          paddingTop: design.spacing.paddingTop,
          paddingBottom: design.spacing.paddingBottom,
          backgroundColor: design.background.type === 'color' ? design.background.value : undefined,
        }}
      >
        <div className="flex items-center justify-between mb-8 sm:mb-10 gap-4">
          <p className="text-lg sm:text-xl font-semibold" style={headingStyle}>
            {renderRichText(content.brand, 'FLORA')}
          </p>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
            {navItems.map((item: string, index: number) => (
              <a key={index} href="#" className="hover:opacity-80" style={linkStyle}>
                {item}
              </a>
            ))}
          </nav>
          <a href={content.topCtaLink || '#'} className="btn btn-primary btn-sm" style={linkStyle}>
            {content.topCtaText || 'Get started'}
          </a>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-center">
          <div className="bg-base-200 rounded-2xl p-4 border border-base-content/10">
            <img src={content.leftCardImage || ''} alt="left" className="w-full h-40 object-cover rounded-xl bg-base-300" />
            <p className="text-sm mt-3 opacity-80" style={textStyle}>
              {renderRichText(content.leftCardLabel, 'Style Transfer')}
            </p>
          </div>

          <div className="text-center px-2">
            <p className="text-xs uppercase tracking-widest mb-3 opacity-70" style={subtitleStyle}>
              {renderRichText(content.eyebrow, 'New')}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" style={h1Style}>
              {renderRichText(content.title, 'Your creative environment.')}
            </h1>
            <h2 className="mt-4 text-sm sm:text-base opacity-80" style={h2Style}>
              {renderRichText(content.subtitle, 'Bring your ideas to life faster than ever before.')}
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={content.primaryLink || '#'} className="btn btn-primary btn-sm" style={linkStyle}>{content.primaryText || 'Contact sales'}</a>
              <a href={content.secondaryLink || '#'} className="btn btn-outline btn-sm" style={linkStyle}>{content.secondaryText || 'Try for free'}</a>
            </div>
          </div>

          <div className="bg-base-200 rounded-2xl p-4 border border-base-content/10">
            <img src={content.rightCardImage || ''} alt="right" className="w-full h-40 object-cover rounded-xl bg-base-300" />
            <p className="text-sm mt-3 opacity-80" style={textStyle}>
              {renderRichText(content.rightCardLabel, 'Fashion Campaign')}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-base-content/10 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-wider opacity-70">
          {logos.map((logo: string, index: number) => (
            <span key={index}>{logo}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
