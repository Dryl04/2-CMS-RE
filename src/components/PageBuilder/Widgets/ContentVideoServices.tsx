import { useState } from 'react';
import { Play, Pause, Umbrella, Layers, PaintBucket } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ContentVideoServicesProps {
  section: PageBuilderSection;
}

const iconMap: { [key: string]: any } = {
  umbrella: Umbrella,
  layers: Layers,
  paintbucket: PaintBucket,
};

export default function ContentVideoServices({ section }: ContentVideoServicesProps) {
  const { content, design } = section;
  const [isPlaying, setIsPlaying] = useState(false);
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const typo = design.typography || {};
  const accentColor = design.colors?.accent || design.colors?.buttonBackground;
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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const videoPoster =
    content.thumbnail ||
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920';

  return (
    <div className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-3 bg-base-100 rounded-2xl p-6 sm:p-8 shadow-lg">
            {content.subtitle && (
              <p className="text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4 text-base-content/70" style={subtitleStyle}>
                {content.subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight text-base-content" style={headingStyle}>
              {content.title || 'Digital Marketing and Strategy.'}
            </h2>
            {content.description && (
              <p className="text-sm sm:text-base leading-relaxed mb-4 text-base-content/70" style={textStyle}>
                {content.description}
              </p>
            )}
            {content.additionalText && (
              <p className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 text-base-content/70" style={textStyle}>
                {content.additionalText}
              </p>
            )}
            {content.ctaText && (
              <button className="btn btn-primary px-6 sm:px-8">
                {content.ctaText}
              </button>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[360px] lg:min-h-[450px] bg-neutral shadow-xl">
              {content.videoUrl && isPlaying ? (
                <iframe
                  src={getEmbedUrl(content.videoUrl)}
                  className="absolute inset-0 w-full h-full bg-black"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0">
                  <img
                    src={videoPoster}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral/30 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full text-neutral-content shadow-2xl transition-transform hover:scale-105"
                      style={accentColor ? { backgroundColor: accentColor } : undefined}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 sm:w-9 sm:h-9" />
                      ) : (
                        <Play className="w-6 h-6 sm:w-9 sm:h-9 ml-0.5" fill="currentColor" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {content.videoUrl && isPlaying && (
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 text-neutral-content shadow-lg"
                  style={accentColor ? { backgroundColor: accentColor } : undefined}
                  aria-label="Pause video"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 grid sm:grid-cols-3 lg:grid-cols-1 gap-6 sm:gap-4 lg:gap-8">
            {content.services?.map((service: any, index: number) => {
              const IconComponent = iconMap[service.icon] || Umbrella;
              return (
                <div key={index} className="text-center space-y-2 sm:space-y-3">
                  <div className="flex justify-center">
                    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-base-content" style={headingStyle} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold leading-tight text-base-content" style={headingStyle}>
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-xs sm:text-sm text-base-content/70" style={textStyle}>
                      {service.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
