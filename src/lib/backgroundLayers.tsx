import { PageBuilderSection } from './pageBuilderTypes';
import {
  isYouTubeUrl,
  buildEmbedUrl,
  getVideoElementProps,
  getIframeCoverStyle,
  getVideoIframeProps,
  getIframeCoverContainerStyle,
} from './videoConfig';

type BackgroundConfig = PageBuilderSection['design']['background'];

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
            borderRadius: 'inherit',
          }}
        />
      )}

      {background.type === 'video' && hasBackgroundValue && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ ...getIframeCoverContainerStyle(), borderRadius: 'inherit' }}>
          {isYouTubeUrl(background.value) ? (
            <iframe
              src={buildEmbedUrl(background.value, {
                autoplay: background.videoAutoplay !== false,
                controls: false,
                noBranding: background.videoNoBranding === true,
              })}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={getIframeCoverStyle()}
              {...getVideoIframeProps()}
            />
          ) : (
            <video
              src={background.value}
              {...getVideoElementProps({
                autoplay: background.videoAutoplay !== false,
              })}
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
            borderRadius: 'inherit',
          }}
        />
      )}
    </>
  );
}
