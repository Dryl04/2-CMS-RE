import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { Play } from 'lucide-react';

interface ClickFunnelFeaturesProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function ClickFunnelFeatures({ section }: ClickFunnelFeaturesProps) {
  const content = section.content as {
    title?: string;
    subtitle?: string;
    features?: Array<{
      videoUrl?: string;
      thumbnailUrl?: string;
      quote?: string;
      author?: string;
    }>;
    buttonText?: string;
    buttonUrl?: string;
  };

  const {
    title = 'Build a funnel-based business',
    subtitle = 'Funnels aren\'t just a feature - they\'re a mentality. From leads to sales, from your store to your courses to your community, your entire business is a funnel. And you could build all that here too.',
    features = [
      {
        videoUrl: '',
        thumbnailUrl: 'https://images.pexels.com/photos/5698857/pexels-photo-5698857.jpeg?auto=compress&cs=tinysrgb&w=600',
        quote: 'ClickFunnels is absolutely life-changing.',
        author: 'Tim Shields'
      },
      {
        videoUrl: '',
        thumbnailUrl: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=600',
        quote: 'When I came across ClickFunnels—it snapped!',
        author: 'Kristine Mirelle'
      },
      {
        videoUrl: '',
        thumbnailUrl: 'https://images.pexels.com/photos/2325729/pexels-photo-2325729.jpeg?auto=compress&cs=tinysrgb&w=600',
        quote: 'ClickFunnels has helped me save lives.',
        author: 'Ted Harty'
      }
    ],
    buttonText = 'Try ClickFunnels For Free',
    buttonUrl = '#'
  } = content;

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
  const bodyTextStyle: React.CSSProperties = {
    ...(fontFamily ? { fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };

  const buttonBg = section.design?.colors?.buttonBackground || '#ffa500';
  const buttonTextColor = section.design?.colors?.buttonText || '#FFFFFF';

  return (
    <section className="py-20 px-4" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={headingStyle}
          >
            {title}
          </h2>
          <p
            className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed"
            style={bodyTextStyle}
          >
            {subtitle}
          </p>
        </div>

        <div className={`grid ${getGridCols()} gap-6 mb-12`}>
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative group cursor-pointer rounded-2xl overflow-hidden mb-4 aspect-[4/5]">
                {feature.videoUrl ? (
                  <video
                    src={feature.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <>
                    <img
                      src={feature.thumbnailUrl || 'https://images.pexels.com/photos/5699479/pexels-photo-5699479.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={feature.author}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: buttonBg }}
                      >
                        <Play
                          className="w-6 h-6 fill-current ml-0.5"
                          style={{ color: buttonTextColor }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="text-center">
                <p
                  className="text-lg font-semibold mb-2 leading-tight"
                  style={headingStyle}
                >
                  {feature.quote}
                </p>
                <p
                  className="text-sm"
                  style={bodyTextStyle}
                >
                  {feature.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={buttonUrl}
            className="inline-block font-bold px-8 py-4 rounded-lg transition-opacity duration-300 hover:opacity-90 text-lg"
            style={{
              backgroundColor: buttonBg,
              color: buttonTextColor
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
