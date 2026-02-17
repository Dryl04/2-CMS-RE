import { PageBuilderSection } from "./pageBuilderTypes";
import { widgetLibrary } from "./widgetLibrary";

const COLOR_OVERRIDE_KEYS = [
  "primary",
  "secondary",
  "accent",
  "buttonBackground",
  "buttonText",
  "buttonBackgroundHover",
  "iconBackground",
  "iconColor",
] as const;

const TYPOGRAPHY_COLOR_KEYS = ["headingColor", "textColor"] as const;

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
  for (const key of TYPOGRAPHY_COLOR_KEYS) {
    const value = sourceTypography[key];
    const defaultValue = defaultDesign?.typography?.[key];
    if (shouldDropColorOverride(value, defaultValue)) {
      delete typography[key];
    }
  }

  const colors = { ...sourceColors };
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
    if (t["primary"]) customStyles["--p"] = t["primary"];
    if (t["primary-content"]) customStyles["--pc"] = t["primary-content"];
    if (t["secondary"]) customStyles["--s"] = t["secondary"];
    if (t["secondary-content"]) customStyles["--sc"] = t["secondary-content"];
    if (t["accent"]) customStyles["--a"] = t["accent"];
    if (t["accent-content"]) customStyles["--ac"] = t["accent-content"];
    if (t["neutral"]) customStyles["--n"] = t["neutral"];
    if (t["neutral-content"]) customStyles["--nc"] = t["neutral-content"];
    if (t["base-100"]) customStyles["--b1"] = t["base-100"];
    if (t["base-200"]) customStyles["--b2"] = t["base-200"];
    if (t["base-300"]) customStyles["--b3"] = t["base-300"];
    if (t["base-content"]) customStyles["--bc"] = t["base-content"];
    if (t["info"]) customStyles["--in"] = t["info"];
    if (t["success"]) customStyles["--su"] = t["success"];
    if (t["warning"]) customStyles["--wa"] = t["warning"];
    if (t["error"]) customStyles["--er"] = t["error"];
  }

  return { dataTheme, customStyles };
}

export function getOverrideStyle(section: PageBuilderSection) {
  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;
  const buttonBg = section.design?.colors?.buttonBackground;
  const buttonText = section.design?.colors?.buttonText;
  const buttonHover = section.design?.colors?.buttonBackgroundHover;
  const iconBg = section.design?.colors?.iconBackground;
  const iconColor = section.design?.colors?.iconColor;
  const accentColor = section.design?.colors?.accent;

  return {
    headingColor,
    textColor,
    buttonBg,
    buttonText,
    buttonHover,
    iconBg,
    iconColor,
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
