import { PageBuilderSection } from "./pageBuilderTypes";
import { widgetLibrary } from "./widgetLibrary";

function hexToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToOklchValue(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = hexToLinear(parseInt(clean.slice(0, 2), 16));
  const g = hexToLinear(parseInt(clean.slice(2, 4), 16));
  const b = hexToLinear(parseInt(clean.slice(4, 6), 16));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return `${Math.round(L * 10000) / 100}% ${Math.round(C * 10000) / 10000} ${Math.round(H * 100) / 100}`;
}

function toOklchToken(value: string): string {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? hexToOklchValue(trimmed) : trimmed;
}

const COLOR_OVERRIDE_KEYS = [
  "primary",
  "secondary",
  "accent",
  "buttonBackground",
  "buttonText",
  "buttonBackgroundHover",
  "buttonBorderColor",
  "buttonShadow",
  "iconBackground",
  "iconColor",
  "iconBorderColor",
  "iconRadius",
] as const;

const TYPOGRAPHY_COLOR_KEYS = [
  "headingColor",
  "h1Color",
  "h2Color",
  "textColor",
] as const;

const INTERNAL_VERTICAL_SPACING_WIDGET_TYPES = new Set<string>([
  "videohero",
  "content-video-services",
  "clickfunnel-features",
  "click-funnel-testimonials",
  "clickfunnels-hero",
  "clickfunnel-center-card",
  "header",
  "header-top-info",
  "header-with-icons",
  "header-account-bar",
  "header-full-contact",
  "header-clickfunnel",
  "footer",
]);

function normalizeColorValue(value?: string) {
  return value?.trim().toLowerCase();
}

function shouldDropColorOverride(value?: string, defaultValue?: string) {
  const normalized = normalizeColorValue(value);
  if (!normalized) return true;

  const normalizedDefault = normalizeColorValue(defaultValue);
  if (normalizedDefault && normalized === normalizedDefault) return true;

  return false;
}

function getWidgetDefaultDesign(section: PageBuilderSection) {
  return widgetLibrary.find((widget) => widget.type === section.type)
    ?.defaultDesign;
}

function isLegacyDefaultTypography(typography: Record<string, unknown>) {
  const allowedKeys = new Set([
    "fontFamily",
    "fontSize",
    "lineHeight",
    "buttonFontFamily",
    "buttonFontSize",
    "headingColor",
    "textColor",
    "h1Color",
    "h2Color",
    "subtitleColor",
    "linkColor",
    "headingFontFamily",
    "headingFontWeight",
    "headingFontSize",
    "h1FontFamily",
    "h1FontWeight",
    "h1FontSize",
    "h2FontFamily",
    "h2FontWeight",
    "h2FontSize",
    "textFontSize",
  ]);

  const keys = Object.keys(typography);
  if (keys.length === 0) return false;
  if (keys.some((key) => !allowedKeys.has(key))) return false;

  return (
    normalizeColorValue(String(typography.fontFamily ?? "")) === "inherit" &&
    normalizeColorValue(String(typography.fontSize ?? "")) === "1rem" &&
    normalizeColorValue(String(typography.lineHeight ?? "")) === "1.5" &&
    normalizeColorValue(String(typography.headingColor ?? "")) === "#111827" &&
    normalizeColorValue(String(typography.textColor ?? "")) === "#4b5563"
  );
}

function isLegacyDefaultColors(colors: Record<string, unknown>) {
  const allowedKeys = new Set([
    "primary",
    "secondary",
    "buttonBackground",
    "buttonText",
    "buttonBackgroundHover",
    "buttonRadius",
    "buttonSize",
    "buttonBorderWidth",
    "buttonBorderStyle",
    "buttonBorderColor",
    "buttonShadow",
    "accent",
    "iconBackground",
    "iconColor",
    "iconBorderColor",
    "iconBorderWidth",
    "iconRadius",
  ]);

  const keys = Object.keys(colors);
  if (keys.length === 0) return false;
  if (keys.some((key) => !allowedKeys.has(key))) return false;

  return (
    normalizeColorValue(String(colors.primary ?? "")) === "#000000" &&
    normalizeColorValue(String(colors.secondary ?? "")) === "#ffffff" &&
    normalizeColorValue(String(colors.buttonBackground ?? "")) === "#000000" &&
    normalizeColorValue(String(colors.buttonText ?? "")) === "#ffffff" &&
    normalizeColorValue(String(colors.buttonBackgroundHover ?? "")) ===
      "#1f2937"
  );
}

