import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface FooterWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

const socialIconMap: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function FooterWidget({ section }: FooterWidgetProps) {
  const { logo, logoText, description, columns, socialLinks, copyright } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const iconBg = section.design?.colors?.buttonBackground || undefined;
  const iconColor = section.design?.colors?.buttonText || undefined;

  const renderDefault = () => (
    <footer className="bg-neutral text-neutral-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-8 w-auto mb-4" />
            ) : (
              <span className="text-xl font-bold mb-4 block text-neutral-content" style={{ color: headingColor }}>
                {logoText || 'Brand'}
              </span>
            )}
            {description && (
              <p className="text-sm mb-4 text-neutral-content/70" style={{ color: textColor }}>
                {description}
              </p>
            )}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex items-center space-x-3">
                {socialLinks.map((social: any, index: number) => {
                  const Icon = socialIconMap[social.platform] || Facebook;
                  return (
                    <a
                      key={index}
                      href={social.url || '#'}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity bg-primary text-primary-content"
                      style={{ backgroundColor: iconBg }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {(columns || []).map((column: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-neutral-content" style={{ color: headingColor }}>
                {column.title}
              </h3>
              <ul className="space-y-2">
                {(column.links || []).map((link: any, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url || '#'}
                      className="text-sm hover:opacity-80 transition-opacity text-neutral-content/70"
                      style={{ color: textColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-content/20 pt-8">
          <p className="text-xs sm:text-sm text-center text-neutral-content/70" style={{ color: textColor }}>
            {copyright || `\u00A9 ${new Date().getFullYear()} ${logoText || 'Brand'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );

  const renderMinimal = () => (
    <footer className="bg-base-100 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            {logo ? (
              <img src={logo} alt={logoText || 'Logo'} className="h-6 w-auto" />
            ) : (
              <span className="text-lg font-semibold text-base-content" style={{ color: headingColor }}>
                {logoText || 'Brand'}
              </span>
            )}
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {(columns || []).flatMap((column: any) =>
              (column.links || []).map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url || '#'}
                  className="text-sm hover:opacity-80 transition-opacity text-base-content/70"
                  style={{ color: textColor }}
                >
                  {link.label}
                </a>
              ))
            )}
          </nav>

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center space-x-3">
              {socialLinks.map((social: any, index: number) => {
                const Icon = socialIconMap[social.platform] || Facebook;
                return (
                  <a
                    key={index}
                    href={social.url || '#'}
                    className="hover:opacity-80 transition-opacity text-base-content/70"
                    style={{ color: textColor }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-base-content/70" style={{ color: textColor }}>
            {copyright || `\u00A9 ${new Date().getFullYear()} ${logoText || 'Brand'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );

  const renderCentered = () => (
    <footer className="bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="text-center mb-8">
          {logo ? (
            <img src={logo} alt={logoText || 'Logo'} className="h-10 w-auto mx-auto mb-4" />
          ) : (
            <span className="text-2xl font-bold block mb-4 text-base-content" style={{ color: headingColor }}>
              {logoText || 'Brand'}
            </span>
          )}
          {description && (
            <p className="max-w-md mx-auto mb-6 text-sm sm:text-base text-base-content/70" style={{ color: textColor }}>
              {description}
            </p>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center justify-center space-x-3 mb-8">
              {socialLinks.map((social: any, index: number) => {
                const Icon = socialIconMap[social.platform] || Facebook;
                return (
                  <a
                    key={index}
                    href={social.url || '#'}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-base-100 hover:bg-base-300 border border-base-content/10 rounded-lg flex items-center justify-center transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" style={{ color: textColor }} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 text-center">
          {(columns || []).map((column: any, index: number) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-base-content" style={{ color: headingColor }}>
                {column.title}
              </h3>
              <ul className="space-y-2">
                {(column.links || []).map((link: any, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url || '#'}
                      className="text-sm hover:opacity-80 transition-opacity text-base-content/70"
                      style={{ color: textColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-base-content/20 pt-8">
          <p className="text-xs sm:text-sm text-center text-base-content/70" style={{ color: textColor }}>
            {copyright || `\u00A9 ${new Date().getFullYear()} ${logoText || 'Brand'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );

  switch (section.variant) {
    case 'minimal':
      return renderMinimal();
    case 'centered':
      return renderCentered();
    default:
      return renderDefault();
  }
}
