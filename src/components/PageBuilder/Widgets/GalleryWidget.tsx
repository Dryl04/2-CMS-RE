import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface GalleryWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function GalleryWidget({ section }: GalleryWidgetProps) {
  const { title, subtitle, items } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const defaultItems = [
    {
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Alpha',
      category: 'Web Design',
      link: '#',
    },
    {
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Beta',
      category: 'Branding',
      link: '#',
    },
    {
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Gamma',
      category: 'Mobile App',
      link: '#',
    },
    {
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Delta',
      category: 'UI/UX',
      link: '#',
    },
    {
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Epsilon',
      category: 'Web Design',
      link: '#',
    },
    {
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Project Zeta',
      category: 'Branding',
      link: '#',
    },
  ];

  const renderMasonry = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Our Work'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'A showcase of our latest projects'}
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {(items || defaultItems).map((item: any, index: number) => {
          const heights = ['h-64', 'h-80', 'h-96', 'h-72'];
          return (
            <a
              key={index}
              href={item.link}
              className="group relative block break-inside-avoid overflow-hidden rounded-2xl"
            >
              <img
                src={item.image}
                alt={item.title}
                className={`w-full ${heights[index % 4]} object-cover transition-transform group-hover:scale-110`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p
                  className="text-sm font-medium mb-1 text-primary-content"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  {item.category}
                </p>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Portfolio'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Explore our creative work'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(items || defaultItems).map((item: any, index: number) => (
          <a
            key={index}
            href={item.link}
            className="group relative overflow-hidden rounded-2xl aspect-square"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <p
                className="text-sm font-medium mb-1 text-primary-content"
                style={accentColor ? { color: accentColor } : undefined}
              >
                {item.category}
              </p>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Featured Projects'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Our best work'}
        </p>
      </div>

      <div className="space-y-6">
        {(items || defaultItems).slice(0, 1).map((item: any, index: number) => (
          <a
            key={index}
            href={item.link}
            className="group relative block overflow-hidden rounded-3xl"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-96 lg:h-[600px] object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-12">
              <p
                className="text-base font-medium mb-2 text-primary-content"
                style={accentColor ? { color: accentColor } : undefined}
              >
                {item.category}
              </p>
              <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4">{item.title}</h3>
              <button
                className="self-start px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-xl bg-primary text-primary-content"
                style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
              >
                View Project
              </button>
            </div>
          </a>
        ))}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(items || defaultItems).slice(1).map((item: any, index: number) => (
            <a
              key={index}
              href={item.link}
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p
                  className="text-sm font-medium mb-1 text-primary-content"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  {item.category}
                </p>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCarousel = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title || 'Latest Work'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle || 'Swipe to explore'}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {(items || defaultItems).slice(0, 1).map((item: any, index: number) => (
          <div key={index} className="relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-96 lg:h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-12">
              <div
                className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 bg-primary text-primary-content"
                style={accentColor ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
              >
                {item.category}
              </div>
              <h3 className="text-3xl lg:text-5xl font-bold text-white mb-6">{item.title}</h3>
              <a
                href={item.link}
                className="self-start px-8 py-4 rounded-xl font-semibold bg-base-100 transition-all hover:shadow-xl text-primary"
                style={accentColor ? { color: accentColor } : undefined}
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'grid':
      return renderGrid();
    case 'featured':
      return renderFeatured();
    case 'carousel':
      return renderCarousel();
    default:
      return renderMasonry();
  }
}
