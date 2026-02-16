const daisyThemes = require('daisyui/src/theming/themes');
// Keep DaisyUI official order sourced from package while forcing light/dark first in UI.
const officialDaisyThemes = [
  'light',
  'dark',
  ...Object.keys(daisyThemes).filter((theme) => theme !== 'light' && theme !== 'dark'),
];

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: officialDaisyThemes,
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
