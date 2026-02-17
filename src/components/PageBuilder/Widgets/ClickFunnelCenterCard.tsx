import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface ClickFunnelCenterCardProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function ClickFunnelCenterCard({ section }: ClickFunnelCenterCardProps) {
  const { content, design } = section;

  const bgColor = design?.background?.type === 'color' ? design.background.value : '#1B2A4E';
  const titleColor = design?.typography?.headingColor || '#1F2937';
  const textColor = design?.typography?.textColor || '#4B5563';
  const highlightColor = design?.typography?.highlightColor || '#000000';
  const buttonBg = design?.colors?.buttonBg || '#F59E0B';
  const buttonText = design?.colors?.buttonText || '#000000';
  const cardBg = design?.colors?.cardBg || '#FFFFFF';
  const mediaBg = design?.colors?.mediaBg || '#E5E7EB';
  const navBg = design?.colors?.navBg || '#93C5FD';
  const navText = design?.colors?.navText || '#1F2937';
  const navActiveText = design?.colors?.navActiveText || '#1F2937';
  const decorLeftColor = design?.colors?.decorLeftColor || '#DC2626';
  const decorRightColor = design?.colors?.decorRightColor || '#F59E0B';

  const navItems = content.navItems || [
    {
      label: 'Your Funnel',
      title: 'Your Funnel',
      subtitle: 'Convert your online visitors into paying customers with the',
      highlight: 'best funnel builder on the planet',
      description: 'Easy to use, incredibly fast, and optimized to turn clicks into cash.',
      buttonText: 'Try for Free',
      mediaUrl: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
      mediaType: 'image',
    },
    {
      label: 'Your Store',
      title: 'Your Store',
      subtitle: 'Build and manage your online store with',
      highlight: 'powerful e-commerce tools',
      description: 'Sell products, manage inventory, and process payments seamlessly.',
      buttonText: 'Start Selling',
      mediaUrl: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg',
      mediaType: 'image',
    },
    {
      label: 'Your CRM',
      title: 'Your CRM',
      subtitle: 'Manage your customer relationships with',
      highlight: 'advanced CRM features',
      description: 'Track leads, automate follow-ups, and close more deals.',
      buttonText: 'Get Started',
      mediaUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
      mediaType: 'image',
    },
    {
      label: 'Your Email Marketing',
      title: 'Your Email Marketing',
      subtitle: 'Reach your audience with',
      highlight: 'powerful email campaigns',
      description: 'Create, send, and track email marketing campaigns that convert.',
      buttonText: 'Start Campaign',
      mediaUrl: 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg',
      mediaType: 'image',
    },
    {
      label: 'Your Online Courses',
      title: 'Your Online Courses',
      subtitle: 'Create and sell online courses with',
      highlight: 'professional course platform',
      description: 'Build engaging courses, manage students, and grow your education business.',
      buttonText: 'Create Course',
      mediaUrl: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
      mediaType: 'image',
    },
  ];

  const initialActiveIndex = navItems.findIndex((item: any) => item.active) || 0;
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveIndex >= 0 ? initialActiveIndex : 0);

  const activeTab = navItems[activeTabIndex] || navItems[0];

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {content.showLeftDecor !== false && (
        <>
          <div
            className="absolute left-0 top-1/4 w-40 h-40"
            style={{
              background: `radial-gradient(ellipse at center, ${decorLeftColor}60 0%, transparent 70%)`,
              clipPath: 'polygon(0 0, 100% 20%, 80% 100%, 0 80%)',
              transform: 'rotate(-15deg)',
            }}
          />
          <div
            className="absolute left-0 top-1/3 w-32 h-32"
            style={{
              background: `radial-gradient(ellipse at center, ${decorRightColor}40 0%, transparent 70%)`,
              clipPath: 'polygon(0 30%, 100% 0, 100% 70%, 0 100%)',
              transform: 'rotate(25deg) translateY(40px)',
            }}
          />
        </>
      )}

      {content.showRightDecor !== false && (
        <>
          <div
            className="absolute right-0 top-0 w-48 h-48"
            style={{
              background: `radial-gradient(ellipse at center, ${decorLeftColor}50 0%, transparent 70%)`,
              clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 80% 80%)',
              transform: 'rotate(25deg)',
            }}
          />
          <div
            className="absolute right-0 top-12 w-40 h-40"
            style={{
              background: `radial-gradient(ellipse at center, ${decorRightColor}50 0%, transparent 70%)`,
              clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 30% 80%)',
              transform: 'rotate(-20deg) translateX(20px)',
            }}
          />
        </>
      )}

      <nav className="relative z-10 pt-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-center gap-4 flex-wrap">
          {navItems.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveTabIndex(index)}
              className="px-6 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-100"
              style={{
                backgroundColor: activeTabIndex === index ? navBg : 'transparent',
                color: activeTabIndex === index ? navActiveText : navText,
                opacity: activeTabIndex === index ? 1 : 0.7,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-16">
        <div
          className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: cardBg }}
        >
          <div className="grid md:grid-cols-2 gap-0 min-h-[500px]">
            <div className="flex flex-col justify-center p-12 lg:p-16">
              <h2
                className="text-4xl lg:text-5xl font-bold mb-6 transition-all duration-300"
                style={{ color: titleColor }}
              >
                {activeTab.title || 'Your Funnel'}
              </h2>
              <p
                className="text-lg mb-2 transition-all duration-300"
                style={{ color: textColor }}
              >
                {activeTab.subtitle || 'Convert your online visitors into paying customers with the'}{' '}
                <span className="font-bold" style={{ color: highlightColor }}>
                  {activeTab.highlight || 'best funnel builder on the planet'}
                </span>
                .{' '}
                {activeTab.description || 'Easy to use, incredibly fast, and optimized to turn clicks into cash.'}
              </p>
              <div className="mt-8">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonText,
                  }}
                >
                  {activeTab.buttonText || 'Try for Free'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="relative flex items-center justify-center p-8"
              style={{ backgroundColor: mediaBg }}
            >
              {activeTab.mediaType === 'video' && activeTab.mediaUrl ? (
                <video
                  key={activeTab.mediaUrl}
                  src={activeTab.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-xl transition-all duration-300"
                />
              ) : (
                <img
                  key={activeTab.mediaUrl}
                  src={activeTab.mediaUrl}
                  alt={activeTab.mediaAlt || activeTab.title || 'Preview'}
                  className="w-full h-full object-cover rounded-xl transition-all duration-300"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
