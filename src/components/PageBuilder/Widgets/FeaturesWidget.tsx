import React from 'react';
import { ImageIcon } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { renderIcon, ICON_MAP } from '@/lib/iconLibrary';
import { Zap } from 'lucide-react';

interface FeaturesWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

const gridColsClass: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export default function FeaturesWidget({ section }: FeaturesWidgetProps) {
  const { title, subtitle, features } = section.content;

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

  const renderGrid = (columns: number) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Amazing Features')}
        </h2>
        <p
          className="text-lg sm:text-xl font-normal text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Everything you need to succeed')}
        </p>
      </div>

      <div className={`grid ${gridColsClass[columns] || gridColsClass[3]} gap-6 sm:gap-8`}>
        {(features || []).map((feature: any, index: number) => {
          return (
            <div key={index} className="text-center">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-primary"
                data-widget-icon-frame
              >
                {renderIcon(feature.icon, 'w-7 h-7 sm:w-8 sm:h-8 text-primary-content', 28)}
              </div>
              <h3
                className="text-lg sm:text-xl font-bold mb-2 text-base-content"
                style={headingStyle}
              >
                {renderRichText(feature.title)}
              </h3>
              <p
                className="text-sm sm:text-base text-base-content/70"
                style={textStyle}
              >
                {renderRichText(feature.description)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAlternating = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Amazing Features')}
        </h2>
        <p
          className="text-lg sm:text-xl font-normal text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Everything you need to succeed')}
        </p>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {(features || []).map((feature: any, index: number) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center ${isEven ? '' : 'md:grid-flow-dense'
                }`}
            >
              <div className={isEven ? '' : 'md:col-start-2'}>
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 bg-primary"
                  data-widget-icon-frame
                >
                  {renderIcon(feature.icon, 'w-7 h-7 sm:w-8 sm:h-8 text-primary-content', 28)}
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold mb-4 text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(feature.title)}
                </h3>
                <p
                  className="text-base sm:text-lg text-base-content/70"
                  style={textStyle}
                >
                  {renderRichText(feature.description)}
                </p>
              </div>
              <div className={isEven ? '' : 'md:col-start-1'}>
                <div className="bg-base-200 rounded-2xl h-48 sm:h-64 flex flex-col items-center justify-center text-base-content/30">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Image</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'grid-2':
      return renderGrid(2);
    case 'grid-3':
      return renderGrid(3);
    case 'grid-4':
      return renderGrid(4);
    case 'alternating':
      return renderAlternating();
    default:
      return renderGrid(3);
  }
}
