import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface EditorialCardsRowWidgetProps {
  section: PageBuilderSection;
}

interface EditorialCard {
  title?: string;
  description?: string;
  image?: string;
  meta?: string;
}

export default function EditorialCardsRowWidget({ section }: EditorialCardsRowWidgetProps) {
  const { content, design } = section;
  const cards = (content.cards || []) as EditorialCard[];

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

  const columns = section.variant === 'four-columns' ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <section className="bg-base-100">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={headingStyle}>
              {content.title || 'Stories from creative teams.'}
            </h2>
            <p className="text-sm mt-2 opacity-80" style={subtitleStyle}>
              {content.subtitle || 'Showcase case studies, press or editorial highlights.'}
            </p>
          </div>
          {content.ctaText && <a href={content.ctaLink || '#'} className="btn btn-outline btn-sm" style={linkStyle}>{content.ctaText}</a>}
        </div>

        <div className={`grid sm:grid-cols-2 ${columns} gap-4`}>
          {cards.map((card: EditorialCard, index: number) => (
            <article key={index} className="rounded-2xl border border-base-content/10 overflow-hidden bg-base-200">
              <img src={card.image || ''} alt={card.title || 'card'} className="w-full h-40 object-cover bg-base-300" />
              <div className="p-4">
                <h3 className="text-lg font-semibold" style={headingStyle}>{card.title || 'Card title'}</h3>
                <p className="text-sm mt-2 opacity-80" style={textStyle}>{card.description || ''}</p>
                {card.meta && <p className="text-xs mt-3 opacity-60" style={textStyle}>{card.meta}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
