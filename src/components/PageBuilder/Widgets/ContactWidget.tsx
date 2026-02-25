import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface ContactWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function ContactWidget({ section }: ContactWidgetProps) {
  const { title, subtitle, email, phone, address, showForm } = section.content;

  const design = section.design || {};
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

  const renderDefault = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-base-content" style={headingStyle}>
          {renderRichText(title, 'Get in Touch')}
        </h2>
        {subtitle && (
          <p className="text-lg sm:text-xl font-normal text-base-content/70" style={subtitleStyle}>
            {renderRichText(subtitle)}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-base-content" style={headingStyle}>Contact Information</h3>

          {email && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                data-widget-icon-frame
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={headingStyle}>Email</div>
                <a href={`mailto:${email}`} className="text-sm sm:text-base hover:underline text-base-content/70" style={textStyle}>
                  {email}
                </a>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                data-widget-icon-frame
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={headingStyle}>Phone</div>
                <a href={`tel:${phone}`} className="text-sm sm:text-base hover:underline text-base-content/70" style={textStyle}>
                  {phone}
                </a>
              </div>
            </div>
          )}

          {address && (
            <div className="flex items-start space-x-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary"
                data-widget-icon-frame
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-content" />
              </div>
              <div>
                <div className="font-semibold mb-1 text-sm sm:text-base text-base-content" style={headingStyle}>Address</div>
                <p className="text-sm sm:text-base text-base-content/70" style={textStyle}>{renderRichText(address)}</p>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-content/10">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={headingStyle}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={headingStyle}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content" style={headingStyle}>
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Your message"
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
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
      <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-base-content" style={headingStyle}>
        {renderRichText(title, 'Get in Touch')}
      </h2>
      {subtitle && (
        <p className="text-lg sm:text-xl mb-12 font-normal text-base-content/70" style={subtitleStyle}>
          {renderRichText(subtitle)}
        </p>
      )}

      <div className="space-y-4 mb-12">
        {email && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70">
            <Mail className="w-5 h-5" />
            <a href={`mailto:${email}`} className="hover:underline text-sm sm:text-base" style={textStyle}>
              {email}
            </a>
          </div>
        )}

        {phone && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70">
            <Phone className="w-5 h-5" />
            <a href={`tel:${phone}`} className="hover:underline text-sm sm:text-base" style={textStyle}>
              {phone}
            </a>
          </div>
        )}

        {address && (
          <div className="flex items-center justify-center space-x-3 text-base-content/70">
            <MapPin className="w-5 h-5" />
            <span className="text-sm sm:text-base" style={textStyle}>{renderRichText(address)}</span>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-base-100 rounded-2xl p-6 sm:p-8 border border-base-content/10">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Your name"
              className="input input-bordered w-full"
            />
            <input
              type="email"
              placeholder="your@email.com"
              className="input input-bordered w-full"
            />
            <textarea
              rows={4}
              placeholder="Your message"
              className="textarea textarea-bordered w-full"
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-base-content" style={headingStyle}>
        {renderRichText(title, 'Get in Touch')}
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-8">
        {email && (
          <a href={`mailto:${email}`} className="flex items-center space-x-2 hover:underline text-base-content/70" style={textStyle}>
            <Mail className="w-5 h-5" />
            <span className="text-sm sm:text-base">{email}</span>
          </a>
        )}

        {phone && (
          <a href={`tel:${phone}`} className="flex items-center space-x-2 hover:underline text-base-content/70" style={textStyle}>
            <Phone className="w-5 h-5" />
            <span className="text-sm sm:text-base">{phone}</span>
          </a>
        )}

        {address && (
          <div className="flex items-center space-x-2 text-base-content/70" style={textStyle}>
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{renderRichText(address)}</span>
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
