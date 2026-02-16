import { Clock, Phone, Menu, Search, ShoppingBag } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface HeaderTopInfoProps {
  section: PageBuilderSection;
}

export default function HeaderTopInfo({ section }: HeaderTopInfoProps) {
  const { content, design } = section;
  const bg = design.background.type === 'color' ? design.background.value : undefined;
  const textColor = design.typography?.textColor || undefined;
  const headingColor = design.typography?.headingColor || undefined;
  const buttonBg = design.colors?.buttonBg || undefined;
  const buttonText = design.colors?.buttonText || undefined;

  return (
    <header className="bg-base-100" style={{ backgroundColor: bg }}>
      <div className="border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
              <div>
                <p className="text-sm font-semibold text-base-content" style={{ color: headingColor }}>
                  {content.openHoursTitle || 'Open Hours'}
                </p>
                <p className="text-xs text-base-content/70" style={{ color: textColor }}>
                  {content.openHours || 'Mon - Fri 9:30 - 20:00'}
                </p>
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-bold text-base-content" style={{ color: headingColor }}>
              {content.logo || 'KING'}
            </div>

            <div className="flex items-center space-x-4">
              {content.phone && (
                <p className="text-lg font-bold hidden md:block text-base-content" style={{ color: headingColor }}>
                  {content.phone}
                </p>
              )}
              {content.ctaText && (
                <button className="px-6 py-2 border-2 font-semibold hover:opacity-80 transition border-base-content text-base-content" style={{
                  borderColor: headingColor,
                  color: headingColor,
                }}>
                  {content.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button className="lg:hidden">
            <Menu className="w-6 h-6 text-base-content" style={{ color: headingColor }} />
          </button>

          <nav className="hidden lg:flex items-center space-x-8">
            {content.menuItems?.map((item: string, index: number) => (
              <a key={index} href="#" className="text-sm font-semibold hover:opacity-70 transition text-base-content" style={{ color: headingColor }}>
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {content.showSearch && (
              <button className="hover:opacity-70 transition">
                <Search className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
              </button>
            )}
            {content.showCart && (
              <button className="hover:opacity-70 transition">
                <ShoppingBag className="w-5 h-5 text-base-content" style={{ color: headingColor }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
