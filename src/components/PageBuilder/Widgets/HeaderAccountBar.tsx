import { useState } from 'react';
import { Facebook, Twitter, Youtube, Search, Phone, Menu, X } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface HeaderAccountBarProps {
  section: PageBuilderSection;
}

const socialIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

export default function HeaderAccountBar({ section }: HeaderAccountBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              {content.socialLinks && content.socialLinks.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-4">
                  {content.socialLinks.map((social: any, index: number) => {
                    const IconComponent = socialIconMap[social.icon] || Facebook;
                    return (
                      <a key={index} href={social.url || '#'} className="hover:opacity-70 transition" style={linkStyle}>
                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-base-content" style={headingStyle} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {content.description && (
              <p className="hidden sm:block text-xs sm:text-sm text-base-content/70" style={textStyle}>
                {renderRichText(content.description)}
              </p>
            )}

            <button className="btn btn-ghost btn-square btn-sm hover:opacity-70 transition">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-base-content" style={headingStyle} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content" style={headingStyle}>
              {renderRichText(content.logo, 'KING')}
            </div>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {content.menuItems?.map((item: string, index: number) => (
                <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition whitespace-nowrap text-base-content" style={{ ...headingStyle, ...linkStyle }}>
                  {item}
                </a>
              ))}
            </nav>

            {content.phone && (
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-base-content" style={headingStyle} />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-base-content" style={headingStyle}>
                    Call Us
                  </p>
                  <p className="text-xs sm:text-sm text-base-content/70" style={textStyle}>
                    {content.phone}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-base-200 rounded-lg transition text-base-content"
              style={headingStyle}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-base-content/10 bg-base-100">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {content.menuItems?.map((item: string, index: number) => (
              <a
                key={index}
                href="#"
                className="block text-base font-semibold hover:opacity-70 transition py-2 text-base-content"
                style={{ ...headingStyle, ...linkStyle }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            {content.phone && (
              <div className="pt-3 border-t border-base-content/10">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-base-content" style={headingStyle} />
                  <div>
                    <p className="text-sm font-semibold text-base-content" style={headingStyle}>
                      Call Us
                    </p>
                    <p className="text-sm text-base-content/70" style={textStyle}>
                      {content.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
