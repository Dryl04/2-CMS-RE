import { Mail, Send } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface NewsletterWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function NewsletterWidget({ section }: NewsletterWidgetProps) {
  const { title, subtitle, placeholder, buttonText, privacyNote, image } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const headingStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;

  const renderCentered = () => (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/20"
          style={accentColor ? { backgroundColor: `${accentColor}20` } : undefined}
        >
          <Mail
            className="w-8 h-8 text-primary"
            style={accentColor ? { color: accentColor } : undefined}
          />
        </div>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'Stay Updated'}
        </h2>
        <p
          className="text-lg sm:text-xl mb-8 text-base-content/70"
          style={textStyle}
        >
          {subtitle || 'Subscribe to our newsletter for the latest updates and exclusive content'}
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-4">
          <input
            type="email"
            placeholder={placeholder || 'Enter your email'}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-base-content/10 focus:border-base-content/30 focus:outline-none text-base bg-base-100"
          />
          <button
            type="submit"
            className="btn btn-primary px-8 py-4 rounded-xl font-semibold whitespace-nowrap transition-all hover:shadow-lg flex items-center justify-center"
            style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
          >
            <Send className="w-5 h-5 mr-2" />
            {buttonText || 'Subscribe'}
          </button>
        </form>

        {privacyNote && (
          <p
            className="text-xs text-base-content/70"
            style={textStyle}
          >
            {privacyNote}
          </p>
        )}
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-base-content"
            style={headingStyle}
          >
            {title || 'Get Exclusive Updates'}
          </h2>
          <p
            className="text-lg sm:text-xl mb-8 text-base-content/70"
            style={textStyle}
          >
            {subtitle || 'Join our newsletter and be the first to know about new features, tips, and special offers'}
          </p>

          <form className="space-y-4 mb-4">
            <input
              type="email"
              placeholder={placeholder || 'Your email address'}
              className="w-full px-6 py-4 rounded-xl border-2 border-base-content/10 focus:border-base-content/30 focus:outline-none text-base bg-base-100"
            />
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center"
              style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
            >
              {buttonText || 'Subscribe Now'}
            </button>
          </form>

          {privacyNote && (
            <p
              className="text-sm text-base-content/70"
              style={textStyle}
            >
              {privacyNote}
            </p>
          )}
        </div>

        <div className="relative">
          <img
            src={image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt="Newsletter"
            className="w-full h-96 object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </div>
  );

  const renderInline = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className="rounded-2xl p-8 sm:p-12 bg-primary/10"
        style={accentColor ? { backgroundColor: `${accentColor}10` } : undefined}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center lg:text-left">
            <h3
              className="text-2xl sm:text-3xl font-bold mb-2 text-base-content"
              style={headingStyle}
            >
              {title || 'Newsletter'}
            </h3>
            <p
              className="text-base sm:text-lg text-base-content/70"
              style={textStyle}
            >
              {subtitle || 'Get the latest news delivered to your inbox'}
            </p>
          </div>

          <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="email"
              placeholder={placeholder || 'Enter your email'}
              className="flex-1 lg:w-64 px-5 py-3 rounded-xl border-2 border-base-content/10 focus:border-base-content/30 focus:outline-none bg-base-100"
            />
            <button
              type="submit"
              className="btn btn-primary px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all hover:shadow-lg"
              style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
            >
              {buttonText || 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-base-100 rounded-3xl shadow-2xl p-8 sm:p-12 border border-base-content/10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-primary"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          >
            <Mail className="w-10 h-10 text-primary-content" />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
            style={headingStyle}
          >
            {title || 'Join Our Community'}
          </h2>
          <p
            className="text-base sm:text-lg text-base-content/70"
            style={textStyle}
          >
            {subtitle || 'Subscribe to receive exclusive content and updates'}
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-5 py-4 rounded-xl border-2 border-base-content/10 focus:border-base-content/30 focus:outline-none bg-base-100"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder={placeholder || 'Your email address'}
              className="w-full px-5 py-4 rounded-xl border-2 border-base-content/10 focus:border-base-content/30 focus:outline-none bg-base-100"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl"
            style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
          >
            {buttonText || 'Subscribe'}
          </button>
        </form>

        {privacyNote && (
          <p
            className="text-xs text-center mt-6 text-base-content/70"
            style={textStyle}
          >
            {privacyNote}
          </p>
        )}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'split':
      return renderSplit();
    case 'inline':
      return renderInline();
    case 'card':
      return renderCard();
    default:
      return renderCentered();
  }
}
