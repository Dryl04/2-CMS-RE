import { Clock, Mail, MapPin, Facebook, Twitter, Youtube, Phone } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeaderFullContactProps {
  section: PageBuilderSection;
}

const socialIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export default function HeaderFullContact({ section }: HeaderFullContactProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const topBg = design.colors?.topBarBg || undefined;
  const textColor = design.typography?.textColor || undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const buttonBg = design.colors?.buttonBg || undefined;
  const buttonText = design.colors?.buttonText || undefined;

  return (
    <header className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="bg-base-200" style={{ backgroundColor: topBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              {content.openHours && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-base-content" style={{ color: headingColor }} />
                  <span className="text-base-content/70" style={{ color: textColor }}>{content.openHours}</span>
                </div>
              )}
              {content.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-base-content" style={{ color: headingColor }} />
                  <span className="text-base-content/70" style={{ color: textColor }}>{content.email}</span>
                </div>
              )}
              {content.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-base-content" style={{ color: headingColor }} />
                  <span className="text-base-content/70" style={{ color: textColor }}>{content.address}</span>
                </div>
              )}
            </div>

            {content.socialLinks && content.socialLinks.length > 0 && (
              <div className="flex items-center space-x-4">
                {content.socialLinks.map((social: any, index: number) => {
                  const IconComponent = socialIconMap[social.icon] || Facebook;
                  return (
                    <a key={index} href={social.url || '#'} className="hover:opacity-70 transition">
                      <IconComponent className="w-4 h-4 text-base-content" style={{ color: headingColor }} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-3xl md:text-4xl font-bold text-base-content" style={{ color: headingColor }}>
              {content.logo || 'KING'}
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              {content.menuItems?.map((item: string, index: number) => (
                <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ color: headingColor }}>
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-6">
              {content.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary" style={{ backgroundColor: headingColor }}>
                    <Phone className="w-5 h-5 text-primary-content" />
                  </div>
                  <span className="text-lg font-bold text-base-content" style={{ color: headingColor }}>
                    {content.phone}
                  </span>
                </div>
              )}
              {content.ctaText && (
                <button className="px-6 py-3 font-semibold hover:opacity-90 transition bg-primary text-primary-content" style={{
                  backgroundColor: buttonBg,
                  color: buttonText,
                }}>
                  {content.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
