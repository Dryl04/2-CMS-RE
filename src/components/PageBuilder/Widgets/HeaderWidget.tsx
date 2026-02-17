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

  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;

  const renderDefault = () => (
    <header className="bg-base-100 border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-base-content" style={headingColor ? { color: headingColor } : undefined}>
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
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm"
              >
                {ctaText}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-base-content"
            style={headingColor ? { color: headingColor } : undefined}
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
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm w-full"
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
              <span className="text-2xl font-bold text-base-content" style={headingColor ? { color: headingColor } : undefined}>
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
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm"
              >
                {ctaText}
              </a>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-base-content"
            style={headingColor ? { color: headingColor } : undefined}
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
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm w-full"
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
    <header className="absolute top-0 left-0 right-0 z-50 bg-base-100/75 backdrop-blur-md border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto drop-shadow-md" />
            ) : (
              <span
                className="text-xl font-bold text-base-content"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-base-content/70 hover:text-base-content font-medium transition-colors"
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm"
              >
                {ctaText}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-base-content"
            style={textColor ? { color: textColor } : undefined}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-base-100 border-t border-base-300">
          <div className="px-4 py-3 space-y-3">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block font-medium py-2 hover:opacity-80 text-base-content"
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="btn btn-primary btn-sm w-full"
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
              <span className="text-lg font-semibold text-base-content" style={headingColor ? { color: headingColor } : undefined}>
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
                style={textColor ? { color: textColor } : undefined}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="text-sm hover:underline font-medium text-base-content"
                style={headingColor ? { color: headingColor } : undefined}
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
