import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface Testimonial {
  quote: string;
  name: string;
  badge: string;
  avatar: string;
}

interface Logo {
  name: string;
  imageUrl: string;
}

interface ClickFunnelTestimonialsProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

const LogoPlaceholder = ({ name }: { name: string }) => (
  <div className="px-6 py-2 text-white/60 font-bold text-xl tracking-tight">
    {name}
  </div>
);

export default function ClickFunnelTestimonials({ section }: ClickFunnelTestimonialsProps) {
  const content = section?.content || {};
  const design = section?.design || {};

  const bgColor = design?.background?.type === 'color' && design.background.value
    ? design.background.value
    : '#1a1d3d';

  const defaultLogos: Logo[] = [
    { name: 'USA TODAY', imageUrl: '' },
    { name: 'ENTREPRENEUR', imageUrl: '' },
    { name: 'INC. 500', imageUrl: '' },
    { name: 'YAHOO! FINANCE', imageUrl: '' },
    { name: 'FORBES', imageUrl: '' },
    { name: 'INC. 5000', imageUrl: '' },
  ];

  const defaultTestimonials: Testimonial[] = [
    {
      quote: 'By using ClickFunnels one of the main things we\'ve been able to do is launch more and launch more, FASTER.',
      name: 'Lamar Tyler',
      badge: 'Verified ClickFunnels User',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
      quote: 'We became one of the top Booking Agencies for (big tourism brand) using funnels as one of the ways we got there.',
      name: 'Josh Brown',
      badge: 'Verified ClickFunnels User',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
      quote: 'ClickFunnels has changed my life because it gave me to the world, so I didn\'t have to rob the world of me.',
      name: 'Anthony Trucks',
      badge: 'Verified ClickFunnels User',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    },
    {
      quote: 'I was able to turn my passion for helping musicians into programs, books, memberships and a 7-figure business by following what Russell teaches using ClickFunnels.',
      name: 'Kristine Mirelle',
      badge: 'Verified ClickFunnels User',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
  ];

  let logos = defaultLogos;
  if (content && 'logos' in content) {
    if (Array.isArray(content.logos) && content.logos.length > 0) {
      logos = content.logos;
    }
  }

  let testimonials = defaultTestimonials;
  if (content && 'testimonials' in content) {
    if (Array.isArray(content.testimonials) && content.testimonials.length > 0) {
      testimonials = content.testimonials;
    }
  }

  const statNumber = (content && 'statNumber' in content && content.statNumber) ? content.statNumber : '100K+';
  const statLabel = (content && 'statLabel' in content && content.statLabel) ? content.statLabel : 'ClickFunnels Users';
  const showLogos = content && 'showLogos' in content ? content.showLogos !== false : true;
  const showStat = content && 'showStat' in content ? content.showStat !== false : true;

  const allTestimonials = [...testimonials, ...testimonials];
  const statCardPosition = Math.floor(testimonials.length / 2);

  return (
    <div className="relative w-full py-16 overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4">
        {showLogos && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-12 mb-16">
            {logos.map((logo: Logo, index: number) => (
              <div key={index} className="flex items-center">
                {logo.imageUrl ? (
                  <img
                    src={logo.imageUrl}
                    alt={logo.name}
                    className="h-8 w-auto object-contain opacity-60 brightness-0 invert"
                  />
                ) : (
                  <LogoPlaceholder name={logo.name} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative -mx-4">
          <div
            className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${bgColor}, transparent)`
            }}
          ></div>
          <div
            className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${bgColor}, transparent)`
            }}
          ></div>

          <div className="overflow-hidden px-4">
            <div className="flex gap-6 animate-scroll-testimonials">
              {allTestimonials.map((testimonial: Testimonial, index: number) => {
                const isStatCard = showStat && index === statCardPosition;

                if (isStatCard) {
                  return (
                    <div
                      key={`stat-${index}`}
                      className="flex-shrink-0 w-[380px] h-[280px] rounded-2xl bg-gradient-to-br from-[#ffd7c4] via-[#ffe5d6] to-[#fff0e8] p-8 flex flex-col items-center justify-center shadow-xl"
                    >
                      <div className="text-7xl font-black text-[#1a1d3d] mb-4 leading-none">
                        {statNumber}
                      </div>
                      <div className="text-xl font-bold text-[#1a1d3d] text-center">
                        {statLabel}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`testimonial-${index}`}
                    className="flex-shrink-0 w-[380px] h-[280px] rounded-2xl bg-[#2a2d5a] p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <p className="text-white text-lg font-bold leading-relaxed line-clamp-6">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-bold">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-white font-bold text-base truncate">
                          {testimonial.name}
                        </div>
                        <div className="text-white/70 text-sm truncate">
                          {testimonial.badge}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-testimonials {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-testimonials {
          animation: scroll-testimonials 40s linear infinite;
          will-change: transform;
        }

        .animate-scroll-testimonials:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