export function normalizeSectionForTheme(
  section: PageBuilderSection,
): PageBuilderSection {
  const defaultDesign = getWidgetDefaultDesign(section);
  const safeBackground = {
    type:
      section.design?.background?.type ??
      defaultDesign?.background?.type ??
      "color",
    value:
      section.design?.background?.value ??
      defaultDesign?.background?.value ??
      "",
  };

  const safeSpacing = {
    paddingTop:
      section.design?.spacing?.paddingTop ??
      defaultDesign?.spacing?.paddingTop ??
      "0px",
    paddingBottom:
      section.design?.spacing?.paddingBottom ??
      defaultDesign?.spacing?.paddingBottom ??
      "0px",
    marginTop:
      section.design?.spacing?.marginTop ??
      defaultDesign?.spacing?.marginTop ??
      "0px",
    marginBottom:
      section.design?.spacing?.marginBottom ??
      defaultDesign?.spacing?.marginBottom ??
      "0px",
  };

  const sourceTypography =
    section.design?.typography ?? defaultDesign?.typography ?? {};
  const sourceColors = section.design?.colors ?? defaultDesign?.colors ?? {};

  const typography = { ...sourceTypography };
  if (isLegacyDefaultTypography(sourceTypography as Record<string, unknown>)) {
    delete typography.fontFamily;
    delete typography.fontSize;
    delete typography.lineHeight;
    delete typography.headingColor;
    delete typography.textColor;
  }

  for (const key of TYPOGRAPHY_COLOR_KEYS) {
    const value = sourceTypography[key];
    const defaultValue = defaultDesign?.typography?.[key];
    if (shouldDropColorOverride(value, defaultValue)) {
      delete typography[key];
    }
  }

  const colors = { ...sourceColors };
  if (isLegacyDefaultColors(sourceColors as Record<string, unknown>)) {
    delete colors.primary;
    delete colors.secondary;
    delete colors.buttonBackground;
    delete colors.buttonText;
    delete colors.buttonBackgroundHover;
  }

  for (const key of COLOR_OVERRIDE_KEYS) {
    const value = sourceColors[key];
    const defaultValue = defaultDesign?.colors?.[key];
    if (shouldDropColorOverride(value, defaultValue)) {
      delete colors[key];
    }
  }

  const normalizedBackgroundValue = shouldDropColorOverride(
    safeBackground.value,
    defaultDesign?.background?.value,
  )
    ? ""
    : safeBackground.value;

  return {
    ...section,
    id: section.id || `section-${section.type || "widget"}`,
    design: {
      ...(section.design || {}),
      background: {
        ...safeBackground,
        value: normalizedBackgroundValue,
      },
      spacing: safeSpacing,
      typography,
      colors,
    },
  };
}

export function getWidgetThemeProps(section: PageBuilderSection) {
  const themeConfig = section.themeConfig;
  const dataTheme =
    themeConfig?.themeMode === "named" ? themeConfig.themeRef : undefined;

  const customStyles: Record<string, string> = {};
  if (themeConfig?.themeMode === "custom" && themeConfig.customTokens) {
    const t = themeConfig.customTokens;
    if (t["primary"]) customStyles["--p"] = toOklchToken(t["primary"]);
    if (t["primary-content"])
      customStyles["--pc"] = toOklchToken(t["primary-content"]);
    if (t["secondary"]) customStyles["--s"] = toOklchToken(t["secondary"]);
    if (t["secondary-content"])
      customStyles["--sc"] = toOklchToken(t["secondary-content"]);
    if (t["accent"]) customStyles["--a"] = toOklchToken(t["accent"]);
    if (t["accent-content"])
      customStyles["--ac"] = toOklchToken(t["accent-content"]);
    if (t["neutral"]) customStyles["--n"] = toOklchToken(t["neutral"]);
    if (t["neutral-content"])
      customStyles["--nc"] = toOklchToken(t["neutral-content"]);
    if (t["base-100"]) customStyles["--b1"] = toOklchToken(t["base-100"]);
    if (t["base-200"]) customStyles["--b2"] = toOklchToken(t["base-200"]);
    if (t["base-300"]) customStyles["--b3"] = toOklchToken(t["base-300"]);
    if (t["base-content"])
      customStyles["--bc"] = toOklchToken(t["base-content"]);
    if (t["info"]) customStyles["--in"] = toOklchToken(t["info"]);
    if (t["success"]) customStyles["--su"] = toOklchToken(t["success"]);
    if (t["warning"]) customStyles["--wa"] = toOklchToken(t["warning"]);
    if (t["error"]) customStyles["--er"] = toOklchToken(t["error"]);
  }

  return { dataTheme, customStyles };
}

