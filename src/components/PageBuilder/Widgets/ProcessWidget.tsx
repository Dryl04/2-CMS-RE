import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';
import { renderIcon } from '@/lib/iconLibrary';

interface ProcessWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function ProcessWidget({ section }: ProcessWidgetProps) {
  const { title, subtitle, steps } = section.content;

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

  const defaultSteps = [
    { number: '01', icon: 'check-circle', title: 'Sign Up', description: 'Create your account in less than a minute' },
    { number: '02', icon: 'check-circle', title: 'Set Up', description: 'Configure your preferences and settings' },
    { number: '03', icon: 'check-circle', title: 'Start Building', description: 'Begin creating your first project' },
    { number: '04', icon: 'check-circle', title: 'Launch', description: 'Go live and share with the world' },
  ];

  const renderStepIcon = (step: any, iconClassName: string, fallbackClassName: string, size = 28) => {
    if (step.icon) {
      return renderIcon(step.icon, iconClassName, size);
    }
    return <span className={fallbackClassName}>{step.number}</span>;
  };

  const renderNumbered = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 md:mb-8 lg:mb-12">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'How It Works')}
        </h2>
        <p
          className="text-base sm:text-lg md:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Get started in four simple steps')}
        </p>
      </div>

      <div className="relative">
        <div
          className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 md:h-1 -translate-y-1/2 bg-primary/20"
          style={accentColor ? { backgroundColor: `${accentColor}20` } : undefined}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative">
          {(steps || defaultSteps).map((step: any, index: number) => (
            <div key={index} className="text-center">
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl flex items-center justify-center bg-primary"
                data-widget-icon-frame
              >
                {renderStepIcon(
                  step,
                  'text-primary-content',
                  'text-2xl sm:text-3xl md:text-4xl font-bold text-primary-content',
                  32,
                )}
              </div>
              <h3
                className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-3 text-base-content"
                style={headingStyle}
              >
                {renderRichText(step.title)}
              </h3>
              <p
                className="text-sm md:text-base text-base-content/70"
                style={textStyle}
              >
                {renderRichText(step.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Our Process')}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Follow these steps to success')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {(steps || defaultSteps).map((step: any, index: number) => (
          <div
            key={index}
            className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-content/10 hover:shadow-xl transition-all relative overflow-hidden group"
          >
            <div
              className="absolute -right-6 -top-6 text-8xl font-bold opacity-5 text-primary"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {step.number}
            </div>
            <div className="relative">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-primary/20"
                data-widget-icon-frame
              >
                {renderStepIcon(
                  step,
                  'text-primary',
                  'text-2xl font-bold text-primary',
                  28,
                )}
              </div>
              <h3
                className="text-2xl font-bold mb-3 text-base-content"
                style={headingStyle}
              >
                {renderRichText(step.title)}
              </h3>
              <p
                className="text-base text-base-content/70"
                style={textStyle}
              >
                {renderRichText(step.description)}
              </p>
            </div>
            {index < (steps || defaultSteps).length - 1 && (
              <ArrowRight
                className="absolute bottom-8 right-8 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                style={accentColor ? { color: accentColor } : undefined}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVertical = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Step by Step')}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Your journey to success')}
        </p>
      </div>

      <div className="relative">
        <div
          className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1 bg-primary/20"
          style={accentColor ? { backgroundColor: `${accentColor}20` } : undefined}
        />

        <div className="space-y-8 sm:space-y-12">
          {(steps || defaultSteps).map((step: any, index: number) => (
            <div key={index} className="relative pl-16 sm:pl-20">
              <div
                className="absolute left-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-primary"
                data-widget-icon-frame
              >
                {renderStepIcon(
                  step,
                  'text-primary-content',
                  'text-lg sm:text-2xl font-bold text-primary-content',
                  24,
                )}
              </div>
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold mb-2 text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(step.title)}
                </h3>
                <p
                  className="text-base sm:text-lg text-base-content/70"
                  style={textStyle}
                >
                  {renderRichText(step.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {renderRichText(title, 'Simple Steps')}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={subtitleStyle}
        >
          {renderRichText(subtitle, 'Everything you need to get started')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {(steps || defaultSteps).map((step: any, index: number) => (
          <div
            key={index}
            className="relative p-8 rounded-2xl border-2 hover:shadow-lg transition-all border-primary/20"
            style={accentColor ? { borderColor: `${accentColor}20` } : undefined}
          >
            <div className="flex items-start gap-6">
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-primary"
                data-widget-icon-frame
              >
                {renderStepIcon(
                  step,
                  'text-primary-content',
                  'text-xl font-bold text-primary-content',
                  28,
                )}
              </div>
              <div className="flex-1">
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-primary/20 text-primary"
                  style={accentColor ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
                >
                  Step {step.number}
                </div>
                <h3
                  className="text-xl font-bold mb-2 text-base-content"
                  style={headingStyle}
                >
                  {renderRichText(step.title)}
                </h3>
                <p
                  className="text-sm text-base-content/70"
                  style={textStyle}
                >
                  {renderRichText(step.description)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'cards':
      return renderCards();
    case 'vertical':
      return renderVertical();
    case 'grid':
      return renderGrid();
    default:
      return renderNumbered();
  }
}
