import { User } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeroWithTestimonialsProps {
  section: PageBuilderSection;
}

export default function HeroWithTestimonials({ section }: HeroWithTestimonialsProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;
  const cardBg = design.colors?.cardBackground || undefined;

  return (
    <div className="bg-neutral relative" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: '200px',
      }}>
        {content.subtitle && (
          <p className="text-sm font-medium tracking-wider uppercase mb-6 text-neutral-content/70" style={{ color: textColor }}>
            {content.subtitle}
          </p>
        )}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-neutral-content" style={{ color: headingColor }}>
          {content.title || 'Corporate Branding Design Services'}
        </h1>
        {content.description && (
          <p className="text-lg max-w-3xl mx-auto mb-12 text-neutral-content/70" style={{ color: textColor }}>
            {content.description}
          </p>
        )}
        {content.ctaText && (
          <button className="bg-base-100 text-base-content px-10 py-4 rounded-full font-semibold hover:bg-base-200 transition text-lg">
            {content.ctaText}
          </button>
        )}
      </div>

      {content.testimonials && content.testimonials.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ marginTop: '-150px' }}>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="rounded-3xl p-8 shadow-xl bg-base-100" style={{ backgroundColor: cardBg }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full bg-base-300" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                        <User className="w-8 h-8 text-base-content/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-base leading-relaxed text-base-content">
                      {testimonial.text}
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
