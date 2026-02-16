import { useEffect } from 'react';
import { generateThemeCSS, getPageThemeById, PAGE_THEMES } from '../lib/pageThemes';
import { usePageTheme } from '../contexts/PageThemeContext';

interface PageThemeInjectorProps {
  themeId?: string | null;
}

export default function PageThemeInjector({ themeId }: PageThemeInjectorProps) {
  const { pageThemes } = usePageTheme();

  useEffect(() => {
    let theme;

    if (themeId) {
      theme = pageThemes.find(t => t.id === themeId);

      if (!theme) {
        theme = getPageThemeById(themeId);
      }
    }

    if (!theme) {
      theme = PAGE_THEMES[0];
    }

    const css = generateThemeCSS(theme);

    let styleElement = document.getElementById('page-theme-styles') as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'page-theme-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;

    return () => {
      const el = document.getElementById('page-theme-styles');
      if (el) {
        el.remove();
      }
    };
  }, [themeId, pageThemes]);

  useEffect(() => {
    const fonts = [
      'Inter:wght@300;400;500;600;700',
      'Playfair+Display:wght@400;700',
      'Poppins:wght@300;400;600;800',
      'Montserrat:wght@400;600;800',
      'Roboto:wght@300;400;500;700',
      'Work+Sans:wght@300;400;500;600',
      'Lora:wght@400;700',
      'Merriweather:wght@400;700;900',
    ];

    const linkId = 'page-theme-fonts';
    let linkElement = document.getElementById(linkId) as HTMLLinkElement;

    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = linkId;
      linkElement.rel = 'stylesheet';
      linkElement.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`;
      document.head.appendChild(linkElement);
    }

    return () => {
      const el = document.getElementById(linkId);
      if (el) {
        el.remove();
      }
    };
  }, []);

  return null;
}
