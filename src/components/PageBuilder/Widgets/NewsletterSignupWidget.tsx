import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface NewsletterSignupWidgetProps {
  section: PageBuilderSection;
}

export default function NewsletterSignupWidget({ section }: NewsletterSignupWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;

  return (
    <div className="bg-neutral" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-6 text-neutral-content/70" style={{ color: textColor }}>
            {content.subtitle}
          </p>
        )}

        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-neutral-content" style={{ color: headingColor }}>
          {content.title || 'Sign up now for exclusive contents.'}
        </h2>

        {content.description && (
          <p className="text-lg mb-12 max-w-3xl mx-auto text-neutral-content/70" style={{ color: textColor }}>
            {content.description}
          </p>
        )}

        <form className="flex items-center max-w-2xl mx-auto">
          <div className="flex-1 bg-base-100 rounded-full p-2 flex items-center">
            <input
              type="email"
              placeholder={content.placeholder || 'Your Email Address'}
              className="flex-1 px-6 py-3 bg-transparent border-none focus:outline-none text-base-content"
            />
            <button
              type="submit"
              className="bg-primary text-primary-content px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:opacity-90 transition whitespace-nowrap"
            >
              {content.buttonText || 'SUBSCRIBE'}
            </button>
          </div>
        </form>

        {content.note && (
          <p className="text-sm mt-6 text-neutral-content/70" style={{ color: textColor }}>
            {content.note}
          </p>
        )}
      </div>
    </div>
  );
}
