import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeStyleInjector: React.FC = () => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    const styleId = 'theme-custom-css';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    if (currentTheme?.custom_css) {
      styleElement.textContent = currentTheme.custom_css;
    } else {
      styleElement.textContent = '';
    }

    return () => {
      const element = document.getElementById(styleId);
      if (element && !currentTheme?.custom_css) {
        element.remove();
      }
    };
  }, [currentTheme]);

  return null;
};
