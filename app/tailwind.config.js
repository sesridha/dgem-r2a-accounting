/** @type {import('tailwindcss').Config} */
const dgemPreset = require('../package/tailwind.config.js')

module.exports = {
  presets: [dgemPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}