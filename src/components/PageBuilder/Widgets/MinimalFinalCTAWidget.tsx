import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface MinimalFinalCTAWidgetProps {
  section: PageBuilderSection;
}

export default function MinimalFinalCTAWidget({ section }: MinimalFinalCTAWidgetProps) {
  const { content, design } = section;
  const headingColor = design.typography?.headingColor;

  return (
    <section className="bg-base-100">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: design.spacing.paddingTop, paddingBottom: design.spacing.paddingBottom }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-base-content/10 rounded-2xl px-6 py-5 bg-base-200">
          <h2 className="text-xl sm:text-2xl font-semibold" style={headingColor ? { color: headingColor } : undefined}>
            {content.title || 'A new medium needs a new canvas.'}
          </h2>
          <div className="flex items-center gap-2">
            <a href={content.primaryLink || '#'} className="btn btn-primary btn-sm">{content.primaryText || 'Contact sales'}</a>
            <a href={content.secondaryLink || '#'} className="btn btn-outline btn-sm">{content.secondaryText || 'Try for free'}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
