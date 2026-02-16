import { Star } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface TestimonialsWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function TestimonialsWidget({ section }: TestimonialsWidgetProps) {
  const { title, subtitle, testimonials } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;

  const headingStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-base-content/30'
          }`}
        />
      ))}
    </div>
  );

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'What Our Customers Say'}
        </h2>
        {subtitle && (
          <h2
            className="text-lg sm:text-xl font-normal text-base-content/70"
            style={textStyle}
          >
            {subtitle}
          </h2>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {(testimonials || []).map((testimonial: any, index: number) => (
          <div key={index} className="bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-content/10">
            {testimonial.rating && renderStars(testimonial.rating)}
            <p
              className="my-4 leading-relaxed text-sm sm:text-base text-base-content/70"
              style={textStyle}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center space-x-3">
              {testimonial.avatar && (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
              )}
              <div>
                <div
                  className="font-semibold text-sm sm:text-base text-base-content"
                  style={headingStyle}
                >
                  {testimonial.name}
                </div>
                <div
                  className="text-xs sm:text-sm text-base-content/50"
                  style={textColor ? { color: textColor, opacity: 0.7 } : undefined}
                >
                  {testimonial.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2
        className="text-3xl sm:text-4xl font-bold mb-12 text-base-content"
        style={headingStyle}
      >
        {title || 'What Our Customers Say'}
      </h2>

      {(testimonials || []).slice(0, 1).map((testimonial: any, index: number) => (
        <div key={index} className="bg-base-100 rounded-2xl p-8 sm:p-12 border border-base-content/10">
          {testimonial.rating && (
            <div className="flex justify-center mb-6">
              {renderStars(testimonial.rating)}
            </div>
          )}
          <p
            className="text-xl sm:text-2xl mb-8 leading-relaxed text-base-content/70"
            style={textStyle}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex flex-col items-center">
            {testimonial.avatar && (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mb-3"
              />
            )}
            <div
              className="font-semibold text-base sm:text-lg text-base-content"
              style={headingStyle}
            >
              {testimonial.name}
            </div>
            <div
              className="text-sm sm:text-base text-base-content/50"
              style={textColor ? { color: textColor, opacity: 0.7 } : undefined}
            >
              {testimonial.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2 text-base-content"
          style={headingStyle}
        >
          {title || 'What Our Customers Say'}
        </h2>
        {subtitle && (
          <h2
            className="text-base sm:text-lg font-normal text-base-content/70"
            style={textStyle}
          >
            {subtitle}
          </h2>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {(testimonials || []).map((testimonial: any, index: number) => (
          <div
            key={index}
            className="border-l-4 border-primary pl-4 sm:pl-6 py-2"
            style={headingColor ? { borderColor: headingColor } : undefined}
          >
            <p
              className="mb-3 italic text-sm sm:text-base text-base-content/70"
              style={textStyle}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="text-sm">
              <span
                className="font-semibold text-base-content"
                style={headingStyle}
              >
                {testimonial.name}
              </span>
              {testimonial.title && (
                <span
                  className="text-base-content/50"
                  style={textColor ? { color: textColor, opacity: 0.7 } : undefined}
                >
                  {' '}&mdash; {testimonial.title}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'carousel':
      return renderCarousel();
    case 'minimal':
      return renderMinimal();
    default:
      return renderGrid();
  }
}
