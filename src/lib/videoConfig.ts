// ---------------------------------------------------------------------------
// Shared video configuration & helpers
// Centralises defaults, URL building and element props so that every renderer
// (backgroundLayers, VideoHeroWidget, ContentVideoServices, …) behaves the
// same way.
// ---------------------------------------------------------------------------

/** Product-validated defaults – applied when no explicit user value exists. */
export const VIDEO_DEFAULTS = {
  autoplay: true,
  muted: true,
  loop: true,
  fullWidth: true,
} as const;

// ---------------------------------------------------------------------------
// URL detection helpers
// ---------------------------------------------------------------------------

export const isYouTubeUrl = (url: string): boolean =>
  /youtube\.com|youtu\.be/i.test(url);

export const isVimeoUrl = (url: string): boolean =>
  /vimeo\.com/i.test(url);

export const isDirectVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|ogg)(\?|$)/i.test(url);

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

function extractUrlFromIframeHtml(value: string): string {
  const srcMatch = value.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return srcMatch?.[1] || value;
}

// ---------------------------------------------------------------------------
// ID extraction
// ---------------------------------------------------------------------------

export function getYouTubeId(url: string): string {
  const rawValue = (url || '').trim();
  if (!rawValue) return '';

  const normalized = extractUrlFromIframeHtml(rawValue).trim();

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname;

    if (host === 'youtu.be') {
      const candidate = path.split('/').filter(Boolean)[0] || '';
      return YOUTUBE_ID_REGEX.test(candidate) ? candidate : '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (path === '/watch') {
        const candidate = parsed.searchParams.get('v') || '';
        return YOUTUBE_ID_REGEX.test(candidate) ? candidate : '';
      }

      const parts = path.split('/').filter(Boolean);
      const first = parts[0];
      const second = parts[1] || '';

      if (first === 'embed' || first === 'shorts' || first === 'live' || first === 'v') {
        return YOUTUBE_ID_REGEX.test(second) ? second : '';
      }
    }
  } catch {
    // Fallback regex below
  }

  const fallbackMatch = normalized.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
  );
  return fallbackMatch?.[1] || '';
}

export function getVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || url.split('/').pop() || '';
}

// ---------------------------------------------------------------------------
// Embed-URL builder
// ---------------------------------------------------------------------------

export interface EmbedUrlOptions {
  /** Defaults to VIDEO_DEFAULTS.autoplay */
  autoplay?: boolean;
  /** Hide YouTube branding (modestbranding, showinfo, rel) */
  noBranding?: boolean;
  /** Show native player controls — switches between background mode (false)
   *  and content mode (true). Default: false (background). */
  controls?: boolean;
  /** Force mute (default true). Applies to both background and content mode. */
  mute?: boolean;
  /** Force loop (default true). Applies to both background and content mode. */
  loop?: boolean;
}

/**
 * Builds the correct embed URL for YouTube or Vimeo.
 *
 * Two modes of operation:
 * - **Background mode** (`controls: false`, the default): applies the full
 *   parameter set (mute, loop, no controls, playlist) — matches what
 *   `backgroundLayers` was already doing.
 * - **Content mode** (`controls: true`): only sends `autoplay` — matches the
 *   original working behaviour of VideoHeroWidget / ContentVideoServices where
 *   the user clicks play and expects standard player behaviour.
 *
 * For direct-file URLs the input is returned as-is.
 */
export function buildEmbedUrl(url: string, opts: EmbedUrlOptions = {}): string {
  if (!url) return '';

  const autoplay = opts.autoplay ?? VIDEO_DEFAULTS.autoplay;
  const controls = opts.controls ?? false;
  const noBranding = opts.noBranding ?? false;
  const mute = opts.mute ?? VIDEO_DEFAULTS.muted;
  const loop = opts.loop ?? VIDEO_DEFAULTS.loop;

  // --- YouTube -----------------------------------------------------------
  if (isYouTubeUrl(url)) {
    const id = getYouTubeId(url);
    if (!id) return '';

    const params = [
      `autoplay=${autoplay ? 1 : 0}`,
      `mute=${mute ? 1 : 0}`,
      `loop=${loop ? 1 : 0}`,
      `controls=${controls ? 1 : 0}`,
    ];
    if (loop) params.push(`playlist=${id}`);
    if (noBranding) params.push('modestbranding=1', 'showinfo=0', 'rel=0');
    return `https://www.youtube.com/embed/${id}?${params.join('&')}`;
  }

  // --- Vimeo --------------------------------------------------------------
  if (isVimeoUrl(url)) {
    const id = getVimeoId(url);

    if (!controls) {
      // Background mode: Vimeo's `background=1` hides UI + forces
      // autoplay / muted / loop automatically.
      return `https://player.vimeo.com/video/${id}?background=1`;
    }

    const params = [
      `autoplay=${autoplay ? 1 : 0}`,
      `muted=${mute ? 1 : 0}`,
      `loop=${loop ? 1 : 0}`,
    ];
    return `https://player.vimeo.com/video/${id}?${params.join('&')}`;
  }

  // Direct file URL – nothing to transform
  return url;
}

// ---------------------------------------------------------------------------
// Native <video> element props
// ---------------------------------------------------------------------------

export interface VideoElementOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

/**
 * Returns the HTML attributes to spread on a `<video>` element.
 * Uses the shared defaults when no explicit value is supplied.
 */
export function getVideoElementProps(opts: VideoElementOptions = {}) {
  return {
    autoPlay: opts.autoplay ?? VIDEO_DEFAULTS.autoplay,
    muted: opts.muted ?? VIDEO_DEFAULTS.muted,
    loop: opts.loop ?? VIDEO_DEFAULTS.loop,
    playsInline: true as const,
  };
}

// ---------------------------------------------------------------------------
// Iframe props (Referer requirements for YouTube embeds)
// ---------------------------------------------------------------------------

/**
 * YouTube embed playback can fail with Error 153 when no Referer is sent.
 * Force a permissive-enough referrer policy for cross-origin iframe requests.
 */
export function getVideoIframeProps() {
  return {
    allow: 'autoplay; encrypted-media; fullscreen',
    referrerPolicy: 'strict-origin-when-cross-origin' as const,
  };
}

// ---------------------------------------------------------------------------
// Iframe cover-sizing style  (eliminates lateral margins)
// ---------------------------------------------------------------------------

/**
 * Parent style required for `cqw/cqh` units used by `getIframeCoverStyle`.
 */
export function getIframeCoverContainerStyle(): Record<string, string> {
  return {
    containerType: 'size',
  };
}

/**
 * Framed video mode: fills the frame without additional crop.
 */
export function getIframeFrameStyle(): Record<string, string> {
  return {
    width: '100%',
    height: '100%',
    border: 'none',
  };
}

/**
 * Returns a CSS style object that makes an iframe fully cover its container
 * while preserving 16 : 9 aspect ratio (no black bars / lateral margins).
 *
 * The trick: use viewport-relative units to create a box that is always at
 * least as wide *and* as tall as the parent, then centre it with absolute
 * positioning + translate.
 */
export function getIframeCoverStyle(): Record<string, string> {
  return {
    // Cover fit against the actual container size (not viewport)
    width: 'max(100cqw, calc(100cqh * 16 / 9))',
    height: 'max(100cqh, calc(100cqw * 9 / 16))',
    border: 'none',
  };
}
