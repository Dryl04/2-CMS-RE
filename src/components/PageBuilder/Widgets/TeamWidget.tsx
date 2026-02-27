import React from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface TeamWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function TeamWidget({ section }: TeamWidgetProps) {
  const { title, subtitle, members } = section.content;

  const design = section.design || {};
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
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const accentColor = design.colors?.accent;
  const accentStyle: React.CSSProperties = accentColor ? { color: accentColor } : {};

  /** Retourne les props data-attributes + style CSS vars pour l'overlay par membre */
  const getMemberOverlayProps = (member: any) => {
    if (!member.overlayImage) return {};
    return {
      'data-widget-overlay': 'on' as const,
      'data-widget-overlay-position': (member.overlayPosition || 'center') as string,
      style: {
        '--widget-media-overlay-image': `url(${member.overlayImage})`,
        ...(member.overlaySize ? { '--widget-media-overlay-size': member.overlaySize } : {}),
        ...(member.overlayOpacity !== undefined ? { '--widget-media-overlay-opacity': String(member.overlayOpacity) } : {}),
        ...(member.overlayBrightness !== undefined ? { '--widget-media-overlay-brightness': String(member.overlayBrightness) } : {}),
        ...(member.overlayContrast !== undefined ? { '--widget-media-overlay-contrast': String(member.overlayContrast) } : {}),
        ...(member.overlaySaturate !== undefined ? { '--widget-media-overlay-saturate': String(member.overlaySaturate) } : {}),
        ...(member.overlayBlur ? { '--widget-media-overlay-blur': member.overlayBlur } : {}),
      } as React.CSSProperties,
    };
  };

  const defaultMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Passionate about building innovative solutions',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: { linkedin: '#', twitter: '#', email: 'sarah@example.com' },
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Tech enthusiast with 15 years of experience',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: { linkedin: '#', twitter: '#', email: 'michael@example.com' },
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      bio: 'Creating beautiful and functional experiences',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: { linkedin: '#', twitter: '#', email: 'emily@example.com' },
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      bio: 'Building scalable and efficient systems',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: { linkedin: '#', twitter: '#', email: 'david@example.com' },
    },
  ];

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Meet Our Team')}
        </h2>
        <p
          className="text-lg sm:text-xl max-w-3xl mx-auto text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Talented individuals working together to create something amazing')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {(members || defaultMembers).map((member: any, index: number) => {
          const overlayProps = getMemberOverlayProps(member);
          return (
          <div key={index} className="group text-center">
            <div
              className="relative mb-4 overflow-hidden rounded-2xl"
              data-widget-media-frame
              {...overlayProps}
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-80 object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                <div className="flex space-x-3">
                  {member.social?.linkedin && (
                    <a
                      href={member.social.linkedin}
                      className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Linkedin
                        className="w-5 h-5 text-primary"
                        style={accentStyle}
                      />
                    </a>
                  )}
                  {member.social?.twitter && (
                    <a
                      href={member.social.twitter}
                      className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Twitter
                        className="w-5 h-5 text-primary"
                        style={accentStyle}
                      />
                    </a>
                  )}
                  {member.social?.email && (
                    <a
                      href={`mailto:${member.social.email}`}
                      className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Mail
                        className="w-5 h-5 text-primary"
                        style={accentStyle}
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <h3
              className="text-xl font-bold mb-1 text-base-content"
              style={headingStyle}
            >
              {renderRichText(member.name)}
            </h3>
            <p
              className="text-sm font-medium mb-2 text-primary"
              style={accentStyle}
            >
              {renderRichText(member.role)}
            </p>
            <p
              className="text-sm text-base-content/70"
              style={textStyle}
            >
              {renderRichText(member.bio)}
            </p>
          </div>
          );
        })}
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Leadership Team')}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'The people behind our success')}
        </p>
      </div>

      <div className="bg-base-100 rounded-3xl shadow-2xl p-8 sm:p-12">
        {(members || defaultMembers).slice(0, 1).map((member: any, index: number) => {
          const overlayProps = getMemberOverlayProps(member);
          return (
          <div key={index} className="grid md:grid-cols-5 gap-8 items-center">
            <div
              className="md:col-span-2"
              data-widget-media-frame
              {...overlayProps}
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div className="md:col-span-3">
              <h3
                className="text-3xl font-bold mb-2 text-base-content"
                style={headingStyle}
              >
                {renderRichText(member.name)}
              </h3>
              <p
                className="text-xl font-medium mb-4 text-primary"
                style={accentStyle}
              >
                {renderRichText(member.role)}
              </p>
              <p
                className="text-lg mb-6 text-base-content/70"
                style={textStyle}
              >
                {renderRichText(member.bio)}
              </p>
              <div className="flex space-x-3">
                {member.social?.linkedin && (
                  <a
                    href={member.social.linkedin}
                    className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center hover:scale-110 transition-transform"
                    style={accentColor ? { borderColor: accentColor } : undefined}
                  >
                    <Linkedin
                      className="w-6 h-6 text-primary"
                      style={accentStyle}
                    />
                  </a>
                )}
                {member.social?.twitter && (
                  <a
                    href={member.social.twitter}
                    className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center hover:scale-110 transition-transform"
                    style={accentColor ? { borderColor: accentColor } : undefined}
                  >
                    <Twitter
                      className="w-6 h-6 text-primary"
                      style={accentStyle}
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );

  const renderBento = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Our Team')}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Meet the people making it happen')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(members || defaultMembers).map((member: any, index: number) => {
          const isLarge = index === 0 || index === 3;
          const overlayProps = getMemberOverlayProps(member);
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1'
                }`}
              data-widget-media-frame
              {...overlayProps}
            >
              <img
                src={member.avatar}
                alt={member.name}
                className={`w-full object-cover ${isLarge ? 'h-96' : 'h-48'
                  } group-hover:scale-110 transition-transform`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-neutral/40 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-neutral-content text-xl font-bold mb-1">{renderRichText(member.name)}</h3>
                <p className="text-neutral-content/90 text-sm">{renderRichText(member.role)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Team')}
        </h2>
        <p
          className="text-lg text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'The people behind our work')}
        </p>
      </div>

      <div className="space-y-8">
        {(members || defaultMembers).map((member: any, index: number) => {
          const overlayProps = getMemberOverlayProps(member);
          return (
          <div key={index} className="flex items-center space-x-6 border-b border-base-content/10 pb-8">
            <div
              className="relative flex-shrink-0"
              data-widget-media-frame
              {...overlayProps}
            >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            </div>
            <div className="flex-1">
              <h3
                className="text-2xl font-bold mb-1 text-base-content"
                style={headingStyle}
              >
                {renderRichText(member.name)}
              </h3>
              <p
                className="text-base font-medium mb-2 text-primary"
                style={accentStyle}
              >
                {renderRichText(member.role)}
              </p>
              <p
                className="text-sm text-base-content/70"
                style={textStyle}
              >
                {renderRichText(member.bio)}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              {member.social?.linkedin && (
                <a href={member.social.linkedin} className="hover:scale-110 transition-transform">
                  <Linkedin
                    className="w-5 h-5 text-primary"
                    style={accentStyle}
                  />
                </a>
              )}
              {member.social?.twitter && (
                <a href={member.social.twitter} className="hover:scale-110 transition-transform">
                  <Twitter
                    className="w-5 h-5 text-primary"
                    style={accentStyle}
                  />
                </a>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'carousel':
      return renderCarousel();
    case 'bento':
      return renderBento();
    case 'minimal':
      return renderMinimal();
    default:
      return renderGrid();
  }
}
