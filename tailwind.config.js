/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-black': '#070707',
        'brand-yellow': '#ffd100',
      },
      transitionDuration: {
        'fast': '350ms',
        'medium': '500ms',
      },
      transitionTimingFunction: {
        'brand': 'cubic-bezier(0.22, 0.9, 0.18, 1)',
      },
    },
  },
  plugins: [],
};



