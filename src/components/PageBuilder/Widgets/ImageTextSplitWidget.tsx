import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ImageTextSplitWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function ImageTextSplitWidget({ section }: ImageTextSplitWidgetProps) {
  const {
    subtitle,
    headline,
    paragraph1,
    paragraph2,
    paragraph3,
    ctaText,
    ctaLink,
    image
  } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const subtitleColor = section.design?.typography?.subtitleColor || undefined;
  const linkColor = section.design?.typography?.linkColor || undefined;
  const bgColor = section.design?.background?.value || undefined;

  const renderDefault = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
      <div className="relative">
        <img
          src={image || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg"
        />
      </div>
      <div className="space-y-4 md:space-y-6">
        <h2
          className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl italic leading-relaxed text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Nemo enim quia sit asper natur sed magni dolores eos ratione serui nesciunt est dolorem ipsum dolor sit amet consec tetur adipisci velit sed non numsuam modi.'}
        </h2>

        <div className="space-y-3 md:space-y-4">
          <p
            className="text-sm lg:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph1 || 'Welcome to our digital sanctuary, an immersive space where the symphony of innovation and creativity harmoniously reverberates. As you step into this virtual realm, be prepared for a transformative journey that transcends the ordinary and delves deep into the extraordinary.'}
          </p>

          <p
            className="text-sm lg:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph2 || 'As you step into this virtual realm, be prepared for a transformative journey that transcends the ordinary and delves deep into the extraordinary. Here at our digital abode, we don\'t just design websites we orchestrate experiences, sculpting each pixel with intentionality and crafting narratives that leave an indelible mark.'}
          </p>

          {paragraph3 && (
            <p
              className="text-sm lg:text-base leading-relaxed text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {paragraph3}
            </p>
          )}
        </div>

        <a
          href={ctaLink || '#'}
          className="inline-block font-semibold text-xs sm:text-sm tracking-wider uppercase border-b-2 pb-1 transition-colors hover:opacity-70 text-base-content border-base-content"
          style={linkColor ? { color: linkColor, borderColor: linkColor } : undefined}
        >
          {ctaText || 'LEARN MORE'}
        </a>
      </div>
      </div>
    </div>
  );

  const renderImageRight = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
      <div className="space-y-4 md:space-y-6 order-2 md:order-1">
        <h2
          className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl italic leading-relaxed text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Nemo enim quia sit asper natur sed magni dolores eos ratione serui nesciunt est dolorem ipsum dolor sit amet consec tetur adipisci velit sed non numsuam modi.'}
        </h2>

        <div className="space-y-3 md:space-y-4">
          <p
            className="text-sm lg:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph1 || 'Welcome to our digital sanctuary, an immersive space where the symphony of innovation and creativity harmoniously reverberates.'}
          </p>

          <p
            className="text-sm lg:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph2 || 'As you step into this virtual realm, be prepared for a transformative journey that transcends the ordinary and delves deep into the extraordinary.'}
          </p>

          {paragraph3 && (
            <p
              className="text-sm lg:text-base leading-relaxed text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {paragraph3}
            </p>
          )}
        </div>

        <a
          href={ctaLink || '#'}
          className="inline-block font-semibold text-xs sm:text-sm tracking-wider uppercase border-b-2 pb-1 transition-colors hover:opacity-70 text-base-content border-base-content"
          style={linkColor ? { color: linkColor, borderColor: linkColor } : undefined}
        >
          {ctaText || 'LEARN MORE'}
        </a>
      </div>
      <div className="relative order-1 md:order-2">
        <img
          src={image || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg"
        />
      </div>
      </div>
    </div>
  );

  const renderStacked = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="relative w-full">
        <img
          src={image || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
          alt="Content"
          className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg"
        />
      </div>
      <div className="space-y-4 md:space-y-6">
        <h2
          className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl italic leading-relaxed text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {headline || 'Nemo enim quia sit asper natur sed magni dolores eos ratione'}
        </h2>

        <div className="space-y-3 md:space-y-4">
          <p
            className="text-sm md:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph1 || 'Welcome to our digital sanctuary, an immersive space where the symphony of innovation and creativity harmoniously reverberates.'}
          </p>

          <p
            className="text-sm md:text-base leading-relaxed text-base-content/70"
            style={textColor ? { color: textColor } : undefined}
          >
            {paragraph2 || 'As you step into this virtual realm, be prepared for a transformative journey that transcends the ordinary.'}
          </p>
        </div>

        <a
          href={ctaLink || '#'}
          className="inline-block font-semibold text-xs sm:text-sm tracking-wider uppercase border-b-2 pb-1 transition-colors hover:opacity-70 text-base-content border-base-content"
          style={linkColor ? { color: linkColor, borderColor: linkColor } : undefined}
        >
          {ctaText || 'LEARN MORE'}
        </a>
      </div>
      </div>
    </div>
  );

  switch (section.variant) {
    case 'image-right':
      return renderImageRight();
    case 'stacked':
      return renderStacked();
    default:
      return renderDefault();
  }
}
