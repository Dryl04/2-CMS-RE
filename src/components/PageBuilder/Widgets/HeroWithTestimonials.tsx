import { User } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface HeroWithTestimonialsProps {
  section: PageBuilderSection;
}

export default function HeroWithTestimonials({ section }: HeroWithTestimonialsProps) {
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
  const cardBg = design.colors?.cardBackground;

  return (
    <div className="bg-neutral relative" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: content.testimonials?.length ? '180px' : design.spacing.paddingBottom,
      }}>
        <h2 className="text-sm font-medium tracking-wider uppercase mb-4 sm:mb-6 text-neutral-content/70" style={h2Style}>
          {renderRichText(content.subtitle, 'Trusted by teams that value measurable outcomes')}
        </h2>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight text-neutral-content" style={h1Style}>
          {renderRichText(content.title, 'Corporate Branding Design Services')}
        </h1>
        {content.description && (
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-8 sm:mb-12 text-neutral-content/70" style={textStyle}>
            {renderRichText(content.description)}
          </p>
        )}
        {content.ctaText && (
          <button className="btn px-8 sm:px-10 rounded-full bg-base-100 text-base-content border-transparent hover:bg-base-200 text-base sm:text-lg">
            {content.ctaText}
          </button>
        )}
      </div>

      {content.testimonials && content.testimonials.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ marginTop: '-140px' }}>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {content.testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl bg-base-100" style={cardBg ? { backgroundColor: cardBg } : undefined}>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-base-300 object-cover" />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-base-300 flex items-center justify-center">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-base-content/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm sm:text-base leading-relaxed text-base-content" style={textStyle}>
                      {renderRichText(testimonial.text)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
