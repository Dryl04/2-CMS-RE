import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface CreativeNetworkHeroWidgetProps {
  section: PageBuilderSection;
}

export default function CreativeNetworkHeroWidget({ section }: CreativeNetworkHeroWidgetProps) {
  const { content, design } = section;
  const headingColor = design.typography?.headingColor;
  const textColor = design.typography?.textColor;

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
        <div className="flex items-center justify-between mb-10">
          <p className="text-xl font-semibold" style={headingColor ? { color: headingColor } : undefined}>
            {content.brand || 'FLORA'}
          </p>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item: string, index: number) => (
              <a key={index} href="#" className="hover:opacity-80" style={textColor ? { color: textColor } : undefined}>
                {item}
              </a>
            ))}
          </nav>
          <a href={content.topCtaLink || '#'} className="btn btn-primary btn-sm">
            {content.topCtaText || 'Get started'}
          </a>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-center">
          <div className="bg-base-200 rounded-2xl p-4 border border-base-content/10">
            <img src={content.leftCardImage || ''} alt="left" className="w-full h-40 object-cover rounded-xl bg-base-300" />
            <p className="text-sm mt-3 opacity-80" style={textColor ? { color: textColor } : undefined}>
              {content.leftCardLabel || 'Style Transfer'}
            </p>
          </div>

          <div className="text-center px-2">
            <p className="text-xs uppercase tracking-widest mb-3 opacity-70" style={textColor ? { color: textColor } : undefined}>
              {content.eyebrow || 'New'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight" style={headingColor ? { color: headingColor } : undefined}>
              {content.title || 'Your creative environment.'}
            </h1>
            <p className="mt-4 text-sm sm:text-base opacity-80" style={textColor ? { color: textColor } : undefined}>
              {content.subtitle || 'Bring your ideas to life faster than ever before.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={content.primaryLink || '#'} className="btn btn-primary btn-sm">{content.primaryText || 'Contact sales'}</a>
              <a href={content.secondaryLink || '#'} className="btn btn-outline btn-sm">{content.secondaryText || 'Try for free'}</a>
            </div>
          </div>

          <div className="bg-base-200 rounded-2xl p-4 border border-base-content/10">
            <img src={content.rightCardImage || ''} alt="right" className="w-full h-40 object-cover rounded-xl bg-base-300" />
            <p className="text-sm mt-3 opacity-80" style={textColor ? { color: textColor } : undefined}>
              {content.rightCardLabel || 'Fashion Campaign'}
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
