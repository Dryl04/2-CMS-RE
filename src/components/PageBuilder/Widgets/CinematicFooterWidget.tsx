import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { ComponentType } from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface CinematicFooterWidgetProps {
  section: PageBuilderSection;
}

interface SocialItem {
  platform?: string;
  url?: string;
}

interface FooterLink {
  label?: string;
  url?: string;
}

interface FooterColumn {
  title?: string;
  links?: FooterLink[];
}

const socialIconMap: Record<string, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function CinematicFooterWidget({ section }: CinematicFooterWidgetProps) {
  const { content, design } = section;
  const columns = (content.columns || []) as FooterColumn[];
  const socials = (content.socials || []) as SocialItem[];

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
    <footer className="relative bg-base-300 text-base-content overflow-hidden">
      {content.backgroundImage && (
        <img src={content.backgroundImage} alt="footer-bg" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-neutral/70" />

      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xl font-semibold text-neutral-content" style={headingStyle}>{content.brand || 'FLORA'}</p>
            <p className="text-xs text-neutral-content/80 mt-1" style={textStyle}>{content.copyright || 'Copyright © 2026'}</p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((social: SocialItem, index: number) => {
              const platformKey = social.platform || 'facebook';
              const Icon = socialIconMap[platformKey] || Facebook;
              return (
                <a key={index} href={social.url || '#'} className="text-neutral-content/80 hover:text-neutral-content transition-colors" style={linkStyle}>
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column: FooterColumn, index: number) => (
            <div key={index}>
              <h3 className="font-semibold text-neutral-content mb-3" style={headingStyle}>{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {(column.links || []).map((link: FooterLink, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a href={link.url || '#'} className="text-neutral-content/80 hover:text-neutral-content transition-colors" style={linkStyle}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
