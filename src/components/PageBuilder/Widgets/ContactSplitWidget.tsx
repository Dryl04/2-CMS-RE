import { Phone, MapPin, AtSign } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface ContactSplitWidgetProps {
  section: PageBuilderSection;
}

export default function ContactSplitWidget({ section }: ContactSplitWidgetProps) {
  const { content, design } = section;
  const buttonBg = design.colors?.buttonBackground;
  const buttonText = design.colors?.buttonText;

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

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            {content.subtitle && (
              <p
                className="text-sm font-medium tracking-wider uppercase text-base-content/70"
                style={subtitleStyle}
              >
                {renderRichText(content.subtitle)}
              </p>
            )}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-base-content"
              style={headingStyle}
            >
              {renderRichText(content.title, "Let's talk design and innovation.")}
            </h2>
            {content.description && (
              <p
                className="text-base md:text-lg text-base-content/70"
                style={textStyle}
              >
                {renderRichText(content.description)}
              </p>
            )}

            <div className="space-y-4 md:space-y-6">
              {content.phone && (
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <Phone
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base-content"
                      style={headingStyle}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-lg text-base-content"
                      style={headingStyle}
                    >
                      Phone
                    </p>
                    <p
                      className="text-base-content/70"
                      style={textStyle}
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
                      style={headingStyle}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-base md:text-lg text-base-content"
                      style={headingStyle}
                    >
                      Address
                    </p>
                    <p
                      className="text-sm md:text-base text-base-content/70"
                      style={textStyle}
                    >
                      {renderRichText(content.address)}
                    </p>
                  </div>
                </div>
              )}

              {content.email && (
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <AtSign
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-base-content"
                      style={headingStyle}
                    />
                  </div>
                  <div>
                    <p
                      className="font-bold text-base md:text-lg text-base-content"
                      style={headingStyle}
                    >
                      Email
                    </p>
                    <p
                      className="text-sm md:text-base text-base-content/70"
                      style={textStyle}
                    >
                      {renderRichText(content.email)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-base-content/10">
            <h3
              className="text-xl sm:text-2xl font-bold mb-4 md:mb-6 text-base-content"
              style={headingStyle}
            >
              {renderRichText(content.formTitle, 'Ask Us Anything')}
            </h3>
            {content.formDescription && (
              <p
                className="text-sm md:text-base mb-4 md:mb-6 text-base-content/70"
                style={textStyle}
              >
                {renderRichText(content.formDescription)}
              </p>
            )}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-base-content/70"
                    style={textStyle}
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
                    style={textStyle}
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
                    style={textStyle}
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
                    style={textStyle}
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
                    style={textStyle}
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
                    style={textStyle}
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
                    style={textStyle}
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
                className="btn btn-primary w-full h-auto py-4 text-lg"
                style={buttonBg || buttonText ? { backgroundColor: buttonBg, color: buttonText } : undefined}
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
