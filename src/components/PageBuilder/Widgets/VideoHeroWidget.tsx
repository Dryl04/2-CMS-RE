import React from 'react';
import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface VideoHeroWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function VideoHeroWidget({ section }: VideoHeroWidgetProps) {
  const { title, subtitle, videoUrl, thumbnail, ctaText, ctaLink } = section.content;
  const [isPlaying, setIsPlaying] = useState(false);

  const design = section.design || {};
  const typo = design.typography || {};
  const h1Style: React.CSSProperties = {
    ...(typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h1FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h1FontWeight || typo.headingFontWeight ? { fontWeight: typo.h1FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h1FontSize || typo.headingFontSize ? { fontSize: typo.h1FontSize || typo.headingFontSize } : {}),
    ...(typo.h1Color || typo.headingColor ? { color: typo.h1Color || typo.headingColor } : {}),
  };
  const h2Style: React.CSSProperties = {
    ...(typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h2FontWeight || typo.headingFontWeight ? { fontWeight: typo.h2FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h2FontSize || typo.headingFontSize ? { fontSize: typo.h2FontSize || typo.headingFontSize } : {}),
    ...(typo.h2Color || typo.subtitleColor || typo.headingColor ? { color: typo.h2Color || typo.subtitleColor || typo.headingColor } : {}),
  };
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

  const getEmbedUrl = (url: string) => {
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

  const renderBackground = () => (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        {isPlaying ? (
          <iframe
            src={getEmbedUrl(videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${thumbnail || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920'})`,
            }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-neutral/50" />

      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-neutral-content"
            style={h1Style}
          >
            {title || 'Watch Our Story'}
          </h1>
          <h2
            className="text-lg sm:text-xl lg:text-2xl mb-8 text-neutral-content/90"
            style={h2Style}
          >
            {subtitle || 'Discover what makes us different'}
          </h2>
          <button
            onClick={() => setIsPlaying(true)}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-base-100 hover:scale-110 transition-transform shadow-2xl"
          >
            <Play
              className="w-7 h-7 sm:w-10 sm:h-10 ml-1 text-primary-content"
              style={accentColor ? { color: accentColor } : undefined}
              fill="currentColor"
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmbedded = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={h1Style}
        >
          {title || 'See It In Action'}
        </h1>
        <h2
          className="text-lg sm:text-xl max-w-3xl mx-auto text-base-content/70"
          style={h2Style}
        >
          {subtitle || 'Watch how our product can transform your workflow'}
        </h2>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        <div className="aspect-video">
          {isPlaying ? (
            <iframe
              src={getEmbedUrl(videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
              <img
                src={thumbnail || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920'}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-neutral/30 group-hover:bg-neutral/40 transition-colors flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-primary"
                  style={accentColor ? { backgroundColor: accentColor } : undefined}
                >
                  <Play className="w-8 h-8 text-primary-content ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {ctaText && (
        <div className="text-center mt-8">
          <a
            href={ctaLink || '#'}
            className="inline-block px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg bg-primary text-primary-content"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );

  const renderSplit = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-base-content"
            style={h1Style}
          >
            {title || 'Experience the Difference'}
          </h1>
          <h2
            className="text-lg sm:text-xl mb-8 text-base-content/70"
            style={h2Style}
          >
            {subtitle || 'See why thousands of customers trust us with their business'}
          </h2>
          {ctaText && (
            <a
              href={ctaLink || '#'}
              className="inline-block px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg bg-primary text-primary-content"
              style={accentColor ? { backgroundColor: accentColor } : undefined}
            >
              {ctaText}
            </a>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video">
            {isPlaying ? (
              <iframe
                src={getEmbedUrl(videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                <img
                  src={thumbnail || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920'}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral/30 group-hover:bg-neutral/40 transition-colors flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-primary"
                    style={accentColor ? { backgroundColor: accentColor } : undefined}
                  >
                    <Play className="w-7 h-7 text-primary-content ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-base-content"
            style={h1Style}
          >
            {title || 'See How It Works'}
          </h1>
          <h2
            className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto text-base-content/70"
            style={h2Style}
          >
            {subtitle || 'Watch our product demo and discover all the features'}
          </h2>

          <div className="relative inline-block rounded-3xl overflow-hidden shadow-2xl cursor-pointer group" onClick={() => setIsPlaying(true)}>
            <img
              src={thumbnail || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920'}
              alt="Video thumbnail"
              className="w-full max-w-4xl h-auto"
            />
            <div className="absolute inset-0 bg-neutral/30 group-hover:bg-neutral/40 transition-colors flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-primary"
                style={accentColor ? { backgroundColor: accentColor } : undefined}
              >
                <Play className="w-10 h-10 text-primary-content ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPlaying && (
        <div className="fixed inset-0 z-50 bg-neutral/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-neutral-content/10 hover:bg-neutral-content/20 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-neutral-content" />
          </button>
          <div className="w-full max-w-6xl aspect-video">
            <iframe
              src={getEmbedUrl(videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );

  switch (section.variant) {
    case 'embedded':
      return renderEmbedded();
    case 'split':
      return renderSplit();
    case 'modal':
      return renderModal();
    default:
      return renderBackground();
  }
}
