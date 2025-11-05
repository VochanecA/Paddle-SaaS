/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'background-alt': 'var(--background-alt)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        'accent-alt': 'var(--accent-alt)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
      transitionDuration: {
        DEFAULT: 'var(--transition-duration)',
      },
    },
  },
  plugins: [],
}
