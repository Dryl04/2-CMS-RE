import { ChevronDown, Facebook, Twitter, Youtube, Mail, Clock, Phone } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

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
  const topBg = design.colors?.topBarBg;

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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  return (
    <header>
      <div className="bg-base-200" style={topBg ? { backgroundColor: topBg } : undefined}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {content.showAccount && (
                <button className="btn btn-ghost btn-sm flex items-center space-x-1 text-sm font-semibold text-base-content" style={{ ...headingStyle, ...linkStyle }}>
                  <span>ACCOUNT</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              {content.showSupport && (
                <a href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ ...headingStyle, ...linkStyle }}>
                  SUPPORT
                </a>
              )}
              {content.socialLinks && content.socialLinks.length > 0 && (
                <div className="flex items-center space-x-4">
                  {content.socialLinks.map((social: any, index: number) => {
                    const IconComponent = socialIconMap[social.icon] || Facebook;
                    return (
                      <a key={index} href={social.url || '#'} className="hover:opacity-70 transition" style={linkStyle}>
                        <IconComponent className="w-4 h-4 text-base-content" style={headingStyle} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {content.email && (
              <p className="text-sm text-base-content/70" style={textStyle}>
                {renderRichText(content.email)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-base-content" style={headingStyle} />
              <div>
                <p className="text-sm font-semibold text-base-content" style={headingStyle}>
                  {renderRichText(content.openHoursTitle, 'Open Hours')}
                </p>
                <p className="text-xs text-base-content/70" style={textStyle}>
                  {renderRichText(content.openHours, 'Mon - Fri 9:30 - 20:00')}
                </p>
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-base-content" style={headingStyle}>
              {renderRichText(content.logo, 'KING')}
            </div>

            {content.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-base-content" style={headingStyle} />
                <div>
                  <p className="text-sm font-semibold text-base-content" style={headingStyle}>
                    Call Us
                  </p>
                  <p className="text-xs text-base-content/70" style={textStyle}>
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
            <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ ...headingStyle, ...linkStyle }}>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
