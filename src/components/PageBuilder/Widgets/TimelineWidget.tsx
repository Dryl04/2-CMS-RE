import { Calendar, CheckCircle } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface TimelineWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function TimelineWidget({ section }: TimelineWidgetProps) {
  const { title, subtitle, events } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const defaultEvents = [
    {
      date: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to transform the industry',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2021',
      title: 'First Product Launch',
      description: 'Released our flagship product to amazing reception',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2022',
      title: 'Series A Funding',
      description: 'Raised $10M to scale our operations',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2023',
      title: 'Global Expansion',
      description: 'Opened offices in 10 new countries',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2024',
      title: 'Industry Recognition',
      description: 'Named Best Product of the Year',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const renderVertical = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Our Journey'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Milestones that shaped our story'}
        </p>
      </div>

      <div className="relative">
        <div
          className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20"
          style={accentColor ? { backgroundColor: `${accentColor}40` } : undefined}
        />

        <div className="space-y-12">
          {(events || defaultEvents).map((event: any, index: number) => (
            <div
              key={index}
              className={`relative flex items-center ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} pl-20 md:pl-0`}>
                <div
                  className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-2 bg-primary/20 text-primary"
                  style={accentColor ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
                >
                  {event.date}
                </div>
                <h3
                  className="text-2xl font-bold mb-2 text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  {event.title}
                </h3>
                <p
                  className="text-base-content/70"
                  style={textColor ? { color: textColor } : undefined}
                >
                  {event.description}
                </p>
              </div>

              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2">
                <div
                  className="w-4 h-4 rounded-full border-4 border-base-100 bg-primary"
                  style={accentColor ? { backgroundColor: accentColor } : undefined}
                />
              </div>

              <div className={`hidden md:block md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHorizontal = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 md:mb-8 lg:mb-12">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Timeline'}
        </h2>
        <p
          className="text-base sm:text-lg md:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Our story over the years'}
        </p>
      </div>

      <div className="relative">
        <div
          className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-primary/20"
          style={accentColor ? { backgroundColor: `${accentColor}40` } : undefined}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:overflow-x-auto pb-8 gap-4 md:gap-6 lg:gap-8">
          {(events || defaultEvents).map((event: any, index: number) => (
            <div key={index} className="flex-shrink-0 w-full sm:w-auto lg:w-72">
              <div className="relative">
                <div
                  className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-base-100 bg-primary"
                  style={accentColor ? { backgroundColor: accentColor } : undefined}
                />
              </div>
              <div className="md:mt-12 bg-base-100 rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 border border-base-content/10">
                <div
                  className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold mb-2 sm:mb-3 bg-primary/20 text-primary"
                  style={accentColor ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
                >
                  {event.date}
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-base-content"
                  style={headingColor ? { color: headingColor } : undefined}
                >
                  {event.title}
                </h3>
                <p
                  className="text-xs sm:text-sm text-base-content/70"
                  style={textColor ? { color: textColor } : undefined}
                >
                  {event.description}
                </p>
              </div>
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
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Our Evolution'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Key moments in our history'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(events || defaultEvents).map((event: any, index: number) => (
          <div
            key={index}
            className="bg-base-100 rounded-2xl shadow-lg overflow-hidden border border-base-content/10 hover:shadow-xl transition-shadow"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center mb-3">
                <Calendar
                  className="w-5 h-5 mr-2 text-primary"
                  style={accentColor ? { color: accentColor } : undefined}
                />
                <span
                  className="text-sm font-bold text-primary"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  {event.date}
                </span>
              </div>
              <h3
                className="text-xl font-bold mb-2 text-base-content"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {event.title}
              </h3>
              <p
                className="text-sm text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'History'}
        </h2>
        <p
          className="text-lg text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Our journey so far'}
        </p>
      </div>

      <div className="space-y-8">
        {(events || defaultEvents).map((event: any, index: number) => (
          <div
            key={index}
            className="flex items-start border-l-4 pl-6 border-primary"
            style={accentColor ? { borderColor: accentColor } : undefined}
          >
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CheckCircle
                  className="w-5 h-5 mr-2 text-primary"
                  style={accentColor ? { color: accentColor } : undefined}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wide text-primary"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  {event.date}
                </span>
              </div>
              <h3
                className="text-2xl font-bold mb-2 text-base-content"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {event.title}
              </h3>
              <p
                className="text-base-content/70"
                style={textColor ? { color: textColor } : undefined}
              >
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'horizontal':
      return renderHorizontal();
    case 'cards':
      return renderCards();
    case 'minimal':
      return renderMinimal();
    default:
      return renderVertical();
  }
}