export function getWidgetWrapperProps(section: PageBuilderSection) {
  const normalizedSection = normalizeSectionForTheme(section);
  const widgetTheme = getWidgetThemeProps(normalizedSection);
  const buttonRadius = getWidgetButtonRadius(normalizedSection);
  const buttonSizeVars = getWidgetButtonSizeVars(normalizedSection);

  const typo = normalizedSection.design?.typography || {};
  const colors = normalizedSection.design?.colors || {};

  const hasHeadingColor = !!typo.headingColor;
  const hasH1Color = !!typo.h1Color;
  const hasH2Color = !!typo.h2Color;
  const hasTextColor = !!typo.textColor;
  const hasLinkColor = !!(typo.linkColor || colors.accent);
  const hasBtnBg = !!colors.buttonBackground;
  const hasBtnText = !!colors.buttonText;
  const hasBtnHover = !!colors.buttonBackgroundHover;

  // Typography conditional flags — only activate CSS overrides when custom values are set
  const hasFontFamily = !!typo.fontFamily;
  const hasHeadingFontFamily = !!typo.headingFontFamily;
  const hasHeadingFontWeight = !!typo.headingFontWeight;
  const hasHeadingFontSize = !!typo.headingFontSize;
  const hasH1FontFamily = !!(typo.h1FontFamily || typo.headingFontFamily);
  const hasH1FontWeight = !!(typo.h1FontWeight || typo.headingFontWeight);
  const hasH1FontSize = !!typo.h1FontSize;
  const hasH2FontFamily = !!(typo.h2FontFamily || typo.headingFontFamily);
  const hasH2FontWeight = !!(typo.h2FontWeight || typo.headingFontWeight);
  const hasH2FontSize = !!typo.h2FontSize;
  const hasTextFontSize = !!typo.textFontSize;

  const buttonBorderStyle = colors.buttonBorderStyle || "none";
  const buttonBorderWidth =
    buttonBorderStyle === "none"
      ? "0px"
      : normalizeRadius(colors.buttonBorderWidth) || "1px";
  const buttonBorderColor =
    buttonBorderStyle === "none"
      ? "transparent"
      : colors.buttonBorderColor || "currentColor";
  const buttonShadow = colors.buttonShadow || "none";
  const iconRadius = normalizeRadius(colors.iconRadius) || "0.75rem";
  const mediaRadius =
    normalizeRadius(normalizedSection.design?.media?.imageRadius) || "12px";

  const usesInternalVerticalSpacing =
    INTERNAL_VERTICAL_SPACING_WIDGET_TYPES.has(normalizedSection.type);

  // For widgets with internal spacing: use 0px by default but allow user overrides
  const userPaddingTop = section.design?.spacing?.paddingTop;
  const userPaddingBottom = section.design?.spacing?.paddingBottom;
  const hasUserPaddingTop = userPaddingTop && userPaddingTop !== "0px";
  const hasUserPaddingBottom = userPaddingBottom && userPaddingBottom !== "0px";

  const className = [
    "widget-design-scope",
    "text-base-content",
    "bg-base-100",
    hasHeadingColor ? "wds-heading-color" : "",
    hasH1Color ? "wds-h1-color" : "",
    hasH2Color ? "wds-h2-color" : "",
    hasTextColor ? "wds-text-color" : "",
    hasLinkColor ? "wds-link-color" : "",
    hasBtnBg ? "wds-btn-bg" : "",
    hasBtnText ? "wds-btn-text" : "",
    hasBtnHover ? "wds-btn-hover" : "",
    hasFontFamily ? "wds-font-family" : "",
    hasHeadingFontFamily ? "wds-heading-font-family" : "",
    hasHeadingFontWeight ? "wds-heading-font-weight" : "",
    hasHeadingFontSize ? "wds-heading-font-size" : "",
    hasH1FontFamily ? "wds-h1-font-family" : "",
    hasH1FontWeight ? "wds-h1-font-weight" : "",
    hasH1FontSize ? "wds-h1-font-size" : "",
    hasH2FontFamily ? "wds-h2-font-family" : "",
    hasH2FontWeight ? "wds-h2-font-weight" : "",
    hasH2FontSize ? "wds-h2-font-size" : "",
    hasTextFontSize ? "wds-text-font-size" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style: Record<string, string | undefined> = {
    "--widget-section-bg":
      normalizedSection.design.background.value || undefined,
    backgroundColor:
      normalizedSection.design.background.type === "color" &&
      normalizedSection.design.background.value
        ? normalizedSection.design.background.value
        : undefined,
    ...(normalizedSection.design.background.type === "image" &&
    normalizedSection.design.background.value
      ? {
          "--widget-bg-image": `url(${normalizedSection.design.background.value})`,
          "--widget-bg-opacity": String(
            normalizedSection.design.background.opacity ?? 1,
          ),
        }
      : {}),
    ...(normalizedSection.design.background.type === "gradient" &&
    normalizedSection.design.background.value
      ? {
          backgroundImage: normalizedSection.design.background.value,
        }
      : {}),
    ...(normalizedSection.design.background.overlayColor
      ? {
          "--widget-bg-overlay-color":
            normalizedSection.design.background.overlayColor,
        }
      : {}),
    ...(normalizedSection.design.background.overlayOpacity !== undefined
      ? {
          "--widget-bg-overlay-opacity": String(
            normalizedSection.design.background.overlayOpacity,
          ),
        }
      : {}),
    position: ["image", "video"].includes(
      normalizedSection.design.background.type,
    )
      ? "relative"
      : undefined,
    paddingTop: usesInternalVerticalSpacing
      ? hasUserPaddingTop
        ? userPaddingTop
        : "0px"
      : normalizedSection.design.spacing.paddingTop,
    paddingBottom: usesInternalVerticalSpacing
      ? hasUserPaddingBottom
        ? userPaddingBottom
        : "0px"
      : normalizedSection.design.spacing.paddingBottom,
    marginTop: normalizedSection.design.spacing.marginTop,
    marginBottom: normalizedSection.design.spacing.marginBottom,
    ...(typo.headingColor
      ? { "--widget-heading-color": typo.headingColor }
      : {}),
    ...(typo.h1Color ? { "--widget-h1-color": typo.h1Color } : {}),
    ...(typo.h2Color ? { "--widget-h2-color": typo.h2Color } : {}),
    ...(typo.subtitleColor
      ? { "--widget-subtitle-color": typo.subtitleColor }
      : {}),
    ...(typo.textColor ? { "--widget-text-color": typo.textColor } : {}),
    ...(typo.linkColor ? { "--widget-link-color": typo.linkColor } : {}),
    ...(colors.buttonBackground
      ? { "--widget-btn-bg": colors.buttonBackground }
      : {}),
    ...(colors.buttonText ? { "--widget-btn-text": colors.buttonText } : {}),
    ...(colors.buttonBackgroundHover
      ? { "--widget-btn-bg-hover": colors.buttonBackgroundHover }
      : {}),
    ...(colors.buttonBorderColor
      ? { "--widget-btn-border-color": colors.buttonBorderColor }
      : {}),
    "--widget-btn-border-width": buttonBorderWidth,
    "--widget-btn-border-style": buttonBorderStyle,
    "--widget-btn-border-color": buttonBorderColor,
    "--widget-btn-shadow": buttonShadow,
    ...(colors.accent ? { "--widget-accent-color": colors.accent } : {}),
    "--widget-icon-bg": colors.iconBackground || "oklch(var(--b2))",
    ...(colors.iconColor ? { "--widget-icon-color": colors.iconColor } : {}),
    ...(colors.iconBorderColor
      ? { "--widget-icon-border-color": colors.iconBorderColor }
      : {}),
    ...(colors.iconBorderWidth
      ? { "--widget-icon-border-width": colors.iconBorderWidth }
      : {}),
    "--widget-icon-radius": iconRadius,
    ...(colors.iconSize ? { "--widget-icon-size": colors.iconSize } : {}),
    ...(typo.fontFamily ? { "--widget-font-family": typo.fontFamily } : {}),
    ...(typo.headingFontFamily
      ? { "--widget-heading-font-family": typo.headingFontFamily }
      : {}),
    ...(typo.headingFontWeight
      ? { "--widget-heading-font-weight": typo.headingFontWeight }
      : {}),
    ...(typo.headingFontSize
      ? { "--widget-heading-font-size": typo.headingFontSize }
      : {}),
    ...(typo.h1FontFamily
      ? { "--widget-h1-font-family": typo.h1FontFamily }
      : {}),
    ...(typo.h1FontWeight
      ? { "--widget-h1-font-weight": typo.h1FontWeight }
      : {}),
    ...(typo.h1FontSize ? { "--widget-h1-font-size": typo.h1FontSize } : {}),
    ...(typo.h2FontFamily
      ? { "--widget-h2-font-family": typo.h2FontFamily }
      : {}),
    ...(typo.h2FontWeight
      ? { "--widget-h2-font-weight": typo.h2FontWeight }
      : {}),
    ...(typo.h2FontSize ? { "--widget-h2-font-size": typo.h2FontSize } : {}),
    ...(typo.textFontSize
      ? { "--widget-text-font-size": typo.textFontSize }
      : {}),
    "--widget-media-radius": mediaRadius,
    ...(normalizedSection.design?.media?.overlayImage
      ? {
          "--widget-media-overlay-image": `url(${normalizedSection.design.media.overlayImage})`,
        }
      : {}),
    ...(normalizedSection.design?.media?.overlaySize
      ? {
          "--widget-media-overlay-size":
            normalizedSection.design.media.overlaySize,
        }
      : {}),
    "--widget-btn-radius": buttonRadius,
    ...buttonSizeVars,
    ...(typo.buttonFontSize
      ? { "--widget-btn-font-size": typo.buttonFontSize }
      : {}),
    ...(typo.buttonFontFamily
      ? { "--widget-btn-font-family": typo.buttonFontFamily }
      : {}),
    ...widgetTheme.customStyles,
  };

  // Section border radius
  const sectionRadius = normalizeRadius(colors.sectionRadius);
  if (sectionRadius && sectionRadius !== "0px") {
    style.borderRadius = sectionRadius;
    style.overflow = "hidden";
  }

  // Transparent header overlay: position absolutely over the next section
  const isOverlayHeader = isTransparentHeaderOverlay(normalizedSection);
  // Sticky header: non-transparent headers stick to top on scroll
  const isStickyHeader =
    !isOverlayHeader && HEADER_TYPES.has(normalizedSection.type);

  if (isOverlayHeader) {
    style.position = "absolute";
    style.top = "0";
    style.left = "0";
    style.right = "0";
    style.zIndex = 50;
    style.backgroundColor = "transparent";
  } else if (isStickyHeader) {
    style.position = "sticky";
    style.top = "0";
    style.zIndex = 40;
  }

  return {
    normalizedSection,
    className,
    dataTheme: widgetTheme.dataTheme,
    style,
    isOverlayHeader,
  };
}

export function getOverrideStyle(section: PageBuilderSection) {
  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;
  const buttonBg = section.design?.colors?.buttonBackground;
  const buttonText = section.design?.colors?.buttonText;
  const buttonHover = section.design?.colors?.buttonBackgroundHover;
  const iconBg = section.design?.colors?.iconBackground;
  const iconColor = section.design?.colors?.iconColor;
  const iconBorderColor = section.design?.colors?.iconBorderColor;
  const buttonBorderColor = section.design?.colors?.buttonBorderColor;
  const accentColor = section.design?.colors?.accent;

  return {
    headingColor,
    textColor,
    buttonBg,
    buttonText,
    buttonHover,
    buttonBorderColor,
    iconBg,
    iconColor,
    iconBorderColor,
    accentColor,
  };
}

function normalizeRadius(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
}

export function getWidgetButtonRadius(section: PageBuilderSection) {
  return normalizeRadius(section.design?.colors?.buttonRadius);
}

export function getWidgetButtonSizeVars(
  section: PageBuilderSection,
): Record<string, string> {
  const size = section.design?.colors?.buttonSize || "md";

  switch (size) {
    case "sm":
      return {
        "--widget-btn-font-size": "0.8rem",
        "--widget-btn-min-height": "2.2rem",
        "--widget-btn-px": "0.85rem",
      };
    case "lg":
      return {
        "--widget-btn-font-size": "1rem",
        "--widget-btn-min-height": "3rem",
        "--widget-btn-px": "1.35rem",
      };
    case "xl":
      return {
        "--widget-btn-font-size": "1.125rem",
        "--widget-btn-min-height": "3.3rem",
        "--widget-btn-px": "1.6rem",
      };
    case "md":
    default:
      return {
        "--widget-btn-font-size": "0.9rem",
        "--widget-btn-min-height": "2.6rem",
        "--widget-btn-px": "1.1rem",
      };
  }
}

/** Whether a section is a transparent header that should overlay on the next section */
const HEADER_TYPES = new Set([
  "header",
  "header-top-info",
  "header-with-icons",
  "header-account-bar",
  "header-full-contact",
  "header-clickfunnel",
]);

export function isTransparentHeaderOverlay(
  section: PageBuilderSection,
): boolean {
  return HEADER_TYPES.has(section.type) && section.variant === "transparent";
}
