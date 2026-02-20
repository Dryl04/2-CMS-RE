import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface StatsWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function StatsWidget({ section }: StatsWidgetProps) {
  const { title, subtitle, stats } = section.content;

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

  const defaultStats = [
    { number: '10K+', label: 'Active Users', suffix: '+', icon: 'users' },
    { number: '99%', label: 'Satisfaction Rate', suffix: '%', icon: 'heart' },
    { number: '50M', label: 'Downloads', suffix: 'M', icon: 'download' },
    { number: '24/7', label: 'Support Available', suffix: '', icon: 'clock' },
  ];

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
              style={headingStyle}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg sm:text-xl text-base-content/70"
              style={subtitleStyle}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {(stats || defaultStats).map((stat: any, index: number) => (
          <div key={index} className="text-center">
            <div
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 text-primary"
              style={accentStyle}
            >
              {stat.number}
            </div>
            <div
              className="text-base sm:text-lg font-medium text-base-content/70"
              style={textStyle}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGradient = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
              style={headingStyle}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg sm:text-xl text-base-content/70"
              style={subtitleStyle}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(stats || defaultStats).map((stat: any, index: number) => {
          const variants = [
            'bg-primary text-primary-content',
            'bg-secondary text-secondary-content',
            'bg-accent text-accent-content',
            'bg-info text-info-content',
          ];
          return (
            <div
              key={index}
              className={`${variants[index % 4]} rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base opacity-90">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMinimalist = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {(title || subtitle) && (
        <div className="text-center mb-16">
          {title && (
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
              style={headingStyle}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg text-base-content/70"
              style={subtitleStyle}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
        {(stats || defaultStats).map((stat: any, index: number) => (
          <div
            key={index}
            className="border-l-4 border-primary pl-6"
            style={accentColor ? { borderColor: accentColor } : undefined}
          >
            <div
              className="text-5xl sm:text-6xl font-bold mb-3 text-base-content"
              style={headingStyle}
            >
              {stat.number}
            </div>
            <div
              className="text-lg font-medium text-base-content/70"
              style={textStyle}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSplit = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          {title && (
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-base-content"
              style={headingStyle}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-lg sm:text-xl mb-8 text-base-content/70"
              style={subtitleStyle}
            >
              {subtitle}
            </p>
          )}
          <button
            className="btn btn-primary px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          >
            Learn More
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {(stats || defaultStats).map((stat: any, index: number) => (
            <div
              key={index}
              className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-content/10 hover:shadow-xl transition-shadow"
            >
              <div
                className="text-4xl sm:text-5xl font-bold mb-2 text-primary"
                style={accentStyle}
              >
                {stat.number}
              </div>
              <div
                className="text-sm sm:text-base font-medium text-base-content/70"
                style={textStyle}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  switch (section.variant) {
    case 'gradient':
      return renderGradient();
    case 'minimalist':
      return renderMinimalist();
    case 'split':
      return renderSplit();
    default:
      return renderGrid();
  }
}
