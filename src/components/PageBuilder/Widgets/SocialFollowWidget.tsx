import { Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface SocialFollowWidgetProps {
  section: PageBuilderSection;
}

const socialIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
  linkedin: Linkedin,
};

export default function SocialFollowWidget({ section }: SocialFollowWidgetProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const buttonBg = design.colors?.buttonBackground || undefined;
  const buttonText = design.colors?.buttonText || undefined;

  return (
    <div className="bg-neutral" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{
        paddingTop: design.spacing.paddingTop,
        paddingBottom: design.spacing.paddingBottom,
      }}>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-content" style={{ color: headingColor }}>
            {content.title || 'Follow Us'}
          </h2>

          <div className="flex items-center space-x-6">
            {content.socials?.map((social: any, index: number) => {
              const IconComponent = socialIconMap[social.platform] || Facebook;
              return (
                <a
                  key={index}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-base-100 flex items-center justify-center hover:bg-base-200 transition"
                  aria-label={social.platform}
                >
                  <IconComponent className="w-5 h-5 text-base-content" />
                </a>
              );
            })}

            {content.ctaText && (
              <button
                className="px-8 py-3 rounded-full font-semibold transition hover:opacity-90 ml-8 bg-primary text-primary-content"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {content.ctaText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
