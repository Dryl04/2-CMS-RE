import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ProviderMasonryWidgetProps {
  section: PageBuilderSection;
}

interface ProviderItem {
  name?: string;
  tag?: string;
  meta?: string;
  image?: string;
  tall?: boolean;
  wide?: boolean;
}

export default function ProviderMasonryWidget({ section }: ProviderMasonryWidgetProps) {
  const { content, design } = section;
  const providers = (content.providers || []) as ProviderItem[];

  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  return (
    <section className="bg-base-100">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={headingStyle}>
              {content.title || 'One subscription to rule them all.'}
            </h2>
            <p className="text-sm mt-2 opacity-80" style={subtitleStyle}>
              {content.subtitle || 'Compare models and providers in one place.'}
            </p>
          </div>
          <a href={content.ctaLink || '#'} className="btn btn-outline btn-sm" style={linkStyle}>{content.ctaText || 'View all models'}</a>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[160px] sm:auto-rows-[170px]">
          {providers.map((item: ProviderItem, index: number) => (
            <article
              key={index}
              className={`rounded-2xl border border-base-content/10 overflow-hidden bg-base-200 ${item.tall ? 'md:row-span-2' : ''} ${item.wide ? 'md:col-span-2' : ''}`}
            >
              <div className="h-full relative">
                <img src={item.image || ''} alt={item.name || 'provider'} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-neutral/50" />
                <div className="relative z-10 p-4 flex h-full flex-col justify-end">
                  <p className="text-xs uppercase tracking-wider text-neutral-content/80" style={subtitleStyle}>{item.tag || 'Provider'}</p>
                  <h3 className="text-lg font-semibold text-neutral-content" style={headingStyle}>{item.name || 'Model'}</h3>
                  <p className="text-xs text-neutral-content/80 mt-1" style={textStyle}>{item.meta || ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
