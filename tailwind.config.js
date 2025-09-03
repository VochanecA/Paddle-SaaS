// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'background-alt': 'var(--background-alt)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        'accent-alt': 'var(--accent-alt)',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
    },
  },
  plugins: [],
};