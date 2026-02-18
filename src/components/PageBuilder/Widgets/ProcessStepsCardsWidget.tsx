import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ProcessStepsCardsWidgetProps {
  section: PageBuilderSection;
}

interface ProcessStepItem {
  number?: string;
  title?: string;
  description?: string;
  image?: string;
}

export default function ProcessStepsCardsWidget({ section }: ProcessStepsCardsWidgetProps) {
  const { content, design } = section;
  const steps = (content.steps || []) as ProcessStepItem[];

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

  return (
    <section className="bg-base-100">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={headingStyle}>
          {content.title || 'Create at the speed of thought.'}
        </h2>
        <p className="text-sm opacity-80 mb-8" style={subtitleStyle}>
          {content.subtitle || 'Move from idea to production with a simple loop.'}
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step: ProcessStepItem, index: number) => (
            <article key={index} className="bg-base-200 rounded-2xl border border-base-content/10 overflow-hidden">
              <img src={step.image || ''} alt={step.title || 'step'} className="w-full h-44 object-cover bg-base-300" />
              <div className="p-4">
                <p className="text-sm font-semibold opacity-80" style={textStyle}>{step.number || `0${index + 1}`}</p>
                <h3 className="text-xl font-bold mt-1" style={headingStyle}>{step.title || 'Step'}</h3>
                <p className="text-sm mt-2 opacity-80" style={textStyle}>{step.description || ''}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
