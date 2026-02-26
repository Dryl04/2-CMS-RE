import { Play } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface FeedbackContactWidgetProps {
  section: PageBuilderSection;
}

export default function FeedbackContactWidget({ section }: FeedbackContactWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
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
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {content.subtitle && (
              <p
                className="text-sm font-medium tracking-wider uppercase text-base-content/70"
                style={subtitleStyle}
              >
                {renderRichText(content.subtitle)}
              </p>
            )}
            <h2
              className="text-4xl md:text-6xl font-bold leading-tight text-base-content"
              style={headingStyle}
            >
              {renderRichText(content.title, 'User feedbacks shapes better designs.')}
            </h2>
            {content.description && (
              <p
                className="text-lg leading-relaxed text-base-content/70"
                style={textStyle}
              >
                {renderRichText(content.description)}
              </p>
            )}

            <div className="flex items-center space-x-4">
              <button className="btn btn-primary px-8">
                {content.ctaText || 'Learn More'}
              </button>
              <button className="btn btn-primary btn-square w-12 h-12 min-h-12">
                <Play className="w-5 h-5 text-primary-content fill-primary-content" />
              </button>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-2xl p-8 border border-base-content/10">
            <h3
              className="text-2xl font-bold mb-6 text-base-content"
              style={headingStyle}
            >
              {renderRichText(content.formTitle, 'Reach Us Here')}
            </h3>
            {content.formDescription && (
              <p
                className="text-base mb-6 text-base-content/70"
                style={textStyle}
              >
                {renderRichText(content.formDescription)}
              </p>
            )}

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Name Surname
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Select Service
                  </label>
                  <select className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content">
                    <option>Website Design</option>
                    <option>Branding</option>
                    <option>Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-base-content/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-base-content/70" style={textStyle}>
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
