import { useState } from 'react';
import { Facebook, Twitter, Youtube, Search, Phone, Menu, X } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

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
  const topBg = design.colors?.topBarBg || undefined;
  const textColor = design.typography?.textColor || undefined;
  const headingColor = design.typography?.headingColor || undefined;

  return (
    <header className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="bg-base-200" style={{ backgroundColor: topBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              {content.socialLinks && content.socialLinks.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-4">
                  {content.socialLinks.map((social: any, index: number) => {
                    const IconComponent = socialIconMap[social.icon] || Facebook;
                    return (
                      <a key={index} href={social.url || '#'} className="hover:opacity-70 transition">
                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-base-content" style={{ color: headingColor }} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {content.description && (
              <p className="hidden sm:block text-xs sm:text-sm text-base-content/70" style={{ color: textColor }}>
                {content.description}
              </p>
            )}

            <button className="hover:opacity-70 transition">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-base-content" style={{ color: headingColor }} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content" style={{ color: headingColor }}>
              {content.logo || 'KING'}
            </div>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {content.menuItems?.map((item: string, index: number) => (
                <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition whitespace-nowrap text-base-content" style={{ color: headingColor }}>
                  {item}
                </a>
              ))}
            </nav>

            {content.phone && (
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-base-content" style={{ color: headingColor }} />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-base-content" style={{ color: headingColor }}>
                    Call Us
                  </p>
                  <p className="text-xs sm:text-sm text-base-content/70" style={{ color: textColor }}>
                    {content.phone}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-base-200 rounded-lg transition text-base-content"
              style={{ color: headingColor }}
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
                style={{ color: headingColor }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            {content.phone && (
              <div className="pt-3 border-t border-base-content/10">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
                  <div>
                    <p className="text-sm font-semibold text-base-content" style={{ color: headingColor }}>
                      Call Us
                    </p>
                    <p className="text-sm text-base-content/70" style={{ color: textColor }}>
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
