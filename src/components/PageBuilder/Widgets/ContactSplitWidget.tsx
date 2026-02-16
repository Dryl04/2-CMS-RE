import { Phone, MapPin, AtSign } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContactSplitWidgetProps {
  section: PageBuilderSection;
}

export default function ContactSplitWidget({ section }: ContactSplitWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const textColor = design.typography?.textColor || undefined;
  const buttonBg = design.colors?.buttonBackground || undefined;
  const buttonText = design.colors?.buttonText || undefined;

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            {content.subtitle && (
              <p
                className="text-sm font-medium tracking-wider uppercase text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.subtitle}
              </p>
            )}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {content.title || "Let's talk design and innovation."}
            </h2>
            {content.description && (
              <p
                className="text-base md:text-lg text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.description}
              </p>
            )}

            <div className="space-y-4 md:space-y-6">
              {content.phone && (
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <Phone
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-lg text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    >
                      Phone
                    </p>
                    <p
                      className="text-base-content/70"
                      style={textColor ? { color: textColor } : undefined}
                    >
                      {content.phone}
                    </p>
                  </div>
                </div>
              )}

              {content.address && (
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-base md:text-lg text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    >
                      Address
                    </p>
                    <p
                      className="text-sm md:text-base text-base-content/70"
                      style={textColor ? { color: textColor } : undefined}
                    >
                      {content.address}
                    </p>
                  </div>
                </div>
              )}

              {content.email && (
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <AtSign
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-base md:text-lg text-base-content"
                      style={headingColor ? { color: headingColor } : undefined}
                    >
                      Email
                    </p>
                    <p
                      className="text-sm md:text-base text-base-content/70"
                      style={textColor ? { color: textColor } : undefined}
                    >
                      {content.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-base-content/10">
            <h3
              className="text-xl sm:text-2xl font-bold mb-4 md:mb-6 text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {content.formTitle || 'Ask Us Anything'}
            </h3>
            {content.formDescription && (
              <p
                className="text-sm md:text-base mb-4 md:mb-6 text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {content.formDescription}
              </p>
            )}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Name Surname
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Select Service
                  </label>
                  <select className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content">
                    <option>Website Design</option>
                    <option>Branding</option>
                    <option>Development</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textColor ? { color: textColor } : undefined}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg font-semibold text-lg transition hover:opacity-90 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {content.buttonText || 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
