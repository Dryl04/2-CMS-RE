import { ChevronDown, Facebook, Twitter, Youtube, Mail, Clock, Phone } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeaderWithIconsProps {
  section: PageBuilderSection;
}

const socialIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export default function HeaderWithIcons({ section }: HeaderWithIconsProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const topBg = design.colors?.topBarBg || undefined;
  const textColor = design.typography?.textColor || undefined;
  const headingColor = design.typography?.headingColor || undefined;

  return (
    <header className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="bg-base-200" style={{ backgroundColor: topBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {content.showAccount && (
                <button className="flex items-center space-x-1 text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ color: headingColor }}>
                  <span>ACCOUNT</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              {content.showSupport && (
                <a href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ color: headingColor }}>
                  SUPPORT
                </a>
              )}
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

            {content.email && (
              <p className="text-sm text-base-content/70" style={{ color: textColor }}>
                {content.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
              <div>
                <p className="text-sm font-semibold text-base-content" style={{ color: headingColor }}>
                  {content.openHoursTitle || 'Open Hours'}
                </p>
                <p className="text-xs text-base-content/70" style={{ color: textColor }}>
                  {content.openHours || 'Mon - Fri 9:30 - 20:00'}
                </p>
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-base-content" style={{ color: headingColor }}>
              {content.logo || 'KING'}
            </div>

            {content.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
                <div>
                  <p className="text-sm font-semibold text-base-content" style={{ color: headingColor }}>
                    Call Us
                  </p>
                  <p className="text-xs text-base-content/70" style={{ color: textColor }}>
                    {content.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-center space-x-8">
          {content.menuItems?.map((item: string, index: number) => (
            <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ color: headingColor }}>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
