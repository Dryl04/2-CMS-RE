import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeroWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function HeroWidget({ section }: HeroWidgetProps) {
  const { headline, subheadline, ctaText, ctaLink, image } = section.content;

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
    ...(typo.h2Color || typo.headingColor ? { color: typo.h2Color || typo.headingColor } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(typo.h2Color || typo.subtitleColor || typo.headingColor ? { color: typo.h2Color || typo.subtitleColor || typo.headingColor } : {}),
    ...(typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.h2FontFamily || typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.h2FontWeight || typo.headingFontWeight ? { fontWeight: typo.h2FontWeight || typo.headingFontWeight } : {}),
    ...(typo.h2FontSize || typo.headingFontSize ? { fontSize: typo.h2FontSize || typo.headingFontSize } : {}),
    ...(typo.subtitleColor ? { color: typo.subtitleColor } : {}),
  };
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const overlayEnabled = design.overlay?.enabled !== false;
  const overlayColor = design.overlay?.color || 'oklch(var(--n))';
  const overlayOpacity = design.overlay?.opacity ?? 0.4;
  const overlayGradient = design.overlay?.gradient || 'none';
  const overlayGradientDirection = design.overlay?.gradientDirection || 'to bottom';

  const blurAmount = design.effects?.blur || 0;
  const brightness = design.effects?.brightness ?? 100;
  const contrast = design.effects?.contrast ?? 100;
  const saturate = design.effects?.saturate ?? 100;
  const grayscale = design.effects?.grayscale || 0;
  const sepia = design.effects?.sepia || 0;
  const hueRotate = design.effects?.hueRotate || 0;

  const parallaxEnabled = design.effects?.parallax || false;
  const animationEnabled = design.effects?.animation || false;
  const animationType = design.effects?.animationType || 'fade-in';

  const contentPosition = design.layout?.contentPosition || 'left';
  const contentAlignment = design.layout?.contentAlignment || 'start';
  const minHeight = design.layout?.minHeight || '500px';
  const maxWidth = design.layout?.maxWidth || '7xl';

  const getOverlayStyle = () => {
    if (!overlayEnabled) return {};

    if (overlayGradient === 'linear') {
      return {
        background: `linear-gradient(${overlayGradientDirection}, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')}, transparent)`,
      };
    } else if (overlayGradient === 'radial') {
      return {
        background: `radial-gradient(circle, transparent 0%, ${overlayColor}${Math.round(overlayOpacity * 255).toString(16).padStart(2, '0')} 100%)`,
      };
    } else {
      return {
        backgroundColor: overlayColor,
        opacity: overlayOpacity,
      };
    }
  };

  const getImageFilter = () => {
    const filters = [];
    if (blurAmount > 0) filters.push(`blur(${blurAmount}px)`);
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
    if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
    if (sepia > 0) filters.push(`sepia(${sepia}%)`);
    if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  const getAnimationClass = () => {
    if (!animationEnabled) return '';

    const animations: { [key: string]: string } = {
      'fade-in': 'animate-fadeIn',
      'slide-up': 'animate-slideUp',
      'slide-down': 'animate-slideDown',
      'zoom-in': 'animate-zoomIn',
      'slide-left': 'animate-slideLeft',
      'slide-right': 'animate-slideRight',
    };

    return animations[animationType] || '';
  };

  const getContentAlignmentClass = () => {
    const alignmentMap: { [key: string]: string } = {
      'start': 'items-start',
      'center': 'items-center',
      'end': 'items-end',
    };
    return alignmentMap[contentAlignment] || 'items-start';
  };

  const getContentPositionClass = () => {
    const positionMap: { [key: string]: string } = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return positionMap[contentPosition] || 'justify-start';
  };

  const getContentTextClass = () => {
    const textMap: { [key: string]: string } = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return textMap[contentPosition] || 'text-left';
  };

  const getMaxWidthClass = () => {
    const widthMap: { [key: string]: string } = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      'full': 'max-w-full',
    };
    return widthMap[maxWidth] || 'max-w-7xl';
  };

  const renderDefault = () => (
    <div className={`${getMaxWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 ${getAnimationClass()}`}>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <h1
            className="text-base-content text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight"
            style={h1Style}
          >
            {headline || 'Your Amazing Headline'}
          </h1>
          <h2
            className="text-base-content/70 text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 font-normal"
            style={subtitleStyle}
          >
            {subheadline || 'A compelling subheadline that explains your value proposition'}
          </h2>
          <a
            href={ctaLink || '#'}
            className="btn btn-primary inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            {ctaText || 'Get Started'}
          </a>
        </div>
        <div className="relative">
          <img
            src={image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'}
            alt="Hero"
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-xl"
            style={{ filter: getImageFilter() }}
          />
          {overlayEnabled && (
            <div
              className="absolute inset-0 rounded-2xl"
              style={getOverlayStyle()}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderCentered = () => (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 text-center ${getAnimationClass()}`}>
      <h1
        className="text-base-content text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight"
        style={h1Style}
      >
        {headline || 'Your Amazing Headline'}
      </h1>
      <h2
        className="text-base-content/70 text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 font-normal"
        style={subtitleStyle}
      >
        {subheadline || 'A compelling subheadline that explains your value proposition'}
      </h2>
      <a
        href={ctaLink || '#'}
        className="btn btn-primary inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
      >
        {ctaText || 'Get Started'}
      </a>
    </div>
  );

  const renderSplit = () => (
    <div className="grid lg:grid-cols-2 h-full">
      <div
        className={`bg-base-200 text-base-content flex ${getContentAlignmentClass()} ${contentPosition === 'right' ? 'lg:order-2' : ''} justify-center p-8 sm:p-12 ${getAnimationClass()} ${getContentTextClass()}`}
      >
        <div className="max-w-xl">
          <h1
            className="text-base-content text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            style={h1Style}
          >
            {headline || 'Your Amazing Headline'}
          </h1>
          <h2 className="text-base-content/70 text-lg sm:text-xl mb-8 font-normal" style={subtitleStyle}>
            {subheadline || 'A compelling subheadline that explains your value proposition'}
          </h2>
          <a
            href={ctaLink || '#'}
            className="btn btn-primary inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            {ctaText || 'Get Started'}
          </a>
        </div>
      </div>
      <div className="relative h-64 lg:h-full min-h-[300px] lg:min-h-[500px] overflow-hidden">
        <div
          className={`w-full h-full bg-cover bg-center ${parallaxEnabled ? 'transform-gpu' : ''}`}
          style={{
            backgroundImage: `url(${image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'})`,
            backgroundAttachment: parallaxEnabled ? 'fixed' : 'scroll',
            filter: getImageFilter(),
          }}
        />
        {overlayEnabled && (
          <div
            className="absolute inset-0"
            style={getOverlayStyle()}
          />
        )}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className={`max-w-3xl mx-auto px-4 ${getAnimationClass()}`}>
      <h1
        className="text-base-content text-3xl sm:text-4xl font-bold mb-4"
        style={h1Style}
      >
        {headline || 'Your Amazing Headline'}
      </h1>
      <h2
        className="text-base-content/70 text-base sm:text-lg mb-6 font-normal"
        style={subtitleStyle}
      >
        {subheadline || 'A compelling subheadline that explains your value proposition'}
      </h2>
      <a
        href={ctaLink || '#'}
        className="text-base-content font-semibold hover:underline transition-all"
        style={linkStyle}
      >
        {ctaText || 'Get Started'} &rarr;
      </a>
    </div>
  );

  const renderFullBackground = () => (
    <div className="relative w-full h-full overflow-hidden" style={{ minHeight }}>
      <div
        className={`absolute inset-0 bg-cover bg-center ${parallaxEnabled ? 'transform-gpu' : ''}`}
        style={{
          backgroundImage: `url(${image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'})`,
          backgroundAttachment: parallaxEnabled ? 'fixed' : 'scroll',
          filter: getImageFilter(),
        }}
      />
      {overlayEnabled && (
        <div
          className="absolute inset-0"
          style={getOverlayStyle()}
        />
      )}
      <div className={`relative z-10 flex ${getContentAlignmentClass()} ${getContentPositionClass()} h-full`}>
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 ${getAnimationClass()}`}>
          <div
            className={`max-w-2xl ${contentPosition === 'center'
              ? 'mx-auto text-center'
              : contentPosition === 'right'
                ? 'ml-auto text-right'
                : 'mr-auto text-left'
              }`}
          >
            <h1
              className="text-base-content text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight drop-shadow-lg"
              style={h1Style}
            >
              {headline || 'Your Amazing Headline'}
            </h1>
            <h2
              className="text-base-content/70 text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 font-normal drop-shadow-md"
              style={subtitleStyle}
            >
              {subheadline || 'A compelling subheadline that explains your value proposition'}
            </h2>
            <a
              href={ctaLink || '#'}
              className="btn btn-primary inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
            >
              {ctaText || 'Get Started'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'split':
      return renderSplit();
    case 'minimal':
      return renderMinimal();
    case 'full-background':
      return renderFullBackground();
    default:
      return renderDefault();
  }
}
