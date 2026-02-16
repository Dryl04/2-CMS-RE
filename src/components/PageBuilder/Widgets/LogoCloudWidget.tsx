import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface LogoCloudWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function LogoCloudWidget({ section }: LogoCloudWidgetProps) {
  const { title, subtitle, logos } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;

  const defaultLogos = [
    { name: 'Company 1', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+1' },
    { name: 'Company 2', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+2' },
    { name: 'Company 3', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+3' },
    { name: 'Company 4', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+4' },
    { name: 'Company 5', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+5' },
    { name: 'Company 6', url: 'https://via.placeholder.com/200x80/cccccc/666666?text=Logo+6' },
  ];

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          {title && (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-base-content"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8 items-center">
        {(logos || defaultLogos).map((logo: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
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
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {subtitle}
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
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-sm sm:text-base md:text-lg text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {subtitle}
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
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-xs sm:text-sm md:text-base text-base-content/70"
              style={textColor ? { color: textColor } : undefined}
            >
              {subtitle}
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
