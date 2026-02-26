import { PageBuilderSection } from './pageBuilderTypes';

type BackgroundConfig = PageBuilderSection['design']['background'];

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] || url.split(/[=/]/).pop() || '';
};

const isYouTubeUrl = (url: string) =>
  url.includes('youtube.com') || url.includes('youtu.be');

const toYouTubeEmbedUrl = (
  url: string,
  options: { autoplay: boolean; noBranding: boolean },
) => {
  const id = getYouTubeId(url);
  const base = `https://www.youtube.com/embed/${id}`;
  const params = [
    `autoplay=${options.autoplay ? 1 : 0}`,
    'mute=1',
    'loop=1',
    'controls=0',
    `playlist=${id}`,
  ];

  if (options.noBranding) {
    params.push('modestbranding=1', 'showinfo=0', 'rel=0');
  }

  return `${base}?${params.join('&')}`;
};

export const hasBackgroundMediaLayer = (type?: string) =>
  type === 'image' || type === 'video';

export const getBackgroundContentClassName = (background?: BackgroundConfig) =>
  hasBackgroundMediaLayer(background?.type) ? 'relative z-10' : '';

export function renderBackgroundLayers(background?: BackgroundConfig) {
  if (!background) return null;

  const hasBackgroundValue = typeof background.value === 'string' && background.value.trim() !== '';

  return (
    <>
      {background.type === 'image' && hasBackgroundValue && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${background.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: background.opacity ?? 1,
          }}
        />
      )}

      {background.type === 'video' && hasBackgroundValue && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {isYouTubeUrl(background.value) ? (
            <iframe
              src={toYouTubeEmbedUrl(background.value, {
                autoplay: background.videoAutoplay !== false,
                noBranding: background.videoNoBranding === true,
              })}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: background.videoFullWidth ? '100vw' : '177.78vh',
                height: background.videoFullWidth ? '56.25vw' : '100vh',
                minWidth: '100%',
                minHeight: '100%',
                border: 'none',
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video
              src={background.value}
              autoPlay={background.videoAutoplay !== false}
              muted
              loop
              playsInline
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
            />
          )}
        </div>
      )}

      {background.overlayColor && hasBackgroundMediaLayer(background.type) && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            backgroundColor: background.overlayColor,
            opacity: background.overlayOpacity ?? 0.5,
          }}
        />
      )}
    </>
  );
}