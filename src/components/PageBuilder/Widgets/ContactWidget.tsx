import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContactWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function ContactWidget({ section }: ContactWidgetProps) {
  const { title, subtitle, email, phone, address, showForm } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const buttonBg = section.design?.colors?.buttonBackground || undefined;
  const buttonText = section.design?.colors?.buttonText || undefined;
  const buttonHover = section.design?.colors?.buttonBackgroundHover || undefined;

  const renderDefault = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-base-content" style={{ color: headingColor }}>
          {title || 'Get in Touch'}
        </h2>
        {subtitle && (
          <h2 className="text-lg sm:text-xl font-normal text-base-content/70" style={{ color: textColor }}>
            {subtitle}
          </h2>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-base-content" style={{ color: headingColor }}>Contact Information</h3>

          {email && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                style={{ backgroundColor: buttonBg }}
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" style={{ color: buttonText }} />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={{ color: headingColor }}>Email</div>
                <a href={`mailto:${email}`} className="text-sm sm:text-base hover:underline text-base-content/70" style={{ color: textColor }}>
                  {email}
                </a>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                style={{ backgroundColor: buttonBg }}
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" style={{ color: buttonText }} />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={{ color: headingColor }}>Phone</div>
                <a href={`tel:${phone}`} className="text-sm sm:text-base hover:underline text-base-content/70" style={{ color: textColor }}>
                  {phone}
                </a>
              </div>
            </div>
          )}

          {address && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                style={{ backgroundColor: buttonBg }}
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" style={{ color: buttonText }} />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={{ color: headingColor }}>Address</div>
                <p className="text-sm sm:text-base text-base-content/70" style={{ color: textColor }}>{address}</p>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-content/10">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={{ color: headingColor }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={{ color: headingColor }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={{ color: headingColor }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Your message"
                  className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
                onMouseOver={(e) => { if (buttonHover) e.currentTarget.style.backgroundColor = buttonHover; }}
                onMouseOut={(e) => { if (buttonBg) e.currentTarget.style.backgroundColor = buttonBg; }}
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  const renderCentered = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-base-content" style={{ color: headingColor }}>
        {title || 'Get in Touch'}
      </h2>
      {subtitle && (
        <h2 className="text-lg sm:text-xl mb-12 font-normal text-base-content/70" style={{ color: textColor }}>
          {subtitle}
        </h2>
      )}

      <div className="space-y-4 mb-12">
        {email && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70" style={{ color: textColor }}>
            <Mail className="w-5 h-5" />
            <a href={`mailto:${email}`} className="hover:underline text-sm sm:text-base">
              {email}
            </a>
          </div>
        )}

        {phone && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70" style={{ color: textColor }}>
            <Phone className="w-5 h-5" />
            <a href={`tel:${phone}`} className="hover:underline text-sm sm:text-base">
              {phone}
            </a>
          </div>
        )}

        {address && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70" style={{ color: textColor }}>
            <MapPin className="w-5 h-5" />
            <span className="text-sm sm:text-base">{address}</span>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-content/10">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
            />
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
            />
            <textarea
              rows={4}
              placeholder="Your message"
              className="w-full px-4 py-3 border border-base-content/20 rounded-xl focus:outline-none bg-base-100 text-base-content"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl font-semibold transition-colors bg-primary text-primary-content"
              style={{ backgroundColor: buttonBg, color: buttonText }}
              onMouseOver={(e) => { if (buttonHover) e.currentTarget.style.backgroundColor = buttonHover; }}
              onMouseOut={(e) => { if (buttonBg) e.currentTarget.style.backgroundColor = buttonBg; }}
            >
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-base-content" style={{ color: headingColor }}>
        {title || 'Get in Touch'}
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-8">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center space-x-2 hover:underline text-base-content/70" style={{ color: textColor }}>
            <Mail className="w-5 h-5" />
            <span className="text-sm sm:text-base">{email}</span>
          </a>
        )}

        {phone && (
          <a href={`tel:${phone}`} className="flex items-center space-x-2 hover:underline text-base-content/70" style={{ color: textColor }}>
            <Phone className="w-5 h-5" />
            <span className="text-sm sm:text-base">{phone}</span>
          </a>
        )}

        {address && (
          <div className="flex items-center space-x-2 text-base-content/70" style={{ color: textColor }}>
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{address}</span>
          </div>
        )}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'minimal':
      return renderMinimal();
    default:
      return renderDefault();
  }
}
