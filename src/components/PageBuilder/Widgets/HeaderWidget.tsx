import { Menu, X } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { useState } from 'react';

interface HeaderWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function HeaderWidget({ section }: HeaderWidgetProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logo, logoText, navItems, ctaText, ctaLink } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const buttonBg = section.design?.colors?.buttonBackground || undefined;
  const buttonText = section.design?.colors?.buttonText || undefined;
  const buttonHover = section.design?.colors?.buttonBackgroundHover || undefined;

  const renderDefault = () => (
    <header className="bg-base-100 border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-base-content" style={{ color: headingColor }}>
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="font-medium transition-colors hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
                onMouseOver={(e) => { if (buttonHover) e.currentTarget.style.backgroundColor = buttonHover; }}
                onMouseOut={(e) => { if (buttonBg) e.currentTarget.style.backgroundColor = buttonBg; }}
              >
                {ctaText}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-base-content"
            style={{ color: headingColor }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-content/10">
          <div className="px-4 py-3 space-y-3">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block font-medium py-2 hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="block text-center px-6 py-2 rounded-lg font-medium mt-4 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );

  const renderCentered = () => (
    <header className="bg-base-100 border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-10 w-auto" />
            ) : (
              <span className="text-2xl font-bold text-base-content" style={{ color: headingColor }}>
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="font-medium transition-colors hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
                onMouseOver={(e) => { if (buttonHover) e.currentTarget.style.backgroundColor = buttonHover; }}
                onMouseOut={(e) => { if (buttonBg) e.currentTarget.style.backgroundColor = buttonBg; }}
              >
                {ctaText}
              </a>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-base-content"
            style={{ color: headingColor }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-content/10">
          <div className="px-4 py-3 space-y-3">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block font-medium py-2 text-center hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="block text-center px-6 py-2 rounded-lg font-medium mt-4 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );

  const renderTransparent = () => (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-white">
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-white hover:text-white/70 font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="bg-base-100 hover:bg-base-200 text-base-content px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-base-100 border-t border-base-content/10">
          <div className="px-4 py-3 space-y-3">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block font-medium py-2 hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="block text-center px-6 py-2 rounded-lg font-medium mt-4 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );

  const renderMinimal = () => (
    <header className="bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-base-content/5">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-6 w-auto" />
            ) : (
              <span className="text-lg font-semibold text-base-content" style={{ color: headingColor }}>
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-sm transition-colors hover:opacity-80 text-base-content/70"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="text-sm hover:underline font-medium text-base-content"
                style={{ color: headingColor }}
              >
                {ctaText} →
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'transparent':
      return renderTransparent();
    case 'minimal':
      return renderMinimal();
    default:
      return renderDefault();
  }
}
