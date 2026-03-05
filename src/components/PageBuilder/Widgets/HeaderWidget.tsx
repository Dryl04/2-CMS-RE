import React from 'react';
import { Menu, X } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { useState } from 'react';

interface HeaderWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function HeaderWidget({ section }: HeaderWidgetProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    logo,
    logoText,
    navItems,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
  } = section.content;

  const design = section.design || {};
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
    ...(typo.headingColor || typo.h1Color ? { color: typo.headingColor || typo.h1Color } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
    ...(typo.linkColor ? { color: typo.linkColor } : {}),
  };
  const _subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };
  const _linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.linkColor ? { color: typo.linkColor } : {}),
  };

  const renderDefault = () => (
    <header className="border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-base-content" style={headingStyle}>
                {renderRichText(logoText, 'Brand')}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="font-medium transition-colors hover:opacity-80 text-base-content/70"
                style={textStyle}
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
            style={headingStyle}
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
                style={textStyle}
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
    <header className="border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center space-y-4">
          <a href="#" className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-10 w-auto" />
            ) : (
              <span className="text-2xl font-bold text-base-content" style={headingStyle}>
                {renderRichText(logoText, 'Brand')}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="font-medium transition-colors hover:opacity-80 text-base-content/70"
                style={textStyle}
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
            style={headingStyle}
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
                style={textStyle}
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
    <header className="border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto drop-shadow-md" />
            ) : (
              <span
                className="text-xl font-bold text-base-content"
                style={headingStyle}
              >
                {renderRichText(logoText, 'Brand')}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-base-content/70 hover:text-base-content font-medium transition-colors"
                style={textStyle}
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
            style={textStyle}
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
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-base-content/5">
          <a href="#" className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-6 w-auto" />
            ) : (
              <span className="text-lg font-semibold text-base-content" style={headingStyle}>
                {renderRichText(logoText, 'Brand')}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-6">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-sm transition-colors hover:opacity-80 text-base-content/70"
                style={textStyle}
              >
                {item.label}
              </a>
            ))}
            {ctaText && (
              <a
                href={ctaLink || '#'}
                className="text-sm hover:underline font-medium text-base-content"
                style={headingStyle}
              >
                {ctaText} →
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );

  const renderCreativePremium = () => (
    <header className="border-b border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center min-w-[120px]">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-7 w-auto" />
            ) : (
              <span className="text-lg font-semibold tracking-wide" style={headingStyle}>
                {renderRichText(logoText, 'FLORA')}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-6">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={textStyle}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 min-w-[120px] justify-end">
            {secondaryCtaText && (
              <a href={secondaryCtaLink || '#'} className="btn btn-outline btn-sm">
                {secondaryCtaText}
              </a>
            )}
            {ctaText && (
              <a href={ctaLink || '#'} className="btn btn-primary btn-sm">
                {ctaText}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-content"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-content/10">
          <div className="px-4 py-4 space-y-3">
            {(navItems || []).map((item: any, index: number) => (
              <a
                key={index}
                href={item.link || '#'}
                className="block text-sm font-medium py-1 text-base-content/90"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 flex flex-wrap gap-2">
              {secondaryCtaText && (
                <a href={secondaryCtaLink || '#'} className="btn btn-outline btn-sm">
                  {secondaryCtaText}
                </a>
              )}
              {ctaText && (
                <a href={ctaLink || '#'} className="btn btn-primary btn-sm">
                  {ctaText}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'transparent':
      return renderTransparent();
    case 'minimal':
      return renderMinimal();
    case 'creative-premium':
      return renderCreativePremium();
    default:
      return renderDefault();
  }
}
