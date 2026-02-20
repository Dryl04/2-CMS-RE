import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ClickFunnelFooterProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function ClickFunnelFooter({ section }: ClickFunnelFooterProps) {
  const content = section.content as {
    logo?: string;
    logoText?: string;
    columns?: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;
    showPrivacyChoices?: boolean;
    privacyChoicesText?: string;
  };

  const {
    logo = '',
    logoText = 'ClickFunnels',
    columns = [
      {
        title: 'Product',
        links: [
          { label: 'Sales Funnels', url: '#' },
          { label: 'Websites', url: '#' },
          { label: 'Ecommerce Store', url: '#' },
          { label: 'Add to Cart', url: '#' },
          { label: 'Landing Pages', url: '#' },
          { label: 'Blog', url: '#' },
          { label: 'Customer Center', url: '#' },
          { label: 'Email Marketing', url: '#' },
          { label: 'Workflows', url: '#' },
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'Careers', url: '#' },
          { label: 'Partnerships', url: '#' },
          { label: 'Affiliate Program', url: '#' },
          { label: 'Legal', url: '#' },
          { label: 'Privacy Policy', url: '#' },
        ]
      },
      {
        title: 'Help',
        links: [
          { label: 'ClickFunnels Login', url: '#' },
          { label: 'ClickFunnels Classic Login', url: '#' },
          { label: 'ClickFunnels Blog', url: '#' },
          { label: 'Help Center', url: '#' },
          { label: 'Official Facebook Group', url: '#' },
          { label: 'Business Tools', url: '#' },
          { label: 'ClickFunnels Status', url: '#' },
          { label: 'ClickFunnels Classic Status', url: '#' },
          { label: 'Product Updates', url: '#' },
          { label: 'Accessibility Options', url: '#' },
        ]
      }
    ],
    showPrivacyChoices = true,
    privacyChoicesText = 'Your Privacy Choices'
  } = content;

  const bgColor = section.design?.background?.type === 'color' && section.design?.background?.value
    ? section.design.background.value
    : '#0a1628';

  const typo = section.design?.typography || {};
  const fontFamily = typo.fontFamily || undefined;
  const headingFontFamily = typo.headingFontFamily || fontFamily || undefined;

  const headingStyle: React.CSSProperties = {
    ...(headingFontFamily ? { fontFamily: headingFontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const linkTextStyle: React.CSSProperties = {
    ...(fontFamily ? { fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };

  const linkHoverColor = section.design?.colors?.linkHover || '#FFFFFF';

  const variant = section.variant || 'default';

  const getGridCols = () => {
    switch (variant) {
      case 'two-columns':
        return 'grid-cols-1 md:grid-cols-2';
      case 'four-columns':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-3';
    }
  };

  return (
    <footer className="py-16 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-12">
          {logo ? (
            <img src={logo} alt={logoText} className="h-8" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-base-100 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500 fill-current">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <span
                className="text-xl font-bold"
                style={headingStyle}
              >
                {logoText}
              </span>
            </div>
          )}
        </div>

        <div className={`grid ${getGridCols()} gap-8 md:gap-12 mb-8`}>
          {columns.map((column, index) => (
            <div key={index}>
              <h3
                className="font-bold text-lg mb-4"
                style={headingStyle}
              >
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      className="transition-colors duration-200 hover-link"
                      style={linkTextStyle}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = linkHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = '';
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {showPrivacyChoices && (
          <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-700">
            <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: 'currentColor' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span style={linkTextStyle}>
              {privacyChoicesText}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
