import { Clock, Menu, Search, ShoppingBag } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeaderTopInfoProps {
  section: PageBuilderSection;
}

export default function HeaderTopInfo({ section }: HeaderTopInfoProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;

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
  const linkStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  return (
    <header className="bg-base-100" style={bg ? { backgroundColor: bg } : undefined}>
      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-base-content" style={headingStyle} />
              <div>
                <p className="text-sm font-semibold text-base-content" style={headingStyle}>
                  {content.openHoursTitle || 'Open Hours'}
                </p>
                <p className="text-xs text-base-content/70" style={textStyle}>
                  {content.openHours || 'Mon - Fri 9:30 - 20:00'}
                </p>
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-base-content" style={headingStyle}>
              {content.logo || 'KING'}
            </div>

            <div className="flex items-center space-x-4">
              {content.phone && (
                <p className="text-lg font-bold hidden md:block text-base-content" style={headingStyle}>
                  {content.phone}
                </p>
              )}
              {content.ctaText && (
                <button className="btn btn-outline px-6" style={headingStyle}>
                  {content.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button className="btn btn-ghost btn-square lg:hidden">
            <Menu className="w-6 h-6 text-base-content" style={headingStyle} />
          </button>

          <nav className="hidden lg:flex items-center space-x-8">
            {content.menuItems?.map((item: string, index: number) => (
              <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ ...headingStyle, ...linkStyle }}>
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {content.showSearch && (
              <button className="btn btn-ghost btn-square">
                <Search className="w-5 h-5 text-base-content" style={headingStyle} />
              </button>
            )}
            {content.showCart && (
              <button className="btn btn-ghost btn-square">
                <ShoppingBag className="w-5 h-5 text-base-content" style={headingStyle} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
