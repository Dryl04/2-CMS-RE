import { PageBuilderSection } from './pageBuilderTypes';

export function getWidgetThemeProps(section: PageBuilderSection) {
  const themeConfig = section.themeConfig;
  const dataTheme = themeConfig?.themeMode === 'named' ? themeConfig.themeRef : undefined;

  const customStyles: Record<string, string> = {};
  if (themeConfig?.themeMode === 'custom' && themeConfig.customTokens) {
    const t = themeConfig.customTokens;
    if (t['primary']) customStyles['--p'] = t['primary'];
    if (t['primary-content']) customStyles['--pc'] = t['primary-content'];
    if (t['secondary']) customStyles['--s'] = t['secondary'];
    if (t['secondary-content']) customStyles['--sc'] = t['secondary-content'];
    if (t['accent']) customStyles['--a'] = t['accent'];
    if (t['accent-content']) customStyles['--ac'] = t['accent-content'];
    if (t['neutral']) customStyles['--n'] = t['neutral'];
    if (t['neutral-content']) customStyles['--nc'] = t['neutral-content'];
    if (t['base-100']) customStyles['--b1'] = t['base-100'];
    if (t['base-200']) customStyles['--b2'] = t['base-200'];
    if (t['base-300']) customStyles['--b3'] = t['base-300'];
    if (t['base-content']) customStyles['--bc'] = t['base-content'];
    if (t['info']) customStyles['--in'] = t['info'];
    if (t['success']) customStyles['--su'] = t['success'];
    if (t['warning']) customStyles['--wa'] = t['warning'];
    if (t['error']) customStyles['--er'] = t['error'];
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
