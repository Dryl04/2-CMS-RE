import React from 'react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface LogoCloudWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function LogoCloudWidget({ section }: LogoCloudWidgetProps) {
  const { title, subtitle, logos } = section.content;

  const design = section.design || {};
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const _textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const makePlaceholderLogo = (n: number) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><rect fill="#e5e7eb" width="200" height="80" rx="8"/><text x="100" y="45" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="16" font-weight="600">Logo ${n}</text></svg>`)}`;

  const defaultLogos = [
    { name: 'Company 1', url: makePlaceholderLogo(1) },
    { name: 'Company 2', url: makePlaceholderLogo(2) },
    { name: 'Company 3', url: makePlaceholderLogo(3) },
    { name: 'Company 4', url: makePlaceholderLogo(4) },
    { name: 'Company 5', url: makePlaceholderLogo(5) },
    { name: 'Company 6', url: makePlaceholderLogo(6) },
  ];

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          {title && (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-base-content"
              style={headingStyle}
            >
              {renderRichText(title)}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(subtitle)}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8 place-items-center">
        {(logos || defaultLogos).map((logo: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-center w-full grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
          >
            <img
              src={logo.url}
              alt={logo.name}
              className="max-h-12 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarquee = () => (
    <div className="max-w-full overflow-hidden">
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8 lg:mb-12 px-4">
          {title && (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-base-content"
              style={headingStyle}
            >
              {renderRichText(title)}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(subtitle)}
            </p>
          )}
        </div>
      )}

      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...(logos || defaultLogos), ...(logos || defaultLogos)].map((logo: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-center mx-6 sm:mx-8 md:mx-10 lg:mx-12 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );

  const renderFeatured = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          {title && (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-base-content"
              style={headingStyle}
            >
              {renderRichText(title)}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(subtitle)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6 md:space-y-8 lg:space-y-12">
        <div className="flex justify-center items-center">
          {(logos || defaultLogos).slice(0, 1).map((logo: any, index: number) => (
            <div
              key={index}
              className="bg-base-100 rounded-xl md:rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-base-content/10"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {(logos || defaultLogos).slice(1).map((logo: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-center bg-base-100 rounded-lg md:rounded-xl shadow-md p-4 sm:p-5 md:p-6 border border-base-content/10 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          {title && (
            <h2
              className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 text-base-content"
              style={headingStyle}
            >
              {renderRichText(title)}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-xs sm:text-sm md:text-base text-base-content/70"
              style={subtitleStyle}
            >
              {renderRichText(subtitle)}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 sm:gap-y-6 md:gap-x-16 md:gap-y-8">
        {(logos || defaultLogos).map((logo: any, index: number) => (
          <div
            key={index}
            className="grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
          >
            <img
              src={logo.url}
              alt={logo.name}
              className="h-10 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'marquee':
      return renderMarquee();
    case 'featured':
      return renderFeatured();
    case 'minimal':
      return renderMinimal();
    default:
      return renderGrid();
  }
}
