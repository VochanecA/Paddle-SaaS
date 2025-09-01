// tailwind.config.js
module.exports = {
  darkMode: "class", // 👈 important
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
  },
  plugins: [],
};
