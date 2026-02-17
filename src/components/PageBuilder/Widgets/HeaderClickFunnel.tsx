import { ArrowRight, Menu, X } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { useState } from 'react';

interface HeaderClickFunnelProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function HeaderClickFunnel({ section }: HeaderClickFunnelProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content, design } = section;

  const bgColor = design?.background?.type === 'color' ? design.background.value : '#1B2A4E';
  const textColor = design?.typography?.textColor || '#FFFFFF';
  const navColor = design?.typography?.navColor || '#E5E7EB';
  const buttonBg = design?.colors?.buttonBg || '#F59E0B';
  const buttonText = design?.colors?.buttonText || '#000000';
  const logoColor = design?.typography?.headingColor || '#FFFFFF';

  return (
    <header style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            {content.logo ? (
              <img src={content.logo} alt={content.logoText || 'Logo'} className="h-8 w-auto" />
            ) : (
              <>
                {content.logoIcon && (
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: content.logoIconBg || '#FFFFFF',
                      color: content.logoIconColor || '#EF4444',
                    }}
                  >
                    {content.logoIcon}
                  </div>
                )}
                <span
                  className="text-xl font-bold tracking-wide"
                  style={{ color: logoColor }}
                >
                  {content.logoText || 'Brand'}
                </span>
              </>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {(content.navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: navColor }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {content.ctaText && (
              <a
                href={content.ctaLink || '#'}
                className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90 shadow-lg"
                style={{
                  backgroundColor: buttonBg,
                  color: buttonText,
                }}
              >
                {content.ctaText}
                {content.showCtaArrow !== false && (
                  <ArrowRight className="ml-2 w-4 h-4" />
                )}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: textColor }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-4 py-4 space-y-3">
            {(content.navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block py-2 text-sm font-medium"
                style={{ color: navColor }}
              >
                {item.label}
              </a>
            ))}
            {content.ctaText && (
              <a
                href={content.ctaLink || '#'}
                className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-md text-sm font-semibold mt-4"
                style={{
                  backgroundColor: buttonBg,
                  color: buttonText,
                }}
              >
                {content.ctaText}
                {content.showCtaArrow !== false && (
                  <ArrowRight className="ml-2 w-4 h-4" />
                )}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
