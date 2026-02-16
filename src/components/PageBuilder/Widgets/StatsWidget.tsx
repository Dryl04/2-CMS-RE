import { TrendingUp } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface StatsWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function StatsWidget({ section }: StatsWidgetProps) {
  const { title, subtitle, stats } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const headingStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;
  const accentStyle = accentColor ? { color: accentColor } : undefined;

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
              style={textStyle}
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
              style={textStyle}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(stats || defaultStats).map((stat: any, index: number) => {
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-orange-500 to-orange-600',
          ];
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${gradients[index % 4]} rounded-2xl p-8 text-white shadow-xl hover:scale-105 transition-transform`}
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
              style={textStyle}
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
              style={textStyle}
            >
              {subtitle}
            </p>
          )}
          <button
            className="btn btn-primary px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
            style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
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
