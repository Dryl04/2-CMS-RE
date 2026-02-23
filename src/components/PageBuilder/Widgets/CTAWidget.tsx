import React from 'react';
import { ImageIcon } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';
import { renderRichText } from '../../../lib/htmlSanitizer';

interface CTAWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function CTAWidget({ section }: CTAWidgetProps) {
  const { headline, description, primaryCta, primaryLink, secondaryCta, secondaryLink } = section.content;

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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const renderBanner = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2 text-base-content"
            style={headingStyle}
          >
            {headline || 'Ready to Get Started?'}
          </h2>
          <p
            className="text-base sm:text-lg font-normal text-base-content/80"
            style={subtitleStyle}
          >
            {renderRichText(description, 'Join thousands of satisfied customers today')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <a
            href={primaryLink || '#'}
            className="btn btn-primary px-6 sm:px-8 rounded-xl font-semibold whitespace-nowrap"
          >
            {primaryCta || 'Start Free Trial'}
          </a>
          {secondaryCta && (
            <a
              href={secondaryLink || '#'}
              className="btn btn-ghost font-semibold whitespace-nowrap text-base-content"
              style={linkStyle}
            >
              {secondaryCta}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const renderCentered = () => (
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h2
        className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
        style={headingStyle}
      >
        {headline || 'Ready to Get Started?'}
      </h2>
      <p
        className="text-lg sm:text-xl mb-8 font-normal text-base-content/80"
        style={subtitleStyle}
      >
        {renderRichText(description, 'Join thousands of satisfied customers today')}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a
          href={primaryLink || '#'}
          className="btn btn-primary px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
        >
          {primaryCta || 'Start Free Trial'}
        </a>
        {secondaryCta && (
          <a
            href={secondaryLink || '#'}
            className="btn btn-outline px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
          >
            {secondaryCta}
          </a>
        )}
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {headline || 'Ready to Get Started?'}
        </h2>
        <p
          className="text-lg sm:text-xl mb-8 font-normal text-base-content/80"
          style={subtitleStyle}
        >
          {renderRichText(description, 'Join thousands of satisfied customers today')}
        </p>
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <a
            href={primaryLink || '#'}
            className="btn btn-primary px-6 sm:px-8 sm:py-4 rounded-xl font-semibold"
          >
            {primaryCta || 'Start Free Trial'}
          </a>
          {secondaryCta && (
            <a
              href={secondaryLink || '#'}
              className="btn btn-ghost font-semibold flex items-center py-3 sm:py-4 text-base-content"
              style={linkStyle}
            >
              {secondaryCta} &rarr;
            </a>
          )}
        </div>
      </div>
      {section.content.image ? (
        <img
          src={section.content.image}
          alt={headline || 'CTA'}
          className="w-full h-48 sm:h-64 object-cover rounded-2xl"
        />
      ) : (
        <div className="bg-base-300 rounded-2xl h-48 sm:h-64 flex flex-col items-center justify-center text-base-content/30">
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="text-sm font-medium">Image</span>
        </div>
      )}
    </div>
  );

  switch (section.variant) {
    case 'centered':
      return renderCentered();
    case 'split':
      return renderSplit();
    default:
      return renderBanner();
  }
}
