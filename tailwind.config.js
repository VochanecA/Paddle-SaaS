/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'background-alt': 'var(--background-alt)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        'accent-alt': 'var(--accent-alt)',
        'accent-dark': 'var(--accent)',
      },
    },
  },
  plugins: [],
};
