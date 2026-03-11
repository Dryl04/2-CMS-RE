import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { getBackgroundContentClassName, renderBackgroundLayers } from '@/lib/backgroundLayers';
import { getWidgetWrapperProps, normalizeSectionForTheme } from '@/lib/widgetThemeHelper';
import { sanitizeSectionUrls } from '@/lib/contentSanitizer';
import HeaderWidget from '@/components/PageBuilder/Widgets/HeaderWidget';
import FooterWidget from '@/components/PageBuilder/Widgets/FooterWidget';
import SimpleHeaderDivider from '@/components/PageBuilder/Widgets/SimpleHeaderDivider';
import HeaderTopInfo from '@/components/PageBuilder/Widgets/HeaderTopInfo';
import HeaderWithIcons from '@/components/PageBuilder/Widgets/HeaderWithIcons';
import HeaderAccountBar from '@/components/PageBuilder/Widgets/HeaderAccountBar';
import HeaderFullContact from '@/components/PageBuilder/Widgets/HeaderFullContact';
import HeaderClickFunnel from '@/components/PageBuilder/Widgets/HeaderClickFunnel';
import ClickFunnelFooter from '@/components/PageBuilder/Widgets/ClickFunnelFooter';
import CinematicFooterWidget from '@/components/PageBuilder/Widgets/CinematicFooterWidget';

function renderHFWidget(section: PageBuilderSection) {
  const normalizedSection = normalizeSectionForTheme(sanitizeSectionUrls(section));
  const props = { section: normalizedSection, onUpdate: () => {} };

  switch (normalizedSection.type) {
    case 'header':
      return <HeaderWidget {...props} />;
    case 'header-top-info':
      return <HeaderTopInfo {...props} />;
    case 'header-with-icons':
      return <HeaderWithIcons {...props} />;
    case 'header-account-bar':
      return <HeaderAccountBar {...props} />;
    case 'header-full-contact':
      return <HeaderFullContact {...props} />;
    case 'header-clickfunnel':
      return <HeaderClickFunnel {...props} />;
    case 'simple-header-divider':
      return <SimpleHeaderDivider {...props} />;
    case 'footer':
      return <FooterWidget {...props} />;
    case 'clickfunnel-footer':
      return <ClickFunnelFooter {...props} />;
    case 'cinematic-footer':
      return <CinematicFooterWidget {...props} />;
    default:
      return (
        <div className="px-6 py-10 text-sm text-gray-500 text-center">
          Apercu non disponible pour ce type de section.
        </div>
      );
  }
}

function PreviewCard({ title, section }: { title: string; section: PageBuilderSection | null }) {
  if (!section) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-sm text-gray-400">
        {title} non configure
      </div>
    );
  }

  const { normalizedSection, className, dataTheme, style } = getWidgetWrapperProps(section);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{normalizedSection.type}{normalizedSection.variant && normalizedSection.variant !== 'default' ? ` · ${normalizedSection.variant}` : ''}</p>
        </div>
      </div>
      <div className="max-h-[26rem] overflow-auto bg-white">
        <div
          className={className}
          data-theme={dataTheme}
          data-widget-type={normalizedSection.type}
          style={style as React.CSSProperties}
        >
          {renderBackgroundLayers(normalizedSection.design?.background)}
          <div className={getBackgroundContentClassName(normalizedSection.design?.background)}>
            {renderHFWidget(normalizedSection)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlobalHFPreview({
  headerSection,
  footerSection,
}: {
  headerSection: PageBuilderSection | null;
  footerSection: PageBuilderSection | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PreviewCard title="Header applique" section={headerSection} />
      <PreviewCard title="Footer applique" section={footerSection} />
    </div>
  );
}